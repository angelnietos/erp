import { AggregateRoot, EntityId } from '@josanz-erp/shared-model';
import { PaymentStatus, PaymentMethod } from '@josanz-erp/receipts-api';

export interface ReceiptProps {
  tenantId: EntityId;
  invoiceId: EntityId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: Date;
  dueDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class Receipt extends AggregateRoot {
  readonly id: EntityId;
  private props: ReceiptProps;

  private constructor(id: EntityId, props: ReceiptProps) {
    super();
    this.id = id;
    this.props = props;
  }

  static create(props: Omit<ReceiptProps, 'createdAt' | 'status' | 'currency'> & { currency?: string }): Receipt {
    const id = new EntityId();
    return new Receipt(id, {
      ...props,
      currency: props.currency || 'EUR',
      status: 'PENDING',
      createdAt: new Date(),
    });
  }

  static reconstitute(id: string, props: ReceiptProps): Receipt {
    return new Receipt(new EntityId(id), props);
  }

  markAsPaid(paymentMethod: PaymentMethod, paymentDate?: Date): void {
    if (this.props.status !== 'PENDING') {
      throw new Error(
        `Cannot mark receipt as paid in status: ${this.props.status}`,
      );
    }
    this.props.status = 'PAID';
    this.props.paymentMethod = paymentMethod;
    this.props.paymentDate = paymentDate || new Date();
    this.props.updatedAt = new Date();
  }

  markAsOverdue(): void {
    if (this.props.status !== 'PENDING') {
      throw new Error(
        `Cannot mark receipt as overdue in status: ${this.props.status}`,
      );
    }
    this.props.status = 'OVERDUE';
    this.props.updatedAt = new Date();
  }

  cancel(): void {
    if (this.props.status === 'PAID') {
      throw new Error('Cannot cancel a paid receipt');
    }
    this.props.status = 'CANCELLED';
    this.props.updatedAt = new Date();
  }

  updateAmount(amount: number): void {
    if (this.props.status === 'PAID') {
      throw new Error('Cannot update amount of a paid receipt');
    }
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    this.props.amount = amount;
    this.props.updatedAt = new Date();
  }

  updateNotes(notes?: string): void {
    this.props.notes = notes;
    this.props.updatedAt = new Date();
  }

  get tenantId(): EntityId {
    return this.props.tenantId;
  }

  get invoiceId(): EntityId {
    return this.props.invoiceId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  get paymentMethod(): PaymentMethod | undefined {
    return this.props.paymentMethod;
  }

  get paymentDate(): Date | undefined {
    return this.props.paymentDate;
  }

  get dueDate(): Date {
    return this.props.dueDate;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get isOverdue(): boolean {
    return this.props.status === 'PENDING' && new Date() > this.props.dueDate;
  }

  get daysUntilDue(): number {
    const today = new Date();
    const diffTime = this.props.dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
