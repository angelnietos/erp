export declare const AUTH_TOKEN_PORT: unique symbol;
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
