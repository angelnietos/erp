import { AggregateRoot, EntityId, DomainEvent } from '@josanz-erp/model-shared';

export type BudgetStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';

export interface BudgetProps {
  clientId: EntityId;
  total: number;
  status: BudgetStatus;
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

  static create(clientId: EntityId, idempotencyKey?: string): Budget {
    const id = new EntityId();
    const now = new Date();
    return new Budget(id, {
      clientId,
      total: 0,
      status: 'DRAFT',
      version: 1,
      idempotencyKey,
      createdAt: now,
    });
  }

  static reconstitute(id: string, props: BudgetProps): Budget {
    return new Budget(new EntityId(id), props);
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

