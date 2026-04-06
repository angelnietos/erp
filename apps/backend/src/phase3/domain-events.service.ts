import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface StoredDomainEvent {
  id: string;
  tenantId: string;
  occurredAt: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
}

/** Anillo en memoria (Fase 3). Sustituible por tabla `domain_events` + outbox. */
@Injectable()
export class DomainEventsService {
  private readonly buffer: StoredDomainEvent[] = [];
  private readonly max = 2000;

  append(
    tenantId: string,
    event: Omit<StoredDomainEvent, 'id' | 'tenantId' | 'occurredAt'>,
  ): StoredDomainEvent {
    const row: StoredDomainEvent = {
      id: randomUUID(),
      tenantId,
      occurredAt: new Date().toISOString(),
      ...event,
    };
    this.buffer.unshift(row);
    if (this.buffer.length > this.max) {
      this.buffer.length = this.max;
    }
    return row;
  }

  list(tenantId: string, limit = 100): StoredDomainEvent[] {
    return this.buffer.filter((e) => e.tenantId === tenantId).slice(0, limit);
  }
}
