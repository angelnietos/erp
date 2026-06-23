import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SessionTokenStorageService } from './session-token.storage';

/** Añade Bearer JWT; ante 401 limpia sesión (token caducado o inválido). */
function isPublicAuthRoute(req: { method: string; url: string }): boolean {
  return (
    req.method === 'POST' &&
    (req.url.includes('/api/auth/login') || req.url.endsWith('/auth/login'))
  );
}

export const authBearerInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(SessionTokenStorageService);
  const token = storage.getAccessToken();
  const tenantId = storage.getTenantId();
  const attachAuth = token && !isPublicAuthRoute(req);

  console.log('authBearerInterceptor', req.url, {
    token: !!token,
    tenantId: !!tenantId,
    attachAuth,
    isPublic: isPublicAuthRoute(req),
  });

  const headers: Record<string, string> = {};
  if (attachAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (tenantId) {
    headers['x-tenant-id'] = tenantId;
  }

  const authReq =
    Object.keys(headers).length > 0
      ? req.clone({ setHeaders: headers })
      : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        storage.clear();
      }
      return throwError(() => err);
    }),
  );
};
