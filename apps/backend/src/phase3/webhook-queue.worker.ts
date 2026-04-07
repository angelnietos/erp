import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService, decrypt } from '@josanz-erp/shared-infrastructure';
import { signWebhookPayload } from './webhook-dispatcher.service';
import { IntegrationWebhook, IntegrationWebhookQueueItem, DomainEventRecord } from '@prisma/client';

type QueueItemWithRelations = IntegrationWebhookQueueItem & {
  webhook: IntegrationWebhook;
  domainEvent: DomainEventRecord;
};

@Injectable()
export class WebhookQueueWorker {
  private readonly logger = new Logger(WebhookQueueWorker.name);
  private isProcessing = false;

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const pendingItems = await this.prisma.integrationWebhookQueueItem.findMany({
        where: {
          status: { in: ['PENDING', 'FAILED'] },
          nextRetryAt: { lte: new Date() },
          retries: { lt: 5 } // maxRetries
        },
        include: {
          webhook: true,
          domainEvent: true
        },
        take: 50,
        orderBy: { createdAt: 'asc' }
      }) as unknown as QueueItemWithRelations[];

      if (pendingItems.length === 0) {
        this.isProcessing = false;
        return;
      }

      this.logger.log(`Processing ${pendingItems.length} webhook queue items`);

      for (const item of pendingItems) {
        await this.deliverItem(item);
      }
    } catch (error) {
      this.logger.error('Error in webhook queue worker', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async deliverItem(item: QueueItemWithRelations) {
    const { webhook, domainEvent } = item;
    
    const body = JSON.stringify({
      id: domainEvent.id,
      eventType: domainEvent.eventType,
      aggregateType: domainEvent.aggregateType,
      aggregateId: domainEvent.aggregateId,
      payload: domainEvent.payload,
      occurredAt: domainEvent.createdAt.toISOString(),
    });

    const decryptedSecret = decrypt(webhook.secret);
    const sig = signWebhookPayload(decryptedSecret, body);

    try {
      const res = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Josanz-Signature': `sha256=${sig}`,
          'X-Josanz-Event-Id': domainEvent.id,
        },
        body,
        signal: AbortSignal.timeout(10000),
      });

      const text = await res.text().catch(() => '');
      
      // Registrar entrega exitosa o fallida
      await this.prisma.integrationWebhookDelivery.create({
        data: {
          webhookId: webhook.id,
          tenantId: item.tenantId,
          domainEventId: domainEvent.id,
          eventType: domainEvent.eventType,
          status: res.ok ? 'DELIVERED' : 'FAILED',
          statusCode: res.status,
          responseBody: text.slice(0, 8000),
        },
      });

      if (res.ok) {
        await this.prisma.integrationWebhookQueueItem.update({
          where: { id: item.id },
          data: { status: 'COMPLETED', updatedAt: new Date() }
        });
      } else {
        await this.handleFailure(item, `HTTP ${res.status}: ${text.slice(0, 500)}`);
      }
    } catch (e) {
      this.logger.warn(`Failed to deliver webhook ${item.id}: ${String(e)}`);
      await this.handleFailure(item, String(e));
    }
  }

  private async handleFailure(item: QueueItemWithRelations, errorMsg: string) {
    const nextRetries = item.retries + 1;
    const maxRetries = item.maxRetries;
    
    if (nextRetries >= maxRetries) {
      await this.prisma.integrationWebhookQueueItem.update({
        where: { id: item.id },
        data: { 
          status: 'FAILED', 
          retries: nextRetries,
          lastError: errorMsg,
          updatedAt: new Date()
        }
      });
    } else {
      // Exponential backoff: 1min, 4min, 9min, 16min, 25min...
      const delayMinutes = Math.pow(nextRetries, 2);
      const nextRetryAt = new Date();
      nextRetryAt.setMinutes(nextRetryAt.getMinutes() + delayMinutes);

      await this.prisma.integrationWebhookQueueItem.update({
        where: { id: item.id },
        data: { 
          status: 'FAILED',
          retries: nextRetries,
          nextRetryAt,
          lastError: errorMsg,
          updatedAt: new Date()
        }
      });
    }
  }
}
