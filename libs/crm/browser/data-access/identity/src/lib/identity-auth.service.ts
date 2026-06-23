import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type {
  LoginRequestBody,
  LoginResponse,
  SessionResponse,
  UserMeResponse,
} from '@generic-crm/identity-api';
import { identityPaths } from '@generic-crm/identity-api';
import {
  API_BASE_URL,
  joinApiUrl,
  SessionTokenStorageService,
} from '@generic-crm/shared-browser-data-access';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IdentityAuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly tokens = inject(SessionTokenStorageService);

  login(body: LoginRequestBody): Observable<LoginResponse> {
    const url = joinApiUrl(this.baseUrl, identityPaths.login);
    return this.http.post<LoginResponse>(url, body).pipe(
      tap((res) => {
        this.tokens.setAccessToken(res.accessToken);
        this.tokens.setTenantContext({
          tenantId: res.tenantId,
          tenantSlug: res.tenantSlug,
          tenantName: res.tenantName,
        });
      }),
    );
  }

  /** Elimina JWT local; las siguientes peticiones irán sin Bearer hasta nuevo login. */
  logout(): void {
    this.tokens.clear();
  }

  session(): Observable<SessionResponse> {
    return this.http.get<SessionResponse>(
      joinApiUrl(this.baseUrl, identityPaths.session),
    );
  }

  me(): Observable<UserMeResponse | null> {
    return this.http.get<UserMeResponse | null>(
      joinApiUrl(this.baseUrl, identityPaths.usersMe),
    );
  }
}
