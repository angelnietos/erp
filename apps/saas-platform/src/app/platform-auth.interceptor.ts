import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { BffAuthClient, ENTERPRISE_AUTH_CONFIG } from '@josanz-erp/shared-auth-keycloak';

const TOKEN_KEY = 'saas_platform_token';

export const platformAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const enterpriseAuth = inject(ENTERPRISE_AUTH_CONFIG, { optional: true });
  const bff = inject(BffAuthClient, { optional: true });
  const isBff = bff?.isBffMode() ?? enterpriseAuth?.mode === 'bff';

  let request = req;
  if (!isBff) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && req.url.includes('/api/')) {
      request = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }
  }

  return next(request).pipe(
    catchError((error: unknown) => {
      const isAuthEndpoint =
        req.url.includes('/api/platform/auth/login') ||
        req.url.includes('/api/platform/auth/session') ||
        req.url.includes('/api/bff/platform/auth/login') ||
        req.url.includes('/api/bff/platform/auth/callback') ||
        req.url.includes('/api/bff/platform/auth/session');
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isAuthEndpoint
      ) {
        clearPlatformToken();
        void router.navigate(['/login'], {
          queryParams: { reason: 'expired' },
          replaceUrl: true,
        });
      }
      return throwError(() => error);
    }),
  );
};

export function getPlatformToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setPlatformToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearPlatformToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isPlatformTokenExpired(token: string, now = Date.now()): boolean {
  const payload = decodeJwtPayload(token);
  const exp = payload?.['exp'];
  return typeof exp === 'number' && exp * 1000 <= now;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }
    const segment = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = segment.padEnd(
      segment.length + ((4 - (segment.length % 4)) % 4),
      '=',
    );
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}
