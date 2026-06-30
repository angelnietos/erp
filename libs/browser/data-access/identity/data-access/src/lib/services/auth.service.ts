import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, switchMap, of, throwError, timeout, tap } from 'rxjs';
import {
  ALL_APP_PERMISSION_IDS,
  AuthResponse,
  LoginCredentials,
  PLATFORM_OWNER_PERMISSIONS,
  UserPayload,
  getTenantKeycloakConfig,
  tenantUsesKeycloakLogin,
} from '@josanz-erp/identity-api';
import {
  buildKeycloakAuthorizeUrl,
  clearPkceSession,
  createOidcState,
  createPkcePair,
  defaultOidcCallbackUri,
  markPkceRedirectPending,
  readPkceSession,
  storePkceSession,
} from '@josanz-erp/shared-auth-keycloak';
import { InjectionToken } from '@angular/core';
import {
  ERP_AUTH_SESSION_MODE,
  ERP_BFF_AUTH,
  ErpBffLoginResult,
} from '../ports/erp-bff-auth.port';

interface KeycloakTokenResponse {
  access_token?: string;
}
import {
  clearStoredTenantId,
  getStoredTenantId,
  setStoredTenantId,
} from '../interceptors/tenant.interceptor';

export const AUTH_KEYCLOAK_CONFIG = new InjectionToken<{
  url: string;
  realm: string;
  clientId: string;
  enabled: boolean;
}>('AUTH_KEYCLOAK_CONFIG');

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }
    const segment = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = segment.padEnd(segment.length + ((4 - (segment.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readHttpErrorMessage(error: unknown): string | null {
  if (!(error instanceof HttpErrorResponse)) {
    if (error && typeof error === 'object' && 'error' in error) {
      return extractNestMessage((error as { error?: unknown }).error);
    }
    return null;
  }
  if (error.status === 0) {
    return 'No hay conexión con el servidor. Comprueba que el backend esté en marcha.';
  }
  return extractNestMessage(error.error) ?? null;
}

function extractNestMessage(body: unknown): string | null {
  if (typeof body === 'string' && body.trim()) {
    return body.trim();
  }
  if (!body || typeof body !== 'object') {
    return null;
  }
  const record = body as { message?: unknown; error?: unknown };
  if (typeof record.message === 'string' && record.message.trim()) {
    return record.message.trim();
  }
  if (Array.isArray(record.message)) {
    const joined = record.message
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .join(' ');
    if (joined) {
      return joined;
    }
  }
  if (typeof record.error === 'string' && record.error.trim()) {
    return record.error.trim();
  }
  return null;
}

const KEYCLOAK_TO_ERP_ROLE_MAP: Record<string, string> = {
  PlatformOwner: 'platformAdmin',
  PlatformAdmin: 'platformAdmin',
  TenantAdmin: 'clientAdmin',
  admin: 'clientAdmin',
};

const ALL_APP_PERMISSIONS: string[] = ['*', ...ALL_APP_PERMISSION_IDS];

function extractKeycloakRoles(payload: Record<string, unknown>): string[] {
  const realmAccess = payload['realm_access'] as { roles?: unknown } | undefined;
  const rawRoles = (realmAccess?.roles as string[]) ?? [];
  const clientRoles = payload['client_roles'] as { [key: string]: unknown } | undefined;
  return [...rawRoles, ...(Object.values(clientRoles ?? {}).flat() as string[])].filter(
    (r): r is string => typeof r === 'string',
  );
}

/** Sin sesión ERP en backend: no ampliar permisos desde roles KC en cliente. */
function resolveKeycloakFallbackPermissions(_allKeycloakRoles: string[]): string[] {
  return [];
}

function mapKeycloakTokenToUserPayload(
  payload: Record<string, unknown>,
  fallbackEmail = '',
): { user: UserPayload; tenantId: string; isPlatformAdmin: boolean } {
  const allKeycloakRoles = extractKeycloakRoles(payload);

  const erpRoles: string[] = [];
  for (const kcRole of allKeycloakRoles) {
    const erpRole = KEYCLOAK_TO_ERP_ROLE_MAP[kcRole];
    if (erpRole && !erpRoles.includes(erpRole)) {
      erpRoles.push(erpRole);
    }
  }
  const permissions = resolveKeycloakFallbackPermissions(allKeycloakRoles);
  const resolvedEmail =
    (typeof payload['email'] === 'string' && payload['email']) ||
    (typeof payload['preferred_username'] === 'string' && payload['preferred_username']) ||
    fallbackEmail;
  const user: UserPayload = {
    id: String(payload['sub']),
    email: resolvedEmail,
    roles: erpRoles.length > 0 ? erpRoles : ['authenticated'],
    permissions,
  };
  const tenantId = typeof payload['tenant_id'] === 'string' ? payload['tenant_id'].trim() : '';
  const isPlatformAdmin = allKeycloakRoles.some((r) =>
    ['PlatformOwner', 'PlatformAdmin'].includes(r),
  );
  return { user, tenantId, isPlatformAdmin };
}

export const DEFAULT_LOGIN_TENANT_SLUG = 'josanz';

export const ERP_TENANT_SLUG_SESSION_KEY = 'erp_tenant_slug';

/** URL de vuelta al login ERP tras RP-initiated logout en Keycloak. */
export function buildErpPostLogoutRedirectUri(origin?: string): string | undefined {
  if (typeof window === 'undefined' && !origin) {
    return undefined;
  }
  const base = (origin ?? window.location.origin).replace(/\/$/, '');
  const slug =
    (typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem(ERP_TENANT_SLUG_SESSION_KEY)
      : null) ?? '';
  const params = new URLSearchParams({ reason: 'logout' });
  const normalizedSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (normalizedSlug) {
    params.set('tenant', normalizedSlug);
  }
  return `${base}/auth/login?${params.toString()}`;
}

export type IdentityAuthMode = 'keycloak' | 'local' | 'none';
export const IDENTITY_AUTH_MODE_SESSION_KEY = 'identity_auth_mode';
export const IDENTITY_KEYCLOAK_AVAILABLE_SESSION_KEY = 'identity_keycloak_available';

export interface IdentityAuthMeta {
  authMode: IdentityAuthMode;
  keycloakAvailable: boolean | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/auth';
  private readonly bff = inject(ERP_BFF_AUTH, { optional: true });
  private readonly authSessionMode = inject(ERP_AUTH_SESSION_MODE, { optional: true });

  private readonly keycloakConfig = inject(AUTH_KEYCLOAK_CONFIG, { optional: true });
  /** JWT en memoria (modo BFF): no se persiste en localStorage. */
  private bffAccessToken: string | null = null;

  /** BFF: cookies HttpOnly + CSRF; sin JWT en localStorage. */
  isBffMode(): boolean {
    return this.bff?.isBffMode() ?? this.authSessionMode?.mode === 'bff';
  }

  canUseKeycloakPkce(tenantSlug: string): boolean {
    return (
      this.isBffMode() &&
      tenantUsesKeycloakLogin(tenantSlug) &&
      Boolean(getTenantKeycloakConfig(tenantSlug))
    );
  }

  /** Redirige al login OIDC de Keycloak (Authorization Code + PKCE). */
  async startKeycloakPkceRedirect(
    tenantSlug: string = DEFAULT_LOGIN_TENANT_SLUG,
    callbackPath = '/auth/callback',
  ): Promise<void> {
    const slug = tenantSlug.trim().toLowerCase();
    const tenantCfg = getTenantKeycloakConfig(slug);
    if (!tenantCfg) {
      throw new Error('Este tenant no usa Keycloak.');
    }
    const kcUrl = this.keycloakConfig?.url?.replace(/\/$/, '') ?? '';
    if (!kcUrl) {
      throw new Error('Keycloak no está configurado.');
    }
    const { codeVerifier, codeChallenge } = await createPkcePair();
    const state = createOidcState();
    const redirectUri = defaultOidcCallbackUri(callbackPath);
    storePkceSession({ codeVerifier, state, tenantSlug: slug, redirectUri });
    const authorizeUrl = buildKeycloakAuthorizeUrl({
      authServerUrl: kcUrl,
      realm: tenantCfg.realm,
      clientId: tenantCfg.clientId,
      redirectUri,
      codeChallenge,
      state,
      uiLocales: 'es',
    });
    markPkceRedirectPending();
    window.location.assign(authorizeUrl);
  }

  loginWithAuthorizationCode(code: string): Observable<AuthResponse> {
    const stored = readPkceSession();
    if (!stored) {
      return throwError(() => new Error('Sesión PKCE no encontrada o caducada.'));
    }
    if (!this.isBffMode() || !this.bff) {
      return throwError(() => new Error('PKCE requiere modo BFF.'));
    }
    clearPkceSession();
    return this.bff
      .erpCallbackWithCode({
        code,
        codeVerifier: stored.codeVerifier,
        redirectUri: stored.redirectUri,
        tenantSlug: stored.tenantSlug,
      })
      .pipe(
        map((res) => {
          this.persistAuthMeta('keycloak', true);
          return this.mapBffErpResponse(res);
        }),
        catchError((err) =>
          throwError(() => new Error(this.describeLoginError(err))),
        ),
      );
  }

  login(
    email: string,
    password: string,
    tenantSlug: string = DEFAULT_LOGIN_TENANT_SLUG,
  ): Observable<AuthResponse> {
    if (this.isBffMode() && this.bff) {
      return this.bff.erpLogin({ email, password, tenantSlug }).pipe(
        map((res) => {
          const kcAvailable =
            res.authMode === 'keycloak'
              ? true
              : res.keycloakReachable ?? false;
          this.persistAuthMeta(res.authMode, kcAvailable);
          return this.mapBffErpResponse(res);
        }),
        catchError((err) =>
          throwError(() => new Error(this.describeLoginError(err))),
        ),
      );
    }

    const keycloakConfig = this.keycloakConfig;
    const tenantCfg = getTenantKeycloakConfig(tenantSlug);
    if (keycloakConfig?.enabled && tenantCfg) {
      return this.isKeycloakAvailable(tenantCfg.realm).pipe(
        switchMap((available) => {
          if (!available) {
            return this.traditionalLogin(email, password, tenantSlug, false);
          }
          return this.keycloakLogin(email, password, tenantCfg).pipe(
            catchError((keycloakError: unknown) =>
              this.traditionalLogin(email, password, tenantSlug, true).pipe(
                catchError((localError: unknown) =>
                  throwError(() => this.mergeLoginErrors(keycloakError, localError)),
                ),
              ),
            ),
          );
        }),
      );
    }
    return this.traditionalLogin(email, password, tenantSlug, false);
  }

  isKeycloakAvailable(realm = this.keycloakConfig?.realm ?? ''): Observable<boolean> {
    const keycloakConfig = this.keycloakConfig;
    if (!keycloakConfig?.enabled || !keycloakConfig.url || !realm) {
      return of(false);
    }
    const base = keycloakConfig.url.replace(/\/$/, '');
    return this.http
      .get<unknown>(`${base}/realms/${realm}/.well-known/openid-configuration`)
      .pipe(
        timeout(2500),
        map(() => true),
        catchError(() => of(false)),
      );
  }

  getPersistedAuthMeta(): IdentityAuthMeta {
    if (typeof sessionStorage === 'undefined') {
      return { authMode: 'none', keycloakAvailable: null };
    }
    const rawMode = sessionStorage.getItem(IDENTITY_AUTH_MODE_SESSION_KEY);
    const rawAvailable = sessionStorage.getItem(IDENTITY_KEYCLOAK_AVAILABLE_SESSION_KEY);
    const authMode: IdentityAuthMode =
      rawMode === 'keycloak' || rawMode === 'local' ? rawMode : 'none';
    return {
      authMode,
      keycloakAvailable: rawAvailable === null ? null : rawAvailable === 'true',
    };
  }

  describeLoginError(error: unknown): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }
    const httpMessage = readHttpErrorMessage(error);
    if (httpMessage) {
      return httpMessage;
    }
    return 'No se pudo iniciar sesión. Comprueba email, contraseña y organización.';
  }

  private keycloakLogin(
    email: string,
    password: string,
    tenantCfg: { realm: string; clientId: string },
  ): Observable<AuthResponse> {
    const keycloakConfig = this.keycloakConfig;
    if (!keycloakConfig?.enabled) {
      return throwError(() => new Error('Keycloak no está configurado.'));
    }
    const tokenUrl = `${keycloakConfig.url.replace(/\/$/, '')}/realms/${tenantCfg.realm}/protocol/openid-connect/token`;
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('client_id', tenantCfg.clientId);
    body.set('username', email.trim());
    body.set('password', password);
    body.set('scope', 'openid email profile');

    return this.http.post<KeycloakTokenResponse>(tokenUrl, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).pipe(
        switchMap((tokenResponse) => {
          const access_token = tokenResponse?.access_token;
          if (!access_token) {
            throw new Error('No access token from Keycloak');
          }
          const payload = decodeJwtPayload(access_token);
          if (!payload || typeof payload['sub'] !== 'string') {
            throw new Error('Invalid Keycloak token payload');
          }
          this.persistAuthMeta('keycloak', true);

          const isPlatformRealm = tenantCfg.realm === 'babooni-platform';

          // Store the Keycloak token NOW so the interceptor can send it as Bearer
          // when we call the appropriate session endpoint below.
          this.setToken(access_token);

          if (isPlatformRealm) {
            // Platform admin login - use /api/platform/auth/session
            return this.http.get<AuthResponse>(`/api/platform/auth/session`).pipe(
              catchError(() =>
                // If session fails, return basic user info
                of({
                  accessToken: access_token,
                  user: {
                    id: String(payload['sub']),
                    email: typeof payload['email'] === 'string' ? payload['email'] : email,
                    roles: ['platformAdmin'],
                    permissions: [...PLATFORM_OWNER_PERMISSIONS],
                  },
                  tenantId: undefined,
                } as AuthResponse),
              ),
            );
          }

          const { user: localUser, tenantId } = mapKeycloakTokenToUserPayload(payload, email);
          if (tenantId) {
            this.setTenantId(tenantId);
          }

          // Enrich with real DB permissions via the backend session endpoint.
          // The HybridJwtStrategy will look up (or auto-provision) the user in
          // Postgres and return their actual roles + permissions.
          return this.http.get<AuthResponse>(`${this.apiUrl}/session`).pipe(
            catchError(() =>
              // If the session call fails (e.g. backend down), fall back to the
              // locally-decoded Keycloak payload — still lets the user in.
              of({
                accessToken: access_token,
                user: localUser,
                tenantId,
              } as AuthResponse),
            ),
          );
        }),
      );
  }

  private traditionalLogin(
    email: string,
    password: string,
    tenantSlug: string = DEFAULT_LOGIN_TENANT_SLUG,
    keycloakAvailable = false,
  ): Observable<AuthResponse> {
    const body: LoginCredentials = { email, password, tenantSlug };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, body).pipe(
      map((response) => {
        this.persistAuthMeta('local', keycloakAvailable);
        return response;
      }),
    );
  }

  private persistAuthMeta(mode: IdentityAuthMode, keycloakAvailable: boolean): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    sessionStorage.setItem(IDENTITY_AUTH_MODE_SESSION_KEY, mode);
    sessionStorage.setItem(IDENTITY_KEYCLOAK_AVAILABLE_SESSION_KEY, String(keycloakAvailable));
  }

  private mergeLoginErrors(keycloakError: unknown, localError: unknown): Error {
    const keycloakStatus = this.readHttpStatus(keycloakError);
    const localStatus = this.readHttpStatus(localError);
    if (keycloakStatus === 400 || keycloakStatus === 401 || localStatus === 400 || localStatus === 401) {
      return new Error('Credenciales incorrectas para Keycloak y acceso local.');
    }
    if (localStatus === 0) {
      return new Error('Keycloak responde, pero el backend local no está disponible para fallback.');
    }
    return new Error(this.describeLoginError(localError));
  }

  private readHttpStatus(error: unknown): number | null {
    return error && typeof error === 'object' && 'status' in error
      ? Number((error as { status?: unknown }).status)
      : null;
  }

  refreshSession(): Observable<AuthResponse> {
    if (this.isBffMode() && this.bff) {
      return this.bff.erpSession().pipe(map((res) => this.mapBffErpResponse(res)));
    }

    // Check if current user is a platform admin (no tenantId in token)
    const token = this.getToken();
    const isPlatformAdmin = token ? this.isPlatformAdminToken(token) : false;
    const url = isPlatformAdmin ? '/api/platform/auth/session' : `${this.apiUrl}/session`;
    return this.http.get<AuthResponse>(url);
  }

  private isPlatformAdminToken(token: string): boolean {
    const payload = decodeJwtPayload(token);
    if (!payload) return false;
    const isKeycloak = payload['iss'] && String(payload['iss']).includes('/realms/');
    if (isKeycloak) {
      const realmAccess = payload['realm_access'] as { roles?: unknown } | undefined;
      const rawRoles = (realmAccess?.roles as string[]) ?? [];
      const clientRoles = payload['client_roles'] as { [key: string]: unknown } | undefined;
      const allRoles = [...rawRoles, ...(Object.values(clientRoles ?? {}).flat() as string[])].filter((r): r is string => typeof r === 'string');
      return allRoles.some((r) => ['PlatformOwner', 'PlatformAdmin'].includes(r));
    }
    const roles = payload['roles'];
    return Array.isArray(roles) && roles.includes('PlatformOwner');
  }

  /** Cierra sesión BFF (cookies) o limpia token local. RP-initiated logout si hay sesión Keycloak. */
  logout(postLogoutRedirectUri?: string): Observable<{ keycloakLogoutUrl?: string }> {
    if (this.isBffMode() && this.bff) {
      return this.bff.erpLogout(postLogoutRedirectUri).pipe(
        tap(() => this.clearSessionForRelogin()),
        map((res) => ({ keycloakLogoutUrl: res.keycloakLogoutUrl })),
        catchError(() => {
          this.clearSessionForRelogin();
          return of({});
        }),
      );
    }
    this.clearSessionForRelogin();
    return of({});
  }

  setToken(token: string): void {
    if (this.isBffMode()) {
      const trimmed = token?.trim();
      this.bffAccessToken = trimmed ? trimmed : null;
      return;
    }
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (this.isBffMode()) {
      return this.bffAccessToken;
    }
    return localStorage.getItem('auth_token');
  }

  /** Limpia credenciales previas antes de un nuevo login (p. ej. cambiar de usuario sin cerrar sesión). */
  clearSessionForRelogin(): void {
    this.bffAccessToken = null;
    if (!this.isBffMode()) {
      localStorage.removeItem('auth_token');
    }
    clearStoredTenantId();
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(IDENTITY_AUTH_MODE_SESSION_KEY);
      sessionStorage.removeItem(IDENTITY_KEYCLOAK_AVAILABLE_SESSION_KEY);
    }
    this.bff?.clearErpCsrf();
  }

  syncTenantIdFromAccessToken(): string | null {
    const session = this.readPersistedSession();
    if (session?.tenantId) {
      this.setTenantId(session.tenantId);
      return session.tenantId;
    }
    return null;
  }

  removeToken(): void {
    this.clearSessionForRelogin();
  }

  setTenantId(tenantId: string): void {
    setStoredTenantId(tenantId);
  }

  readPersistedSession(): { user: UserPayload; tenantId: string } | null {
    if (this.isBffMode()) {
      return null;
    }
    const token = this.getToken();
    if (!token) {
      return null;
    }
    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload['sub'] !== 'string') {
      this.removeToken();
      return null;
    }
    const exp = payload['exp'];
    if (typeof exp === 'number' && exp * 1000 < Date.now()) {
      this.removeToken();
      return null;
    }

    const isKeycloakToken = payload['iss'] && String(payload['iss']).includes('/realms/');

    let user: UserPayload;
    let tenantId = '';

    if (isKeycloakToken) {
      const mapped = mapKeycloakTokenToUserPayload(payload);
      user = mapped.user;
      tenantId = mapped.tenantId;
    } else {
      const rawRoles = payload['roles'];
      const roles = Array.isArray(rawRoles)
        ? rawRoles.filter((r): r is string => typeof r === 'string')
        : [];
      const rawPerms = payload['permissions'];
      const permissions = Array.isArray(rawPerms)
        ? rawPerms.filter((p): p is string => typeof p === 'string')
        : [];

      const emailVal = typeof payload['email'] === 'string' ? payload['email'] : '';
      user = {
        id: payload['sub'],
        email: emailVal,
        roles,
        permissions,
      };

      const tidFromJwt =
        (typeof payload['tenantId'] === 'string' ? payload['tenantId'].trim() : '') ||
        (typeof payload['tenant_id'] === 'string' ? payload['tenant_id'].trim() : '');
      tenantId = tidFromJwt;
    }

    if (tenantId) {
      setStoredTenantId(tenantId);
    }
    return { user, tenantId: getStoredTenantId() ?? tenantId ?? '' };
  }

  private mapBffErpResponse(res: ErpBffLoginResult & { accessToken?: string }): AuthResponse {
    return {
      accessToken: res.accessToken?.trim() ?? '',
      user: res.user,
      tenantId: res.tenantId,
      tenantSlug: res.tenantSlug,
    };
  }

  forgotPassword(email: string, tenantSlug: string): Observable<{ ok: true; devResetUrl?: string }> {
    return this.http.post<{ ok: true; devResetUrl?: string }>(`${this.apiUrl}/forgot-password`, {
      email,
      tenantSlug,
    });
  }

  resetPassword(token: string, newPassword: string): Observable<{ ok: true }> {
    return this.http.post<{ ok: true }>(`${this.apiUrl}/reset-password`, {
      token,
      newPassword,
    });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ ok: true }> {
    return this.http.post<{ ok: true }>(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  updateMyProfile(data: {
    firstName?: string;
    lastName?: string;
  }): Observable<{ user: UserPayload }> {
    return this.http.patch<{ user: UserPayload }>(`${this.apiUrl}/profile`, data);
  }
}