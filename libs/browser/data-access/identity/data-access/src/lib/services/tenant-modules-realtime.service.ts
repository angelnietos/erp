import { inject, Injectable } from '@angular/core';
import { io, type Socket } from 'socket.io-client';
import { PluginStore } from '@josanz-erp/shared-data-access';
import { AuthService } from './auth.service';
import { getStoredTenantId } from '../interceptors/tenant.interceptor';

@Injectable({ providedIn: 'root' })
export class TenantModulesRealtimeService {
  private readonly auth = inject(AuthService);
  private readonly plugins = inject(PluginStore);
  private socket: Socket | null = null;

  /**
   * Conecta al namespace `/realtime` y escucha cambios de módulos del tenant actual.
   * Idempotente: si ya hay socket, lo desmonta y vuelve a crear.
   */
  connect(apiOrigin: string): void {
    this.disconnect();
    const base = apiOrigin?.replace(/\/$/, '').trim();
    if (!base) {
      return;
    }
    const token = this.auth.getToken();
    if (!token) {
      return;
    }

    const socket = io(`${base}/realtime`, {
      transports: ['websocket'],
      autoConnect: true,
    });
    this.socket = socket;

    socket.on('connect', () => {
      socket.emit(
        'authenticate',
        { token },
        (ack: { ok?: boolean; error?: string } | undefined) => {
          if (!ack?.ok) {
            console.warn('[tenant-modules-realtime] auth failed', ack?.error);
          }
        },
      );
    });

    socket.on(
      'tenant.modules.updated',
      (payload: { tenantId?: string; enabledModuleIds?: string[] }) => {
        const tid = getStoredTenantId();
        if (
          payload?.tenantId &&
          tid &&
          payload.tenantId === tid &&
          Array.isArray(payload.enabledModuleIds)
        ) {
          this.plugins.setPlugins(payload.enabledModuleIds);
        }
      },
    );

    socket.on('disconnect', () => {
      /* noop */
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
