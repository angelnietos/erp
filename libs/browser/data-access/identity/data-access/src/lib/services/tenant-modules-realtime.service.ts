import { inject, Injectable, InjectionToken } from '@angular/core';
import { io, type Socket } from 'socket.io-client';
import { PluginStore } from '@josanz-erp/shared-data-access';
import { AuthService } from './auth.service';
import { getStoredTenantId } from '../interceptors/tenant.interceptor';

/**
 * Origen del API (p. ej. `http://localhost:3000`) para reconectar tras refresh de token.
 * Proporcionar desde `app.config` con el mismo valor que `environment.apiOrigin`.
 */
export const TENANT_MODULES_REALTIME_API_ORIGIN = new InjectionToken<string>(
  'TENANT_MODULES_REALTIME_API_ORIGIN',
  { factory: () => '' },
);

@Injectable({ providedIn: 'root' })
export class TenantModulesRealtimeService {
  private readonly auth = inject(AuthService);
  private readonly plugins = inject(PluginStore);
  private readonly defaultApiOrigin = inject(TENANT_MODULES_REALTIME_API_ORIGIN);
  private socket: Socket | null = null;
  /** Último origen usado en `connect()` (tiene prioridad sobre el token inyectado). */
  private lastConnectOrigin = '';

  /**
   * Conecta al namespace `/realtime` y escucha cambios de módulos del tenant actual.
   * Idempotente: si ya hay socket, lo desmonta y vuelve a crear.
   */
  connect(apiOrigin: string): void {
    this.disconnect();
    const base = this.normalizeOrigin(apiOrigin);
    if (!base) {
      return;
    }
    this.lastConnectOrigin = base;
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
      this.emitAuthenticate(socket);
    });

    socket.on(
      'tenant.modules.updated',
      (payload: { tenantId?: string; enabledModuleIds?: string[] }) => {
        const tid = this.resolveCurrentTenantId();
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
  }

  /**
   * Tras login o `refreshSession`, reenvía el JWT al socket o reconecta si hace falta.
   */
  afterAccessTokenChanged(): void {
    const base = this.lastConnectOrigin || this.normalizeOrigin(this.defaultApiOrigin);
    const token = this.auth.getToken();
    if (!base || !token) {
      return;
    }
    if (this.socket?.connected) {
      this.emitAuthenticate(this.socket);
      return;
    }
    this.connect(base);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private normalizeOrigin(origin: string): string {
    return origin?.replace(/\/$/, '').trim() ?? '';
  }

  /** `localStorage` o `tenantId` del JWT (p. ej. tras login antes de persistir). */
  private resolveCurrentTenantId(): string | null {
    const fromLs = getStoredTenantId();
    if (fromLs) {
      return fromLs;
    }
    return this.parseTenantIdFromJwt(this.auth.getToken());
  }

  private parseTenantIdFromJwt(token: string | null): string | null {
    if (!token) {
      return null;
    }
    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        return null;
      }
      const segment = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = segment.padEnd(
        segment.length + ((4 - (segment.length % 4)) % 4),
        '=',
      );
      const json = atob(padded);
      const payload = JSON.parse(json) as { tenantId?: unknown };
      const tid = payload.tenantId;
      return typeof tid === 'string' && tid.length >= 32 ? tid : null;
    } catch {
      return null;
    }
  }

  private emitAuthenticate(socket: Socket): void {
    const token = this.auth.getToken();
    if (!token) {
      return;
    }
    socket.emit(
      'authenticate',
      { token },
      (ack: { ok?: boolean; error?: string } | undefined) => {
        if (!ack?.ok) {
          console.warn('[tenant-modules-realtime] auth failed', ack?.error);
        }
      },
    );
  }
}
