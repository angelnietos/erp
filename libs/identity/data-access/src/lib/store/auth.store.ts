import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserPayload } from '@josanz-erp/identity-api';
import { Router } from '@angular/router';
import { computed } from '@angular/core';

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
  withMethods((store, authService = inject(AuthService), router = inject(Router)) => ({
    login: rxMethod<{ email: string; password: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ email, password }) => 
          authService.login(email, password).pipe(
            tap((response) => {
              authService.setToken(response.accessToken);
              patchState(store, { user: response.user, loading: false });
              router.navigate(['/']);
            }),
            catchError((err) => {
              patchState(store, { 
                loading: false, 
                error: err.error?.message || 'Login failed. Please check your credentials.' 
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
      router.navigate(['/auth/login']);
    },
    // Rehydrate state on app load
    loadUserFromToken() {
        // TODO: Implement token decoding or verification endpoint
    }
  }))
);
