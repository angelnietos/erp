import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { KeycloakToken, ErpMappedUser } from '../../domain/entities/keycloak-token.entity';
import { mapKeycloakRolesToErp } from '../../utils/role-mapper';

@Injectable()
export class KeycloakTokenService {
  private readonly keycloakUrl: string;
  private readonly realm: string;

  constructor(private readonly configService: ConfigService) {
    this.keycloakUrl = (configService.get<string>('KEYCLOAK_AUTH_SERVER_URL') || 'http://localhost:8081').replace(/\/$/, '');
    this.realm = configService.get<string>('KEYCLOAK_REALM') || 'josanz-web-app-realm';
  }

  isKeycloakToken(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as KeycloakToken | null;
      return decoded?.iss?.includes('/realms/') ?? false;
    } catch {
      return false;
    }
  }

  decodeToken(token: string): KeycloakToken | null {
    try {
      return jwt.decode(token) as KeycloakToken;
    } catch {
      return null;
    }
  }

  extractUserInfo(token: KeycloakToken): ErpMappedUser {
    const { roles, permissions } = mapKeycloakRolesToErp(token);

    return {
      id: token.sub,
      email: token.email,
      firstName: token.given_name,
      lastName: token.family_name,
      roles,
      permissions,
      tenantId: token.tenant_id,
    };
  }
}