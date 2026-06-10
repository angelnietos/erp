import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, switchMap } from 'rxjs';
import { AuthResponse, LoginCredentials, UserPayload } from '@josanz-erp/identity-api';
import { InjectionToken } from '@angular/core';
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
    if (this.keycloakConfig?.enabled) {
      const tokenUrl = `${this.keycloakConfig.url}/realms/${this.keycloakConfig.realm}/protocol/openid-connect/token`;
      const body = new URLSearchParams();
      body.set('grant_type', 'password');
      body.set('client_id', this.keycloakConfig.clientId);
      body.set('username', email);
      body.set('password', password);

      return this.http.post(tokenUrl, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }).pipe(
        switchMap((tokenResponse: any) => {
          const access_token = tokenResponse?.access_token;
          if (!access_token) {
            throw new Error('No access token from Keycloak');
          }
          const payload = decodeJwtPayload(access_token);
          if (!payload || typeof payload['email'] !== 'string') {
            throw new Error('Invalid Keycloak token payload');
          }
          const rawRoles = (payload['realm_access'] as any)?.roles ?? [];
          const clientRoles = (payload['client_roles'] as any) ?? {};
          const allKeycloakRoles = [...rawRoles, ...Object.values(clientRoles).flat()].filter((r: unknown): r is string => typeof r === 'string');

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
          const user: UserPayload = {
            id: String(payload['sub'] ?? ''),
            email: payload['email'],
            roles: erpRoles.length > 0 ? erpRoles : ['authenticated'],
            permissions: Array.from(permissions),
          };
          const tidFromJwt = typeof payload['tenant_id'] === 'string' ? payload['tenant_id'].trim() : '';
          return new Observable<AuthResponse>(subscriber => {
            subscriber.next({
              accessToken: access_token,
              user,
              tenantId: tidFromJwt,
            });
            subscriber.complete();
          });
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
    return this.http.get<AuthResponse>(`${this.apiUrl}/session`);
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
    if (!payload || typeof payload['sub'] !== 'string' || typeof payload['email'] !== 'string') {
      this.removeToken();
      return null;
    }
    const exp = payload['exp'];
    if (typeof exp === 'number' && exp * 1000 < Date.now()) {
      this.removeToken();
      return null;
    }
    const rawRoles = payload['roles'];
    const roles = Array.isArray(rawRoles)
      ? rawRoles.filter((r): r is string => typeof r === 'string')
      : [];
    const rawPerms = payload['permissions'];
    const permissions = Array.isArray(rawPerms)
      ? rawPerms.filter((p): p is string => typeof p === 'string')
      : [];
    const user: UserPayload = {
      id: payload['sub'],
      email: payload['email'],
      roles,
      permissions,
    };
    const tidFromJwt =
      typeof payload['tenantId'] === 'string' ? payload['tenantId'].trim() : '';
    if (tidFromJwt) {
      setStoredTenantId(tidFromJwt);
    }
    return { user, tenantId: getStoredTenantId() ?? tidFromJwt ?? '' };
  }
}
