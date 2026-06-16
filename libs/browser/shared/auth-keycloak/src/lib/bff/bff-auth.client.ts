import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  ENTERPRISE_AUTH_CONFIG,
  EnterpriseAuthConfig,
} from './enterprise-auth.config';

export interface BffErpLoginBody {
  email: string;
  password: string;
  tenantSlug?: string;
}

export interface BffLoginResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
    permissions: string[];
  };
  tenantId?: string;
  tenantSlug?: string;
  authMode: 'keycloak' | 'local';
  csrfToken?: string;
}

export interface BffPlatformLoginResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
    permissions: string[];
  };
  authMode: 'keycloak' | 'local';
  csrfToken?: string;
}

@Injectable({ providedIn: 'root' })
export class BffAuthClient {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ENTERPRISE_AUTH_CONFIG, { optional: true });

  private erpCsrf: string | null = null;
  private platformCsrf: string | null = null;

  private prefix(): string {
    const p = this.config?.apiPrefix ?? '/api';
    return p.replace(/\/$/, '');
  }

  isBffMode(): boolean {
    return (this.config?.mode ?? 'legacy') === 'bff';
  }

  getErpCsrf(): string | null {
    return this.erpCsrf;
  }

  getPlatformCsrf(): string | null {
    return this.platformCsrf;
  }

  clearErpCsrf(): void {
    this.erpCsrf = null;
  }

  clearPlatformCsrf(): void {
    this.platformCsrf = null;
  }

  private rememberErpCsrf(token?: string): void {
    if (token) {
      this.erpCsrf = token;
    }
  }

  private rememberPlatformCsrf(token?: string): void {
    if (token) {
      this.platformCsrf = token;
    }
  }

  erpLogin(body: BffErpLoginBody): Observable<BffLoginResponse> {
    return this.http.post<BffLoginResponse>(`${this.prefix()}/bff/auth/login`, {
      email: body.email,
      password: body.password,
      tenantSlug: body.tenantSlug ?? this.config?.defaultTenantSlug ?? 'josanz',
    }, { withCredentials: true }).pipe(
      tap((res) => this.rememberErpCsrf(res.csrfToken)),
    );
  }

  erpSession(): Observable<BffLoginResponse> {
    return this.http.get<BffLoginResponse>(`${this.prefix()}/bff/auth/session`, {
      withCredentials: true,
    }).pipe(
      tap((res) => this.rememberErpCsrf(res.csrfToken)),
    );
  }

  erpLogout(): Observable<{ ok: true }> {
    return this.http.post<{ ok: true }>(`${this.prefix()}/bff/auth/logout`, {}, {
      withCredentials: true,
    }).pipe(
      tap(() => this.clearErpCsrf()),
    );
  }

  platformLogin(email: string, password: string): Observable<BffPlatformLoginResponse> {
    return this.http.post<BffPlatformLoginResponse>(
      `${this.prefix()}/bff/platform/auth/login`,
      { email, password },
      { withCredentials: true },
    ).pipe(
      tap((res) => this.rememberPlatformCsrf(res.csrfToken)),
    );
  }

  platformSession(): Observable<BffPlatformLoginResponse> {
    return this.http.get<BffPlatformLoginResponse>(`${this.prefix()}/bff/platform/auth/session`, {
      withCredentials: true,
    }).pipe(
      tap((res) => this.rememberPlatformCsrf(res.csrfToken)),
    );
  }

  platformLogout(): Observable<{ ok: true }> {
    return this.http.post<{ ok: true }>(`${this.prefix()}/bff/platform/auth/logout`, {}, {
      withCredentials: true,
    }).pipe(
      tap(() => this.clearPlatformCsrf()),
    );
  }
}

export function provideEnterpriseAuth(config: EnterpriseAuthConfig) {
  return { provide: ENTERPRISE_AUTH_CONFIG, useValue: config };
}
