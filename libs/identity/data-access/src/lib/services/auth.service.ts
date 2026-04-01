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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  // TODO: Use environment variable for API URL
  private readonly apiUrl = 'http://localhost:3000/api/auth';

  login(
    email: string,
    password: string,
    tenantSlug: string = DEFAULT_LOGIN_TENANT_SLUG,
  ): Observable<AuthResponse> {
    const body: LoginCredentials = { email, password, tenantSlug };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, body);
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
    const user: UserPayload = {
      id: payload['sub'],
      email: payload['email'],
      roles,
    };
    return { user, tenantId: getStoredTenantId() ?? '' };
  }
}
