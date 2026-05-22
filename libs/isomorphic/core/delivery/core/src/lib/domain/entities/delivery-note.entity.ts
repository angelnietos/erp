import { AggregateRoot, EntityId } from '@josanz-erp/shared-model';

/**
 * Delivery Note Status
 */
export type DeliveryStatus = 'DRAFT' | 'PREPARED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

/**
 * Delivery Note Item
 */
export interface DeliveryItem {
  id: EntityId;
  productId: EntityId;
  quantity: number;
  deliveredQuantity: number;
}

/**
 * Delivery Note Props
 */
export interface DeliveryNoteProps {
  budgetId: EntityId;
  clientId: EntityId;
  driverId?: EntityId;
  vehicleId?: EntityId;
  deliveryDate: Date;
  status: DeliveryStatus;
  items: DeliveryItem[];
  notes?: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Delivery Note Entity
 * Represents a delivery note (albarán) in the ERP system
 */
export class DeliveryNote extends AggregateRoot {
  readonly id: EntityId;
  private readonly props: DeliveryNoteProps;

  private constructor(id: EntityId, props: DeliveryNoteProps) {
    super();
    this.id = id;
    this.props = props;
  }

  /**
   * Create a new delivery note from a budget
   */
  static create(budgetId: EntityId, clientId: EntityId, deliveryDate: Date): DeliveryNote {
    const id = new EntityId();
    const now = new Date();
    return new DeliveryNote(id, {
      budgetId,
      clientId,
      deliveryDate,
      status: 'DRAFT',
      items: [],
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Reconstitute an existing delivery note
   */
  static reconstitute(id: string, props: DeliveryNoteProps): DeliveryNote {
    return new DeliveryNote(new EntityId(id), props);
  }

  /**
   * Add an item to the delivery note
   */
  addItem(productId: EntityId, quantity: number): void {
    if (this.props.status !== 'DRAFT') {
      throw new Error('Can only add items to a DRAFT delivery note');
    }
    this.props.items.push({
      id: new EntityId(),
      productId,
      quantity,
      deliveredQuantity: 0,
    });
    this.touch();
  }

  /**
   * Prepare the delivery note for shipment
   */
  prepare(): void {
    if (this.props.status !== 'DRAFT') {
      throw new Error(`Cannot prepare a delivery note in status: ${this.props.status}`);
    }
    if (this.props.items.length === 0) {
      throw new Error('Cannot prepare a delivery note without items');
    }
    this.props.status = 'PREPARED';
    this.touch();
  }

  /**
   * Mark as in transit
   */
  startTransit(driverId: EntityId, vehicleId: EntityId): void {
    if (this.props.status !== 'PREPARED') {
      throw new Error(`Cannot start transit for a delivery note in status: ${this.props.status}`);
    }
    this.props.driverId = driverId;
    this.props.vehicleId = vehicleId;
    this.props.status = 'IN_TRANSIT';
    this.touch();
  }

  /**
   * Mark as delivered
   */
  deliver(notes?: string): void {
    if (this.props.status !== 'IN_TRANSIT') {
      throw new Error(`Cannot deliver a delivery note in status: ${this.props.status}`);
    }
    this.props.status = 'DELIVERED';
    if (notes) {
      this.props.notes = notes;
    }
    this.touch();
  }

  /**
   * Cancel the delivery note
   */
  cancel(reason: string): void {
    if (['DELIVERED', 'CANCELLED'].includes(this.props.status)) {
      throw new Error(`Cannot cancel a delivery note in status: ${this.props.status}`);
    }
    this.props.status = 'CANCELLED';
    this.props.notes = `Cancelled: ${reason}`;
    this.touch();
  }

  /**
   * Update delivered quantities
   */
  updateDeliveredQuantity(itemId: EntityId, deliveredQuantity: number): void {
    const item = this.props.items.find(i => i.id.equals(itemId));
    if (!item) {
      throw new Error('Item not found');
    }
    if (deliveredQuantity > item.quantity) {
      throw new Error('Delivered quantity cannot exceed ordered quantity');
    }
    item.deliveredQuantity = deliveredQuantity;
    this.touch();
  }

  /**
   * Mark as updated
   */
  private touch(): void {
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  // Getters
  get budgetId(): EntityId { return this.props.budgetId; }
  get clientId(): EntityId { return this.props.clientId; }
  get driverId(): EntityId | undefined { return this.props.driverId; }
  get vehicleId(): EntityId | undefined { return this.props.vehicleId; }
  get deliveryDate(): Date { return this.props.deliveryDate; }
  get status(): DeliveryStatus { return this.props.status; }
  get items(): DeliveryItem[] { return [...this.props.items]; }
  get notes(): string | undefined { return this.props.notes; }
  get version(): number { return this.props.version; }

  /**
   * Check if all items are fully delivered
   */
  isFullyDelivered(): boolean {
    return this.props.items.every(item => item.deliveredQuantity === item.quantity);
  }

  /**
   * Get total items count
   */
  get totalItems(): number {
    return this.props.items.length;
  }

  /**
   * Get total quantity
   */
  get totalQuantity(): number {
    return this.props.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
