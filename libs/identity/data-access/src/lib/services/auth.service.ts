import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, LoginCredentials } from '@josanz-erp/identity-api';
import { clearStoredTenantId, setStoredTenantId } from '../interceptors/tenant.interceptor';

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
}
