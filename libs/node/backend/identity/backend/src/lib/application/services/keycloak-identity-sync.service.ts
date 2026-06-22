import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import {
  DEFAULT_TENANT_MODULE_IDS,
  getTenantKeycloakConfig,
  normalizeTenantModuleIds,
  permissionsForEnabledModules,
  PLATFORM_KEYCLOAK_BINDING,
  PLATFORM_KEYCLOAK_REALM_ROLES,
  tenantUsesKeycloakLogin,
} from '@josanz-erp/identity-api';
import * as bcrypt from 'bcrypt';
import { KeycloakAdminService } from './keycloak-admin.service';

export interface KeycloakSyncResult {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  rolesEnsured?: number;
  usersSynced?: number;
  errors?: string[];
}

@Injectable()
export class KeycloakIdentitySyncService {
  private readonly logger = new Logger(KeycloakIdentitySyncService.name);

  constructor(
    private readonly kcAdmin: KeycloakAdminService,
    private readonly prisma: PrismaService,
  ) {}

  async syncTenantModules(
    tenantId: string,
    enabledModuleIds: string[],
  ): Promise<KeycloakSyncResult> {
    const ctx = await this.resolveTenantKeycloak(tenantId);
    if (!ctx) {
      return {
        ok: true,
        skipped: true,
        reason: 'Tenant sin Keycloak configurado',
      };
    }

    const permissionRoles = permissionsForEnabledModules(enabledModuleIds);
    const ensured = await this.ensureClientRoles(
      ctx.realm,
      ctx.clientId,
      permissionRoles,
    );

    return {
      ok: true,
      rolesEnsured: ensured,
    };
  }

  async pushTenantToKeycloak(tenantId: string): Promise<KeycloakSyncResult> {
    const ctx = await this.resolveTenantKeycloak(tenantId);
    if (!ctx) {
      return {
        ok: true,
        skipped: true,
        reason: 'Tenant sin Keycloak configurado',
      };
    }

    if (!this.kcAdmin.isConfigured()) {
      return { ok: false, reason: 'Credenciales admin Keycloak no configuradas' };
    }

    const token = await this.kcAdmin.getAdminToken();
    if (!token) {
      return { ok: false, reason: 'No se pudo obtener token admin Keycloak' };
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { enabledModuleIds: true },
    });
    const moduleIds =
      tenant?.enabledModuleIds && tenant.enabledModuleIds.length > 0
        ? normalizeTenantModuleIds(tenant.enabledModuleIds)
        : [...DEFAULT_TENANT_MODULE_IDS];

    const roles = await this.prisma.role.findMany({
      where: { tenantId },
      select: { name: true, permissions: true },
    });

    const roleNames = roles.map((r) => r.name);
    const permissionIds = new Set(permissionsForEnabledModules(moduleIds));
    for (const role of roles) {
      for (const p of role.permissions) {
        permissionIds.add(p);
      }
    }

    const clientRoles = [...new Set([...permissionIds, ...roleNames])];
    const rolesEnsured = await this.ensureClientRoles(
      ctx.realm,
      ctx.clientId,
      clientRoles,
      token,
    );

    const users = await this.prisma.user.findMany({
      where: { tenantId, isActive: true },
      select: {
        id: true,
        email: true,
        roles: { include: { role: { select: { name: true } } } },
      },
    });

    const errors: string[] = [];
    let usersSynced = 0;

    for (const user of users) {
      const result = await this.pushTenantUserRoles(
        tenantId,
        user.id,
        token,
        ctx,
      );
      if (result.ok) {
        usersSynced += 1;
      } else if (result.reason) {
        errors.push(`${user.email}: ${result.reason}`);
      }
    }

    this.logger.log(
      `Pushed tenant ${tenantId} to KC: ${rolesEnsured} roles, ${usersSynced} users`,
    );

    return {
      ok: errors.length === 0,
      rolesEnsured,
      usersSynced,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async pushTenantUserToKeycloak(
    tenantId: string,
    userId: string,
  ): Promise<KeycloakSyncResult> {
    const ctx = await this.resolveTenantKeycloak(tenantId);
    if (!ctx) {
      return {
        ok: true,
        skipped: true,
        reason: 'Tenant sin Keycloak configurado',
      };
    }

    return this.pushTenantUserRoles(tenantId, userId, undefined, ctx);
  }

  async pullTenantUserFromKeycloak(
    tenantId: string,
    email: string,
  ): Promise<KeycloakSyncResult & { userId?: string }> {
    const ctx = await this.resolveTenantKeycloak(tenantId);
    if (!ctx) {
      return {
        ok: false,
        reason: 'Tenant sin Keycloak configurado',
      };
    }

    const token = await this.kcAdmin.getAdminToken();
    if (!token) {
      return { ok: false, reason: 'No se pudo obtener token admin Keycloak' };
    }

    const kcUser = await this.kcAdmin.findUserByEmail(ctx.realm, email, token);
    if (!kcUser?.id) {
      return { ok: false, reason: 'Usuario no encontrado en Keycloak' };
    }

    const clientUuid = await this.kcAdmin.getClientUuid(
      ctx.realm,
      ctx.clientId,
      token,
    );
    if (!clientUuid) {
      return { ok: false, reason: 'Cliente Keycloak no encontrado' };
    }

    const kcRoles = await this.kcAdmin.getUserClientRoles(
      ctx.realm,
      kcUser.id,
      clientUuid,
      token,
    );

    const tenantRoles = await this.prisma.role.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    });
    const matchedRoleIds = tenantRoles
      .filter((r) => kcRoles.includes(r.name))
      .map((r) => r.id);

    const normalizedEmail = email.trim().toLowerCase();
    let user = await this.prisma.user.findFirst({
      where: { tenantId, email: normalizedEmail },
      include: { roles: { include: { role: true } } },
    });

    if (!user) {
      const placeholderHash = await bcrypt.hash(
        `kc-pull:${normalizedEmail}:${Date.now()}`,
        10,
      );
      user = await this.prisma.user.create({
        data: {
          tenantId,
          email: normalizedEmail,
          password: placeholderHash,
          firstName: kcUser.firstName ?? null,
          lastName: kcUser.lastName ?? null,
          isActive: kcUser.enabled !== false,
          roles:
            matchedRoleIds.length > 0
              ? {
                  create: matchedRoleIds.map((roleId) => ({ roleId })),
                }
              : undefined,
        },
        include: { roles: { include: { role: true } } },
      });
    } else {
      if (matchedRoleIds.length > 0) {
        await this.prisma.userRole.deleteMany({ where: { userId: user.id } });
        await this.prisma.userRole.createMany({
          data: matchedRoleIds.map((roleId) => ({
            userId: user.id,
            roleId,
          })),
        });
      }
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: kcUser.firstName ?? user.firstName,
          lastName: kcUser.lastName ?? user.lastName,
          isActive: kcUser.enabled !== false,
        },
        include: { roles: { include: { role: true } } },
      });
    }

    return { ok: true, userId: user.id, usersSynced: 1 };
  }

  async syncPlatformUserToKeycloak(
    platformUserId: string,
    options?: { password?: string; realmRoles?: string[] },
  ): Promise<KeycloakSyncResult> {
    if (!this.kcAdmin.isConfigured()) {
      return { ok: false, reason: 'Credenciales admin Keycloak no configuradas' };
    }

    const row = await this.prisma.platformUser.findUnique({
      where: { id: platformUserId },
    });
    if (!row) {
      return { ok: false, reason: 'Usuario de plataforma no encontrado' };
    }

    const { realm } = PLATFORM_KEYCLOAK_BINDING;
    const token = await this.kcAdmin.getAdminToken();
    if (!token) {
      return { ok: false, reason: 'No se pudo obtener token admin Keycloak' };
    }

    let kcUser = await this.kcAdmin.findUserByEmail(realm, row.email, token);
    if (!kcUser?.id) {
      const createdId = await this.kcAdmin.createUser(
        realm,
        {
          email: row.email,
          firstName: row.firstName ?? undefined,
          lastName: row.lastName ?? undefined,
          password: options?.password,
          enabled: row.isActive,
        },
        token,
      );
      if (!createdId) {
        return { ok: false, reason: 'No se pudo crear usuario en Keycloak' };
      }
      kcUser = { id: createdId, email: row.email };
    } else {
      await this.kcAdmin.updateUserProfile(
        realm,
        kcUser.id,
        {
          firstName: row.firstName ?? undefined,
          lastName: row.lastName ?? undefined,
          enabled: row.isActive,
        },
        token,
      );
      if (options?.password) {
        await this.kcAdmin.setUserPassword(
          realm,
          kcUser.id,
          options.password,
          token,
        );
      }
    }

    const realmRoles =
      options?.realmRoles ?? [...PLATFORM_KEYCLOAK_REALM_ROLES];
    await this.kcAdmin.assignRealmRoles(realm, kcUser.id!, realmRoles, token);

    return { ok: true, usersSynced: 1 };
  }

  async isPlatformUserLinkedInKeycloak(email: string): Promise<boolean> {
    if (!this.kcAdmin.isConfigured()) return false;
    const user = await this.kcAdmin.findUserByEmail(
      PLATFORM_KEYCLOAK_BINDING.realm,
      email,
    );
    return Boolean(user?.id);
  }

  private async pushTenantUserRoles(
    tenantId: string,
    userId: string,
    token: string | undefined,
    ctx: { realm: string; clientId: string; slug: string },
  ): Promise<KeycloakSyncResult> {
    const auth = token ?? (await this.kcAdmin.getAdminToken());
    if (!auth) {
      return { ok: false, reason: 'No se pudo obtener token admin Keycloak' };
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        roles: { include: { role: { select: { name: true, permissions: true } } } },
      },
    });
    if (!user) {
      return { ok: false, reason: 'Usuario ERP no encontrado' };
    }

    const clientUuid = await this.kcAdmin.getClientUuid(
      ctx.realm,
      ctx.clientId,
      auth,
    );
    if (!clientUuid) {
      return { ok: false, reason: 'Cliente Keycloak no encontrado' };
    }

    let kcUser = await this.kcAdmin.findUserByEmail(ctx.realm, user.email, auth);
    if (!kcUser?.id) {
      const createdId = await this.kcAdmin.createUser(
        ctx.realm,
        {
          email: user.email,
          firstName: user.firstName ?? undefined,
          lastName: user.lastName ?? undefined,
          enabled: user.isActive,
        },
        auth,
      );
      if (!createdId) {
        return { ok: false, reason: 'No se pudo crear usuario en Keycloak' };
      }
      kcUser = { id: createdId };
    } else {
      await this.kcAdmin.updateUserProfile(
        ctx.realm,
        kcUser.id,
        {
          firstName: user.firstName ?? undefined,
          lastName: user.lastName ?? undefined,
          enabled: user.isActive,
        },
        auth,
      );
    }

    const tenantRoles = user.roles.map((ur) => ur.role);

    const clientRoleNames = new Set<string>();
    for (const role of tenantRoles) {
      clientRoleNames.add(role.name);
      for (const p of role.permissions) {
        clientRoleNames.add(p);
      }
    }

    const ok = await this.kcAdmin.setUserClientRoles(
      ctx.realm,
      kcUser.id!,
      clientUuid,
      [...clientRoleNames],
      auth,
    );

    return ok
      ? { ok: true, usersSynced: 1 }
      : { ok: false, reason: 'Error asignando roles en Keycloak' };
  }

  private async resolveTenantKeycloak(
    tenantId: string,
  ): Promise<{ realm: string; clientId: string; slug: string } | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { slug: true },
    });
    if (!tenant?.slug || !tenantUsesKeycloakLogin(tenant.slug)) {
      return null;
    }
    const binding = getTenantKeycloakConfig(tenant.slug);
    if (!binding) return null;
    return { ...binding, slug: tenant.slug };
  }

  private async ensureClientRoles(
    realm: string,
    clientId: string,
    roleNames: string[],
    token?: string,
  ): Promise<number> {
    const auth = token ?? (await this.kcAdmin.getAdminToken());
    if (!auth) return 0;

    const clientUuid = await this.kcAdmin.getClientUuid(realm, clientId, auth);
    if (!clientUuid) return 0;

    let count = 0;
    for (const roleName of roleNames) {
      const ok = await this.kcAdmin.ensureClientRole(
        realm,
        clientUuid,
        roleName,
        auth,
      );
      if (ok) count += 1;
    }
    return count;
  }
}
