/**
 * Event Bus Service
 * Central event dispatcher for domain events in the ERP system
 */

import { DomainEvent, EventHandler, EventHandlerMetadata, EventHandlers } from '../interfaces/domain-event.interface';

/**
 * EventBus Configuration
 */
export interface EventBusConfig {
  /**
   * Enable async event handling
   */
  async?: boolean;

  /**
   * Timeout for async handlers (ms)
   */
  timeout?: number;

  /**
   * Enable event logging
   */
  logging?: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: EventBusConfig = {
  async: true,
  timeout: 5000,
  logging: false,
};

/**
 * Event Bus for publishing and subscribing to domain events
 */
export class EventBus {
  private handlers: EventHandlers = new Map();
  private config: EventBusConfig;
  private static instance: EventBus | null = null;

  constructor(config: EventBusConfig = DEFAULT_CONFIG) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: EventBusConfig): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus(config);
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to events of a specific type
   * @param eventType - The event class to subscribe to
   * @param handler - Function to handle the event
   * @param priority - Handler priority (higher = first)
   * @returns Unsubscribe function
   */
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
    priority = 0,
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    const metadata: EventHandlerMetadata = {
      handler: handler as EventHandler,
      eventType,
      priority,
    };

    const bucket = this.handlers.get(eventType);
    if (bucket) {
      bucket.add(metadata);
    }

    // Return unsubscribe function
    return () => {
      const handlerSet = this.handlers.get(eventType);
      if (handlerSet) {
        handlerSet.delete(metadata);
        if (handlerSet.size === 0) {
          this.handlers.delete(eventType);
        }
      }
    };
  }

  /**
   * Subscribe to all events (wildcard)
   * @param handler - Function to handle any event
   * @param priority - Handler priority
   * @returns Unsubscribe function
   */
  subscribeToAll(handler: EventHandler, priority = 0): () => void {
    return this.subscribe('*', handler, priority);
  }

  /**
   * Publish an event to all subscribers
   * @param event - Domain event to publish
   */
  async publish<T extends DomainEvent>(event: T): Promise<void> {
    if (this.config.logging) {
      console.log(`[EventBus] Publishing: ${event.eventType}:${event.aggregateId}`);
    }

    const handlers = this.handlers.get(event.eventType) || new Set();
    const wildcardHandlers = this.handlers.get('*') || new Set();

    // Combine specific and wildcard handlers
    const allHandlers = [...handlers, ...wildcardHandlers];

    if (allHandlers.length === 0) {
      if (this.config.logging) {
        console.log(`[EventBus] No handlers for event: ${event.eventType}`);
      }
      return;
    }

    // Sort by priority (highest first)
    const sortedHandlers = [...allHandlers].sort(
      (a, b) => (b.priority || 0) - (a.priority || 0),
    );

    // Execute handlers
    if (this.config.async) {
      await this.publishAsync(sortedHandlers, event);
    } else {
      this.publishSync(sortedHandlers, event);
    }
  }

  /**
   * Publish event synchronously
   */
  private publishSync(handlers: EventHandlerMetadata[], event: DomainEvent): void {
    for (const { handler } of handlers) {
      try {
        handler(event);
      } catch (error) {
        console.error(`[EventBus] Handler error for ${event.eventType}:`, error);
      }
    }
  }

  /**
   * Publish event asynchronously with timeout
   */
  private async publishAsync(
    handlers: EventHandlerMetadata[],
    event: DomainEvent,
  ): Promise<void> {
    const timeout = this.config.timeout || 5000;

    const promises = handlers.map(async ({ handler }) => {
      const promise = Promise.resolve(handler(event));
      
      if (timeout > 0) {
        return Promise.race([
          promise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Handler timeout')), timeout),
          ),
        ]);
      }
      
      return promise;
    });

    const results = await Promise.allSettled(promises);

    // Log any errors
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `[EventBus] Handler ${index} failed for ${event.eventType}:`,
          result.reason,
        );
      }
    });
  }

  /**
   * Publish multiple events in sequence
   * @param events - Array of events to publish
   */
  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clear(): void {
    this.handlers.clear();
  }

  /**
   * Get count of handlers for an event type
   */
  getHandlerCount(eventType: string): number {
    return (this.handlers.get(eventType)?.size || 0) + 
           (this.handlers.get('*')?.size || 0);
  }

  /**
   * Check if there are handlers for an event type
   */
  hasHandlers(eventType: string): boolean {
    return this.getHandlerCount(eventType) > 0;
  }
}

/**
 * Module for dependency injection
 */
export const EVENT_BUS_TOKEN = 'EVENT_BUS';

/**
 * Create and configure a new EventBus instance
 */
export function createEventBus(config?: EventBusConfig): EventBus {
  return new EventBus(config);
}
