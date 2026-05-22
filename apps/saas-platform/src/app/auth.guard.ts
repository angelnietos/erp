import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getPlatformToken } from './platform-auth.interceptor';

export const platformAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (getPlatformToken()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
