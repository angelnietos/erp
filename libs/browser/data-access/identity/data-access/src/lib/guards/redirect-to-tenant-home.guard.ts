import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';
import { AuthService } from '../services/auth.service';
import { resolveTenantHomePath } from '../utils/post-login-navigation';

/** Sin sesión → picker de tenant; con sesión → home del tenant activo. */
export const redirectToTenantHomeGuard: CanActivateFn = () => {
  const router = inject(Router);
  const globalAuthStore = inject(GlobalAuthStore);
  const authService = inject(AuthService);

  const hasSession =
    globalAuthStore.isAuthenticated() ||
    (!authService.isBffMode() && authService.readPersistedSession());

  if (hasSession) {
    return router.createUrlTree([resolveTenantHomePath()]);
  }

  return router.createUrlTree(['/auth/tenant']);
};
