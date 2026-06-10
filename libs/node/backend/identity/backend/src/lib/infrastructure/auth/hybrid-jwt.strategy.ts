import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import jwksRsa from 'jwks-rsa';
import jwt from 'jsonwebtoken';

interface KeycloakToken {
  sub: string;
  email: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: { roles: string[] };
  client_roles?: Record<string, string[]>;
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

const KEYCLOAK_TO_ERP_ROLE_MAP: Record<string, string> = {
  PlatformOwner: 'platformAdmin',
  PlatformAdmin: 'platformAdmin',
  TenantAdmin: 'clientAdmin',
  admin: 'clientAdmin',
};

const KEYCLOAK_TO_ERP_PERMISSION_MAP: Record<string, string[]> = {
  platformAdmin: ['platform.tenants.manage', 'platform.modules.configure'],
  clientAdmin: ['clients.users.manage', 'clients.settings.write'],
};

function mapKeycloakRolesToErp(keycloakToken: KeycloakToken): { roles: string[]; permissions: string[] } {
  const realmRoles = keycloakToken.realm_access?.roles ?? [];
  const clientRoles = keycloakToken.client_roles ?? {};

  const allKeycloakRoles = [...realmRoles, ...Object.values(clientRoles).flat()];

  const erpRoles: string[] = [];
  for (const kcRole of allKeycloakRoles) {
    const erpRole = KEYCLOAK_TO_ERP_ROLE_MAP[kcRole];
    if (erpRole && !erpRoles.includes(erpRole)) {
      erpRoles.push(erpRole);
    }
  }

  const permissions = new Set<string>();
  for (const erpRole of erpRoles) {
    const rolePerms = KEYCLOAK_TO_ERP_PERMISSION_MAP[erpRole] || [];
    rolePerms.forEach((p) => permissions.add(p));
  }

  if (realmRoles.includes('PlatformOwner') || realmRoles.includes('PlatformAdmin')) {
    erpRoles.push('platformAdmin');
  }

  return {
    roles: erpRoles.length > 0 ? erpRoles : ['authenticated'],
    permissions: Array.from(permissions),
  };
}

@Injectable()
export class HybridJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly jwtSecret: string;

  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (request, rawJwtToken) => {
        try {
          const decoded = jwt.decode(rawJwtToken, { complete: true }) as any;
          const iss = decoded?.payload?.iss;
          const isKeycloak = typeof iss === 'string' && iss.includes('/realms/');

          if (isKeycloak) {
            const keycloakUrl = configService.get<string>('KEYCLOAK_AUTH_SERVER_URL')?.replace(/\/$/, '') || 'http://localhost:8081';
            const keycloakRealm = configService.get<string>('KEYCLOAK_REALM') || 'josanz-web-app-realm';
            const jwksUri = `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/certs`;

            const client = jwksRsa({
              jwksUri,
              cache: true,
              cacheMaxEntries: 5,
            });

            const key = await client.getSigningKey(decoded.header.kid);
            const signingKey = key.getPublicKey();
            return signingKey;
          }

          return configService.get<string>('JWT_SECRET') ?? 'default_secret';
        } catch {
          return configService.get<string>('JWT_SECRET') ?? 'default_secret';
        }
      },
    });
    this.jwtSecret = configService.get<string>('JWT_SECRET') ?? 'default_secret';
  }

  async validate(payload: Record<string, unknown>): Promise<ErpMappedUser> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const isKeycloak = typeof payload['iss'] === 'string' && payload['iss'].includes('/realms/');

    if (isKeycloak) {
      const kcToken = payload as unknown as KeycloakToken;
      const { roles, permissions } = mapKeycloakRolesToErp(kcToken);

      return {
        id: kcToken.sub,
        email: kcToken.email,
        firstName: kcToken.given_name,
        lastName: kcToken.family_name,
        roles,
        permissions,
        tenantId: kcToken.tenant_id,
      };
    }

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
}
