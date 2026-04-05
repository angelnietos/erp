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

  async getReceiptsList(tenantId: string, status?: string): Promise<any[]> {
    // Mock data for now - TODO: implement Prisma receipt model
    const mockReceipts = [
      {
        id: '1',
        invoiceId: '001',
        amount: 500.00,
        status: 'PENDING',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString().split('T')[0],
      },
      {
        id: '2',
        invoiceId: '002',
        amount: 1200.50,
        status: 'PAID',
        paymentMethod: 'BANK_TRANSFER',
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    ];

    return mockReceipts.filter(r => !status || r.status === status);
  }
}
