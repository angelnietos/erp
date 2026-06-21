import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { KeycloakToken, ErpMappedUser } from '../domain/entities/keycloak-token.entity';
import { mapKeycloakRolesToErp } from '../utils/role-mapper';

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'keycloak') {
  private readonly jwksClient: jwksClient.JwksClient | null = null;
  private readonly keycloakUrl: string;
  private readonly realm: string;

  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: () => configService.get<string>('JWT_SECRET') || 'default_secret',
    });

    this.keycloakUrl = (configService.get<string>('KEYCLOAK_AUTH_SERVER_URL') || 'http://localhost:8081').replace(/\/$/, '');
    this.realm = configService.get<string>('KEYCLOAK_REALM') || 'josanz-web-app-realm';

    this.jwksClient = jwksClient({
      jwksUri: `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/certs`,
      cache: true,
      cacheMaxEntries: 5,
    });
  }

  async validate(payload: KeycloakToken): Promise<ErpMappedUser> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const { roles, permissions } = mapKeycloakRolesToErp(payload);

    return {
      id: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      roles,
      permissions,
      tenantId: payload.tenant_id,
    };
  }
}