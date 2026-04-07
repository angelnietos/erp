import { Receipt } from '../entities/receipt.entity';
import { PaymentStatus } from '@josanz-erp/receipts-api';
import { EntityId } from '@josanz-erp/shared-model';

export interface ReceiptsRepositoryPort {
  findById(id: EntityId): Promise<Receipt | null>;
  findByInvoiceId(invoiceId: EntityId): Promise<Receipt[]>;
  findByTenantId(
    tenantId: EntityId,
    status?: PaymentStatus,
  ): Promise<Receipt[]>;
  findOverdue(tenantId: EntityId): Promise<Receipt[]>;
  findDueSoon(tenantId: EntityId, days: number): Promise<Receipt[]>;
  save(receipt: Receipt): Promise<void>;
  delete(id: EntityId): Promise<void>;
}

export const RECEIPTS_REPOSITORY = Symbol('RECEIPTS_REPOSITORY');
