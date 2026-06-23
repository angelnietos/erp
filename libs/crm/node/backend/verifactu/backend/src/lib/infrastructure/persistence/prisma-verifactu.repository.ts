import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  VerifactuCredentialEnvironment,
} from '@generic-crm/prisma-client';
import { PrismaService } from '@generic-crm/shared-infrastructure';
import type {
  ClaimedVerifactuJob,
  VerifactuLogRow,
  VerifactuQueueRow,
  VerifactuRepositoryPort,
  VerifactuSeriesRow,
  VerifactuSubmissionResult,
} from '@generic-crm/verifactu-core';
import { extractAeatChainHead } from '../aeat/verifactu-aeat-chain-extract';

@Injectable()
export class PrismaVerifactuRepository implements VerifactuRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async listQueue(tenantId: string): Promise<VerifactuQueueRow[]> {
    const rows = await this.prisma.verifactuQueueItem.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        invoice: { select: { id: true, number: true, status: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      invoiceId: r.invoiceId,
      status: r.status,
      retries: r.retries,
      maxRetries: r.maxRetries,
      nextRetryAt: r.nextRetryAt,
      lastError: r.lastError,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      invoice: {
        id: r.invoice.id,
        number: r.invoice.number,
        status: r.invoice.status,
      },
    }));
  }

  async enqueuePendingInvoice(
    tenantId: string,
    invoiceId: string,
  ): Promise<{ id: string }> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
    });
    if (!invoice) {
      throw new NotFoundException('Factura no encontrada en el tenant');
    }
    const existing = await this.prisma.verifactuQueueItem.findFirst({
      where: {
        tenantId,
        invoiceId,
        status: { in: ['PENDING', 'PROCESSING'] },
      },
    });
    if (existing) {
      throw new BadRequestException(
        'La factura ya está en cola o en proceso Verifactu',
      );
    }
    const created = await this.prisma.verifactuQueueItem.create({
      data: {
        tenantId,
        invoiceId,
        status: 'PENDING',
      },
    });
    return { id: created.id };
  }

  async trackErpForwardedQueueItem(
    tenantId: string,
    invoiceId: string,
    erpQueueItemId: string,
  ): Promise<{ id: string }> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
    });
    if (!invoice) {
      throw new NotFoundException('Factura no encontrada en el tenant');
    }

    const existing = await this.prisma.verifactuQueueItem.findFirst({
      where: {
        tenantId,
        invoiceId,
        status: { in: ['FORWARDED', 'PENDING', 'PROCESSING'] },
      },
    });
    if (existing) {
      await this.prisma.verifactuQueueItem.update({
        where: { id: existing.id },
        data: {
          status: 'FORWARDED',
          lastError: `erpQueueItemId:${erpQueueItemId}`,
        },
      });
      return { id: existing.id };
    }

    const created = await this.prisma.verifactuQueueItem.create({
      data: {
        tenantId,
        invoiceId,
        status: 'FORWARDED',
        lastError: `erpQueueItemId:${erpQueueItemId}`,
      },
    });
    return { id: created.id };
  }

  async applyErpQueueStatus(
    tenantId: string,
    invoiceId: string,
    input: { status: 'COMPLETED' | 'FAILED'; lastError?: string | null },
  ): Promise<void> {
    const row = await this.prisma.verifactuQueueItem.findFirst({
      where: { tenantId, invoiceId },
      orderBy: { createdAt: 'desc' },
    });
    if (!row) {
      return;
    }
    await this.prisma.verifactuQueueItem.update({
      where: { id: row.id },
      data: {
        status: input.status,
        lastError:
          input.status === 'FAILED'
            ? (input.lastError?.trim() || row.lastError)
            : null,
        updatedAt: new Date(),
      },
    });
  }

  async applyErpWebhookEvent(input: {
    eventType: 'invoice.sent' | 'invoice.error';
    tenantId: string;
    invoiceId: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    const isSuccess = input.eventType === 'invoice.sent';
    await this.applyErpQueueStatus(input.tenantId, input.invoiceId, {
      status: isSuccess ? 'COMPLETED' : 'FAILED',
      lastError:
        !isSuccess && typeof input.payload['error'] === 'string'
          ? input.payload['error']
          : undefined,
    });

    if (isSuccess) {
      await this.prisma.invoice.updateMany({
        where: { id: input.invoiceId, tenantId: input.tenantId },
        data: { status: 'ISSUED' },
      });
    }

    const invoice = await this.prisma.invoice.findFirst({
      where: { id: input.invoiceId, tenantId: input.tenantId },
    });
    if (!invoice) {
      return;
    }

    await this.prisma.verifactuLog.create({
      data: {
        invoiceId: input.invoiceId,
        tenantId: input.tenantId,
        requestPayload: {
          source: 'erp-webhook',
          eventType: input.eventType,
        },
        responsePayload: input.payload as Prisma.InputJsonValue,
        status: isSuccess ? 'SUCCESS' : 'ERROR',
        errorMessage:
          !isSuccess && typeof input.payload['error'] === 'string'
            ? input.payload['error']
            : null,
      },
    });
  }

  async listSeries(tenantId: string): Promise<VerifactuSeriesRow[]> {
    const rows = await this.prisma.verifactuSeries.findMany({
      where: { tenantId },
      orderBy: { code: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      code: r.code,
      description: r.description,
      isActive: r.isActive,
      createdAt: r.createdAt,
    }));
  }

  async createSeries(
    tenantId: string,
    input: { code: string; description?: string },
  ): Promise<VerifactuSeriesRow> {
    const code = input.code.trim();
    if (!code.length) {
      throw new BadRequestException('Código de serie obligatorio');
    }
    const row = await this.prisma.verifactuSeries.create({
      data: {
        tenantId,
        code,
        description: input.description?.trim() || null,
        isActive: true,
      },
    });
    return {
      id: row.id,
      tenantId: row.tenantId,
      code: row.code,
      description: row.description,
      isActive: row.isActive,
      createdAt: row.createdAt,
    };
  }

  async listLogs(
    tenantId: string,
    query?: { invoiceId?: string; limit?: number },
  ): Promise<VerifactuLogRow[]> {
    const take = Math.min(query?.limit ?? 100, 500);
    const rows = await this.prisma.verifactuLog.findMany({
      where: {
        tenantId,
        ...(query?.invoiceId ? { invoiceId: query.invoiceId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
    return rows.map((r) => ({
      id: r.id,
      invoiceId: r.invoiceId,
      tenantId: r.tenantId,
      requestPayload: r.requestPayload as unknown,
      responsePayload: r.responsePayload as unknown,
      status: r.status,
      errorMessage: r.errorMessage,
      createdAt: r.createdAt,
    }));
  }

  async claimNextForProcessing(): Promise<ClaimedVerifactuJob | null> {
    const now = new Date();
    const rows = await this.prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
      WITH cte AS (
        SELECT id FROM verifactu_queue_items
        WHERE status = 'PENDING'
          AND (next_retry_at IS NULL OR next_retry_at <= ${now})
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      UPDATE verifactu_queue_items q
      SET status = 'PROCESSING', updated_at = NOW()
      FROM cte
      WHERE q.id = cte.id
      RETURNING q.id
    `);
    const id = rows[0]?.id;
    if (!id) {
      return null;
    }
    const row = await this.prisma.verifactuQueueItem.findFirst({
      where: { id },
      include: {
        tenant: { select: { emitterTaxId: true } },
        invoice: {
          include: {
            client: { select: { taxId: true, name: true } },
          },
        },
      },
    });
    if (!row) {
      return null;
    }
    const previousRegistry = await this.loadAeatChainHeadForTenant(
      row.tenantId,
    );
    return {
      queueItemId: row.id,
      tenantId: row.tenantId,
      invoiceId: row.invoiceId,
      retries: row.retries,
      maxRetries: row.maxRetries,
      emitterTaxId: row.tenant.emitterTaxId?.trim() || null,
      previousRegistry,
      invoice: {
        id: row.invoice.id,
        number: row.invoice.number,
        total: row.invoice.total,
        currency: row.invoice.currency,
        status: row.invoice.status,
        issuedAt: row.invoice.issuedAt,
        client: row.invoice.client
          ? {
              taxId: row.invoice.client.taxId,
              name: row.invoice.client.name,
            }
          : null,
      },
    };
  }

  async completeWithSuccess(
    queueItemId: string,
    tenantId: string,
    log: { requestPayload: unknown; responsePayload: unknown },
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const item = await tx.verifactuQueueItem.findFirst({
        where: { id: queueItemId, tenantId },
      });
      if (!item) {
        throw new NotFoundException('Elemento de cola no encontrado');
      }
      await tx.verifactuLog.create({
        data: {
          invoiceId: item.invoiceId,
          tenantId,
          requestPayload: log.requestPayload as Prisma.InputJsonValue,
          responsePayload: log.responsePayload as Prisma.InputJsonValue,
          status: 'SUCCESS',
        },
      });
      await tx.verifactuQueueItem.update({
        where: { id: queueItemId },
        data: {
          status: 'COMPLETED',
          lastError: null,
        },
      });
    });
  }

  async completeWithFailure(
    queueItemId: string,
    tenantId: string,
    errorMessage: string,
    log: { requestPayload: unknown; responsePayload: unknown },
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const item = await tx.verifactuQueueItem.findFirst({
        where: { id: queueItemId, tenantId },
      });
      if (!item) {
        throw new NotFoundException('Elemento de cola no encontrado');
      }
      const nextRetries = item.retries + 1;
      const failed = nextRetries >= item.maxRetries;
      const backoffMs = Math.min(60_000 * 2 ** item.retries, 3_600_000);
      await tx.verifactuLog.create({
        data: {
          invoiceId: item.invoiceId,
          tenantId,
          requestPayload: log.requestPayload as Prisma.InputJsonValue,
          responsePayload: log.responsePayload as Prisma.InputJsonValue,
          status: 'ERROR',
          errorMessage,
        },
      });
      await tx.verifactuQueueItem.update({
        where: { id: queueItemId },
        data: failed
          ? {
              status: 'FAILED',
              retries: nextRetries,
              lastError: errorMessage,
              nextRetryAt: null,
            }
          : {
              status: 'PENDING',
              retries: nextRetries,
              lastError: errorMessage,
              nextRetryAt: new Date(Date.now() + backoffMs),
            },
      });
    });
  }

  async persistAeatChainHeadIfPresent(
    tenantId: string,
    result: VerifactuSubmissionResult,
  ): Promise<void> {
    const head = extractAeatChainHead(result);
    if (!head) {
      return;
    }
    const env = this.aeatChainEnvironment();
    await this.prisma.verifactuAeatChainHead.upsert({
      where: {
        tenantId_environment: {
          tenantId,
          environment: env,
        },
      },
      create: {
        tenantId,
        environment: env,
        lastHuella: head.huella,
        lastIdRegistro: head.idRegistro,
      },
      update: {
        lastHuella: head.huella,
        lastIdRegistro: head.idRegistro,
      },
    });
  }

  private aeatChainEnvironment(): VerifactuCredentialEnvironment {
    const prod =
      (process.env['AEAT_SUBMISSION_ENV'] || '').toLowerCase() === 'production';
    return prod
      ? VerifactuCredentialEnvironment.PRODUCTION
      : VerifactuCredentialEnvironment.TEST;
  }

  private async loadAeatChainHeadForTenant(
    tenantId: string,
  ): Promise<{ huella: string; idRegistro: string } | null> {
    const row = await this.prisma.verifactuAeatChainHead.findUnique({
      where: {
        tenantId_environment: {
          tenantId,
          environment: this.aeatChainEnvironment(),
        },
      },
    });
    if (!row) {
      return null;
    }
    return { huella: row.lastHuella, idRegistro: row.lastIdRegistro };
  }
}
