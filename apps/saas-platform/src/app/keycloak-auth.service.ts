import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap, throwError, timeout } from 'rxjs';
import { BffAuthClient, ENTERPRISE_AUTH_CONFIG } from '@josanz-erp/shared-auth-keycloak';
import { environment } from '../environments/environment';
import { clearPlatformToken, setPlatformToken } from './platform-auth.interceptor';

export type PlatformAuthMode = 'keycloak' | 'local' | 'none';

export interface PlatformLoginResult {
  accessToken: string;
  mode: Exclude<PlatformAuthMode, 'none'>;
  keycloakAvailable: boolean;
}

interface KeycloakTokenResponse {
  access_token?: string;
}

interface LocalPlatformLoginResponse {
  accessToken: string;
}

const AUTH_MODE_KEY = 'saas_platform_auth_mode';
const KEYCLOAK_AVAILABLE_KEY = 'saas_platform_keycloak_available';

@Injectable({ providedIn: 'root' })
export class KeycloakAuthService {
  private readonly http = inject(HttpClient);
  private readonly bff = inject(BffAuthClient, { optional: true });
  private readonly enterpriseAuth = inject(ENTERPRISE_AUTH_CONFIG, { optional: true });
  private readonly keycloak = environment.keycloak;

  private readonly mode = signal<PlatformAuthMode>(this.readStoredMode());
  private readonly available = signal<boolean | null>(this.readStoredAvailability());

  readonly authMode = computed(() => this.mode());
  readonly keycloakAvailable = computed(() => this.available());

  isBffMode(): boolean {
    return this.bff?.isBffMode() ?? this.enterpriseAuth?.mode === 'bff';
  }

  login(email: string, password: string): Observable<PlatformLoginResult> {
    if (this.isBffMode() && this.bff) {
      return this.bff.platformLogin(email, password).pipe(
        map((res) => {
          this.remember(res.authMode, res.authMode === 'keycloak');
          return {
            accessToken: '',
            mode: res.authMode,
            keycloakAvailable: res.authMode === 'keycloak',
          };
        }),
        catchError((error: unknown) =>
          throwError(() => this.toLoginError(error, this.available() ?? false)),
        ),
      );
    }

    if (!this.keycloak?.enabled) {
      this.remember('none', false);
      return this.localLogin(email, password, false);
    }

    return this.isKeycloakAvailable().pipe(
      switchMap((available) => {
        if (!available) {
          return this.localLogin(email, password, false);
        }
        return this.keycloakLogin(email, password).pipe(
          catchError(() => this.localLogin(email, password, true)),
        );
      }),
    );
  }

  refreshPlatformSession(): Observable<unknown> {
    if (this.isBffMode() && this.bff) {
      return this.bff.platformSession();
    }
    return this.http.get('/api/platform/auth/session');
  }

  logout(): Observable<void> {
    if (this.isBffMode() && this.bff) {
      return this.bff.platformLogout().pipe(
        map(() => undefined),
        catchError(() => of(undefined)),
      );
    }
    clearPlatformToken();
    return of(undefined);
  }

  isKeycloakAvailable(): Observable<boolean> {
    if (!this.keycloak?.enabled) {
      return of(false);
    }

    const base = this.keycloak.url.replace(/\/$/, '');
    const url = `${base}/realms/${this.keycloak.realm}/.well-known/openid-configuration`;
    return this.http.get<unknown>(url).pipe(
      timeout(2500),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  private keycloakLogin(email: string, password: string): Observable<PlatformLoginResult> {
    const base = this.keycloak.url.replace(/\/$/, '');
    const tokenUrl = `${base}/realms/${this.keycloak.realm}/protocol/openid-connect/token`;
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('client_id', this.keycloak.clientId);
    body.set('username', email.trim());
    body.set('password', password);
    body.set('scope', 'openid email profile');

    return this.http
      .post<KeycloakTokenResponse>(tokenUrl, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(
        switchMap((response) => {
          const token = response?.access_token;
          if (!token) {
            return throwError(() => new Error('Keycloak no devolvió token.'));
          }
          setPlatformToken(token);
          this.remember('keycloak', true);
          return this.refreshPlatformSession().pipe(
            map(() => ({
              accessToken: token,
              mode: 'keycloak' as const,
              keycloakAvailable: true,
            })),
            catchError(() =>
              of({
                accessToken: token,
                mode: 'keycloak' as const,
                keycloakAvailable: true,
              }),
            ),
          );
        }),
      );
  }

  private localLogin(
    email: string,
    password: string,
    keycloakAvailable: boolean,
  ): Observable<PlatformLoginResult> {
    return this.http
      .post<LocalPlatformLoginResponse>('/api/platform/auth/login', {
        email: email.trim(),
        password,
      })
      .pipe(
        map((response) => {
          if (!response?.accessToken) {
            throw new Error('El login local no devolvió token.');
          }
          setPlatformToken(response.accessToken);
          this.remember('local', keycloakAvailable);
          return {
            accessToken: response.accessToken,
            mode: 'local' as const,
            keycloakAvailable,
          };
        }),
        catchError((error: unknown) =>
          throwError(() => this.toLoginError(error, keycloakAvailable)),
        ),
      );
  }

  private toLoginError(error: unknown, keycloakAvailable: boolean): Error {
    if (error instanceof HttpErrorResponse) {
      const backendMessage =
        typeof error.error?.message === 'string' ? error.error.message : '';
      if (error.status === 0) {
        return new Error(
          keycloakAvailable
            ? 'Keycloak responde, pero el backend local no está disponible.'
            : 'No se pudo conectar con Keycloak ni con el backend local.',
        );
      }
      if (error.status === 401 || error.status === 400) {
        return new Error('Credenciales incorrectas para Keycloak y acceso local.');
      }
      if (backendMessage.trim()) {
        return new Error(backendMessage);
      }
    }
    if (error instanceof Error && error.message.trim()) {
      return error;
    }
    return new Error('No se pudo iniciar sesión.');
  }

  private remember(mode: PlatformAuthMode, keycloakAvailable: boolean): void {
    this.mode.set(mode);
    this.available.set(keycloakAvailable);
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    sessionStorage.setItem(AUTH_MODE_KEY, mode);
    sessionStorage.setItem(KEYCLOAK_AVAILABLE_KEY, String(keycloakAvailable));
  }

  private readStoredMode(): PlatformAuthMode {
    if (typeof sessionStorage === 'undefined') {
      return 'none';
    }
    const mode = sessionStorage.getItem(AUTH_MODE_KEY);
    return mode === 'keycloak' || mode === 'local' ? mode : 'none';
  }

  private readStoredAvailability(): boolean | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    const raw = sessionStorage.getItem(KEYCLOAK_AVAILABLE_KEY);
    return raw === null ? null : raw === 'true';
  }
}
