import { Injectable } from '@nestjs/common';
import { VerifactuInvoiceRepositoryPort, VerifactuInvoiceData } from '../../../../core/src';
import { VerifactuPrismaService } from '../services/verifactu-prisma.service';

@Injectable()
export class PrismaVerifactuRepository implements VerifactuInvoiceRepositoryPort {
  constructor(private readonly prisma: VerifactuPrismaService) {}

  async findInvoiceById(invoiceId: string): Promise<VerifactuInvoiceData | null> {
    const data = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { id: true, budgetId: true, total: true, currentHash: true },
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
      data: { verifactuStatus: 'SENT', currentHash, previousHash },
    });
  }

  async markInvoiceAsError(invoiceId: string): Promise<void> {
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { verifactuStatus: 'ERROR' },
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
}

