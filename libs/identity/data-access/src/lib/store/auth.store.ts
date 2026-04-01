import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserPayload } from '@josanz-erp/identity-api';
import { Router } from '@angular/router';
import { AuthStore as GlobalAuthStore } from '@josanz-erp/shared-data-access';

export interface AuthState {
  user: UserPayload | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user }) => ({
    isAuthenticated: computed(() => !!user()),
  })),
  withMethods((store, authService = inject(AuthService), router = inject(Router), globalAuthStore = inject(GlobalAuthStore)) => ({
    login: rxMethod<{ email: string; password: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ email, password }) => 
          authService.login(email, password).pipe(
            tap((response) => {
              authService.setToken(response.accessToken);
              authService.setTenantId(response.tenantId);
              patchState(store, { user: response.user, loading: false });
              // Sync with global auth store
              globalAuthStore.setUser({
                id: response.user.id,
                email: response.user.email,
                name: response.user.email,
                tenantId: response.tenantId,
              });
              router.navigate(['/budgets']);
            }),
            catchError((err) => {
              const msg = err.error?.message;
              const messageText = Array.isArray(msg) ? msg.join('. ') : msg;
              patchState(store, {
                loading: false,
                error:
                  messageText || 'Login failed. Please check your credentials.',
              });
              return of(null);
            })
          )
        )
      )
    ),
    logout() {
      authService.removeToken();
      patchState(store, { user: null });
      // Clear global auth store
      globalAuthStore.logout();
      router.navigate(['/auth/login']);
    },
    loadUserFromToken() {
      const session = authService.readPersistedSession();
      if (!session) {
        return;
      }
      patchState(store, { user: session.user });
      const u = session.user;
      const displayName = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email;
      globalAuthStore.setUser({
        id: u.id,
        email: u.email,
        name: displayName,
        tenantId: session.tenantId,
      });
    },
  }))
);
