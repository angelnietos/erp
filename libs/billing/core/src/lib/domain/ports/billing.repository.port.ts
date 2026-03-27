import { Invoice } from '../entities/invoice.entity';
import { EntityId } from '@josanz-erp/shared-model';

/**
 * Billing Repository Port
 * Defines the contract for invoice persistence
 */
export interface BillingRepositoryPort {
  // Invoice operations
  findInvoiceById(id: EntityId): Promise<Invoice | null>;
  findInvoiceByBudgetId(budgetId: EntityId): Promise<Invoice | null>;
  findInvoicesByStatus(status: string): Promise<Invoice[]>;
  findInvoicesByTenantId(tenantId: EntityId): Promise<Invoice[]>;
  findAllInvoices(): Promise<Invoice[]>;
  saveInvoice(invoice: Invoice): Promise<void>;
  deleteInvoice(id: EntityId): Promise<void>;
}

/**
 * Token for dependency injection
 */
export const BILLING_REPOSITORY = Symbol('BILLING_REPOSITORY');