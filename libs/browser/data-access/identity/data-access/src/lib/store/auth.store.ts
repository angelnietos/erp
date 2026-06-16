import { inject, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, catchError, of, map } from 'rxjs';
import {
  AuthService,
  ERP_TENANT_SLUG_SESSION_KEY,
  type IdentityAuthMode,
} from '../services/auth.service';
import { syncErpTenantHtmlTheme } from '../utils/erp-tenant-theme';
import { resolvePostLoginPath } from '../utils/post-login-navigation';
import { resetSessionInvalidationGuard } from '../interceptors/session-expiry.interceptor';
import { TenantModulesApiService } from '../services/tenant-modules-api.service';
import { TenantModulesRealtimeService } from '../services/tenant-modules-realtime.service';
import { GlobalAuthStore, PluginStore, ThemeService } from '@josanz-erp/shared-data-access';
import { AuthResponse, UserPayload } from '@josanz-erp/identity-api';
import { getStoredTenantId } from '../interceptors/tenant.interceptor';

export interface IdentityAuthState {
  user: UserPayload | null;
  loading: boolean;
  error: string | null;
  authMode: IdentityAuthMode;
  keycloakAvailable: boolean | null;
}

const initialState: IdentityAuthState = {
  user: null,
  loading: false,
  error: null,
  authMode: 'none',
  keycloakAvailable: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const authService = inject(AuthService);
    const globalAuthStore = inject(GlobalAuthStore);
    const router = inject(Router);
    const tenantModulesApi = inject(TenantModulesApiService);
    const tenantModulesRealtime = inject(TenantModulesRealtimeService);
    const pluginStore = inject(PluginStore);
    const themeService = inject(ThemeService);

    return {
      loadUserFromToken() {
        const session = authService.readPersistedSession();
        if (!session) return;
        const authMeta = authService.getPersistedAuthMeta();
        
        patchState(store, { user: session.user, ...authMeta });
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
          tap(() => {
            resetSessionInvalidationGuard();
            tenantModulesRealtime.disconnect();
            authService.clearSessionForRelogin();
            globalAuthStore.logout();
            patchState(store, {
              user: null,
              loading: true,
              error: null,
              authMode: 'none',
              keycloakAvailable: null,
            });
          }),
          switchMap(({ email, password, tenantSlug }) =>
            authService.login(email, password, tenantSlug).pipe(
              switchMap((response) => {
                const authMeta = authService.getPersistedAuthMeta();
                authService.setToken(response.accessToken);
                const tenantId =
                  response.tenantId ??
                  authService.syncTenantIdFromAccessToken() ??
                  getStoredTenantId() ??
                  undefined;

                if (tenantId) {
                  authService.setTenantId(tenantId);
                }

                patchState(store, {
                  user: response.user,
                  loading: true,
                  ...authMeta,
                });

                const displayName =
                  [response.user.firstName, response.user.lastName]
                    .filter(Boolean)
                    .join(' ')
                    .trim() || response.user.email;
                globalAuthStore.setUser({
                  id: response.user.id,
                  email: response.user.email,
                  name: displayName,
                  tenantId: tenantId ?? '',
                  permissions: response.user.permissions,
                });

                if (response.tenantSlug) {
                  if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.setItem(
                      ERP_TENANT_SLUG_SESSION_KEY,
                      response.tenantSlug,
                    );
                  }
                  syncErpTenantHtmlTheme();
                  themeService.reapplyTheme();
                } else if (tenantSlug && typeof sessionStorage !== 'undefined') {
                  sessionStorage.setItem(ERP_TENANT_SLUG_SESSION_KEY, tenantSlug);
                  syncErpTenantHtmlTheme();
                  themeService.reapplyTheme();
                }

                const modules$ = tenantId
                  ? tenantModulesApi.fetchEnabledModules(tenantId).pipe(
                      catchError(() => {
                        pluginStore.loadFromStorage();
                        return of({
                          enabledModuleIds: pluginStore.enabledPlugins(),
                        });
                      }),
                    )
                  : of({ enabledModuleIds: pluginStore.enabledPlugins() });

                return modules$.pipe(
                  tap((modules) => pluginStore.setPlugins(modules.enabledModuleIds)),
                  map(() => ({ response, authMeta })),
                );
              }),
              tap(({ response, authMeta }) => {
                patchState(store, {
                  user: response.user,
                  loading: false,
                  ...authMeta,
                });
                tenantModulesRealtime.afterAccessTokenChanged();
                const target = resolvePostLoginPath(
                  pluginStore.enabledPlugins(),
                  response.user.permissions ?? [],
                );
                void router.navigateByUrl(target, { replaceUrl: true });
              }),
              catchError((error) => {
                const authMeta = authService.getPersistedAuthMeta();
                patchState(store, {
                  loading: false,
                  error: authService.describeLoginError(error),
                  ...authMeta,
                });
                return of(null);
              }),
            ),
          ),
        ),
      ),

      logout() {
        tenantModulesRealtime.disconnect();
        authService.logout().subscribe(() => {
          resetSessionInvalidationGuard();
          patchState(store, {
            user: null,
            authMode: 'none',
            keycloakAvailable: null,
          });
          globalAuthStore.logout();
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem(ERP_TENANT_SLUG_SESSION_KEY);
          }
          syncErpTenantHtmlTheme();
          themeService.reapplyTheme();
          void router.navigate(['/auth/login'], {
            queryParams: { reason: 'logout' },
            replaceUrl: true,
          });
        });
      },

      refreshSession: rxMethod<void>(
        pipe(
          switchMap(() => authService.refreshSession().pipe(
            catchError((err) => {
              if (isDevMode()) {
                console.warn(
                  '[AuthStore] refreshSession failed:',
                  err?.status,
                  err?.message,
                );
              }
              return of(null);
            })
          )),
          tap((response: AuthResponse | null) => {
            if (!response) {
              if (globalAuthStore.isAuthenticated()) {
                tenantModulesRealtime.disconnect();
                authService.clearSessionForRelogin();
                patchState(store, {
                  user: null,
                  authMode: 'none',
                  keycloakAvailable: null,
                });
                globalAuthStore.logout();
                if (typeof sessionStorage !== 'undefined') {
                  sessionStorage.removeItem(ERP_TENANT_SLUG_SESSION_KEY);
                }
                syncErpTenantHtmlTheme();
                themeService.reapplyTheme();
                void router.navigate(['/auth/login'], {
                  queryParams: { reason: 'expired' },
                  replaceUrl: true,
                });
              }
              return;
            }

            if (isDevMode()) {
              console.log(
                '[AuthStore] refreshSession response user:',
                response.user.email,
              );
              console.log(
                '[AuthStore] refreshSession response permissions:',
                response.user.permissions,
              );
            }

            authService.setToken(response.accessToken);
            if (response.tenantId) {
              authService.setTenantId(response.tenantId);
            }
            patchState(store, { user: response.user });

            if (response.tenantSlug) {
              if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem(ERP_TENANT_SLUG_SESSION_KEY, response.tenantSlug);
              }
              syncErpTenantHtmlTheme();
              themeService.reapplyTheme();
            }

            const displayName = [response.user.firstName, response.user.lastName].filter(Boolean).join(' ').trim() || response.user.email;
            globalAuthStore.setUser({
              id: response.user.id,
              email: response.user.email,
              name: displayName,
              tenantId: response.tenantId || getStoredTenantId() || '',
              permissions: response.user.permissions,
            });

            // Only fetch tenant modules if we have a tenant context
            if (response.tenantId || getStoredTenantId()) {
              tenantModulesApi.fetchEnabledModules(response.tenantId ?? getStoredTenantId()!).subscribe({
                next: (r) => pluginStore.setPlugins(r.enabledModuleIds),
                error: () => pluginStore.loadFromStorage(),
              });
            }
            tenantModulesRealtime.afterAccessTokenChanged();
          })
        )
      ),
    };
  }),
);
