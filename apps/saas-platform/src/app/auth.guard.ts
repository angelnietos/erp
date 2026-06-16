import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {
  clearPlatformToken,
  getPlatformToken,
  isPlatformTokenExpired,
} from './platform-auth.interceptor';

export const platformAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
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
