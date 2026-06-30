import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {
  AuthService,
  IdentitySessionHydrationService,
} from '@josanz-erp/identity-data-access';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';

/** Login dedicado de josanz-web-app (Keycloak PKCE + fallback local). */
const JOSANZ_LOGIN_URL = '/auth/login';

/**
 * Impide acceder al shell sin sesión. Redirige a `/auth/login` (no `/auth/tenant` del hub ERP).
 */
export const josanzAuthGuard: CanActivateFn = async () => {
  const globalAuthStore = inject(GlobalAuthStore);
  const authService = inject(AuthService);
  const sessionHydration = inject(IdentitySessionHydrationService);
  const router = inject(Router);

  if (globalAuthStore.isAuthenticated()) {
    return true;
  }

  if (!authService.isBffMode()) {
    if (authService.readPersistedSession()) {
      return true;
    }
    return router.createUrlTree([JOSANZ_LOGIN_URL]);
  }

  const restored = await sessionHydration.tryRestoreFromBffCookie();
  if (restored) {
    return true;
  }

  return router.createUrlTree([JOSANZ_LOGIN_URL]);
};

export const josanzGuestGuard: CanActivateFn = async () => {
  const globalAuthStore = inject(GlobalAuthStore);
  const authService = inject(AuthService);
  const sessionHydration = inject(IdentitySessionHydrationService);
  const router = inject(Router);

  if (globalAuthStore.isAuthenticated()) {
    return router.createUrlTree(['/events']);
  }

  if (authService.isBffMode()) {
    const restored = await sessionHydration.tryRestoreFromBffCookie();
    if (restored) {
      return router.createUrlTree(['/events']);
    }
  } else if (authService.readPersistedSession()) {
    return router.createUrlTree(['/events']);
  }

  return true;
};
