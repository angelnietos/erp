import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';
import { AuthService } from '../services/auth.service';
import { IdentitySessionHydrationService } from '../services/identity-session-hydration.service';

/**
 * Impide acceder al shell ERP sin usuario en memoria ni sesión BFF/JWT persistida válida.
 */
export const erpAuthGuard: CanActivateFn = async () => {
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
    void router.navigate(['/auth/tenant'], { replaceUrl: true });
    return false;
  }

  const restored = await sessionHydration.tryRestoreFromBffCookie();
  if (restored) {
    return true;
  }

  void router.navigate(['/auth/tenant'], { replaceUrl: true });
  return false;
};
