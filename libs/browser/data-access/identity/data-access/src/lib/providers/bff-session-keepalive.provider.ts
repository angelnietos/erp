import { APP_INITIALIZER, inject } from '@angular/core';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';
import { AuthService } from '../services/auth.service';
import { AuthStore } from '../store/auth.store';

/** Intervalo de keepalive BFF (renueva JWT en servidor vía GET /bff/auth/session). */
const BFF_KEEPALIVE_MS = 4 * 60 * 1000;

/**
 * En modo BFF, renueva la sesión periódicamente para mantener el JWT del servidor al día.
 */
export function provideBffSessionKeepalive(): {
  provide: typeof APP_INITIALIZER;
  multi: true;
  useFactory: () => () => void;
} {
  return {
    provide: APP_INITIALIZER,
    multi: true,
    useFactory: () => {
      const authService = inject(AuthService);
      const authStore = inject(AuthStore);
      const globalAuth = inject(GlobalAuthStore);

      return () => {
        if (!authService.isBffMode()) {
          return;
        }

        window.setInterval(() => {
          if (globalAuth.isAuthenticated()) {
            authStore.refreshSession();
          }
        }, BFF_KEEPALIVE_MS);

        const onVisible = (): void => {
          if (document.visibilityState === 'visible' && globalAuth.isAuthenticated()) {
            authStore.refreshSession();
          }
        };
        document.addEventListener('visibilitychange', onVisible);
      };
    },
  };
}
