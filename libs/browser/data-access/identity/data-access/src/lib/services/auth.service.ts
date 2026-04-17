import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, LoginCredentials, UserPayload } from '@josanz-erp/identity-api';
import {
  clearStoredTenantId,
  getStoredTenantId,
  setStoredTenantId,
} from '../interceptors/tenant.interceptor';

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

/** Default slug matches `prisma/seed.ts` tenant (`slug: 'josanz'`). */
export const DEFAULT_LOGIN_TENANT_SLUG = 'josanz';

/** `sessionStorage`: tenant elegido en la pantalla previa (`/auth/tenant`). */
export const ERP_TENANT_SLUG_SESSION_KEY = 'erp_tenant_slug';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  /** Ruta relativa: `apiOriginInterceptor` antepone `environment.apiOrigin` si está definido. */
  private readonly apiUrl = '/api/auth';

  login(
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

  /**
   * Restores user + tenant from localStorage when a valid JWT is present.
   * Clears stored credentials if the token is missing required claims or expired.
   */
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
    /** Alinear localStorage con el JWT (si falta `tenant_id`, las APIs no enviaban `x-tenant-id`). */
    const tidFromJwt =
      typeof payload['tenantId'] === 'string' ? payload['tenantId'].trim() : '';
    if (tidFromJwt) {
      setStoredTenantId(tidFromJwt);
    }
    return { user, tenantId: getStoredTenantId() ?? tidFromJwt ?? '' };
  }
}
