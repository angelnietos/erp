import { AggregateRoot, EntityId, DomainEvent } from '@josanz-erp/shared-model';

export type BudgetStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';

export interface BudgetItem {
  id: EntityId;
  productId: EntityId;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
}

export interface BudgetProps {
  clientId: EntityId;
  startDate: Date;
  endDate: Date;
  total: number;
  status: BudgetStatus;
  items: BudgetItem[];
  version: number;
  idempotencyKey?: string;
  createdAt: Date;
}

/**
 * Budget Aggregate Root â€” owns all commercial document lifecycle logic.
 */
export class Budget extends AggregateRoot {
  readonly id: EntityId;
  private props: BudgetProps;

  private constructor(id: EntityId, props: BudgetProps) {
    super();
    this.id = id;
    this.props = props;
  }

  static create(clientId: EntityId, startDate: Date, endDate: Date, idempotencyKey?: string): Budget {
    if (endDate < startDate) {
      throw new Error('Budget endDate must be greater than or equal to startDate');
    }

    const id = new EntityId();
    const now = new Date();
    return new Budget(id, {
      clientId,
      startDate,
      endDate,
      total: 0,
      status: 'DRAFT',
      items: [],
      version: 1,
      idempotencyKey,
      createdAt: now,
    });
  }

  static reconstitute(id: string, props: BudgetProps): Budget {
    return new Budget(new EntityId(id), props);
  }

  addItem(productId: EntityId, quantity: number, price: number, tax = 21, discount = 0): void {
    if (this.props.status !== 'DRAFT') {
      throw new Error('Can only add items to a DRAFT budget');
    }
    
    this.props.items.push({
      id: new EntityId(),
      productId,
      quantity,
      price,
      tax,
      discount
    });

    this.recalculateTotal();
  }

  private recalculateTotal(): void {
    this.props.total = this.props.items.reduce((acc, item) => {
      const lineTotal = (item.price * item.quantity) * (1 - item.discount / 100);
      return acc + (lineTotal * (1 + item.tax / 100));
    }, 0);
  }

  send(): void {
    if (this.props.status !== 'DRAFT') {
      throw new Error(`Cannot send a budget in status: ${this.props.status}`);
    }
    this.props.status = 'SENT';
    this.addDomainEvent(this.buildEvent('BudgetSent'));
  }

  accept(): void {
    if (this.props.status !== 'SENT') {
      throw new Error(`Cannot accept a budget in status: ${this.props.status}`);
    }
    this.props.status = 'ACCEPTED';
    this.addDomainEvent(this.buildEvent('BudgetAccepted'));
  }

  reject(): void {
    if (!['SENT', 'DRAFT'].includes(this.props.status)) {
      throw new Error(`Cannot reject a budget in status: ${this.props.status}`);
    }
    this.props.status = 'REJECTED';
    this.addDomainEvent(this.buildEvent('BudgetRejected'));
  }

  get status(): BudgetStatus { return this.props.status; }
  get clientId(): EntityId { return this.props.clientId; }
  get startDate(): Date { return this.props.startDate; }
  get endDate(): Date { return this.props.endDate; }
  get items(): BudgetItem[] { return [...this.props.items]; }
  get total(): number { return this.props.total; }
  get version(): number { return this.props.version; }

  private buildEvent(eventType: string): DomainEvent {
    return {
      aggregateType: 'Budget',
      aggregateId: this.id.value,
      eventType,
      payload: { status: this.props.status, clientId: this.props.clientId.value },
      occurredAt: new Date(),
    };
  }
}


