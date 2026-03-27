import { Injectable } from '@nestjs/common';
import { SubmitVerifactuInvoiceDto, VerifactuService } from '@josanz-erp/verifactu-core';
import { VerifactuPrismaService, VerifactuQueueService } from '@josanz-erp/verifactu-adapters';
import { CreateCustomerDto } from '../../application/dtos/create-customer.dto';
import { CreateSeriesDto } from '../../application/dtos/create-series.dto';
import { CreateWebhookEndpointDto } from '../../application/dtos/create-webhook-endpoint.dto';

@Injectable()
export class VerifactuRuntimeFacade {
  constructor(
    private readonly verifactuService: VerifactuService,
    private readonly queueService: VerifactuQueueService,
    private readonly prisma: VerifactuPrismaService,
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
    return (this.prisma as any).verifactuCustomer.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  createCustomer(dto: CreateCustomerDto) {
    return (this.prisma as any).verifactuCustomer.create({
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
    return (this.prisma as any).verifactuSeries.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  createSeries(dto: CreateSeriesDto) {
    return (this.prisma as any).verifactuSeries.create({
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
}

