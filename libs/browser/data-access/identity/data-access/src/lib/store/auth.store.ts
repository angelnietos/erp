import { inject, isDevMode } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, catchError, of, map, Observable } from 'rxjs';
import {
  AuthService,
  ERP_TENANT_SLUG_SESSION_KEY,
  type IdentityAuthMode,
} from '../services/auth.service';
import { syncErpTenantHtmlTheme, setErpTenantSlug, resolveTenantSlugFromId } from '../utils/erp-tenant-theme';
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

type RefreshSessionOutcome =
  | { kind: 'ok'; response: AuthResponse }
  | { kind: 'auth-failed' }
  | { kind: 'transient' };

function readHttpStatus(error: unknown): number | null {
  if (error instanceof HttpErrorResponse) {
    return error.status;
  }
  if (error && typeof error === 'object' && 'status' in error) {
    const status = Number((error as { status?: unknown }).status);
    return Number.isFinite(status) ? status : null;
  }
  return null;
}

function classifyRefreshError(error: unknown): RefreshSessionOutcome['kind'] {
  const status = readHttpStatus(error);
  if (status === 401 || status === 403) {
    return 'auth-failed';
  }
  return 'transient';
}

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
                if (response.accessToken?.trim()) {
                  authService.setToken(response.accessToken);
                }
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
                  setErpTenantSlug(response.tenantSlug);
                  themeService.reapplyTheme();
                } else if (tenantSlug) {
                  setErpTenantSlug(tenantSlug);
                  themeService.reapplyTheme();
                } else {
                  const slugFromId = resolveTenantSlugFromId(tenantId);
                  if (slugFromId) {
                    setErpTenantSlug(slugFromId);
                    themeService.reapplyTheme();
                  }
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
                  map(() => ({ response, authMeta, tenantId })),
                );
              }),
              tap(({ response, authMeta, tenantId }) => {
                patchState(store, {
                  user: response.user,
                  loading: false,
                  ...authMeta,
                });
                tenantModulesRealtime.afterAccessTokenChanged();
                const target = resolvePostLoginPath(
                  pluginStore.enabledPlugins(),
                  response.user.permissions ?? [],
                  response.tenantSlug ??
                    resolveTenantSlugFromId(tenantId ?? getStoredTenantId()),
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
          switchMap(
            (): Observable<RefreshSessionOutcome> =>
              authService.refreshSession().pipe(
                map((response): RefreshSessionOutcome => ({ kind: 'ok', response })),
                catchError((err): Observable<RefreshSessionOutcome> => {
                  const kind = classifyRefreshError(err);
                  if (isDevMode()) {
                    console.warn(
                      '[AuthStore] refreshSession failed:',
                      readHttpStatus(err),
                      kind,
                      err instanceof Error ? err.message : err,
                    );
                  }
                  if (kind === 'auth-failed') {
                    return of({ kind: 'auth-failed' });
                  }
                  return of({ kind: 'transient' });
                }),
              ),
          ),
          tap((outcome: RefreshSessionOutcome) => {
            if (outcome.kind === 'transient') {
              return;
            }

            if (outcome.kind === 'auth-failed') {
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

            const response = outcome.response;

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

            if (response.accessToken?.trim()) {
              authService.setToken(response.accessToken);
            }
            if (response.tenantId) {
              authService.setTenantId(response.tenantId);
            }
            patchState(store, { user: response.user });

            if (response.tenantSlug) {
              setErpTenantSlug(response.tenantSlug);
              themeService.reapplyTheme();
            } else {
              const slugFromId = resolveTenantSlugFromId(
                response.tenantId ?? getStoredTenantId(),
              );
              if (slugFromId) {
                setErpTenantSlug(slugFromId);
                themeService.reapplyTheme();
              }
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

      updateProfile: rxMethod<{ firstName?: string; lastName?: string }>(
        pipe(
          switchMap((data) =>
            authService.updateMyProfile(data).pipe(
              tap(({ user }) => {
                patchState(store, { user });
                const displayName =
                  [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
                  user.email;
                globalAuthStore.setUser({
                  id: user.id,
                  email: user.email,
                  name: displayName,
                  tenantId: getStoredTenantId() || '',
                  permissions: user.permissions,
                });
              }),
              catchError(() => of(null)),
            ),
          ),
        ),
      ),
    };
  }),
);
