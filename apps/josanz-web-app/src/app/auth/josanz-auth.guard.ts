import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {
  AuthService,
  erpAuthGuard,
  IdentitySessionHydrationService,
} from '@josanz-erp/identity-data-access';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';

export const josanzAuthGuard: CanActivateFn = (route, state) => {
  return erpAuthGuard(route, state);
};

export const josanzGuestGuard: CanActivateFn = async () => {
  const globalAuthStore = inject(GlobalAuthStore);
  const authService = inject(AuthService);
  const sessionHydration = inject(IdentitySessionHydrationService);
  const router = inject(Router);

  if (globalAuthStore.isAuthenticated()) {
    return router.createUrlTree(['/dashboard']);
  }

  if (authService.isBffMode()) {
    const restored = await sessionHydration.tryRestoreFromBffCookie();
    if (restored) {
      return router.createUrlTree(['/dashboard']);
    }
  } else if (authService.readPersistedSession()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
