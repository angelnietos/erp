import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  RECEIPTS_REPOSITORY,
  ReceiptsRepositoryPort,
  Receipt,
} from '@josanz-erp/receipts-core';
import { PaymentMethod } from '@josanz-erp/receipts-api';
import { EntityId } from '@josanz-erp/shared-model';
import { CreateReceiptDto, UpdateReceiptDto } from '../dtos/create-receipt.dto';
import {
  OutboxService,
  PrismaService,
} from '@josanz-erp/shared-infrastructure';

@Injectable()
export class ReceiptsService {
  constructor(
    @Inject(RECEIPTS_REPOSITORY)
    private readonly receiptsRepository: ReceiptsRepositoryPort,
    private readonly outboxService: OutboxService,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateReceiptDto): Promise<Receipt> {
    const receipt = Receipt.create({
      tenantId: new EntityId(dto.tenantId),
      invoiceId: new EntityId(dto.invoiceId),
      amount: dto.amount,
      dueDate: new Date(dto.dueDate),
      paymentMethod: dto.paymentMethod as PaymentMethod,
      notes: dto.notes,
    });

    await this.prisma.$transaction(async (tx) => {
      await this.receiptsRepository.save(receipt);
      await this.outboxService.saveEvents(receipt.pullEvents(), tx);
    });

    return receipt;
  }

  async findById(id: string): Promise<Receipt | null> {
    return await this.receiptsRepository.findById(new EntityId(id));
  }

  async findAll(tenantId: string, status?: string): Promise<Receipt[]> {
    return await this.receiptsRepository.findByTenantId(new EntityId(tenantId), status as any);
  }

  async findActive(tenantId: string): Promise<Receipt[]> {
    return await this.receiptsRepository.findByTenantId(new EntityId(tenantId), 'PENDING');
  }

  async update(id: string, dto: UpdateReceiptDto): Promise<Receipt> {
    const receipt = await this.receiptsRepository.findById(new EntityId(id));
    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    if (dto.amount !== undefined) {
      receipt.updateAmount(dto.amount);
    }

    if (dto.status !== undefined) {
      if (dto.status === 'PAID' && dto.paymentMethod && dto.paymentDate) {
        receipt.markAsPaid(dto.paymentMethod as PaymentMethod, new Date(dto.paymentDate));
      } else if (dto.status === 'OVERDUE') {
        receipt.markAsOverdue();
      } else if (dto.status === 'CANCELLED') {
        receipt.cancel();
      }
    }

    if (dto.notes !== undefined) {
      receipt.updateNotes(dto.notes);
    }

    await this.prisma.$transaction(async (tx) => {
      await this.receiptsRepository.save(receipt);
      await this.outboxService.saveEvents(receipt.pullEvents(), tx);
    });

    return receipt;
  }

  async markAsPaid(id: string, paymentMethod: string, paymentDate?: Date): Promise<Receipt> {
    const receipt = await this.receiptsRepository.findById(new EntityId(id));
    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    if (receipt.status === 'PAID') {
      return receipt;
    }

    receipt.markAsPaid(paymentMethod as any, paymentDate);
    await this.prisma.$transaction(async (tx) => {
      await this.receiptsRepository.save(receipt);
      await this.outboxService.saveEvents(receipt.pullEvents(), tx);
    });

    return receipt;
  }

  async delete(id: string): Promise<void> {
    await this.receiptsRepository.delete(new EntityId(id));
  }

  async getReceiptsList(tenantId: string, status?: string): Promise<unknown[]> {
    if (!tenantId) {
      return [];
    }
    const list = await this.findAll(tenantId, status);
    return list.map((receipt) => ({
      id: receipt.id.value,
      invoiceId: receipt.invoiceId.value,
      amount: receipt.amount,
      currency: receipt.currency,
      status: receipt.status,
      dueDate: receipt.dueDate.toISOString().split('T')[0],
      paymentDate: receipt.paymentDate?.toISOString().split('T')[0],
      paymentMethod: receipt.paymentMethod,
      createdAt: receipt.createdAt.toISOString().split('T')[0],
    }));
  }
}
