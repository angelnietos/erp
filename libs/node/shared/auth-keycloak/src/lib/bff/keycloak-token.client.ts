import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface KeycloakTokenResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface KeycloakLoginParams {
  realm: string;
  clientId: string;
  clientSecret?: string;
  username: string;
  password: string;
}

@Injectable()
export class KeycloakTokenClient {
  private readonly logger = new Logger(KeycloakTokenClient.name);

  constructor(private readonly config: ConfigService) {}

  get authServerUrl(): string {
    return (this.config.get<string>('KEYCLOAK_AUTH_SERVER_URL') ?? 'http://localhost:8081').replace(/\/$/, '');
  }

  isEnabled(): boolean {
    return this.config.get<string>('KEYCLOAK_ENABLED') === 'true';
  }

  async isRealmReachable(realm: string): Promise<boolean> {
    const url = `${this.authServerUrl}/realms/${realm}/.well-known/openid-configuration`;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      return res.ok;
    } catch {
      return false;
    }
  }

  /** Resource Owner Password — solo en BFF (nunca en el navegador). Migración hacia Auth Code + PKCE. */
  async passwordGrant(params: KeycloakLoginParams): Promise<KeycloakTokenResult | null> {
    const tokenUrl = `${this.authServerUrl}/realms/${params.realm}/protocol/openid-connect/token`;
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('client_id', params.clientId);
    body.set('username', params.username.trim());
    body.set('password', params.password);
    body.set('scope', 'openid email profile');

    if (params.clientSecret) {
      body.set('client_secret', params.clientSecret);
    }

    try {
      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (!res.ok) {
        this.logger.debug(`Keycloak password grant failed (${res.status}) realm=${params.realm}`);
        return null;
      }
      const json = (await res.json()) as {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
      };
      if (!json.access_token) {
        return null;
      }
      return {
        accessToken: json.access_token,
        refreshToken: json.refresh_token,
        expiresIn: json.expires_in ?? 300,
      };
    } catch (err) {
      this.logger.warn(`Keycloak token request error: ${String(err)}`);
      return null;
    }
  }
}
