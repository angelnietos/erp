/**
 * Event Store Service
 * Provides persistence and retrieval of domain events
 */

import { DomainEvent } from '../interfaces/domain-event.interface';

/**
 * Stored event record
 */
export interface StoredEvent {
  id: string;
  type: string;
  aggregateId: string;
  data: Record<string, unknown>;
  metadata: EventMetadata;
  occurredOn: Date;
  storedAt: Date;
}

/**
 * Event metadata for storage
 */
export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  userId?: string;
  tenantId?: string;
  version: number;
}

/**
 * Event filter for querying
 */
export interface EventFilter {
  aggregateId?: string;
  type?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Event store interface
 */
export interface IEventStore {
  /**
   * Append events to the store
   */
  append(events: DomainEvent[], metadata?: Partial<EventMetadata>): Promise<void>;

  /**
   * Get events by aggregate ID
   */
  getByAggregateId(aggregateId: string): Promise<StoredEvent[]>;

  /**
   * Get events by type
   */
  getByType(type: string, limit?: number): Promise<StoredEvent[]>;

  /**
   * Get events by filter
   */
  getEvents(filter: EventFilter): Promise<StoredEvent[]>;

  /**
   * Get event count by aggregate
   */
  getEventCount(aggregateId: string): Promise<number>;
}

/**
 * In-memory event store implementation (for development/testing)
 */
export class InMemoryEventStore implements IEventStore {
  private events: StoredEvent[] = [];

  async append(events: DomainEvent[], metadata?: Partial<EventMetadata>): Promise<void> {
    const storedAt = new Date();
    
    for (const event of events) {
      const storedEvent: StoredEvent = {
        id:
          typeof globalThis !== 'undefined' &&
          (globalThis as any).crypto &&
          typeof (globalThis as any).crypto.randomUUID === 'function'
            ? (globalThis as any).crypto.randomUUID()
            : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
              }),
        type: event.eventType,
        aggregateId: event.aggregateId,
        data: event as unknown as Record<string, unknown>,
        metadata: {
          version: event.eventVersion,
          ...metadata,
        },
        occurredOn: event.occurredOn,
        storedAt,
      };
      
      this.events.push(storedEvent);
    }
  }

  async getByAggregateId(aggregateId: string): Promise<StoredEvent[]> {
    return this.events
      .filter(e => e.aggregateId === aggregateId)
      .sort((a, b) => a.occurredOn.getTime() - b.occurredOn.getTime());
  }

  async getByType(type: string, limit = 100): Promise<StoredEvent[]> {
    return this.events
      .filter(e => e.type === type)
      .sort((a, b) => b.storedAt.getTime() - a.storedAt.getTime())
      .slice(0, limit);
  }

  async getEvents(filter: EventFilter): Promise<StoredEvent[]> {
    let results = [...this.events];

    if (filter.aggregateId) {
      results = results.filter(e => e.aggregateId === filter.aggregateId);
    }

    if (filter.type) {
      results = results.filter(e => e.type === filter.type);
    }

    if (filter.from) {
      results = results.filter(e => e.occurredOn >= filter.from!);
    }

    if (filter.to) {
      results = results.filter(e => e.occurredOn <= filter.to!);
    }

    // Sort by occurredOn descending (newest first)
    results.sort((a, b) => b.occurredOn.getTime() - a.occurredOn.getTime());

    // Apply pagination
    if (filter.offset) {
      results = results.slice(filter.offset);
    }

    if (filter.limit) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  async getEventCount(aggregateId: string): Promise<number> {
    return this.events.filter(e => e.aggregateId === aggregateId).length;
  }

  /**
   * Clear all events (for testing)
   */
  clear(): void {
    this.events = [];
  }
}

/**
 * Event Store Factory
 */
export class EventStoreFactory {
  private static instance: IEventStore | null = null;

  static getInstance(): IEventStore {
    if (!EventStoreFactory.instance) {
      EventStoreFactory.instance = new InMemoryEventStore();
    }
    return EventStoreFactory.instance;
  }

  static setInstance(store: IEventStore): void {
    EventStoreFactory.instance = store;
  }
}

/**
 * Token for dependency injection
 */
export const EVENT_STORE_TOKEN = 'EVENT_STORE';