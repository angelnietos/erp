import {
  ApplicationConfig,
  APP_INITIALIZER,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
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
  IdentitySessionHydrationService,
  TenantModulesApiService,
  TenantModulesRealtimeService,
  TENANT_MODULES_REALTIME_API_ORIGIN,
  getStoredTenantId,
  setErpTenantSlug,
  JOSANZ_FIGMA_TENANT_SLUG,
} from '@josanz-erp/identity-data-access';
import { GlobalAuthStore, PluginStore } from '@josanz-erp/shared-data-access';
import { JosanzThemeService } from '@josanz-erp/josanz-ui';
import { ClientsFacade } from '@josanz-erp/clients-data-access';

declare global {
  interface Window {
    __ENV__?: {
      KEYCLOAK_URL?: string;
      KEYCLOAK_REALM?: string;
      KEYCLOAK_CLIENT_ID?: string;
      KEYCLOAK_ENABLED?: string;
    };
  }
}

function getKeycloakConfig() {
  const env = environment.keycloak;
  const runtimeEnv = (typeof window !== 'undefined' && window.__ENV__) || {};

  return {
    enabled: runtimeEnv.KEYCLOAK_ENABLED !== undefined ? runtimeEnv.KEYCLOAK_ENABLED === 'true' : (env.enabled ?? false),
    url: runtimeEnv.KEYCLOAK_URL || env.url || '',
    realm: runtimeEnv.KEYCLOAK_REALM || env.realm || '',
    clientId: runtimeEnv.KEYCLOAK_CLIENT_ID || env.clientId || '',
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    {
      provide: TENANT_MODULES_REALTIME_API_ORIGIN,
      useFactory: () => environment.apiOrigin?.replace(/\/$/, '') ?? '',
    },
    {
      provide: AUTH_KEYCLOAK_CONFIG,
      useFactory: () => getKeycloakConfig(),
    },
    provideEnterpriseAuth({
      mode: environment.auth?.mode ?? 'bff',
      apiPrefix: '/api',
      defaultTenantSlug: JOSANZ_FIGMA_TENANT_SLUG,
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
        const sessionHydration = inject(IdentitySessionHydrationService);
        const tenantModulesApi = inject(TenantModulesApiService);
        const tenantModulesRealtime = inject(TenantModulesRealtimeService);
        const authStore = inject(AuthStore);
        const pluginStore = inject(PluginStore);
        const josanzTheme = inject(JosanzThemeService);
        const clientsFacade = inject(ClientsFacade);

        setErpTenantSlug(JOSANZ_FIGMA_TENANT_SLUG);
        josanzTheme.setTheme('luxe-rounded');

        tenantModulesRealtime.registerIdentityRefresh(() => {
          authStore.refreshSession({ identityEvent: true });
        });

        return async () => {
          try {
            if (
              authService.isBffMode() &&
              !sessionHydration.hasBffSessionCookie()
            ) {
              pluginStore.loadFromStorage();
              return;
            }

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
              setErpTenantSlug(response.tenantSlug ?? JOSANZ_FIGMA_TENANT_SLUG);

              const u = response.user;
              const displayName =
                [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email;
              globalAuthStore.setUser({
                id: u.id,
                email: u.email,
                name: displayName,
                tenantId: response.tenantId || getStoredTenantId() || '',
                permissions: u.permissions,
                roles: u.roles ?? [],
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
              clientsFacade.prefetchClients();
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
