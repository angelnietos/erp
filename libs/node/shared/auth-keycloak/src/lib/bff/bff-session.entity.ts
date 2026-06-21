/** Sesión BFF: tokens solo en servidor; el navegador recibe cookie opaca HttpOnly. */
export type BffAuthKind = 'keycloak' | 'local' | 'platform';

export interface BffSessionRecord {
  id: string;
  kind: BffAuthKind;
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  keycloakRealm?: string;
  keycloakClientId?: string;
  expiresAt: number;
  tenantId?: string;
  tenantSlug?: string;
  csrfToken: string;
  createdAt: number;
}

export interface BffSessionPublicView {
  authenticated: boolean;
  kind: BffAuthKind;
  expiresAt: number;
}

export interface BffCookieNames {
  session: string;
  csrf: string;
}

export const ERP_BFF_COOKIE_NAMES: BffCookieNames = {
  session: 'erp_sid',
  csrf: 'erp_csrf',
};

export const PLATFORM_BFF_COOKIE_NAMES: BffCookieNames = {
  session: 'saas_sid',
  csrf: 'saas_csrf',
};
