import { createHmac, randomBytes } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService, decrypt } from '@josanz-erp/shared-infrastructure';
import type { DomainEventRecord } from '@prisma/client';

export function signWebhookPayload(secret: string, body: string): string {
  return createHmac('sha256', secret).update(body, 'utf8').digest('hex');
}

@Injectable()
export class WebhookDispatcherService {
  private readonly logger = new Logger(WebhookDispatcherService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Encola los webhooks correspondientes a un evento de dominio.
   * El worker (WebhookQueueWorker) se encargarÃ¡ de la entrega real.
   */
  async dispatchForDomainEvent(record: DomainEventRecord): Promise<void> {
    const hooks = await this.prisma.integrationWebhook.findMany({
      where: { tenantId: record.tenantId, isActive: true },
    });
    
    if (hooks.length === 0) return;

    const queueItems = hooks
      .filter(h => {
        const types = h.eventTypes as unknown as string[];
        const list = Array.isArray(types) ? types : ['*'];
        return list.includes('*') || list.includes(record.eventType);
      })
      .map(h => ({
        webhookId: h.id,
        tenantId: record.tenantId,
        domainEventId: record.id,
        status: 'PENDING',
        retries: 0,
        maxRetries: 5,
        nextRetryAt: new Date(), // En este momento se encola para su proceso inmediato
      }));

    if (queueItems.length > 0) {
      await this.prisma.integrationWebhookQueueItem.createMany({
        data: queueItems,
      });
      this.logger.log(`Enqueued ${queueItems.length} webhooks for event ${record.id}`);
    }
  }

  public async deliver(record: DomainEventRecord): Promise<void> {
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

      const decryptedSecret = decrypt(h.secret);
      const sig = signWebhookPayload(decryptedSecret, body);
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
