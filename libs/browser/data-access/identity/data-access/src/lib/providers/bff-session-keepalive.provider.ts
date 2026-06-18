import { APP_INITIALIZER, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AuthStore } from '../store/auth.store';

/** Intervalo de keepalive BFF (renueva JWT en servidor vía GET /bff/auth/session). */
const BFF_KEEPALIVE_MS = 4 * 60 * 1000;
/** Al volver a la pestaña, esperar un instante antes de refrescar (evita ráfagas). */
const VISIBILITY_REFRESH_DEBOUNCE_MS = 500;

/**
 * En modo BFF, renueva la sesión periódicamente y al volver a la pestaña visible.
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

      return () => {
        if (!authService.isBffMode() || typeof window === 'undefined') {
          return;
        }

        const refreshBffSession = (): void => {
          authStore.refreshSession();
        };

        window.setInterval(refreshBffSession, BFF_KEEPALIVE_MS);

        let visibilityTimer: number | undefined;
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState !== 'visible') {
            return;
          }
          if (visibilityTimer !== undefined) {
            window.clearTimeout(visibilityTimer);
          }
          visibilityTimer = window.setTimeout(() => {
            visibilityTimer = undefined;
            refreshBffSession();
          }, VISIBILITY_REFRESH_DEBOUNCE_MS);
        });
      };
    },
  };
}
