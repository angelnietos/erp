import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import jwksRsa from 'jwks-rsa';
import jwt from 'jsonwebtoken';

interface KeycloakToken {
  sub: string;
  email: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: { roles: string[] };
  client_roles?: string[] | Record<string, string[]>;
  tenant_id?: string;
  scope?: string;
  iss?: string;
}

interface ErpMappedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  permissions: string[];
  tenantId?: string;
}

const ALL_APP_PERMISSIONS: string[] = [
  '*',
  'dashboard.view',
  'users.view',
  'users.manage',
  'roles.manage',
  'tenants.manage',
  'clients.view',
  'clients.manage',
  'products.view',
  'products.manage',
  'inventory.movement',
  'budgets.view',
  'budgets.create',
  'budgets.approve',
  'invoices.view',
  'invoices.submit',
  'rentals.view',
  'rentals.manage',
  'rentals.approve',
  'projects.view',
  'projects.manage',
  'fleet.view',
  'fleet.manage',
  'events.view',
  'events.manage',
  'services.view',
  'services.manage',
  'reports.view',
  'audit.view',
  'delivery.view',
  'delivery.manage',
  'billing.view',
  'verifactu.view',
  'receipts.view',
  'ai.view',
];

@Injectable()
export class HybridJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly jwtSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (
        _request: unknown,
        rawJwtToken: string,
        done: (err: Error | null, secretOrKey?: string) => void,
      ) => {
        const secret = configService.get<string>('JWT_SECRET') ?? 'default_secret';
        try {
          const decoded = jwt.decode(rawJwtToken, { complete: true }) as any;
          const iss = decoded?.payload?.iss;
          const isKeycloak = typeof iss === 'string' && iss.includes('/realms/');

          if (isKeycloak) {
            const keycloakUrl =
              configService.get<string>('KEYCLOAK_AUTH_SERVER_URL')?.replace(/\/$/, '') ||
              'http://localhost:8081';
            const keycloakRealm =
              configService.get<string>('KEYCLOAK_REALM') || 'josanz-web-app-realm';
            const jwksUri = `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/certs`;

            const client = jwksRsa({
              jwksUri,
              cache: true,
              cacheMaxEntries: 5,
            });

            client
              .getSigningKey(decoded.header.kid)
              .then((key) => done(null, key.getPublicKey()))
              .catch((err) => done(err instanceof Error ? err : new Error(String(err))));
          } else {
            done(null, secret);
          }
        } catch (err) {
          done(null, secret);
        }
      },
    });
    this.jwtSecret = configService.get<string>('JWT_SECRET') ?? 'default_secret';
  }

  async validate(payload: Record<string, unknown>): Promise<ErpMappedUser> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const isKeycloak =
      typeof payload['iss'] === 'string' && payload['iss'].includes('/realms/');

    if (isKeycloak) {
      return this.validateKeycloakUser(payload as unknown as KeycloakToken);
    }

    // Standard ERP JWT (HS256)
    return {
      id: String(payload.sub),
      email: String(payload.email ?? ''),
      firstName: payload.firstName as string | undefined,
      lastName: payload.lastName as string | undefined,
      roles: Array.isArray(payload.roles)
        ? payload.roles.filter((r): r is string => typeof r === 'string')
        : [],
      permissions: Array.isArray(payload.permissions)
        ? payload.permissions.filter((p): p is string => typeof p === 'string')
        : [],
      tenantId: payload.tenantId as string | undefined,
    };
  }

  /**
   * Resolves a Keycloak-authenticated user against the local Postgres DB.
   *
   * Strategy:
   * 1. Look up the user by (email, tenantId) in the DB.
   * 2. If found → return their real DB roles + permissions.
   * 3. If NOT found but tenantId is valid → auto-provision the user with the
   *    "Administrador" role so they can work immediately.
   * 4. Safe fallback → if DB is unreachable, grant ALL_APP_PERMISSIONS to
   *    recognised admin roles so the admin is never locked out.
   */
  private async validateKeycloakUser(kcToken: KeycloakToken): Promise<ErpMappedUser> {
    const email = kcToken.email || kcToken.preferred_username || '';
    const tenantId = kcToken.tenant_id?.trim() ?? '';

    if (!email) {
      throw new UnauthorizedException('Keycloak token missing email claim');
    }

    try {
      // ── 1. Look up user in the local DB ──────────────────────────────────
      type DbUserWithRoles = {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        tenantId: string;
        roles: Array<{ role: { name: string; permissions: string[] } }>;
      };

      let dbUser: DbUserWithRoles | null = tenantId
        ? await (this.prisma.user.findFirst as any)({
            where: { email, tenantId },
            include: { roles: { include: { role: { select: { name: true, permissions: true } } } } },
          })
        : await (this.prisma.user.findFirst as any)({
            where: { email },
            include: { roles: { include: { role: { select: { name: true, permissions: true } } } } },
          });

      // ── 2. Auto-provision if the user doesn't exist yet ──────────────────
      if (!dbUser && tenantId) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (tenant) {
          // Prefer "Administrador", fallback to "SuperAdmin"
          const adminRole = await (this.prisma.role as any).findFirst({
            where: { tenantId, name: { in: ['Administrador', 'SuperAdmin'] } },
            orderBy: { name: 'asc' }, // Administrador sorts first
          });

          dbUser = await (this.prisma.user.create as any)({
            data: {
              email,
              firstName: kcToken.given_name ?? '',
              lastName: kcToken.family_name ?? '',
              // Keycloak-managed users — local password not used for auth
              password: `keycloak:${kcToken.sub}`,
              tenantId,
              ...(adminRole
                ? { roles: { create: [{ roleId: adminRole.id }] } }
                : {}),
            },
            include: { roles: { include: { role: { select: { name: true, permissions: true } } } } },
          });
        }
      }

      // ── 3. Return real DB permissions ────────────────────────────────────
      if (dbUser) {
        const permissions = Array.from(
          new Set(dbUser.roles.flatMap((ur) => ur.role.permissions)),
        );
        const roleNames = dbUser.roles.map((ur) => ur.role.name);

        return {
          id: dbUser.id,
          email: dbUser.email,
          firstName: dbUser.firstName ?? kcToken.given_name,
          lastName: dbUser.lastName ?? kcToken.family_name,
          roles: roleNames,
          permissions,
          tenantId: dbUser.tenantId ?? tenantId,
        };
      }
    } catch (err) {
      console.error('[HybridJwtStrategy] DB lookup/provision error:', err);
    }

    // ── 4. Safe fallback ────────────────────────────────────────────────────
    // DB is unavailable but the Keycloak token is valid — grant full access
    // to recognised admin realm-roles so the admin is never locked out.
    const realmRoles = kcToken.realm_access?.roles ?? [];
    const isAdmin = realmRoles.some((r) =>
      ['PlatformAdmin', 'PlatformOwner', 'TenantAdmin', 'admin'].includes(r),
    );

    return {
      id: kcToken.sub,
      email,
      firstName: kcToken.given_name,
      lastName: kcToken.family_name,
      roles: isAdmin ? ['Administrador'] : ['authenticated'],
      permissions: isAdmin ? ALL_APP_PERMISSIONS : [],
      tenantId: tenantId || undefined,
    };
  }
}

