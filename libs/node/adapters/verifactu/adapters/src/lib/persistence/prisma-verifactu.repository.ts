import { Injectable } from '@nestjs/common';
import {
  VerifactuInvoiceRepositoryPort,
  VerifactuInvoiceData,
  CreateChainBlockDto,
} from '@josanz-erp/verifactu-core';
import { VerifactuPrismaService } from '../services/verifactu-prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PrismaVerifactuRepository implements VerifactuInvoiceRepositoryPort {
  constructor(private readonly prisma: VerifactuPrismaService) {}

  async findInvoiceById(invoiceId: string): Promise<VerifactuInvoiceData | null> {
    const data = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        budgetId: true,
        total: true,
        currentHash: true,
        verifactuStatus: true,
        invoiceKind: true,
      },
    });
    return data ?? null;
  }

  async getLastAcceptedHash(): Promise<string | null> {
    const data = await this.prisma.invoice.findFirst({
      where: { verifactuStatus: 'SENT', currentHash: { not: null } },
      orderBy: { createdAt: 'desc' },
      select: { currentHash: true },
    });
    return data?.currentHash ?? null;
  }

  async markInvoiceAsSent(
    invoiceId: string,
    currentHash: string,
    previousHash?: string,
  ): Promise<void> {
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { verifactuStatus: 'SENT', currentHash, previousHash },
    });
  }

  async markInvoiceAsError(invoiceId: string): Promise<void> {
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { verifactuStatus: 'ERROR' },
    });
  }

  async markInvoiceAsCancelled(invoiceId: string): Promise<void> {
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { verifactuStatus: 'CANCELLED' },
    });
  }

  async createSubmissionLog(params: {
    invoiceId: string;
    tenantId: string;
    requestPayload: unknown;
    responsePayload: unknown;
    status: 'SENT' | 'ERROR';
    errorMessage?: string;
  }): Promise<void> {
    await this.prisma.verifactuLog.create({
      data: {
        invoiceId: params.invoiceId,
        tenantId: params.tenantId,
        requestPayload: params.requestPayload as object,
        responsePayload: params.responsePayload as object,
        status: params.status,
        errorMessage: params.errorMessage,
      },
    });
  }

  async createRectificativaInvoice(params: {
    originalInvoiceId: string;
    tenantId: string;
    rectificationType: 'S' | 'I';
    rectificationReason: string;
    total?: number;
  }): Promise<string> {
    const originalInvoice = await this.prisma.invoice.findUnique({
      where: { id: params.originalInvoiceId },
    });

    const newInvoice = await this.prisma.invoice.create({
      data: {
        tenantId: params.tenantId,
        budgetId: originalInvoice?.budgetId ?? '',
        total: params.total ?? originalInvoice?.total ?? 0,
        status: 'DRAFT',
        invoiceKind: 'RECTIFICATIVE',
        rectifiesInvoiceId: params.originalInvoiceId,
        rectificationType: params.rectificationType,
        rectificationReason: params.rectificationReason,
      },
    });

    return newInvoice.id;
  }

  async createChainBlock(params: CreateChainBlockDto): Promise<void> {
    const lastBlock = await this.prisma.verifactuChainBlock.findFirst({
      where: {
        tenantId: params.tenantId,
        environment: 'PRODUCTION', // TODO: get from invoice
      },
      orderBy: { blockIndex: 'desc' },
      select: { blockIndex: true },
    });

    const blockIndex = (lastBlock?.blockIndex ?? -1) + 1;

    await this.prisma.verifactuChainBlock.create({
      data: {
        tenantId: params.tenantId,
        environment: 'PRODUCTION', // TODO: parameterize
        blockIndex,
        invoiceId: params.invoiceId,
        invoiceTotal: params.invoiceTotal,
        previousHash: params.previousHash,
        currentHash: params.currentHash,
        aeatHuella: params.aeatHuella ?? params.currentHash,
        aeatIdRegistro: params.aeatIdRegistro ?? `REG-${uuidv4().slice(0, 8)}`,
        recordKind: params.recordKind,
      },
    });
  }
}

