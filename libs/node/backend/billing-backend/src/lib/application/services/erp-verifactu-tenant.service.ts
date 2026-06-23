import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import { VerifactuQrService } from '@josanz-erp/verifactu-core';

export interface ErpVerifactuOverviewDto {
  queuePending: number;
  queueCompleted: number;
  queueFailed: number;
  invoicesSent: number;
  invoicesPending: number;
  invoicesError: number;
  serviceOperational: boolean;
  lastActivityAt: string | null;
}

export interface ErpVerifactuFiscalDto {
  invoiceId: string;
  invoiceNumber: string;
  verifactuStatus: 'pending' | 'sent' | 'error';
  aeatReference: string | null;
  currentHash: string | null;
  previousHash: string | null;
  qrCode: string | null;
  queueStatus: string | null;
  lastError: string | null;
  issueDate: string;
  total: number;
  customerNif: string;
}

@Injectable()
export class ErpVerifactuTenantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qrService: VerifactuQrService,
  ) {}

  async overview(tenantId: string): Promise<ErpVerifactuOverviewDto> {
    const [
      queuePending,
      queueCompleted,
      queueFailed,
      invoicesSent,
      invoicesPending,
      invoicesError,
      lastQueue,
      lastLog,
    ] = await Promise.all([
      this.prisma.verifactuQueueItem.count({
        where: {
          tenantId,
          status: { in: ['PENDING', 'RETRYING', 'PROCESSING'] },
        },
      }),
      this.prisma.verifactuQueueItem.count({
        where: { tenantId, status: { in: ['COMPLETED', 'DONE'] } },
      }),
      this.prisma.verifactuQueueItem.count({
        where: { tenantId, status: 'FAILED' },
      }),
      this.prisma.invoice.count({
        where: { tenantId, verifactuStatus: 'SENT' },
      }),
      this.prisma.invoice.count({
        where: { tenantId, verifactuStatus: 'PENDING' },
      }),
      this.prisma.invoice.count({
        where: { tenantId, verifactuStatus: 'ERROR' },
      }),
      this.prisma.verifactuQueueItem.findFirst({
        where: { tenantId },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
      this.prisma.verifactuLog.findFirst({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    const activityDates = [lastQueue?.updatedAt, lastLog?.createdAt].filter(
      (d): d is Date => d instanceof Date,
    );
    const lastActivityAt =
      activityDates.sort((a, b) => b.getTime() - a.getTime())[0]?.toISOString() ??
      null;

    return {
      queuePending,
      queueCompleted,
      queueFailed,
      invoicesSent,
      invoicesPending,
      invoicesError,
      serviceOperational: true,
      lastActivityAt,
    };
  }

  async fiscalDetail(
    tenantId: string,
    invoiceId: string,
  ): Promise<ErpVerifactuFiscalDto> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: {
        budget: { include: { client: true } },
        queueItems: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }

    const latestLog = await this.prisma.verifactuLog.findFirst({
      where: { tenantId, invoiceId },
      orderBy: { createdAt: 'desc' },
    });

    const responsePayload = latestLog?.responsePayload as
      | { aeatReference?: string; reference?: string; ack?: { aeat?: { idRegistro?: string } } }
      | undefined;

    const aeatReference =
      responsePayload?.aeatReference ??
      responsePayload?.reference ??
      responsePayload?.ack?.aeat?.idRegistro ??
      null;

    const verifactuStatus = invoice.verifactuStatus.toLowerCase() as
      | 'pending'
      | 'sent'
      | 'error';

    const customerNif =
      invoice.budget?.client?.taxId?.trim() ||
      process.env.VERIFACTU_SELLER_NIF?.trim() ||
      'B00000000';

    const sellerNif =
      process.env.VERIFACTU_SELLER_NIF?.trim() || customerNif;

    let qrCode: string | null = null;
    if (verifactuStatus === 'sent') {
      const base64 = await this.qrService.generateQrBase64({
        nif: sellerNif,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.issueDate.toISOString().split('T')[0],
        totalAmount: invoice.total,
        environment:
          (process.env.VERIFACTU_QR_ENV ?? 'test') === 'production'
            ? 'production'
            : 'test',
      });
      qrCode = `data:image/png;base64,${base64}`;
    }

    const queueItem = invoice.queueItems[0];

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      verifactuStatus,
      aeatReference,
      currentHash: invoice.currentHash,
      previousHash: invoice.previousHash,
      qrCode,
      queueStatus: queueItem?.status ?? null,
      lastError: queueItem?.lastError ?? latestLog?.errorMessage ?? null,
      issueDate: invoice.issueDate.toISOString().split('T')[0],
      total: invoice.total,
      customerNif,
    };
  }
}
