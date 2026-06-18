import { APP_INITIALIZER, inject } from '@angular/core';
import { AuthStore } from '../store/auth.store';
import { IdentitySessionHydrationService } from '../services/identity-session-hydration.service';

/** Renueva sesión BFF antes de que caduque el JWT (~cada 90 s con pestaña activa). */
const BFF_KEEPALIVE_MS = 90 * 1000;
/** Al volver a la pestaña o ventana, esperar un instante antes de refrescar. */
const FOCUS_REFRESH_DEBOUNCE_MS = 400;

/**
 * En modo BFF, renueva la sesión periódicamente, al volver a la pestaña y al recuperar el foco.
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
      const authStore = inject(AuthStore);
      const sessionHydration = inject(IdentitySessionHydrationService);

      return () => {
        if (typeof window === 'undefined') {
          return;
        }

        const refreshBffSession = (): void => {
          if (!sessionHydration.shouldRunBffKeepalive()) {
            return;
          }
          authStore.refreshSession();
        };

        window.setInterval(refreshBffSession, BFF_KEEPALIVE_MS);

        let focusTimer: number | undefined;
        const scheduleFocusRefresh = (): void => {
          if (document.visibilityState === 'hidden') {
            return;
          }
          if (focusTimer !== undefined) {
            window.clearTimeout(focusTimer);
          }
          focusTimer = window.setTimeout(() => {
            focusTimer = undefined;
            refreshBffSession();
          }, FOCUS_REFRESH_DEBOUNCE_MS);
        };

        document.addEventListener('visibilitychange', scheduleFocusRefresh);
        window.addEventListener('focus', scheduleFocusRefresh);
      };
    },
  };
}
