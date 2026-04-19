import { computed } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
// import { pipe, tap, switchMap, catchError, of } from 'rxjs';

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
  withMethods((store) => ({
    hasPermission(permission: string) {
      const user = store.user();
      if (!user) return false;
      const has = user.permissions?.includes('*') || user.permissions?.includes(permission);
      if (has) console.log(`[GlobalAuthStore] Permission GRANTED for '${permission}' (User has: ${user.permissions.join(',')})`);
      else console.warn(`[GlobalAuthStore] Permission DENIED for '${permission}' (User has: ${user.permissions.join(',')})`);
      return has;
    },
    setUser(user: AuthState['user']) {
      console.log('[GlobalAuthStore] Setting user:', user?.email, 'with permissions:', user?.permissions);
      patchState(store, { user });
    },
    logout() {
      patchState(store, { user: null });
    },
    setLoading(loading: boolean) {
      patchState(store, { loading });
    },
    setError(error: string | null) {
      patchState(store, { error });
    },
  }))
);
