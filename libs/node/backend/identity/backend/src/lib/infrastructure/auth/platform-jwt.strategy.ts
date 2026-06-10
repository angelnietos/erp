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
  scope?: string;
  iss?: string;
}

interface PlatformMappedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  permissions: string[];
  kind: 'platform';
}

const ALL_PLATFORM_PERMISSIONS: string[] = [
  '*',
  'platform.manage',
  'tenants.view',
  'tenants.manage',
  'users.view',
  'users.manage',
  'roles.manage',
  'system.manage',
  'audit.view',
];

@Injectable()
export class PlatformJwtStrategy extends PassportStrategy(Strategy, 'platform-jwt') {
  constructor(
    private readonly configService: ConfigService,
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
              configService.get<string>('KEYCLOAK_PLATFORM_REALM') || 'babooni-platform';
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
  }

  async validate(payload: Record<string, unknown>): Promise<PlatformMappedUser> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const isKeycloak =
      typeof payload['iss'] === 'string' && payload['iss'].includes('/realms/');

    if (isKeycloak) {
      return this.validateKeycloakPlatformUser(payload as unknown as KeycloakToken);
    }

    // Standard platform JWT (HS256) - local dev fallback
    const roles = Array.isArray(payload.roles)
      ? payload.roles.filter((r): r is string => typeof r === 'string')
      : [];
    
    const isAdmin = roles.some(r => ['PlatformOwner', 'PlatformAdmin'].includes(r));

    return {
      id: String(payload.sub),
      email: String(payload.email ?? ''),
      firstName: payload.firstName as string | undefined,
      lastName: payload.lastName as string | undefined,
      roles: isAdmin ? roles : ['authenticated'],
      permissions: isAdmin ? ALL_PLATFORM_PERMISSIONS : [],
      kind: 'platform',
    };
  }

  private validateKeycloakPlatformUser(kcToken: KeycloakToken): PlatformMappedUser {
    const email = kcToken.email || kcToken.preferred_username || '';

    if (!email) {
      throw new UnauthorizedException('Keycloak token missing email claim');
    }

    const realmRoles = kcToken.realm_access?.roles ?? [];
    const isPlatformAdmin = realmRoles.some((r) =>
      ['PlatformOwner', 'PlatformAdmin'].includes(r),
    );

    return {
      id: kcToken.sub,
      email,
      firstName: kcToken.given_name,
      lastName: kcToken.family_name,
      roles: isPlatformAdmin ? realmRoles : ['authenticated'],
      permissions: isPlatformAdmin ? ALL_PLATFORM_PERMISSIONS : [],
      kind: 'platform',
    };
  }
}