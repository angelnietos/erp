import { AggregateRoot, EntityId, DomainEvent } from '@josanz-erp/shared-model';

/**
 * Rental Status
 */
export type RentalStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

/**
 * Rental Item Props
 */
export interface RentalItemProps {
  id: EntityId;
  productId: EntityId;
  quantity: number;
  unitId?: EntityId;
}

/**
 * Rental Props
 */
export interface RentalProps {
  clientId: EntityId;
  status: RentalStatus;
  items: RentalItemProps[];
  version: number;
  createdAt: Date;
  deletedAt?: Date;
}

/**
 * Rental Aggregate Root
 * Represents a rental in the ERP rentals domain
 */
export class Rental extends AggregateRoot {
  readonly id: EntityId;
  private props: RentalProps;

  private constructor(id: EntityId, props: RentalProps) {
    super();
    this.id = id;
    this.props = props;
  }

  /**
   * Create a new rental
   */
  static create(clientId: EntityId): Rental {
    const id = new EntityId();
    return new Rental(id, {
      clientId,
      status: 'DRAFT',
      items: [],
      version: 1,
      createdAt: new Date(),
    });
  }

  /**
   * Reconstitute an existing rental
   */
  static reconstitute(id: string, props: RentalProps): Rental {
    return new Rental(new EntityId(id), props);
  }

  /**
   * Add an item to the rental
   */
  addItem(productId: EntityId, quantity: number, unitId?: EntityId): void {
    if (this.props.status !== 'DRAFT') {
      throw new Error('Can only add items to a DRAFT rental');
    }
    this.props.items.push({
      id: new EntityId(),
      productId,
      quantity,
      unitId,
    });
  }

  /**
   * Remove an item from the rental
   */
  removeItem(itemId: EntityId): void {
    if (this.props.status !== 'DRAFT') {
      throw new Error('Can only remove items from a DRAFT rental');
    }
    this.props.items = this.props.items.filter((item) => item.id.value !== itemId.value);
  }

  /**
   * Activate the rental
   */
  activate(): void {
    if (this.props.status !== 'DRAFT') {
      throw new Error(`Cannot activate a rental in status: ${this.props.status}`);
    }
    if (this.props.items.length === 0) {
      throw new Error('Cannot activate a rental without items');
    }
    this.props.status = 'ACTIVE';
    this.addDomainEvent(this.buildEvent('RentalActivated'));
  }

  /**
   * Complete the rental
   */
  complete(): void {
    if (this.props.status !== 'ACTIVE') {
      throw new Error(`Cannot complete a rental in status: ${this.props.status}`);
    }
    this.props.status = 'COMPLETED';
    this.addDomainEvent(this.buildEvent('RentalCompleted'));
  }

  /**
   * Cancel the rental
   */
  cancel(): void {
    if (this.props.status === 'COMPLETED') {
      throw new Error('Cannot cancel a completed rental');
    }
    this.props.status = 'CANCELLED';
    this.addDomainEvent(this.buildEvent('RentalCancelled'));
  }

  /**
   * Mark as deleted (soft delete)
   */
  delete(): void {
    this.props.deletedAt = new Date();
    this.addDomainEvent(this.buildEvent('RentalDeleted'));
  }

  // Getters
  get clientId(): EntityId { return this.props.clientId; }
  get status(): RentalStatus { return this.props.status; }
  get items(): RentalItemProps[] { return [...this.props.items]; }
  get version(): number { return this.props.version; }
  get createdAt(): Date { return this.props.createdAt; }
  get deletedAt(): Date | undefined { return this.props.deletedAt; }

  private buildEvent(eventType: string): DomainEvent {
    return {
      aggregateType: 'Rental',
      aggregateId: this.id.value,
      eventType,
      payload: {
        clientId: this.props.clientId.value,
        status: this.props.status,
        itemsCount: this.props.items.length,
      },
      occurredAt: new Date(),
    };
  }
}
