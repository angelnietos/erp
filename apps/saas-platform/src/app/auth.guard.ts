import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { BffAuthClient, ENTERPRISE_AUTH_CONFIG } from '@josanz-erp/shared-auth-keycloak';
import {
  clearPlatformToken,
  getPlatformToken,
  isPlatformTokenExpired,
} from './platform-auth.interceptor';

export const platformAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const enterpriseAuth = inject(ENTERPRISE_AUTH_CONFIG, { optional: true });
  const bff = inject(BffAuthClient, { optional: true });
  const isBff = bff?.isBffMode() ?? enterpriseAuth?.mode === 'bff';

  if (isBff && bff) {
    return bff.platformSession().pipe(
      map(() => true),
      catchError(() =>
        of(
          router.createUrlTree(['/login'], {
            queryParams: { reason: 'expired' },
          }),
        ),
      ),
    );
  }

  const token = getPlatformToken();
  if (token && !isPlatformTokenExpired(token)) {
    return true;
  }
  if (token) {
    clearPlatformToken();
  }
  return router.createUrlTree(['/login'], {
    queryParams: token ? { reason: 'expired' } : undefined,
  });
};
