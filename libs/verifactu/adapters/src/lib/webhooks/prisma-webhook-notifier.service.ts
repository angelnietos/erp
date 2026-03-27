import { Injectable } from '@nestjs/common';
import { WebhookNotifierPort, VerifactuWebhookEvent } from '../../../../core/src';
import { VerifactuPrismaService } from '../services/verifactu-prisma.service';
import { createHmac } from 'crypto';

@Injectable()
export class PrismaWebhookNotifierService implements WebhookNotifierPort {
  constructor(private readonly prisma: VerifactuPrismaService) {}

  async notify(event: VerifactuWebhookEvent): Promise<void> {
    const endpoints = await this.prisma.verifactuWebhookEndpoint.findMany({
      where: { tenantId: event.tenantId, isActive: true, eventType: event.eventType },
    });

    for (const endpoint of endpoints) {
      const body = JSON.stringify({
        eventType: event.eventType,
        tenantId: event.tenantId,
        invoiceId: event.invoiceId,
        payload: event.payload,
      });
      const signature = createHmac('sha256', endpoint.secret).update(body).digest('hex');

      let statusCode = 0;
      let ok = false;
      let responsePayload: unknown = {};
      try {
        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Verifactu-Signature': signature,
          },
          body,
        });
        statusCode = response.status;
        ok = response.ok;
        responsePayload = await response.json().catch(() => ({}));
      } catch (error) {
        responsePayload = {
          error: error instanceof Error ? error.message : 'Unknown webhook error',
        };
      }

      await this.prisma.verifactuWebhookDelivery.create({
        data: {
          endpointId: endpoint.id,
          tenantId: event.tenantId,
          eventType: event.eventType,
          payload: JSON.parse(body) as object,
          status: ok ? 'SUCCESS' : 'FAILED',
          statusCode,
          responsePayload: responsePayload as object,
        },
      });
    }
  }
}

