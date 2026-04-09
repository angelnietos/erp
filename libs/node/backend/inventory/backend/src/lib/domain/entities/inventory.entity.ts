import { AggregateRoot, EntityId, DomainEvent } from '@josanz-erp/shared-model';

export type InventoryStatus = 'AVAILABLE' | 'MAINTENANCE' | 'RETIRED';

export interface InventoryProps {
  productId: EntityId;
  totalStock: number;
  status: InventoryStatus;
  /** Optimistic locking version — incremented on every write */
  version: number;
}

export class InsufficientStockError extends Error {
  constructor(productId: string, requested: number, available: number) {
    super(
      `Insufficient stock for product ${productId}. Requested: ${requested}, Available: ${available}`,
    );
  }
}

export class InvalidStateTransitionError extends Error {
  constructor(entity: string, from: string, to: string) {
    super(`Invalid state transition for ${entity}: ${from} → ${to}`);
  }
}

/**
 * Inventory Aggregate Root — single source of truth for stock availability.
 * Rentals request reservations here; they NEVER modify stock directly (ADR rule).
 */
export class Inventory extends AggregateRoot {
  readonly id: EntityId;
  private props: InventoryProps;

  private constructor(id: EntityId, props: InventoryProps) {
    super();
    this.id = id;
    this.props = props;
  }

  static create(productId: EntityId, totalStock: number): Inventory {
    return new Inventory(new EntityId(), {
      productId,
      totalStock,
      status: 'AVAILABLE',
      version: 1,
    });
  }

  static reconstitute(id: string, props: InventoryProps): Inventory {
    return new Inventory(new EntityId(id), props);
  }

  /**
   * Validates that enough units are available for a reservation.
   * The actual InventoryReservation record is created by infrastructure.
   */
  validateAvailability(requested: number, currentlyReserved: number): void {
    const available = this.props.totalStock - currentlyReserved;
    if (requested > available) {
      throw new InsufficientStockError(this.props.productId.value, requested, available);
    }
  }

  addStock(units: number): void {
    this.props.totalStock += units;
    this.addDomainEvent(this.buildEvent('StockAdded', { units }));
  }

  removeStock(units: number): void {
    if (units > this.props.totalStock) {
      throw new InsufficientStockError(this.props.productId.value, units, this.props.totalStock);
    }
    this.props.totalStock -= units;
    this.addDomainEvent(this.buildEvent('StockRemoved', { units }));
  }

  get totalStock(): number { return this.props.totalStock; }
  get status(): InventoryStatus { return this.props.status; }
  get version(): number { return this.props.version; }
  get productId(): EntityId { return this.props.productId; }

  private buildEvent(eventType: string, extra: Record<string, unknown> = {}): DomainEvent {
    return {
      aggregateType: 'Inventory',
      aggregateId: this.id.value,
      eventType,
      payload: { productId: this.props.productId.value, totalStock: this.props.totalStock, ...extra },
      occurredAt: new Date(),
    };
  }
}


