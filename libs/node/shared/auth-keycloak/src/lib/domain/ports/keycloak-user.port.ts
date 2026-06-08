import { KeycloakToken, ErpMappedUser } from '../entities/keycloak-token.entity';

export const KEYCLOAK_TOKEN_SERVICE = 'KEYCLOAK_TOKEN_SERVICE';

export interface KeycloakUserServicePort {
  validateToken(token: string): Promise<KeycloakToken | null>;
  extractUserInfo(token: KeycloakToken): ErpMappedUser;
  isKeycloakToken(token: string): boolean;
}