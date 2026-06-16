import { Injectable } from '@nestjs/common';
import {
  BffSessionRenewerPort,
  readJwtSubject,
  type BffSessionRecord,
} from '@josanz-erp/auth-keycloak';
import { AuthService } from '../../application/services/auth.service';

@Injectable()
export class ErpBffSessionRenewer implements BffSessionRenewerPort {
  constructor(private readonly authService: AuthService) {}

  async renewAccessToken(session: BffSessionRecord): Promise<string | null> {
    const userId = readJwtSubject(session.accessToken);
    if (!userId) {
      return null;
    }

    try {
      if (session.kind === 'platform') {
        const refreshed = await this.authService.refreshPlatformSession(userId);
        return refreshed.accessToken;
      }

      const tenantId = session.tenantId?.trim();
      if (!tenantId) {
        return null;
      }
      const refreshed = await this.authService.refreshSession(userId, tenantId);
      return refreshed.accessToken;
    } catch {
      return null;
    }
  }
}
