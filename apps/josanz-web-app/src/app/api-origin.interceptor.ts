import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ENTERPRISE_AUTH_CONFIG } from '@josanz-erp/shared-auth-keycloak';
import { environment } from '../environments/environment';

/** Same-origin BFF vía proxy en dev; legacy con apiOrigin absoluto. */
export const apiOriginInterceptor: HttpInterceptorFn = (req, next) => {
  const authCfg = inject(ENTERPRISE_AUTH_CONFIG, { optional: true });
  const bffMode = authCfg?.mode === 'bff';

  if (bffMode) {
    return next(req.clone({ withCredentials: true }));
  }

  const origin = environment.apiOrigin?.replace(/\/$/, '') ?? '';
  if (origin && req.url.startsWith('/api')) {
    return next(req.clone({ url: `${origin}${req.url}` }));
  }
  return next(req);
};
