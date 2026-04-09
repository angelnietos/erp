import { AggregateRoot, EntityId, DomainEvent } from '@josanz-erp/shared-model';

export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'EMITTED' | 'PAID' | 'CANCELLED';
export type VerifactuStatus = 'PENDING' | 'SENT' | 'ERROR';

export interface InvoiceProps {
  budgetId: EntityId;
  total: number;
  status: InvoiceStatus;
  verifactuStatus: VerifactuStatus;
  currentHash?: string;
  previousHash?: string;
  createdAt: Date;
}

/**
 * Invoice Aggregate Root (ADR — Billing / Verifactu)
 * Enforces that invoices originate strictly from accepted Delivery Notes (POD).
 */
export class Invoice extends AggregateRoot {
  readonly id: EntityId;
  private props: InvoiceProps;

  private constructor(id: EntityId, props: InvoiceProps) {
    super();
    this.id = id;
    this.props = props;
  }

  static create(budgetId: EntityId, total: number): Invoice {
    const id = new EntityId();
    return new Invoice(id, {
      budgetId,
      total,
      status: 'PENDING',
      verifactuStatus: 'PENDING',
      createdAt: new Date(),
    });
  }

  static reconstitute(id: string, props: InvoiceProps): Invoice {
    return new Invoice(new EntityId(id), props);
  }

  emit(): void {
    if (this.props.status !== 'PENDING') {
      throw new Error(`Invoice cannot be emitted in status: ${this.props.status}`);
    }
    this.props.status = 'EMITTED';
    this.addDomainEvent(this.buildEvent('InvoiceEmitted'));
  }

  markVerifactuSent(currentHash: string, previousHash: string): void {
    this.props.verifactuStatus = 'SENT';
    this.props.currentHash = currentHash;
    this.props.previousHash = previousHash;
    this.addDomainEvent(this.buildEvent('InvoiceVerifactuSent'));
  }

  markVerifactuError(): void {
    this.props.verifactuStatus = 'ERROR';
  }

  get status(): InvoiceStatus { return this.props.status; }
  get verifactuStatus(): VerifactuStatus { return this.props.verifactuStatus; }
  get total(): number { return this.props.total; }
  get budgetId(): EntityId { return this.props.budgetId; }

  private buildEvent(eventType: string): DomainEvent {
    return {
      aggregateType: 'Invoice',
      aggregateId: this.id.value,
      eventType,
      payload: {
        total: this.props.total,
        status: this.props.status,
        verifactuStatus: this.props.verifactuStatus,
      },
      occurredAt: new Date(),
    };
  }
}


