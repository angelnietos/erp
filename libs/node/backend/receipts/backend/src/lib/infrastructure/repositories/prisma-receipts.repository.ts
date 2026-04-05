import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import {
  ReceiptsRepositoryPort,
  Receipt,
  PaymentStatus,
} from '@josanz-erp/receipts-core';
import { EntityId } from '@josanz-erp/shared-model';
import { TenantContext } from '@josanz-erp/shared-infrastructure';

@Injectable()
export class PrismaReceiptsRepository implements ReceiptsRepositoryPort {
  // Mock in-memory storage for now - TODO: implement Prisma receipt model
  private receipts: Receipt[] = [];

  constructor(
    private readonly cls: ClsService<TenantContext>,
  ) {
    // Initialize with mock data
    this.initializeMockData();
  }

  private getTenantId(): string {
    const tenantId = this.cls.get('tenantId');
    if (!tenantId) {
      throw new Error('Tenant ID is not set in the request context');
    }
    return tenantId;
  }

  private initializeMockData(): void {
    // Mock data for development
    const tenantId = new EntityId('mock-tenant-id');
    this.receipts = [
      Receipt.reconstitute('1', {
        tenantId,
        invoiceId: new EntityId('inv-001'),
        amount: 500.00,
        status: 'PENDING',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      }),
      Receipt.reconstitute('2', {
        tenantId,
        invoiceId: new EntityId('inv-002'),
        amount: 1200.50,
        status: 'PAID',
        paymentMethod: 'BANK_TRANSFER',
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        paymentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      }),
    ];
  }

  async findById(id: EntityId): Promise<Receipt | null> {
    return this.receipts.find(r => r.id.value === id.value) || null;
  }

  async findByInvoiceId(invoiceId: EntityId): Promise<Receipt[]> {
    return this.receipts.filter(r => r.invoiceId.value === invoiceId.value);
  }

  async findByTenantId(tenantId: EntityId, status?: PaymentStatus): Promise<Receipt[]> {
    return this.receipts.filter(r =>
      r.tenantId.value === tenantId.value &&
      (!status || r.status === status)
    );
  }

  async findActive(tenantId: EntityId, status?: PaymentStatus): Promise<Receipt[]> {
    return this.receipts.filter(r =>
      r.tenantId.value === tenantId.value &&
      r.status !== 'CANCELLED' &&
      (!status || r.status === status)
    );
  }

  async findOverdue(tenantId: EntityId): Promise<Receipt[]> {
    const now = new Date();
    return this.receipts.filter(r =>
      r.tenantId.value === tenantId.value &&
      r.status === 'PENDING' &&
      r.dueDate < now
    );
  }

  async findDueSoon(tenantId: EntityId, days: number): Promise<Receipt[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return this.receipts.filter(r =>
      r.tenantId.value === tenantId.value &&
      r.status === 'PENDING' &&
      r.dueDate >= now &&
      r.dueDate <= futureDate
    );
  }

  async save(receipt: Receipt): Promise<void> {
    const existingIndex = this.receipts.findIndex(r => r.id.value === receipt.id.value);
    if (existingIndex >= 0) {
      this.receipts[existingIndex] = receipt;
    } else {
      this.receipts.push(receipt);
    }
  }

  async delete(id: EntityId): Promise<void> {
    this.receipts = this.receipts.filter(r => r.id.value !== id.value);
  }
}
