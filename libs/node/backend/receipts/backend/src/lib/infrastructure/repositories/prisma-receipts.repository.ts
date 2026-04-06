import { Injectable } from '@nestjs/common';
import { ReceiptsRepositoryPort, Receipt } from '@josanz-erp/receipts-core';
import { PaymentMethod, PaymentStatus } from '@josanz-erp/receipts-api';
import { EntityId } from '@josanz-erp/shared-model';
import { PrismaService } from '@josanz-erp/shared-infrastructure';

/** Alineado con el modelo Prisma `ErpReceipt` (tabla `erp_receipts`). */
interface ErpReceiptRow {
  id: string;
  tenantId: string;
  invoiceId: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  paymentDate: Date | null;
  dueDate: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Subconjunto del delegado Prisma `erpReceipt` (evita desfase de tipos entre libs y generate). */
interface ErpReceiptDelegate {
  findFirst(args: object): Promise<ErpReceiptRow | null>;
  findMany(args: object): Promise<ErpReceiptRow[]>;
  upsert(args: object): Promise<ErpReceiptRow>;
  deleteMany(args: object): Promise<unknown>;
}

@Injectable()
export class PrismaReceiptsRepository implements ReceiptsRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private erp(): ErpReceiptDelegate {
    return (this.prisma as unknown as { erpReceipt: ErpReceiptDelegate })
      .erpReceipt;
  }

  private toEntity(row: ErpReceiptRow): Receipt {
    return Receipt.reconstitute(row.id, {
      tenantId: new EntityId(row.tenantId),
      invoiceId: new EntityId(row.invoiceId),
      amount: row.amount,
      status: row.status as PaymentStatus,
      paymentMethod: row.paymentMethod as PaymentMethod | undefined,
      paymentDate: row.paymentDate ?? undefined,
      dueDate: row.dueDate,
      notes: row.notes ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? undefined,
    });
  }

  async findById(id: EntityId): Promise<Receipt | null> {
    const row = await this.erp().findFirst({
      where: { id: id.value },
    });
    return row ? this.toEntity(row) : null;
  }

  async findByInvoiceId(invoiceId: EntityId): Promise<Receipt[]> {
    const rows = await this.erp().findMany({
      where: { invoiceId: invoiceId.value },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async findByTenantId(
    tenantId: EntityId,
    status?: PaymentStatus,
  ): Promise<Receipt[]> {
    const rows = await this.erp().findMany({
      where: {
        tenantId: tenantId.value,
        ...(status ? { status } : {}),
      },
      orderBy: { dueDate: 'asc' },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async findActive(
    tenantId: EntityId,
    status?: PaymentStatus,
  ): Promise<Receipt[]> {
    const rows = await this.erp().findMany({
      where: {
        tenantId: tenantId.value,
        status: { not: 'CANCELLED' },
        ...(status ? { status } : {}),
      },
      orderBy: { dueDate: 'asc' },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async findOverdue(tenantId: EntityId): Promise<Receipt[]> {
    const now = new Date();
    const rows = await this.erp().findMany({
      where: {
        tenantId: tenantId.value,
        status: 'PENDING',
        dueDate: { lt: now },
      },
      orderBy: { dueDate: 'asc' },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async findDueSoon(tenantId: EntityId, days: number): Promise<Receipt[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);
    const rows = await this.erp().findMany({
      where: {
        tenantId: tenantId.value,
        status: 'PENDING',
        dueDate: { gte: now, lte: future },
      },
      orderBy: { dueDate: 'asc' },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async save(receipt: Receipt): Promise<void> {
    const tid = receipt.tenantId.value;
    const data = {
      tenantId: tid,
      invoiceId: receipt.invoiceId.value,
      amount: receipt.amount,
      status: receipt.status,
      paymentMethod: receipt.paymentMethod ?? null,
      paymentDate: receipt.paymentDate ?? null,
      dueDate: receipt.dueDate,
      notes: receipt.notes ?? null,
    };
    await this.erp().upsert({
      where: { id: receipt.id.value },
      create: { id: receipt.id.value, ...data },
      update: { ...data },
    });
  }

  async delete(id: EntityId): Promise<void> {
    await this.erp().deleteMany({ where: { id: id.value } });
  }
}
