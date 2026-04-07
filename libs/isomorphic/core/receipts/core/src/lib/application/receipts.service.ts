import { Inject, Injectable } from '@nestjs/common';
import { Receipt } from '../domain/entities/receipt.entity';
import {
  RECEIPTS_REPOSITORY,
  ReceiptsRepositoryPort,
} from '../domain/ports/receipts.repository.port';
import { PaymentStatus, PaymentMethod } from '@josanz-erp/receipts-api';
import { EntityId } from '@josanz-erp/shared-model';

export interface CreateReceiptDto {
  tenantId: string;
  invoiceId: string;
  amount: number;
  dueDate: Date;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface UpdateReceiptDto {
  amount?: number;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: Date;
  dueDate?: Date;
  notes?: string;
}

@Injectable()
export class ReceiptsService {
  constructor(
    @Inject(RECEIPTS_REPOSITORY)
    private readonly repository: ReceiptsRepositoryPort,
  ) {}

  async createReceipt(dto: CreateReceiptDto): Promise<Receipt> {
    const receipt = Receipt.create({
      tenantId: new EntityId(dto.tenantId),
      invoiceId: new EntityId(dto.invoiceId),
      amount: dto.amount,
      dueDate: dto.dueDate,
      paymentMethod: dto.paymentMethod,
      notes: dto.notes,
    });

    await this.repository.save(receipt);
    return receipt;
  }

  async getReceiptById(id: string): Promise<Receipt | null> {
    const receiptId = new EntityId(id);
    return this.repository.findById(receiptId);
  }

  async getReceiptsByInvoice(invoiceId: string): Promise<Receipt[]> {
    const invoiceEntityId = new EntityId(invoiceId);
    return this.repository.findByInvoiceId(invoiceEntityId);
  }

  async getReceipts(
    tenantId: string,
    status?: PaymentStatus,
  ): Promise<Receipt[]> {
    const tenantEntityId = new EntityId(tenantId);
    return this.repository.findByTenantId(tenantEntityId, status);
  }

  async getOverdueReceipts(tenantId: string): Promise<Receipt[]> {
    const tenantEntityId = new EntityId(tenantId);
    return this.repository.findOverdue(tenantEntityId);
  }

  async getReceiptsDueSoon(
    tenantId: string,
    days: number = 7,
  ): Promise<Receipt[]> {
    const tenantEntityId = new EntityId(tenantId);
    return this.repository.findDueSoon(tenantEntityId, days);
  }

  async updateReceipt(id: string, dto: UpdateReceiptDto): Promise<Receipt> {
    const receiptId = new EntityId(id);
    const receipt = await this.repository.findById(receiptId);

    if (!receipt) {
      throw new Error('Receipt not found');
    }

    if (dto.amount !== undefined) {
      receipt.updateAmount(dto.amount);
    }

    if (dto.status !== undefined) {
      if (dto.status === 'PAID' && dto.paymentMethod && dto.paymentDate) {
        receipt.markAsPaid(dto.paymentMethod, dto.paymentDate);
      } else if (dto.status === 'OVERDUE') {
        receipt.markAsOverdue();
      } else if (dto.status === 'CANCELLED') {
        receipt.cancel();
      }
    }

    if (dto.notes !== undefined) {
      receipt.updateNotes(dto.notes);
    }

    await this.repository.save(receipt);
    return receipt;
  }

  async markReceiptAsPaid(
    id: string,
    paymentMethod: PaymentMethod,
    paymentDate?: Date,
  ): Promise<Receipt> {
    const receiptId = new EntityId(id);
    const receipt = await this.repository.findById(receiptId);

    if (!receipt) {
      throw new Error('Receipt not found');
    }

    receipt.markAsPaid(paymentMethod, paymentDate);
    await this.repository.save(receipt);
    return receipt;
  }

  async deleteReceipt(id: string): Promise<void> {
    const receiptId = new EntityId(id);
    await this.repository.delete(receiptId);
  }

  async checkAndUpdateOverdueReceipts(tenantId: string): Promise<Receipt[]> {
    const overdueReceipts = await this.getOverdueReceipts(tenantId);

    for (const receipt of overdueReceipts) {
      if (receipt.status === 'PENDING') {
        receipt.markAsOverdue();
        await this.repository.save(receipt);
      }
    }

    return overdueReceipts;
  }
}
