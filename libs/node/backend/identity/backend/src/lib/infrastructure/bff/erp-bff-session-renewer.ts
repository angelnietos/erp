import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BffSessionRenewerPort,
  BffTokenRenewalResult,
  KeycloakTokenClient,
  readJwtSubject,
  type BffSessionRecord,
} from '@josanz-erp/auth-keycloak';
import { getTenantKeycloakConfig } from '@josanz-erp/identity-api';
import { AuthService } from '../../application/services/auth.service';

@Injectable()
export class ErpBffSessionRenewer implements BffSessionRenewerPort {
  constructor(
    private readonly authService: AuthService,
    private readonly keycloak: KeycloakTokenClient,
    private readonly config: ConfigService,
  ) {}

  async renewAccessToken(session: BffSessionRecord): Promise<BffTokenRenewalResult | null> {
    const userId = readJwtSubject(session.accessToken);
    if (!userId) {
      return null;
    }

    let refreshTokenPatch: string | undefined;
    if (session.kind === 'keycloak' && session.refreshToken?.trim() && this.keycloak.isEnabled()) {
      const kcRefresh = await this.refreshKeycloakTokens(session);
      if (kcRefresh?.refreshToken) {
        refreshTokenPatch = kcRefresh.refreshToken;
      }
    }

    try {
      if (session.kind === 'platform') {
        const refreshed = await this.authService.refreshPlatformSession(userId);
        return {
          accessToken: refreshed.accessToken,
          refreshToken: refreshTokenPatch,
        };
      }

      const tenantId = session.tenantId?.trim();
      if (!tenantId) {
        return null;
      }
      const refreshed = await this.authService.refreshSession(userId, tenantId);
      return {
        accessToken: refreshed.accessToken,
        refreshToken: refreshTokenPatch,
      };
    } catch {
      return null;
    }
  }

  private async refreshKeycloakTokens(session: BffSessionRecord) {
    const refreshToken = session.refreshToken?.trim();
    if (!refreshToken) {
      return null;
    }

    if (session.kind === 'platform') {
      const realm =
        this.config.get<string>('KEYCLOAK_PLATFORM_REALM') ?? 'babooni-platform';
      const clientId =
        this.config.get<string>('KEYCLOAK_PLATFORM_CLIENT_ID') ?? 'babooni-saas-platform';
      return this.keycloak.refreshGrant({
        realm,
        clientId,
        clientSecret: this.config.get<string>('KEYCLOAK_SPA_CLIENT_SECRET'),
        refreshToken,
      });
    }

    const slug = session.tenantSlug?.trim();
    const kcConfig = slug ? getTenantKeycloakConfig(slug) : undefined;
    if (!kcConfig) {
      return null;
    }

    return this.keycloak.refreshGrant({
      realm: kcConfig.realm,
      clientId: kcConfig.clientId,
      clientSecret: this.config.get<string>('KEYCLOAK_SPA_CLIENT_SECRET'),
      refreshToken,
    });
  }
}
