import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserPayload } from '@josanz-erp/identity-api';
import { Router } from '@angular/router';
import { AuthStore as GlobalAuthStore, DomainEventsApiService } from '@josanz-erp/shared-data-access';
import { getStoredTenantId } from '../interceptors/tenant.interceptor';

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
    permissions: computed(() => user()?.permissions || []),
  })),
  withMethods((store, authService = inject(AuthService), router = inject(Router), globalAuthStore = inject(GlobalAuthStore), domainEventsApi = inject(DomainEventsApiService)) => ({
    hasPermission(permission: string) {
      const user = store.user();
      if (!user) return false;
      return user.permissions?.includes('*') || user.permissions?.includes(permission);
    },
    login: rxMethod<{ email: string; password: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ email, password }) => 
          authService.login(email, password).pipe(
            tap((response) => {
              authService.setToken(response.accessToken);
              authService.setTenantId(response.tenantId);
              patchState(store, { user: response.user, loading: false });
              globalAuthStore.setUser({
                id: response.user.id,
                email: response.user.email,
                name: response.user.email,
                tenantId: response.tenantId,
                permissions: response.user.permissions,
              });
              // Register audit event
              domainEventsApi.append({
                eventType: 'LOGIN',
                aggregateType: 'USER',
                aggregateId: response.user.id,
                payload: { email: response.user.email, name: response.user.email }
              }).subscribe();
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
        permissions: u.permissions,
      });
    },
    refreshSession: rxMethod<void>(
      pipe(
        switchMap(() => authService.refreshSession()),
        tap((user: UserPayload) => {
          patchState(store, { user });
          const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email;
          globalAuthStore.setUser({
            id: user.id,
            email: user.email,
            name: displayName,
            tenantId: getStoredTenantId() || '',
            permissions: user.permissions,
          });
        })
      )
    ),
  }))
)
