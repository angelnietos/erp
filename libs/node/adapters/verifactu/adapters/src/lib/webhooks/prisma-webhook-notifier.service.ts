import { Injectable, Logger } from '@nestjs/common';
import { decrypt } from '@josanz-erp/shared-infrastructure';
import { WebhookNotifierPort, VerifactuWebhookEvent } from '@josanz-erp/verifactu-core';
import { VerifactuPrismaService } from '../services/verifactu-prisma.service';
import { createHmac } from 'crypto';

@Injectable()
export class PrismaWebhookNotifierService implements WebhookNotifierPort {
  private readonly logger = new Logger(PrismaWebhookNotifierService.name);

  constructor(private readonly prisma: VerifactuPrismaService) {}

  async notify(event: VerifactuWebhookEvent): Promise<void> {
    const endpoints = await this.prisma.verifactuWebhookEndpoint.findMany({
      where: { tenantId: event.tenantId, isActive: true, eventType: event.eventType },
    });

    for (const endpoint of endpoints) {
      const timestamp = Date.now().toString();
      const body = JSON.stringify({
        eventType: event.eventType,
        tenantId: event.tenantId,
        invoiceId: event.invoiceId,
        payload: event.payload,
        timestamp,
      });

      const signature = createHmac('sha256', decrypt(endpoint.secretHash))
        .update(body)
        .digest('hex');

      const statusCode = 0;
       
      const ok = false;
       
      let responsePayload: unknown = {};

      // Create delivery record before attempting
      const delivery = await this.prisma.verifactuWebhookDelivery.create({
        data: {
          endpointId: endpoint.id,
          tenantId: event.tenantId,
          eventId: event.id ?? '',
          eventType: event.eventType,
          payload: JSON.parse(body) as object,
          signature,
          status: 'PENDING',
          attempts: 1,
        },
      });
      const deliveryId = delivery.id;

      try {
        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Verifactu-Signature': signature,
            'X-Verifactu-Timestamp': timestamp,
          },
          body,
        });
        statusCode = response.status;
        ok = response.ok;
        responsePayload = await response.json().catch(() => ({}));

        await this.prisma.verifactuWebhookDelivery.update({
          where: { id: deliveryId },
          data: {
            status: 'SUCCESS',
            statusCode,
            responseBody: JSON.stringify(responsePayload),
            completedAt: new Date(),
          },
        });

        this.logger.log(
          `Webhook delivered to ${endpoint.url} for invoice ${event.invoiceId}`,
        );
      } catch (error) {
        responsePayload = {
          error: error instanceof Error ? error.message : 'Unknown webhook error',
        };

        await this.prisma.verifactuWebhookDelivery.update({
          where: { id: deliveryId },
          data: {
            status: 'FAILED',
            statusCode: 0,
            lastError: error instanceof Error ? error.message : 'Unknown error',
            attempts: 1,
          },
        });

        this.logger.error(
          `Webhook failed to ${endpoint.url}: ${error instanceof Error ? error.message : 'unknown'}`,
        );
      }
    }
  }
}

