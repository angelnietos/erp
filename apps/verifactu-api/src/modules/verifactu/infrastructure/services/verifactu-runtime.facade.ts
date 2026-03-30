import { Injectable, NotFoundException } from '@nestjs/common';
import {
  SubmitVerifactuInvoiceDto,
  VerifactuQrService,
  VerifactuService,
} from '@josanz-erp/verifactu-core';
import { VerifactuPrismaService, VerifactuQueueService } from '@josanz-erp/verifactu-adapters';
import { CreateCustomerDto } from '../../application/dtos/create-customer.dto';
import { CreateSeriesDto } from '../../application/dtos/create-series.dto';
import { CreateWebhookEndpointDto } from '../../application/dtos/create-webhook-endpoint.dto';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Matches mock rows in libs/billing InvoiceService (dev UX when DB has no inv-00x). */
const BILLING_MOCK_INVOICES: Record<
  string,
  {
    id: string;
    invoiceId: string;
    series: string;
    number: number;
    issueDate: string;
    customerNif: string;
    customerName: string;
    subtotal: number;
    taxAmount: number;
    total: number;
    status: string;
    verifactuStatus: string;
    createdAt: string;
    aeatReference?: string;
    hashChain?: { currentHash: string; previousHash?: string };
  }
> = {
  'inv-001': {
    id: 'mock-verifactu-inv-001',
    invoiceId: 'inv-001',
    series: 'F/2026',
    number: 1,
    issueDate: '2026-03-20',
    customerNif: 'B12345678',
    customerName: 'Producciones Audiovisuales Madrid',
    subtotal: round2(4500 / 1.21),
    taxAmount: round2(4500 - 4500 / 1.21),
    total: 4500,
    status: 'paid',
    verifactuStatus: 'SENT',
    createdAt: '2026-03-20T00:00:00.000Z',
    aeatReference: 'MOCK-AEAT-001',
    hashChain: { currentHash: 'mock-hash-inv-001' },
  },
  'inv-002': {
    id: 'mock-verifactu-inv-002',
    invoiceId: 'inv-002',
    series: 'F/2026',
    number: 2,
    issueDate: '2026-03-22',
    customerNif: 'B23456789',
    customerName: 'Cadena TV España',
    subtotal: round2(8750 / 1.21),
    taxAmount: round2(8750 - 8750 / 1.21),
    total: 8750,
    status: 'pending',
    verifactuStatus: 'SENT',
    createdAt: '2026-03-22T00:00:00.000Z',
    aeatReference: 'MOCK-AEAT-002',
    hashChain: { currentHash: 'mock-hash-inv-002', previousHash: 'mock-hash-inv-001' },
  },
  'inv-003': {
    id: 'mock-verifactu-inv-003',
    invoiceId: 'inv-003',
    series: 'F/2026',
    number: 3,
    issueDate: '2026-03-18',
    customerNif: 'B34567890',
    customerName: 'Film Studios Barcelona',
    subtotal: round2(3200 / 1.21),
    taxAmount: round2(3200 - 3200 / 1.21),
    total: 3200,
    status: 'sent',
    verifactuStatus: 'PENDING',
    createdAt: '2026-03-18T00:00:00.000Z',
    hashChain: { currentHash: 'mock-hash-inv-003' },
  },
};

@Injectable()
export class VerifactuRuntimeFacade {
  constructor(
    private readonly verifactuService: VerifactuService,
    private readonly queueService: VerifactuQueueService,
    private readonly prisma: VerifactuPrismaService,
    private readonly qrService: VerifactuQrService,
  ) {}

  submitInvoice(dto: SubmitVerifactuInvoiceDto) {
    return this.verifactuService.submitInvoice(dto);
  }

  enqueueInvoice(invoiceId: string, tenantId: string) {
    return this.queueService.enqueue(invoiceId, tenantId);
  }

  processQueue(limit?: number) {
    return this.queueService.processPending(limit ?? 20);
  }

  listWebhookEndpoints(tenantId: string) {
    return this.prisma.verifactuWebhookEndpoint.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  createWebhookEndpoint(dto: CreateWebhookEndpointDto) {
    return this.prisma.verifactuWebhookEndpoint.create({
      data: {
        tenantId: dto.tenantId,
        eventType: dto.eventType,
        url: dto.url,
        secret: dto.secret,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async deleteWebhookEndpoint(endpointId: string) {
    await this.prisma.verifactuWebhookEndpoint.delete({ where: { id: endpointId } });
    return { deleted: true, endpointId };
  }

  listCustomers(tenantId: string) {
    return (
      this.prisma as unknown as {
        verifactuCustomer: {
          findMany(args: { where: { tenantId: string }; orderBy: { createdAt: 'desc' } }): Promise<unknown[]>;
        };
      }
    ).verifactuCustomer.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  createCustomer(dto: CreateCustomerDto) {
    return (
      this.prisma as unknown as {
        verifactuCustomer: {
          create(args: {
            data: {
              tenantId: string;
              taxId: string;
              name: string;
              email?: string;
              countryCode?: string;
            };
          }): Promise<unknown>;
        };
      }
    ).verifactuCustomer.create({
      data: {
        tenantId: dto.tenantId,
        taxId: dto.taxId,
        name: dto.name,
        email: dto.email,
        countryCode: dto.countryCode,
      },
    });
  }

  listSeries(tenantId: string) {
    return (
      this.prisma as unknown as {
        verifactuSeries: {
          findMany(args: { where: { tenantId: string }; orderBy: { createdAt: 'desc' } }): Promise<unknown[]>;
        };
      }
    ).verifactuSeries.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  createSeries(dto: CreateSeriesDto) {
    return (
      this.prisma as unknown as {
        verifactuSeries: {
          create(args: {
            data: { tenantId: string; code: string; description?: string };
          }): Promise<unknown>;
        };
      }
    ).verifactuSeries.create({
      data: {
        tenantId: dto.tenantId,
        code: dto.code,
        description: dto.description,
      },
    });
  }

  queryRecords(tenantId: string, status?: string, from?: string, to?: string) {
    return this.prisma.verifactuLog.findMany({
      where: {
        tenantId,
        ...(status ? { status } : {}),
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async complianceSummary(tenantId: string) {
    const [totalLogs, sentLogs, errorLogs, webhookSuccess, webhookFailed] = await Promise.all([
      this.prisma.verifactuLog.count({ where: { tenantId } }),
      this.prisma.verifactuLog.count({ where: { tenantId, status: 'SENT' } }),
      this.prisma.verifactuLog.count({ where: { tenantId, status: 'ERROR' } }),
      this.prisma.verifactuWebhookDelivery.count({ where: { tenantId, status: 'SUCCESS' } }),
      this.prisma.verifactuWebhookDelivery.count({ where: { tenantId, status: 'FAILED' } }),
    ]);

    return {
      tenantId,
      verifactu: {
        totalLogs,
        sentLogs,
        errorLogs,
        successRate: totalLogs > 0 ? Number(((sentLogs / totalLogs) * 100).toFixed(2)) : 0,
      },
      webhooks: {
        success: webhookSuccess,
        failed: webhookFailed,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  private qrEnvironment(): 'test' | 'production' {
    return process.env.VERIFACTU_MODE === 'real' ? 'production' : 'test';
  }

  private invoiceNumberForQr(series: string, number: number): string {
    return `${series}/${String(number).padStart(4, '0')}`;
  }

  async getInvoiceDetail(invoiceId: string) {
    const mock = BILLING_MOCK_INVOICES[invoiceId];
    if (mock) {
      return { ...mock };
    }

    if (!UUID_RE.test(invoiceId)) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    const row = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        budget: { include: { client: true } },
        verifactuLogs: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!row) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    const subtotal = round2(row.total / 1.21);
    const taxAmount = round2(row.total - subtotal);
    const log = row.verifactuLogs[0];
    let aeatReference: string | undefined;
    const payload = log?.responsePayload;
    if (payload && typeof payload === 'object' && payload !== null && 'aeatReference' in payload) {
      const v = (payload as { aeatReference?: unknown }).aeatReference;
      if (typeof v === 'string') aeatReference = v;
    }

    return {
      id: log?.id ?? row.id,
      invoiceId: row.id,
      series: '—',
      number: 0,
      issueDate: row.createdAt.toISOString().slice(0, 10),
      customerNif: '',
      customerName: row.budget.client.name,
      subtotal,
      taxAmount,
      total: row.total,
      status: 'stored',
      verifactuStatus: row.verifactuStatus,
      createdAt: row.createdAt.toISOString(),
      aeatReference,
      hashChain:
        row.currentHash != null && row.currentHash !== ''
          ? { currentHash: row.currentHash, previousHash: row.previousHash ?? undefined }
          : undefined,
    };
  }

  async getInvoiceQr(invoiceId: string): Promise<{ qrCode: string }> {
    const detail = await this.getInvoiceDetail(invoiceId);
    const invoiceNumber =
      detail.number > 0
        ? this.invoiceNumberForQr(detail.series, detail.number)
        : `ERP-${detail.invoiceId.replace(/[^a-z0-9-]/gi, '').slice(0, 12)}`;
    const base64 = await this.qrService.generateQrBase64({
      nif: detail.customerNif || 'B00000000',
      invoiceNumber,
      invoiceDate: detail.issueDate,
      totalAmount: detail.total,
      environment: this.qrEnvironment(),
    });
    return { qrCode: `data:image/png;base64,${base64}` };
  }
}

