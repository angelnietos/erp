import { EntityId } from '@josanz-erp/shared-model';

export type VerifactuRecordStatus = 'ACCEPTED' | 'REJECTED';

export interface VerifactuRecordProps {
  invoiceId: EntityId;
  tenantId: string;
  status: VerifactuRecordStatus;
  currentHash: string;
  previousHash?: string;
  submittedAt: Date;
}

export class VerifactuRecord {
  readonly id: EntityId;
  private props: VerifactuRecordProps;

  private constructor(id: EntityId, props: VerifactuRecordProps) {
    this.id = id;
    this.props = props;
  }

  static create(props: VerifactuRecordProps): VerifactuRecord {
    return new VerifactuRecord(new EntityId(), props);
  }

  get invoiceId(): EntityId { return this.props.invoiceId; }
  get tenantId(): string { return this.props.tenantId; }
  get status(): VerifactuRecordStatus { return this.props.status; }
  get currentHash(): string { return this.props.currentHash; }
  get previousHash(): string | undefined { return this.props.previousHash; }
  get submittedAt(): Date { return this.props.submittedAt; }
}

