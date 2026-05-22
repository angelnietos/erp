import { Injectable } from '@nestjs/common';

export type TenantModulesBroadcastFn = (
  tenantId: string,
  enabledModuleIds: string[],
) => void;

/**
 * Conecta `TenantModulesService` con el gateway WebSocket sin dependencias circulares fuertes.
 */
@Injectable()
export class TenantModulesNotifierService {
  private broadcast: TenantModulesBroadcastFn | null = null;

  setBroadcaster(fn: TenantModulesBroadcastFn | null): void {
    this.broadcast = fn;
  }

  notifyModulesUpdated(tenantId: string, enabledModuleIds: string[]): void {
    this.broadcast?.(tenantId, enabledModuleIds);
  }
}
