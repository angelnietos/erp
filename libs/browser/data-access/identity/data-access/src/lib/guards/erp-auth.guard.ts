import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';
import { AuthService } from '../services/auth.service';

/**
 * Impide acceder al shell ERP sin usuario en memoria ni sesión persistida válida.
 */
export const erpAuthGuard: CanActivateFn = () => {
  const globalAuthStore = inject(GlobalAuthStore);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (globalAuthStore.isAuthenticated()) {
    return true;
  }

  if (!authService.isBffMode() && authService.readPersistedSession()) {
    return true;
  }

  void router.navigate(['/auth/login'], { replaceUrl: true });
  return false;
};
