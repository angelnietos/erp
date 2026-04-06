import { createHmac, randomBytes } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import type { DomainEventRecord } from '@prisma/client';

export function signWebhookPayload(secret: string, body: string): string {
  return createHmac('sha256', secret).update(body, 'utf8').digest('hex');
}

@Injectable()
export class WebhookDispatcherService {
  private readonly logger = new Logger(WebhookDispatcherService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Entrega en segundo plano (no bloquea la petición HTTP del evento).
   * Cabecera: `X-Josanz-Signature: sha256=<hex>` sobre el cuerpo JSON UTF-8.
   */
  dispatchForDomainEvent(record: DomainEventRecord): void {
    setImmediate(() => {
      this.deliver(record).catch((err) =>
        this.logger.warn(`Webhook dispatch failed: ${String(err)}`),
      );
    });
  }

  private async deliver(record: DomainEventRecord): Promise<void> {
    const hooks = await this.prisma.integrationWebhook.findMany({
      where: { tenantId: record.tenantId, isActive: true },
    });
    if (hooks.length === 0) {
      return;
    }

    const body = JSON.stringify({
      id: record.id,
      eventType: record.eventType,
      aggregateType: record.aggregateType,
      aggregateId: record.aggregateId,
      payload: record.payload,
      occurredAt: record.createdAt.toISOString(),
    });

    for (const h of hooks) {
      const types = h.eventTypes as unknown as string[];
      const list = Array.isArray(types) ? types : ['*'];
      if (!list.includes('*') && !list.includes(record.eventType)) {
        continue;
      }

      const sig = signWebhookPayload(h.secret, body);
      try {
        const res = await fetch(h.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Josanz-Signature': `sha256=${sig}`,
            'X-Josanz-Event-Id': record.id,
          },
          body,
          signal: AbortSignal.timeout(8000),
        });
        const text = await res.text().catch(() => '');
        await this.prisma.integrationWebhookDelivery.create({
          data: {
            webhookId: h.id,
            tenantId: record.tenantId,
            domainEventId: record.id,
            eventType: record.eventType,
            status: res.ok ? 'DELIVERED' : 'FAILED',
            statusCode: res.status,
            responseBody: text.slice(0, 8000),
          },
        });
      } catch (e) {
        await this.prisma.integrationWebhookDelivery.create({
          data: {
            webhookId: h.id,
            tenantId: record.tenantId,
            domainEventId: record.id,
            eventType: record.eventType,
            status: 'ERROR',
            statusCode: 0,
            responseBody: String(e).slice(0, 8000),
          },
        });
      }
    }
  }

  static generateSecret(): string {
    return randomBytes(24).toString('hex');
  }
}
