import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, switchMap, of } from 'rxjs';
import { AuthResponse, LoginCredentials, UserPayload } from '@josanz-erp/identity-api';
import { InjectionToken } from '@angular/core';

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

const KEYCLOAK_TO_ERP_ROLE_MAP: Record<string, string> = {
  PlatformOwner: 'platformAdmin',
  PlatformAdmin: 'platformAdmin',
  TenantAdmin: 'clientAdmin',
  admin: 'clientAdmin',
};

const KEYCLOAK_TO_ERP_PERMISSION_MAP: Record<string, string[]> = {
  platformAdmin: ['platform.tenants.manage', 'platform.modules.configure'],
  clientAdmin: ['clients.users.manage', 'clients.settings.write'],
};

function mapKeycloakTokenToUserPayload(
  payload: Record<string, unknown>,
  fallbackEmail = '',
): { user: UserPayload; tenantId: string; isPlatformAdmin: boolean } {
  const rawRoles = payload['realm_access']?.roles ?? [];
  const clientRoles = payload['client_roles'] ?? {};
  const allKeycloakRoles = [...rawRoles, ...Object.values(clientRoles).flat()].filter((r): r is string => typeof r === 'string');

  const erpRoles: string[] = [];
  const permissions = new Set<string>();
  for (const kcRole of allKeycloakRoles) {
    const erpRole = KEYCLOAK_TO_ERP_ROLE_MAP[kcRole];
    if (erpRole && !erpRoles.includes(erpRole)) {
      erpRoles.push(erpRole);
    }
  }
  for (const erpRole of erpRoles) {
    const rolePerms = KEYCLOAK_TO_ERP_PERMISSION_MAP[erpRole] || [];
    rolePerms.forEach((p) => permissions.add(p));
  }
  const resolvedEmail =
    (typeof payload['email'] === 'string' && payload['email']) ||
    (typeof payload['preferred_username'] === 'string' && payload['preferred_username']) ||
    fallbackEmail;
  const user: UserPayload = {
    id: String(payload['sub']),
    email: resolvedEmail,
    roles: erpRoles.length > 0 ? erpRoles : ['authenticated'],
    permissions: Array.from(permissions),
  };
  const tenantId = typeof payload['tenant_id'] === 'string' ? payload['tenant_id'].trim() : '';
  const isPlatformAdmin = allKeycloakRoles.some((r) => ['PlatformOwner', 'PlatformAdmin'].includes(r));
  return { user, tenantId, isPlatformAdmin };
}

export const DEFAULT_LOGIN_TENANT_SLUG = 'josanz';

export const ERP_TENANT_SLUG_SESSION_KEY = 'erp_tenant_slug';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/auth';

  private readonly keycloakConfig = inject(AUTH_KEYCLOAK_CONFIG, { optional: true });

  login(
    email: string,
    password: string,
    tenantSlug: string = DEFAULT_LOGIN_TENANT_SLUG,
  ): Observable<AuthResponse> {
    const keycloakConfig = this.keycloakConfig;
    if (keycloakConfig?.enabled) {
      const tokenUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`;
      const body = new URLSearchParams();
      body.set('grant_type', 'password');
      body.set('client_id', keycloakConfig.clientId);
      body.set('username', email);
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

          const isPlatformRealm = keycloakConfig.realm === 'babooni-platform';

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
                    permissions: ['platform.tenants.manage', 'platform.modules.configure'],
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
        catchError(() => {
          return this.traditionalLogin(email, password, tenantSlug);
        }),
      );
    }
    return this.traditionalLogin(email, password, tenantSlug);
  }

  private traditionalLogin(
    email: string,
    password: string,
    tenantSlug: string = DEFAULT_LOGIN_TENANT_SLUG,
  ): Observable<AuthResponse> {
    const body: LoginCredentials = { email, password, tenantSlug };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, body);
  }

  refreshSession(): Observable<AuthResponse> {
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
      const rawRoles = payload['realm_access']?.roles ?? [];
      const clientRoles = payload['client_roles'] ?? {};
      const allRoles = [...rawRoles, ...Object.values(clientRoles).flat()].filter((r): r is string => typeof r === 'string');
      return allRoles.some((r) => ['PlatformOwner', 'PlatformAdmin'].includes(r));
    }
    const roles = payload['roles'];
    return Array.isArray(roles) && roles.includes('PlatformOwner');
  }

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  removeToken(): void {
    localStorage.removeItem('auth_token');
    clearStoredTenantId();
  }

  setTenantId(tenantId: string): void {
    setStoredTenantId(tenantId);
  }

  readPersistedSession(): { user: UserPayload; tenantId: string } | null {
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

      const tidFromJwt = typeof payload['tenantId'] === 'string' ? payload['tenantId'].trim() : '';
      tenantId = tidFromJwt;
    }

    if (tenantId) {
      setStoredTenantId(tenantId);
    }
    return { user, tenantId: getStoredTenantId() ?? tenantId ?? '' };
  }
}