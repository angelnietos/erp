import { Injectable, inject, signal, computed } from '@angular/core';
import { KeycloakConfig, KeycloakUser } from '../models/keycloak.config';

declare const Keycloak: any;

@Injectable({ providedIn: 'root' })
export class KeycloakService {
  private readonly _isAuthenticated = signal(false);
  private readonly _user = signal<KeycloakUser | null>(null);
  private _keycloakInstance: any = null;

  readonly isAuthenticated = computed(() => this._isAuthenticated());
  readonly user = computed(() => this._user());

  async init(config: KeycloakConfig): Promise<boolean> {
    if (typeof Keycloak === 'undefined') {
      return false;
    }

    this._keycloakInstance = new Keycloak({
      url: config.url,
      realm: config.realm,
      clientId: config.clientId,
    });

    try {
      const authenticated = await this._keycloakInstance.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: `${window.location.origin}/assets/silent-check-sso.html`,
        enableLogging: true,
      });

      if (authenticated) {
        this._isAuthenticated.set(true);
        this._user.set(this.extractUserInfo(this._keycloakInstance));
      }

      this._keycloakInstance.onTokenExpired = () => {
        this._keycloakInstance.updateToken(30).catch(() => {
          this.logout();
        });
      };

      return authenticated;
    } catch (error) {
      console.error('Keycloak init failed:', error);
      return false;
    }
  }

  login(): Promise<void> {
    return this._keycloakInstance?.login() ?? Promise.resolve();
  }

  logout(): Promise<void> {
    this._isAuthenticated.set(false);
    this._user.set(null);
    return this._keycloakInstance?.logout() ?? Promise.resolve();
  }

  getToken(): string | null {
    return this._keycloakInstance?.token ?? null;
  }

  isTokenExpired(): boolean {
    return this._keycloakInstance?.isTokenExpired() ?? true;
  }

  getKeycloakUser(): KeycloakUser | null {
    return this._user();
  }

  private extractUserInfo(keycloak: any): KeycloakUser {
    const tokenParsed = keycloak.tokenParsed;
    if (!tokenParsed) {
      return {
        id: '',
        email: '',
        roles: [],
        permissions: [],
      };
    }

    const roles: string[] = [];
    const permissions: string[] = [];

    if (tokenParsed?.realm_access?.roles) {
      roles.push(...tokenParsed.realm_access.roles);
    }

    if (tokenParsed?.client_roles) {
      Object.values(tokenParsed.client_roles).flat().forEach((r: any) => {
        if (typeof r === 'string') roles.push(r);
      });
    }

    return {
      id: tokenParsed?.sub ?? '',
      email: tokenParsed?.email ?? '',
      firstName: tokenParsed?.given_name,
      lastName: tokenParsed?.family_name,
      roles,
      permissions,
      tenantId: tokenParsed?.tenant_id,
    };
  }
}