import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DomainEvent } from '@josanz-erp/shared-model';

/**
 * OutboxService — transactionally persists domain events to the outbox table.
 *
 * Called inside the same Prisma transaction as the business operation so that
 * events are never lost even if the process crashes before the worker picks them up.
 */
@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) {}

  async saveEvents(
    events: DomainEvent[],
    tx?: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
  ): Promise<void> {
    const client = tx ?? this.prisma;

    await (client as PrismaService).outboxEvent.createMany({
      data: events.map((e) => ({
        aggregateType: e.aggregateType,
        aggregateId: e.aggregateId,
        eventType: e.eventType,
        payload: e.payload as Prisma.InputJsonValue,
        status: 'PENDING',
        retries: 0,
      })),
    });
  }
}


