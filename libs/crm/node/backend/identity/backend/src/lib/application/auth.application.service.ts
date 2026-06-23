import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import * as bcrypt from 'bcrypt';
import type { TenantClsStore } from '@generic-crm/shared-infrastructure';
import { isTenantUuid } from '@generic-crm/shared-infrastructure';
import {
  AUTH_TOKEN_PORT,
  TENANT_READ_REPOSITORY,
  USER_AUTH_REPOSITORY,
  type AuthTokenPort,
  type TenantReadRepositoryPort,
  type UserAuthRepositoryPort,
} from '@generic-crm/identity-core';
import { LoginDto } from '../dto/login.dto';
import { OidcCallbackDto } from '../dto/oidc-callback.dto';
import { resolveVerifactuTenantKeycloak } from '../tenant-keycloak.config';

@Injectable()
export class AuthApplicationService {
  constructor(
    @Inject(USER_AUTH_REPOSITORY)
    private readonly users: UserAuthRepositoryPort,
    @Inject(TENANT_READ_REPOSITORY)
    private readonly tenants: TenantReadRepositoryPort,
    @Inject(AUTH_TOKEN_PORT)
    private readonly tokens: AuthTokenPort,
    private readonly cls: ClsService<TenantClsStore>,
    private readonly config: ConfigService,
  ) {}

  private async resolveLoginTenantId(dto: LoginDto): Promise<string> {
    console.log(
      '[DEBUG:resolveLoginTenantId] Starting with dto:',
      JSON.stringify(dto),
    );
    const fromCls = this.cls.get('tenantId');
    console.log(
      '[DEBUG:resolveLoginTenantId] Tenant from CLS:',
      fromCls,
      'valid uuid:',
      isTenantUuid(fromCls),
    );

    if (fromCls && isTenantUuid(fromCls)) {
      const id = fromCls.trim();
      const tenantExists = await this.tenants.existsActiveById(id);
      console.log(
        '[DEBUG:resolveLoginTenantId] Checking tenant',
        id,
        'exists active:',
        tenantExists,
      );

      if (tenantExists) {
        return id;
      }
    }

    if (dto.tenantSlug) {
      console.log(
        '[DEBUG:resolveLoginTenantId] Looking for tenant by slug:',
        dto.tenantSlug.trim(),
      );
      const id = await this.tenants.findActiveIdBySlug(dto.tenantSlug.trim());
      console.log('[DEBUG:resolveLoginTenantId] Found tenant id for slug:', id);

      if (!id) {
        throw new BadRequestException(`Tenant desconocido: ${dto.tenantSlug}`);
      }
      return id;
    }

    throw new BadRequestException(
      'Indica el tenant: cabecera x-tenant-id (UUID) o tenantSlug en el cuerpo.',
    );
  }

  async login(dto: LoginDto) {
    console.log('[DEBUG:login] Starting login request for email:', dto.email);

    const tenantId = await this.resolveLoginTenantId(dto);
    console.log('[DEBUG:login] Resolved tenantId:', tenantId);

    const email = dto.email.trim().toLowerCase();
    console.log('[DEBUG:login] Normalized email:', email);

    const user = await this.users.findForLogin(tenantId, email);
    console.log('[DEBUG:login] User found:', !!user);

    if (user) {
      console.log('[DEBUG:login] User is active:', user.isActive);
      console.log('[DEBUG:login] Hash length:', user.passwordHash?.length);
      console.log(
        '[DEBUG:login] Hash starts with:',
        user.passwordHash?.substring(0, 7),
      );
    }

    let passwordMatches = false;
    if (user) {
      try {
        passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
        console.log('[DEBUG:login] bcrypt compare result:', passwordMatches);
      } catch (bcryptError) {
        console.error('[DEBUG:login] BCRYPT ERROR:', bcryptError);
        console.error(
          '[DEBUG:login] Password input length:',
          dto.password?.length,
        );
        console.error('[DEBUG:login] Stored hash:', user.passwordHash);
      }
    }

    if (!user || !passwordMatches) {
      console.log('[DEBUG:login] ❌ 401 thrown - invalid credentials');
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!user.isActive) {
      console.log('[DEBUG:login] ❌ 401 thrown - user inactive');
      throw new UnauthorizedException('Usuario desactivado');
    }
    const permissions = await this.users.getEffectivePermissions(
      tenantId,
      user.id,
    );
    const accessToken = await this.tokens.signAccessToken({
      sub: user.id,
      email: user.email,
      roles: user.roleNames,
      permissions,
      tenantId,
    });
    return {
      accessToken,
      tenantId,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roleNames,
        permissions,
      },
    };
  }

  async getSession(userId: string, tenantId: string) {
    const base = await this.users.findActiveSession(tenantId, userId);
    if (!base) {
      throw new UnauthorizedException();
    }
    const permissions = await this.users.getEffectivePermissions(
      tenantId,
      userId,
    );
    return {
      user: {
        id: base.id,
        email: base.email,
        firstName: base.firstName,
        lastName: base.lastName,
        roles: base.roleNames,
        permissions,
      },
      tenantId,
    };
  }

  /** Canje Authorization Code + PKCE (Keycloak) → JWT del CRM. */
  async loginWithOidc(dto: OidcCallbackDto) {
    const kcUrl = (this.config.get<string>('KEYCLOAK_URL') ?? '').replace(/\/$/, '');
    const realmConfig = resolveVerifactuTenantKeycloak(dto.tenantSlug) ?? {
      realm: this.config.get<string>('KEYCLOAK_REALM') ?? '',
      clientId: this.config.get<string>('KEYCLOAK_CLIENT_ID') ?? '',
    };
    const { realm, clientId } = realmConfig;
    if (!kcUrl || !realm || !clientId) {
      throw new BadRequestException('Keycloak no configurado en el API.');
    }

    const tokenUrl = `${kcUrl}/realms/${realm}/protocol/openid-connect/token`;
    const body = new URLSearchParams();
    body.set('grant_type', 'authorization_code');
    body.set('client_id', clientId);
    body.set('code', dto.code.trim());
    body.set('redirect_uri', dto.redirectUri.trim());
    body.set('code_verifier', dto.codeVerifier.trim());

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!tokenRes.ok) {
      throw new UnauthorizedException('No se pudo canjear el código OIDC.');
    }
    const tokenJson = (await tokenRes.json()) as {
      access_token?: string;
      id_token?: string;
    };
    const rawToken = tokenJson.access_token ?? tokenJson.id_token ?? '';
    if (!rawToken) {
      throw new UnauthorizedException('Keycloak no devolvió token.');
    }

    const email = this.readEmailFromJwt(rawToken);
    if (!email) {
      throw new UnauthorizedException('El token OIDC no incluye email.');
    }

    const tenantSlug =
      dto.tenantSlug?.trim() ||
      this.config.get<string>('DEFAULT_TENANT_SLUG') ||
      'demo';
    const tenantId = await this.tenants.findActiveIdBySlug(tenantSlug);
    if (!tenantId) {
      throw new BadRequestException(`Tenant desconocido: ${tenantSlug}`);
    }

    const user = await this.users.findForLogin(tenantId, email.trim().toLowerCase());
    if (!user?.isActive) {
      throw new UnauthorizedException(
        'No hay usuario CRM activo con ese email en el tenant indicado.',
      );
    }

    const permissions = await this.users.getEffectivePermissions(tenantId, user.id);
    const accessToken = await this.tokens.signAccessToken({
      sub: user.id,
      email: user.email,
      roles: user.roleNames,
      permissions,
      tenantId,
    });

    return {
      accessToken,
      tenantId,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roleNames,
        permissions,
      },
    };
  }

  private readEmailFromJwt(token: string): string | null {
    try {
      const part = token.split('.')[1];
      if (!part) {
        return null;
      }
      const padded = part.replace(/-/g, '+').replace(/_/g, '/');
      const json = Buffer.from(padded, 'base64').toString('utf8');
      const payload = JSON.parse(json) as { email?: string; preferred_username?: string };
      const email = (payload.email ?? payload.preferred_username ?? '').trim().toLowerCase();
      return email || null;
    } catch {
      return null;
    }
  }
}
