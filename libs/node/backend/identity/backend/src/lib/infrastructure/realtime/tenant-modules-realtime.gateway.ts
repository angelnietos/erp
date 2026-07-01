import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwksRsa from 'jwks-rsa';
import jwt from 'jsonwebtoken';
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
  iss?: string;
}

/**
 * Namespace `/realtime` — los clientes ERP se unen a la sala `tenant:<uuid>` tras autenticar.
 * Soporta tokens de Keycloak (RS256) y tokens ERP estándar (HS256).
 * Eventos: `tenant.modules.updated` { tenantId, enabledModuleIds };
 * `tenant.identity.updated` { tenantId, userId? } (roles / usuarios / permisos).
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
  private readonly jwtSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly notifier: TenantModulesNotifierService,
    private readonly identityNotifier: TenantIdentityNotifierService,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET') ?? 'default_secret';
  }

  onModuleInit(): void {
    this.notifier.setBroadcaster((tenantId, enabledModuleIds) => {
      this.server
        ?.to(`tenant:${tenantId}`)
        .emit('tenant.modules.updated', { tenantId, enabledModuleIds });
    });
    this.identityNotifier.setBroadcaster((tenantId, userId) => {
      this.server
        ?.to(`tenant:${tenantId}`)
        .emit('tenant.identity.updated', { tenantId, userId });
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
  async handleAuth(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { token?: string },
  ): Promise<{ ok: boolean; error?: string }> {
    const raw = body?.token?.trim();
    if (!raw) {
      return { ok: false, error: 'missing_token' };
    }

    try {
      const decoded = jwt.decode(raw, { complete: true }) as any;
      const iss = decoded?.payload?.iss ?? '';
      const isKeycloak = typeof iss === 'string' && iss.includes('/realms/');

      let payload: JwtPayload | null = null;

      if (isKeycloak) {
        payload = await this.verifyKeycloakToken(raw);
      } else {
        payload = jwt.verify(raw, this.jwtSecret) as JwtPayload;
      }

      const tenantId = payload?.tenantId;
      if (!tenantId || typeof tenantId !== 'string') {
        return { ok: false, error: 'invalid_token' };
      }
      await client.join(`tenant:${tenantId}`);
      if (payload.sub) {
        await client.join(`user:${payload.sub}`);
      }
      return { ok: true };
    } catch {
      return { ok: false, error: 'invalid_token' };
    }
  }

  private async verifyKeycloakToken(token: string): Promise<JwtPayload | null> {
    const decoded = jwt.decode(token, { complete: true }) as any;
    if (!decoded?.header?.kid) {
      return null;
    }

    const keycloakUrl =
      this.configService.get<string>('KEYCLOAK_AUTH_SERVER_URL')?.replace(/\/$/, '') ||
      'http://localhost:8081';
    const keycloakRealm =
      this.configService.get<string>('KEYCLOAK_REALM') || 'josanz-web-app-realm';
    const jwksUri = `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/certs`;

    const client = jwksRsa({
      jwksUri,
      cache: true,
      cacheMaxEntries: 5,
    });

    const key = await client.getSigningKey(decoded.header.kid);
    return jwt.verify(token, key.getPublicKey()) as JwtPayload;
  }
}
