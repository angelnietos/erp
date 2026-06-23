export const AUTH_TOKEN_PORT = Symbol('AUTH_TOKEN_PORT');

export interface AccessTokenClaims {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
  tenantId: string;
}

export interface AuthTokenPort {
  signAccessToken(claims: AccessTokenClaims): Promise<string>;
}
