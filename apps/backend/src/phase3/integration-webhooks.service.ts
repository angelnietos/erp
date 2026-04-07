import { Injectable } from '@nestjs/common';
import { PrismaService, encrypt } from '@josanz-erp/shared-infrastructure';
import { Prisma } from '@prisma/client';
import { DomainEventsService } from './domain-events.service';
import { WebhookDispatcherService } from './webhook-dispatcher.service';

@Injectable()
export class IntegrationWebhooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly domainEvents: DomainEventsService,
  ) {}

  async register(
    tenantId: string,
    body: { url: string; events?: string[] },
  ): Promise<{
    id: string;
    url: string;
    events: string[];
    secret: string;
    createdAt: string;
    tenantId: string;
  }> {
    const secret = WebhookDispatcherService.generateSecret();
    const encryptedSecret = encrypt(secret);
    const eventTypes = (body.events?.length ? body.events : ['*']) as string[];
    const row = await this.prisma.integrationWebhook.create({
      data: {
        tenantId,
        url: body.url,
        secret: encryptedSecret,
        eventTypes: eventTypes as unknown as Prisma.InputJsonValue,
        isActive: true,
      },
    });

    await this.domainEvents.append(tenantId, {
      eventType: 'WebhookRegistered',
      aggregateType: 'Integration',
      aggregateId: row.id,
      payload: { url: row.url, events: eventTypes },
    });

    return {
      id: row.id,
      url: row.url,
      events: eventTypes,
      secret, // We return the original secret only once during registration
      createdAt: row.createdAt.toISOString(),
      tenantId,
    };
  }

  async listForTenant(tenantId: string) {
    const rows = await this.prisma.integrationWebhook.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      url: r.url,
      events: r.eventTypes as unknown as string[],
      isActive: r.isActive,
      // secret is NOT returned in listings for security (Fase 4 requirement)
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async rotateSecret(tenantId: string, webhookId: string): Promise<{ secret: string }> {
    const secret = WebhookDispatcherService.generateSecret();
    const encryptedSecret = encrypt(secret);
    
    await this.prisma.integrationWebhook.update({
      where: { id: webhookId, tenantId },
      data: { secret: encryptedSecret }
    });

    return { secret };
  }
}
