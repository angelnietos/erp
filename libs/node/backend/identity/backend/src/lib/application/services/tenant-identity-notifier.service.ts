import { Injectable } from '@nestjs/common';

export type TenantIdentityBroadcastFn = (tenantId: string) => void;

/**
 * Emite por Socket.IO (namespace `/realtime`, sala `tenant:<uuid>`) el evento
 * `tenant.identity.updated` cuando cambian roles o usuarios/permisos.
 */
@Injectable()
export class TenantIdentityNotifierService {
  private broadcast: TenantIdentityBroadcastFn | null = null;

  setBroadcaster(fn: TenantIdentityBroadcastFn | null): void {
    this.broadcast = fn;
  }

  notifyIdentityUpdated(tenantId: string): void {
    this.broadcast?.(tenantId);
  }
}
