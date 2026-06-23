import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthResponse } from '@josanz-erp/identity-api';
import { GlobalAuthStore, PluginStore, ThemeService } from '@josanz-erp/shared-data-access';
import { readBrowserCookie } from '@josanz-erp/shared-auth-keycloak';
import { AuthService } from './auth.service';
import { TenantModulesApiService } from './tenant-modules-api.service';
import { TenantModulesRealtimeService } from './tenant-modules-realtime.service';
import { getStoredTenantId } from '../interceptors/tenant.interceptor';
import {
  resolveTenantSlugFromId,
  setErpTenantSlug,
} from '../utils/erp-tenant-theme';

const ERP_BFF_SESSION_COOKIE = 'erp_sid';

/**
 * Restaura el estado de usuario en memoria desde la cookie BFF (GET /bff/auth/session).
 */
@Injectable({ providedIn: 'root' })
export class IdentitySessionHydrationService {
  private readonly authService = inject(AuthService);
  private readonly globalAuthStore = inject(GlobalAuthStore);
  private readonly tenantModulesApi = inject(TenantModulesApiService);
  private readonly tenantModulesRealtime = inject(TenantModulesRealtimeService);
  private readonly pluginStore = inject(PluginStore);
  private readonly themeService = inject(ThemeService);

  hasBffSessionCookie(): boolean {
    if (typeof document === 'undefined') {
      return false;
    }
    return Boolean(readBrowserCookie(ERP_BFF_SESSION_COOKIE)?.trim());
  }

  shouldRunBffKeepalive(): boolean {
    return this.authService.isBffMode() && this.globalAuthStore.isAuthenticated();
  }

  async tryRestoreFromBffCookie(apiOrigin = ''): Promise<boolean> {
    if (!this.authService.isBffMode() || !this.hasBffSessionCookie()) {
      return false;
    }
    if (this.globalAuthStore.isAuthenticated()) {
      return true;
    }

    try {
      const response = await firstValueFrom(
        this.authService.refreshSession().pipe(
          catchError((err) => {
            const status =
              err instanceof HttpErrorResponse ? err.status : readHttpStatus(err);
            if (status === 401 || status === 403) {
              return of(null);
            }
            throw err;
          }),
        ),
      );
      if (!response) {
        return false;
      }
      this.applyAuthResponse(response, apiOrigin);
      return true;
    } catch {
      return false;
    }
  }

  applyAuthResponse(response: AuthResponse, apiOrigin = ''): void {
    if (response.accessToken?.trim()) {
      this.authService.setToken(response.accessToken);
    }
    if (response.tenantId) {
      this.authService.setTenantId(response.tenantId);
    }

    if (response.tenantSlug) {
      setErpTenantSlug(response.tenantSlug);
      this.themeService.reapplyTheme();
    } else {
      const slugFromId = resolveTenantSlugFromId(
        response.tenantId ?? getStoredTenantId(),
      );
      if (slugFromId) {
        setErpTenantSlug(slugFromId);
        this.themeService.reapplyTheme();
      }
    }

    const u = response.user;
    const displayName =
      [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email;
    this.globalAuthStore.setUser({
      id: u.id,
      email: u.email,
      name: displayName,
      tenantId: response.tenantId || getStoredTenantId() || '',
      permissions: u.permissions,
    });

    const tenantId = response.tenantId || getStoredTenantId();
    if (response.enabledModuleIds?.length) {
      this.pluginStore.setPlugins(response.enabledModuleIds);
    } else if (tenantId) {
      this.tenantModulesApi.fetchEnabledModules(tenantId).subscribe({
        next: (r) => this.pluginStore.setPlugins(r.enabledModuleIds),
        error: () => this.pluginStore.loadFromStorage(),
      });
    }

    this.tenantModulesRealtime.afterAccessTokenChanged();
    if (apiOrigin) {
      this.tenantModulesRealtime.connect(apiOrigin.replace(/\/$/, ''));
    }
  }
}

function readHttpStatus(error: unknown): number {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = Number((error as { status?: unknown }).status);
    return Number.isFinite(status) ? status : 0;
  }
  return 0;
}
