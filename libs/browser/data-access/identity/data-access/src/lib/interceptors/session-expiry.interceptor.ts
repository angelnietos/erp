import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';
import { AuthStore } from '../store/auth.store';
import { AuthService } from '../services/auth.service';

let sessionInvalidationInProgress = false;

/** Permite volver a invalidar sesión tras un nuevo login. */
export function resetSessionInvalidationGuard(): void {
  sessionInvalidationInProgress = false;
}

const AUTH_EXEMPT_URL_PARTS = [
  '/bff/auth/login',
  '/bff/auth/logout',
  '/bff/auth/session',
  '/bff/platform/auth/login',
  '/bff/platform/auth/logout',
  '/bff/platform/auth/session',
  '/api/auth/login',
  '/api/platform/auth/login',
  '/api/platform/auth/session',
];

function isAuthExemptUrl(url: string): boolean {
  return AUTH_EXEMPT_URL_PARTS.some((part) => url.includes(part));
}

function shouldInvalidateSession(url: string, error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse)) {
    return false;
  }
  if (error.status !== 401) {
    return false;
  }
  if (!url.includes('/api/')) {
    return false;
  }
  return !isAuthExemptUrl(url);
}

function invalidateSession(reason: 'expired' | 'unauthorized' = 'expired'): void {
  if (sessionInvalidationInProgress) {
    return;
  }
  sessionInvalidationInProgress = true;

  const router = inject(Router);
  const globalAuthStore = inject(GlobalAuthStore);
  const authStore = inject(AuthStore);
  const authService = inject(AuthService);

  if (globalAuthStore.isAuthenticated()) {
    authStore.logout();
    return;
  }

  authService.clearSessionForRelogin();
  void router.navigate(['/auth/login'], {
    queryParams: { reason },
    replaceUrl: true,
  });
}

/**
 * Cierra sesión y redirige al login cuando la API responde 401 (sesión BFF/JWT caducada o inválida).
 */
export const sessionExpiryInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) => {
      if (shouldInvalidateSession(req.url, error)) {
        invalidateSession('expired');
      }
      return throwError(() => error);
    }),
  );
