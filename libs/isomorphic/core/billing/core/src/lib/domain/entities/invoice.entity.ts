import { AggregateRoot, EntityId, DomainEvent } from '@josanz-erp/shared-model';

/**
 * Invoice Status
 */
export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'EMITTED' | 'PAID' | 'CANCELLED';

/**
 * Verifactu Status
 */
export type VerifactuStatus = 'PENDING' | 'SENT' | 'ERROR';

/**
 * Invoice Props
 */
export interface InvoiceProps {
  budgetId: EntityId;
  tenantId?: EntityId;
  total: number;
  status: InvoiceStatus;
  verifactuStatus: VerifactuStatus;
  currentHash?: string;
  previousHash?: string;
  createdAt: Date;
}

/**
 * Invoice Aggregate Root
 * Represents an invoice in the ERP billing domain
 */
export class Invoice extends AggregateRoot {
  readonly id: EntityId;
  private props: InvoiceProps;

  private constructor(id: EntityId, props: InvoiceProps) {
    super();
    this.id = id;
    this.props = props;
  }

  /**
   * Create a new invoice
   */
  static create(budgetId: EntityId, total: number, tenantId?: EntityId): Invoice {
    const id = new EntityId();
    return new Invoice(id, {
      budgetId,
      tenantId,
      total,
      status: 'PENDING',
      verifactuStatus: 'PENDING',
      createdAt: new Date(),
    });
  }

  /**
   * Reconstitute an existing invoice
   */
  static reconstitute(id: string, props: InvoiceProps): Invoice {
    return new Invoice(new EntityId(id), props);
  }

  /**
   * Emit the invoice
   */
  emit(): void {
    if (this.props.status !== 'PENDING') {
      throw new Error(`Invoice cannot be emitted in status: ${this.props.status}`);
    }
    this.props.status = 'EMITTED';
    this.addDomainEvent(this.buildEvent('InvoiceEmitted'));
  }

  /**
   * Mark as paid
   */
  markPaid(): void {
    if (this.props.status !== 'EMITTED') {
      throw new Error(`Invoice cannot be paid in status: ${this.props.status}`);
    }
    this.props.status = 'PAID';
    this.addDomainEvent(this.buildEvent('InvoicePaid'));
  }

  /**
   * Cancel the invoice
   */
  cancel(): void {
    if (this.props.status === 'PAID') {
      throw new Error('Cannot cancel a paid invoice');
    }
    this.props.status = 'CANCELLED';
    this.addDomainEvent(this.buildEvent('InvoiceCancelled'));
  }

  /**
   * Mark as sent to Verifactu
   */
  markVerifactuSent(currentHash: string, previousHash: string): void {
    this.props.verifactuStatus = 'SENT';
    this.props.currentHash = currentHash;
    this.props.previousHash = previousHash;
    this.addDomainEvent(this.buildEvent('InvoiceVerifactuSent'));
  }

  /**
   * Mark Verifactu as error
   */
  markVerifactuError(): void {
    this.props.verifactuStatus = 'ERROR';
  }

  /**
   * Check if insurance is about to expire (within 30 days)
   * Note: This method is kept for potential future use with related entities
   */
  private touch(): void {
    // Version tracking would go here if needed
  }

  // Getters
  get budgetId(): EntityId { return this.props.budgetId; }
  get tenantId(): EntityId | undefined { return this.props.tenantId; }
  get total(): number { return this.props.total; }
  get status(): InvoiceStatus { return this.props.status; }
  get verifactuStatus(): VerifactuStatus { return this.props.verifactuStatus; }
  get currentHash(): string | undefined { return this.props.currentHash; }
  get previousHash(): string | undefined { return this.props.previousHash; }
  get createdAt(): Date { return this.props.createdAt; }

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
