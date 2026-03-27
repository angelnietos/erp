import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import {
  VerifactuInvoiceData,
  VerifactuInvoiceRepositoryPort,
} from '../../domain/ports/verifactu-invoice.repository.port';

@Injectable()
export class PrismaVerifactuRepository implements VerifactuInvoiceRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findInvoiceById(invoiceId: string): Promise<VerifactuInvoiceData | null> {
    const data = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        budgetId: true,
        total: true,
        currentHash: true,
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

  async markInvoiceAsSent(invoiceId: string, currentHash: string, previousHash?: string): Promise<void> {
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        verifactuStatus: 'SENT',
        currentHash,
        previousHash,
      },
    });
  }

  async markInvoiceAsError(invoiceId: string): Promise<void> {
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        verifactuStatus: 'ERROR',
      },
    });
  }

  async createSubmissionLog(params: {
    invoiceId: string;
    requestPayload: unknown;
    responsePayload: unknown;
    status: 'SENT' | 'ERROR';
    errorMessage?: string;
  }): Promise<void> {
    await this.prisma.verifactuLog.create({
      data: {
        invoiceId: params.invoiceId,
        requestPayload: params.requestPayload as object,
        responsePayload: params.responsePayload as object,
        status: params.status,
        errorMessage: params.errorMessage,
      },
    });
  }
}

