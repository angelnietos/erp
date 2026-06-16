import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BffAuthClient } from './bff-auth.client';
import {
  ENTERPRISE_AUTH_CONFIG,
  ERP_BFF_CSRF_COOKIE,
  SAAS_BFF_CSRF_COOKIE,
  readBrowserCookie,
} from './enterprise-auth.config';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function csrfCookieForUrl(url: string): string {
  if (url.includes('/bff/platform') || url.includes('/platform/')) {
    return SAAS_BFF_CSRF_COOKIE;
  }
  return ERP_BFF_CSRF_COOKIE;
}

function resolveCsrf(url: string, bff: BffAuthClient, cookieName: string): string | null {
  if (url.includes('/bff/platform') || url.includes('/platform/')) {
    return bff.getPlatformCsrf() ?? readBrowserCookie(cookieName);
  }
  return bff.getErpCsrf() ?? readBrowserCookie(cookieName);
}

/**
 * Modo BFF: envía cookies de sesión + token CSRF en mutaciones.
 * No añade Authorization Bearer (el middleware BFF inyecta el token en servidor).
 */
export const bffAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(ENTERPRISE_AUTH_CONFIG, { optional: true });
  if ((config?.mode ?? 'legacy') !== 'bff') {
    return next(req);
  }

  const bff = inject(BffAuthClient);
  let cloned = req.clone({ withCredentials: true });

  if (MUTATING.has(req.method)) {
    const csrfName = config?.csrfCookieName ?? csrfCookieForUrl(req.url);
    const token = resolveCsrf(req.url, bff, csrfName);
    if (token) {
      cloned = cloned.clone({
        setHeaders: { 'X-CSRF-Token': token },
      });
    }
  }

  return next(cloned);
};
