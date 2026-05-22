import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JosanzDemoAuthService } from './josanz-demo-auth.service';

export const josanzAuthGuard: CanActivateFn = () => {
  const auth = inject(JosanzDemoAuthService);
  if (auth.isAuthenticated()) {
    return true;
  }
  return inject(Router).createUrlTree(['/auth/login']);
};

export const josanzGuestGuard: CanActivateFn = () => {
  const auth = inject(JosanzDemoAuthService);
  if (!auth.isAuthenticated()) {
    return true;
  }
  return inject(Router).createUrlTree(['/dashboard']);
};
