/**
 * Domain Event Interface
 * Base interface for all domain events in the ERP system
 */

import { AggregateRoot } from '@josanz-erp/shared-model';

export interface DomainEvent {
  /**
   * Unique identifier for the event
   */
  readonly eventId: string;

  /**
   * The aggregate root that triggered this event
   */
  readonly aggregateId: string;

  /**
   * The type of the event (class name)
   */
  readonly eventType: string;

  /**
   * When the event occurred
   */
  readonly occurredOn: Date;

  /**
   * Version of the event schema
   */
  readonly eventVersion: number;
}

/**
 * Base class for all domain events
 */
export abstract class BaseDomainEvent implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: string;
  readonly eventType: string;
  readonly occurredOn: Date;
  readonly eventVersion: number;

  constructor(
    aggregateId: string,
    eventVersion = 1,
  ) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = aggregateId;
    this.eventType = this.constructor.name;
    this.occurredOn = new Date();
    this.eventVersion = eventVersion;
  }

  /**
   * Get the event name for logging/debugging
   */
  toString(): string {
    return `${this.eventType}:${this.aggregateId}`;
  }

  /**
   * Serialize event to JSON for storage
   */
  toJSON(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      aggregateId: this.aggregateId,
      eventType: this.eventType,
      occurredOn: this.occurredOn.toISOString(),
      eventVersion: this.eventVersion,
    };
  }
}

/**
 * Event handler signature
 */
export type EventHandler<T extends DomainEvent = DomainEvent> = (
  event: T,
) => Promise<void> | void;

/**
 * Event handler metadata
 */
export interface EventHandlerMetadata {
  handler: EventHandler;
  eventType: string;
  priority?: number;
}

/**
 * Event subscribers collection
 */
export type EventHandlers = Map<string, Set<EventHandlerMetadata>>;