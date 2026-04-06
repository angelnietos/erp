import { Injectable } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import { Prisma } from '@prisma/client';
import { WebhookDispatcherService } from './webhook-dispatcher.service';

export interface StoredDomainEvent {
  id: string;
  tenantId: string;
  occurredAt: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
}

@Injectable()
export class DomainEventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webhooks: WebhookDispatcherService,
  ) {}

  private mapRow(e: {
    id: string;
    tenantId: string;
    createdAt: Date;
    eventType: string;
    aggregateType: string;
    aggregateId: string;
    payload: Prisma.JsonValue;
  }): StoredDomainEvent {
    return {
      id: e.id,
      tenantId: e.tenantId,
      occurredAt: e.createdAt.toISOString(),
      eventType: e.eventType,
      aggregateType: e.aggregateType,
      aggregateId: e.aggregateId,
      payload: (e.payload ?? {}) as Record<string, unknown>,
    };
  }

  async append(
    tenantId: string,
    event: Omit<StoredDomainEvent, 'id' | 'tenantId' | 'occurredAt'>,
    createdByUserId?: string | null,
  ): Promise<StoredDomainEvent> {
    const row = await this.prisma.domainEventRecord.create({
      data: {
        tenantId,
        eventType: event.eventType,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        payload: event.payload as Prisma.InputJsonValue,
        createdByUserId: createdByUserId ?? undefined,
      },
    });
    const mapped = this.mapRow(row);
    this.webhooks.dispatchForDomainEvent(row);
    return mapped;
  }

  async list(
    tenantId: string,
    limit = 50,
    skip = 0,
  ): Promise<StoredDomainEvent[]> {
    const n = Math.min(500, Math.max(1, limit));
    const s = Math.max(0, skip);
    const rows = await this.prisma.domainEventRecord.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: n,
      skip: s,
    });
    return rows.map((r) => this.mapRow(r));
  }
}
