import { InjectionToken } from '@angular/core';

/** `bff`: cookies HttpOnly vía BFF (recomendado producción). `legacy`: JWT en localStorage. */
export type EnterpriseAuthMode = 'bff' | 'legacy';

export interface EnterpriseAuthConfig {
  mode: EnterpriseAuthMode;
  /** Prefijo API relativo o absoluto (p. ej. `/api` o `http://localhost:3000/api`). */
  apiPrefix?: string;
  /** ERP tenant slug por defecto en login BFF. */
  defaultTenantSlug?: string;
  /** Nombre cookie CSRF legible por JS (debe coincidir con backend). */
  csrfCookieName?: string;
}

export const ENTERPRISE_AUTH_CONFIG = new InjectionToken<EnterpriseAuthConfig>(
  'ENTERPRISE_AUTH_CONFIG',
);

export const ERP_BFF_CSRF_COOKIE = 'erp_csrf';
export const SAAS_BFF_CSRF_COOKIE = 'saas_csrf';

export function readBrowserCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
