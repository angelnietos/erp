import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { KeycloakToken, ErpMappedUser } from '@josanz-erp/auth-keycloak';
import { mapKeycloakRolesToErp } from '@josanz-erp/auth-keycloak';

@Injectable()
export class HybridJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly jwtSecret: string;

  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'default_secret',
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