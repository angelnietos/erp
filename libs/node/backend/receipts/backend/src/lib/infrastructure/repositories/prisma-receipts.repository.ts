import { Injectable } from '@nestjs/common';
import { ReceiptsRepositoryPort, Receipt } from '@josanz-erp/receipts-core';
import { PaymentStatus } from '@josanz-erp/receipts-api';
import { EntityId } from '@josanz-erp/shared-model';

/**
 * Repositorio en memoria multi-tenant (Fase 3).
 * Sustituible por tabla Prisma `Receipt` sin cambiar la API de aplicación.
 */
@Injectable()
export class PrismaReceiptsRepository implements ReceiptsRepositoryPort {
  private readonly receipts: Receipt[] = [];

  private ensureSeed(tenantId: EntityId): void {
    if (this.receipts.some((r) => r.tenantId.value === tenantId.value)) {
      return;
    }
    const t = tenantId.value;
    this.receipts.push(
      Receipt.reconstitute(`${t}:r1`, {
        tenantId,
        invoiceId: new EntityId('001'),
        amount: 500.0,
        status: 'PENDING',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      }),
      Receipt.reconstitute(`${t}:r2`, {
        tenantId,
        invoiceId: new EntityId('002'),
        amount: 1200.5,
        status: 'PAID',
        paymentMethod: 'BANK_TRANSFER',
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        paymentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      }),
      Receipt.reconstitute(`${t}:r3`, {
        tenantId,
        invoiceId: new EntityId('003'),
        amount: 750.25,
        status: 'OVERDUE',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      }),
      Receipt.reconstitute(`${t}:r4`, {
        tenantId,
        invoiceId: new EntityId('004'),
        amount: 300.0,
        status: 'CANCELLED',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      }),
    );
  }

  async findById(id: EntityId): Promise<Receipt | null> {
    return this.receipts.find((r) => r.id.value === id.value) ?? null;
  }

  async findByInvoiceId(invoiceId: EntityId): Promise<Receipt[]> {
    return this.receipts.filter((r) => r.invoiceId.value === invoiceId.value);
  }

  async findByTenantId(
    tenantId: EntityId,
    status?: PaymentStatus,
  ): Promise<Receipt[]> {
    this.ensureSeed(tenantId);
    return this.receipts.filter(
      (r) =>
        r.tenantId.value === tenantId.value &&
        (!status || r.status === status),
    );
  }

  async findActive(tenantId: EntityId, status?: PaymentStatus): Promise<Receipt[]> {
    this.ensureSeed(tenantId);
    return this.receipts.filter(
      (r) =>
        r.tenantId.value === tenantId.value &&
        r.status !== 'CANCELLED' &&
        (!status || r.status === status),
    );
  }

  async findOverdue(tenantId: EntityId): Promise<Receipt[]> {
    this.ensureSeed(tenantId);
    const now = new Date();
    return this.receipts.filter(
      (r) =>
        r.tenantId.value === tenantId.value &&
        r.status === 'PENDING' &&
        r.dueDate < now,
    );
  }

  async findDueSoon(tenantId: EntityId, days: number): Promise<Receipt[]> {
    this.ensureSeed(tenantId);
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    return this.receipts.filter(
      (r) =>
        r.tenantId.value === tenantId.value &&
        r.status === 'PENDING' &&
        r.dueDate >= now &&
        r.dueDate <= futureDate,
    );
  }

  async save(receipt: Receipt): Promise<void> {
    this.ensureSeed(receipt.tenantId);
    const i = this.receipts.findIndex((r) => r.id.value === receipt.id.value);
    if (i >= 0) {
      this.receipts[i] = receipt;
    } else {
      this.receipts.push(receipt);
    }
  }

  async delete(id: EntityId): Promise<void> {
    const i = this.receipts.findIndex((r) => r.id.value === id.value);
    if (i >= 0) {
      this.receipts.splice(i, 1);
    }
  }
}
