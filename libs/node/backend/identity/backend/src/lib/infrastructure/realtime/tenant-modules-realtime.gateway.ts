import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TenantModulesNotifierService } from '../../application/services/tenant-modules-notifier.service';
import { TenantIdentityNotifierService } from '../../application/services/tenant-identity-notifier.service';

interface JwtPayload {
  sub?: string;
  tenantId?: string;
}

/**
 * Namespace `/realtime` — los clientes ERP se unen a la sala `tenant:<uuid>` tras autenticar.
 * Eventos: `tenant.modules.updated` { tenantId, enabledModuleIds };
 * `tenant.identity.updated` { tenantId } (roles / usuarios / permisos).
 */
@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: true, credentials: true },
})
export class TenantModulesRealtimeGateway
  implements
    OnGatewayConnection,
    OnModuleInit,
    OnModuleDestroy
{
  @WebSocketServer()
  server!: Server;

  private readonly log = new Logger(TenantModulesRealtimeGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly notifier: TenantModulesNotifierService,
    private readonly identityNotifier: TenantIdentityNotifierService,
  ) {}

  onModuleInit(): void {
    this.notifier.setBroadcaster((tenantId, enabledModuleIds) => {
      this.server
        ?.to(`tenant:${tenantId}`)
        .emit('tenant.modules.updated', { tenantId, enabledModuleIds });
    });
    this.identityNotifier.setBroadcaster((tenantId) => {
      this.server
        ?.to(`tenant:${tenantId}`)
        .emit('tenant.identity.updated', { tenantId });
    });
  }

  onModuleDestroy(): void {
    this.notifier.setBroadcaster(null);
    this.identityNotifier.setBroadcaster(null);
  }

  handleConnection(client: Socket): void {
    this.log.debug(`socket connected ${client.id}`);
  }

  @SubscribeMessage('authenticate')
  handleAuth(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { token?: string },
  ): { ok: boolean; error?: string } {
    const raw = body?.token?.trim();
    if (!raw) {
      return { ok: false, error: 'missing_token' };
    }
    try {
      const payload = this.jwtService.verify<JwtPayload>(raw);
      const tenantId = payload.tenantId;
      if (!tenantId || typeof tenantId !== 'string') {
        return { ok: false, error: 'invalid_token' };
      }
      void client.join(`tenant:${tenantId}`);
      return { ok: true };
    } catch {
      return { ok: false, error: 'invalid_token' };
    }
  }
}
