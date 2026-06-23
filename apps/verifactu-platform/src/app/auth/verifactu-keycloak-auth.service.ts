import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, timeout } from 'rxjs';
import type { LoginResponse } from '@generic-crm/identity-api';
import { identityPaths } from '@generic-crm/identity-api';
import {
  API_BASE_URL,
  joinApiUrl,
  SessionTokenStorageService,
} from '@generic-crm/shared-browser-data-access';
import { environment } from '../../environments/environment';
import {
  buildKeycloakAuthorizeUrl,
  clearVerifactuPkceRedirectPending,
  clearVerifactuPkceSession,
  createOidcState,
  createPkcePair,
  defaultOidcCallbackUri,
  markVerifactuPkceRedirectPending,
  readVerifactuPkceSession,
  storeVerifactuPkceSession,
} from './pkce.util';
import { resolveVerifactuTenantKeycloak } from './tenant-keycloak.config';

const CALLBACK_PATH = '/login/callback';

@Injectable({ providedIn: 'root' })
export class VerifactuKeycloakAuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly tokens = inject(SessionTokenStorageService);
  private readonly keycloak = environment.keycloak;

  private resolveConfig(tenantSlug?: string) {
    return resolveVerifactuTenantKeycloak(tenantSlug, this.keycloak);
  }

  canUseKeycloak(tenantSlug?: string): boolean {
    if (!this.keycloak?.enabled) {
      return false;
    }
    const config = this.resolveConfig(tenantSlug);
    return Boolean(config?.url?.trim() && config.realm?.trim() && config.clientId?.trim());
  }

  isKeycloakAvailable(tenantSlug?: string): Observable<boolean> {
    const config = this.resolveConfig(tenantSlug);
    if (!config) {
      return of(false);
    }
    const base = config.url.replace(/\/$/, '');
    const url = `${base}/realms/${config.realm}/.well-known/openid-configuration`;
    return this.http.get<unknown>(url).pipe(
      timeout(2500),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  async startKeycloakRedirect(params: {
    tenantSlug: string;
    returnUrl: string;
  }): Promise<void> {
    const realmConfig = this.resolveConfig(params.tenantSlug);
    if (!realmConfig?.url?.trim() || !realmConfig.realm?.trim() || !realmConfig.clientId?.trim()) {
      throw new Error('Keycloak no está configurado para Verifactu.');
    }
    const { codeVerifier, codeChallenge } = await createPkcePair();
    const state = createOidcState();
    const redirectUri = defaultOidcCallbackUri(CALLBACK_PATH);
    storeVerifactuPkceSession({
      codeVerifier,
      state,
      redirectUri,
      tenantSlug: params.tenantSlug,
      returnUrl: params.returnUrl,
    });
    const authorizeUrl = buildKeycloakAuthorizeUrl({
      authServerUrl: realmConfig.url,
      realm: realmConfig.realm,
      clientId: realmConfig.clientId,
      redirectUri,
      codeChallenge,
      state,
    });
    markVerifactuPkceRedirectPending();
    window.location.assign(authorizeUrl);
  }

  completePkceCallback(code: string, state: string): Observable<LoginResponse> {
    const stored = readVerifactuPkceSession();
    if (!stored) {
      throw new Error('Sesión PKCE no encontrada o caducada.');
    }
    if (stored.state !== state.trim()) {
      clearVerifactuPkceSession();
      throw new Error('Estado OIDC inválido.');
    }
    clearVerifactuPkceSession();
    clearVerifactuPkceRedirectPending();

    const url = joinApiUrl(this.baseUrl, identityPaths.oidcCallback);
    return this.http
      .post<LoginResponse>(url, {
        code: code.trim(),
        codeVerifier: stored.codeVerifier,
        redirectUri: stored.redirectUri,
        tenantSlug: stored.tenantSlug || environment.defaultTenantSlug,
      })
      .pipe(
        map((res) => {
          this.tokens.setAccessToken(res.accessToken);
          this.tokens.setTenantId(res.tenantId);
          return res;
        }),
      );
  }

  readStoredReturnUrl(): string {
    const stored = readVerifactuPkceSession();
    return stored?.returnUrl ?? '/verifactu/overview';
  }
}
