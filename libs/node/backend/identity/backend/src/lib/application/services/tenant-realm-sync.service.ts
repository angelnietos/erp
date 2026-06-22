import { Injectable } from '@nestjs/common';
import { KeycloakIdentitySyncService } from './keycloak-identity-sync.service';

/** @deprecated Prefer KeycloakIdentitySyncService; mantiene compatibilidad con módulos. */
@Injectable()
export class TenantRealmSyncService {
  constructor(private readonly kcSync: KeycloakIdentitySyncService) {}

  async syncTenantModules(
    tenantId: string,
    enabledModuleIds: string[],
  ): Promise<void> {
    await this.kcSync.syncTenantModules(tenantId, enabledModuleIds);
  }
}
