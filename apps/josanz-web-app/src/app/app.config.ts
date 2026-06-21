import {
  ApplicationConfig,
  APP_INITIALIZER,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  HttpErrorResponse,
} from '@angular/common/http';
import { firstValueFrom, catchError, map, of, tap } from 'rxjs';
import { appRoutes } from './app.routes';
import { apiOriginInterceptor } from './api-origin.interceptor';
import { environment } from '../environments/environment';
import {
  bffAuthInterceptor,
  provideEnterpriseAuth,
  BffAuthClient,
} from '@josanz-erp/shared-auth-keycloak';
import {
  AUTH_KEYCLOAK_CONFIG,
  AuthService,
  AuthStore,
  ERP_AUTH_SESSION_MODE,
  ERP_BFF_AUTH,
  authInterceptor,
  tenantInterceptor,
  sessionExpiryInterceptor,
  provideBffSessionKeepalive,
  TenantModulesApiService,
  TenantModulesRealtimeService,
  TENANT_MODULES_REALTIME_API_ORIGIN,
  getStoredTenantId,
  setErpTenantSlug,
  resolveTenantSlugFromId,
} from '@josanz-erp/identity-data-access';
import { GlobalAuthStore, PluginStore } from '@josanz-erp/shared-data-access';
import { JosanzThemeService } from '@josanz-erp/josanz-ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    {
      provide: TENANT_MODULES_REALTIME_API_ORIGIN,
      useFactory: () => environment.apiOrigin?.replace(/\/$/, '') ?? '',
    },
    {
      provide: AUTH_KEYCLOAK_CONFIG,
      useValue:
        environment.keycloak ?? { enabled: false, url: '', realm: '', clientId: '' },
    },
    provideEnterpriseAuth({
      mode: environment.auth?.mode ?? 'bff',
      apiPrefix: '/api',
      defaultTenantSlug: 'josanz',
    }),
    provideBffSessionKeepalive(),
    { provide: ERP_BFF_AUTH, useExisting: BffAuthClient },
    {
      provide: ERP_AUTH_SESSION_MODE,
      useValue: { mode: environment.auth?.mode ?? 'bff' },
    },
    provideHttpClient(
      withInterceptors([
        apiOriginInterceptor,
        bffAuthInterceptor,
        tenantInterceptor,
        authInterceptor,
        sessionExpiryInterceptor,
      ]),
    ),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const authService = inject(AuthService);
        const globalAuthStore = inject(GlobalAuthStore);
        const tenantModulesApi = inject(TenantModulesApiService);
        const tenantModulesRealtime = inject(TenantModulesRealtimeService);
        const authStore = inject(AuthStore);
        const pluginStore = inject(PluginStore);
        const josanzTheme = inject(JosanzThemeService);

        setErpTenantSlug('josanz');
        josanzTheme.setTheme('luxe-rounded');

        tenantModulesRealtime.registerIdentityRefresh(() => {
          authStore.refreshSession();
        });

        return async () => {
          try {
            const outcome = await firstValueFrom(
              authService.refreshSession().pipe(
                map((response) => ({ kind: 'ok' as const, response })),
                catchError((err) => {
                  const status = err instanceof HttpErrorResponse ? err.status : 0;
                  if (status === 401 || status === 403) {
                    return of({ kind: 'auth-failed' as const });
                  }
                  return of({ kind: 'transient' as const });
                }),
              ),
            );

            if (outcome.kind === 'ok') {
              const { response } = outcome;
              if (response.accessToken?.trim()) {
                authService.setToken(response.accessToken);
              }
              if (response.tenantId) {
                authService.setTenantId(response.tenantId);
              }
              setErpTenantSlug(response.tenantSlug ?? 'josanz');

              const u = response.user;
              const displayName =
                [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email;
              globalAuthStore.setUser({
                id: u.id,
                email: u.email,
                name: displayName,
                tenantId: response.tenantId || getStoredTenantId() || '',
                permissions: u.permissions,
              });

              const tenantId = response.tenantId || getStoredTenantId();
              if (tenantId) {
                await firstValueFrom(
                  tenantModulesApi.fetchEnabledModules(tenantId).pipe(
                    tap((r) => pluginStore.setPlugins(r.enabledModuleIds)),
                    catchError(() => {
                      pluginStore.loadFromStorage();
                      return of(null);
                    }),
                  ),
                );
              } else {
                pluginStore.loadFromStorage();
              }
              tenantModulesRealtime.connect(
                environment.apiOrigin?.replace(/\/$/, '') ?? '',
              );
            } else if (outcome.kind === 'auth-failed') {
              globalAuthStore.logout();
              pluginStore.loadFromStorage();
            } else {
              pluginStore.loadFromStorage();
            }
          } catch {
            pluginStore.loadFromStorage();
          }
        };
      },
    },
  ],
};
