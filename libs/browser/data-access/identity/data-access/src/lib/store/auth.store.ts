import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';
import { AuthResponse, UserPayload } from '@josanz-erp/identity-api';
import { getStoredTenantId } from '../interceptors/tenant.interceptor';

export interface IdentityAuthState {
  user: UserPayload | null;
  loading: boolean;
  error: string | null;
}

const initialState: IdentityAuthState = {
  user: null,
  loading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const authService = inject(AuthService);
    const globalAuthStore = inject(GlobalAuthStore);
    const router = inject(Router);

    return {
      loadUserFromToken() {
        const session = authService.readPersistedSession();
        if (!session) return;
        
        patchState(store, { user: session.user });
        globalAuthStore.setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.email,
          tenantId: session.tenantId,
          permissions: session.user.permissions,
        });
      },

      login: rxMethod<{ email: string; password: string; tenantSlug?: string }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(({ email, password, tenantSlug }) =>
            authService.login(email, password, tenantSlug).pipe(
              tap((response) => {
                authService.setToken(response.accessToken);
                authService.setTenantId(response.tenantId);
                patchState(store, { user: response.user, loading: false });
                
                const displayName = [response.user.firstName, response.user.lastName].filter(Boolean).join(' ').trim() || response.user.email;
                globalAuthStore.setUser({
                  id: response.user.id,
                  email: response.user.email,
                  name: displayName,
                  tenantId: response.tenantId,
                  permissions: response.user.permissions,
                });

                router.navigate(['/']);
              }),
              catchError((error) => {
                patchState(store, {
                  loading: false,
                  error: error.error?.message || 'Login failed',
                });
                return of(null);
              }),
            ),
          ),
        ),
      ),

      logout() {
        authService.removeToken();
        patchState(store, { user: null });
        globalAuthStore.logout();
        router.navigate(['/auth/login']);
      },

      refreshSession: rxMethod<void>(
        pipe(
          switchMap(() => authService.refreshSession().pipe(
            catchError((err) => {
              console.warn('[AuthStore] refreshSession failed:', err?.status, err?.message);
              return of(null);
            })
          )),
          tap((response: AuthResponse | null) => {
            if (!response) return;
            
            console.log('[AuthStore] refreshSession response user:', response.user.email);
            console.log('[AuthStore] refreshSession response permissions:', response.user.permissions);
            
            authService.setToken(response.accessToken);
            patchState(store, { user: response.user });
            
            const displayName = [response.user.firstName, response.user.lastName].filter(Boolean).join(' ').trim() || response.user.email;
            globalAuthStore.setUser({
              id: response.user.id,
              email: response.user.email,
              name: displayName,
              tenantId: response.tenantId || getStoredTenantId() || '',
              permissions: response.user.permissions,
            });
          })
        )
      ),
    };
  }),
);
