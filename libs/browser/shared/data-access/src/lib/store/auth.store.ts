import { inject ,computed } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
// import { pipe, tap, switchMap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
    tenantId: string;
    permissions: string[];
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const GlobalAuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user }) => ({
    isAuthenticated: computed(() => !!user()),
    permissions: computed(() => user()?.permissions || []),
  })),
  withMethods((store, router = inject(Router)) => ({
    hasPermission(permission: string) {
      const user = store.user();
      if (!user) return false;
      return user.permissions?.includes('*') || user.permissions?.includes(permission);
    },
    setUser(user: AuthState['user']) {
      patchState(store, { user });
    },
    logout() {
      patchState(store, { user: null });
      router.navigate(['/auth/login']);
    },
    setLoading(loading: boolean) {
      patchState(store, { loading });
    },
    setError(error: string | null) {
      patchState(store, { error });
    },
  }))
);
