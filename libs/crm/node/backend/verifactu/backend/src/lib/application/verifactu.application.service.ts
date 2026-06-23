import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@generic-crm/shared-infrastructure';
import type { VerifactuRepositoryPort } from '@generic-crm/verifactu-core';
import { VERIFACTU_REPOSITORY } from '@generic-crm/verifactu-core';
import type { PatchVerifactuSettingsDto } from '../dto/patch-verifactu-settings.dto';
import type { UpsertVerifactuCredentialsDto } from '../dto/upsert-verifactu-credentials.dto';
import type { CreateRectificativaDto } from '../dto/create-rectificativa.dto';
import type { CancelVerifactuInvoiceDto } from '../dto/cancel-invoice.dto';
import {
  MOTIVO_ANULACION_LABELS,
  RECTIFICATION_TYPE_LABELS,
} from '../domain/verifactu-fiscal.constants';
import { isCredentialEncryptionConfigured } from '../infrastructure/credentials/verifactu-credential-crypto';
import { PrismaVerifactuCredentialRepository } from '../infrastructure/credentials/prisma-verifactu-credential.repository';
import { isErpWorkerMode } from '../config/verifactu-worker-mode';
import { ErpVerifactuQueueForwardClient } from '../infrastructure/http/erp-verifactu-queue-forward.client';
import {
  buildAeatQrValidationUrl,
  qrPngDataUrl,
} from '../infrastructure/qr/verifactu-qr-image.util';
import {
  buildVerifactuTimeline,
  extractAeatFieldsFromLog,
  resolveVerifactuInvoiceStatus,
} from './verifactu-invoice-detail.builder';

@Injectable()
export class VerifactuApplicationService {
  constructor(
    @Inject(VERIFACTU_REPOSITORY)
    private readonly verifactu: VerifactuRepositoryPort,
    private readonly aeatCredentials: PrismaVerifactuCredentialRepository,
    private readonly prisma: PrismaService,
    private readonly erpForward: ErpVerifactuQueueForwardClient,
  ) {}

  queueList(tenantId: string) {
    return this.verifactu.listQueue(tenantId);
  }

  async enqueue(tenantId: string, invoiceId: string) {
    if (isErpWorkerMode()) {
      if (!this.erpForward.isConfigured()) {
        throw new BadRequestException(
          'Modo worker ERP activo: configura ERP_API_URL y CRM_ERP_SYNC_API_KEY en verifactu-crm-api.',
        );
      }
      const erp = await this.erpForward.enqueue(tenantId, invoiceId);
      return this.verifactu.trackErpForwardedQueueItem(
        tenantId,
        invoiceId,
        erp.queueItemId,
      );
    }
    return this.verifactu.enqueuePendingInvoice(tenantId, invoiceId);
  }

  seriesList(tenantId: string) {
    return this.verifactu.listSeries(tenantId);
  }

  seriesCreate(
    tenantId: string,
    input: { code: string; description?: string },
  ) {
    return this.verifactu.createSeries(tenantId, input);
  }

  logsList(tenantId: string, query?: { invoiceId?: string; limit?: number }) {
    return this.verifactu.listLogs(tenantId, query);
  }

  chainList(tenantId: string, query?: { invoiceId?: string; limit?: number }) {
    return this.verifactu.listChainBlocks(tenantId, query);
  }

  chainVerify(tenantId: string) {
    return this.verifactu.verifyChainIntegrity(tenantId);
  }

  integrationSummary() {
    const submissionEnv =
      (process.env['AEAT_SUBMISSION_ENV'] || 'test').toLowerCase() ===
      'production'
        ? 'production'
        : 'test';
    return {
      modes: ['erp_worker', 'crm_monolith', 'standalone_verifactu_api'],
      credentials: {
        encryptionKeyConfigured: isCredentialEncryptionConfigured(),
        hint: 'Sube certificado (.pem) y clave privada por entorno (pruebas / producción) en Verifactu → Certificado AEAT. Requiere VERIFACTU_CREDENTIALS_ENCRYPTION_KEY en el servidor.',
      },
      aeat: {
        editorRole:
          'El envío conforme a AEAT lo implementa el editor de este software (adaptador en código).',
        submissionMode:
          process.env['AEAT_SUBMISSION_MODE'] ??
          'stub (por defecto; usar http cuando implementes el cliente AEAT)',
        submissionEnv,
        httpBaseUrl:
          process.env['AEAT_VERIFACTU_HTTP_BASE_URL']?.trim() || null,
        httpTimeoutMsDefault: 120_000,
        emitterNif:
          'Por tenant: GET/PATCH `verifactu/settings` (campo emitterTaxId) o columna BD; prioridad sobre AEAT_EMISOR_NIF.',
        chainPersistence:
          'Ledger append-only por tenant/entorno (`verifactu_chain_blocks`): cada envío exitoso añade un bloque con huella AEAT y encadenamiento SHA-256. Verificación en GET `verifactu/chain/verify`. La cabeza AEAT (`verifactu_aeat_chain_heads`) alimenta el siguiente envío.',
        optionalThirdParty:
          'Un proveedor homologado externo solo si externalizas parte del servicio; no es obligatorio para ser editor.',
      },
      description:
        'Encolado canónico en josanz_erp (VERIFACTU_USE_ERP_WORKER=true) y procesamiento con verifactu-worker. El CRM mantiene espejo de facturas/cola para la UI. Solo activa VERIFACTU_CRM_QUEUE_PROCESSOR_ENABLED=true para desarrollo CRM aislado.',
    };
  }

  async tenantSettings(tenantId: string) {
    const row = await this.prisma.tenant.findFirst({
      where: { id: tenantId },
      select: { emitterTaxId: true },
    });
    if (!row) {
      throw new NotFoundException('Tenant no encontrado');
    }
    return {
      emitterTaxId: row.emitterTaxId?.trim() || null,
    };
  }

  async patchTenantSettings(tenantId: string, dto: PatchVerifactuSettingsDto) {
    const raw = dto as Record<string, unknown>;
    if (!('emitterTaxId' in raw)) {
      throw new BadRequestException(
        'Incluye emitterTaxId (string, "" o null para borrar)',
      );
    }
    const normalized =
      dto.emitterTaxId === null || dto.emitterTaxId === undefined
        ? null
        : dto.emitterTaxId.trim().toUpperCase();
    const exists = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('Tenant no encontrado');
    }
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { emitterTaxId: normalized },
    });
    return { ok: true as const, emitterTaxId: normalized };
  }

  credentialsStatus(tenantId: string) {
    return this.aeatCredentials.listStatus(tenantId);
  }

  async credentialsUpsert(
    tenantId: string,
    dto: UpsertVerifactuCredentialsDto,
  ) {
    if (!isCredentialEncryptionConfigured()) {
      throw new BadRequestException(
        'Configura VERIFACTU_CREDENTIALS_ENCRYPTION_KEY en el servidor antes de guardar certificados.',
      );
    }
    const meta = await this.aeatCredentials.upsertPem(
      tenantId,
      dto.environment,
      dto.certificatePem,
      dto.privateKeyPem,
    );
    return {
      ok: true as const,
      environment: dto.environment,
      certSubject: meta.certSubject,
      certValidTo: meta.certValidTo?.toISOString() ?? null,
    };
  }

  async credentialsDelete(
    tenantId: string,
    environment: 'test' | 'production',
  ) {
    await this.aeatCredentials.deleteForTenant(tenantId, environment);
    return { ok: true as const };
  }

  async getInvoiceDetail(tenantId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: {
        client: true,
        rectifiesInvoice: { select: { id: true, number: true, issuedAt: true } },
        rectifications: {
          select: {
            id: true,
            number: true,
            total: true,
            status: true,
            rectificationType: true,
            issuedAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        verifactuQueue: { orderBy: { createdAt: 'asc' } },
        verifactuLogs: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada.');
    }

    const settings = await this.tenantSettings(tenantId);
    const submissionEnv =
      (process.env['AEAT_SUBMISSION_ENV'] || 'test').toLowerCase() ===
      'production'
        ? 'production'
        : 'test';

    const latestSuccessLog = [...invoice.verifactuLogs]
      .reverse()
      .find((l) => l.status === 'SUCCESS');
    const latestLog = invoice.verifactuLogs[invoice.verifactuLogs.length - 1];
    const aeatFields = extractAeatFieldsFromLog(
      latestSuccessLog ?? latestLog,
    );

    const latestQueue =
      invoice.verifactuQueue[invoice.verifactuQueue.length - 1] ?? null;
    const verifactuStatus = resolveVerifactuInvoiceStatus(
      invoice.verifactuQueue,
      invoice.verifactuLogs,
    );

    const emitterNif =
      settings.emitterTaxId?.trim() ||
      process.env['AEAT_EMISOR_NIF']?.trim() ||
      invoice.client?.taxId?.trim() ||
      'B00000000';

    let qrValidationUrl: string | null = null;
    let qrCode: string | null = null;

    if (
      verifactuStatus === 'sent' &&
      invoice.number?.trim() &&
      invoice.issuedAt
    ) {
      qrValidationUrl = buildAeatQrValidationUrl({
        nif: emitterNif,
        invoiceNumber: invoice.number.trim(),
        issueDate: invoice.issuedAt.toISOString(),
        totalAmount: invoice.total,
        environment: submissionEnv,
      });
      qrCode = await qrPngDataUrl(qrValidationUrl);
    }

    return {
      invoiceId: invoice.id,
      number: invoice.number,
      status: invoice.status,
      total: invoice.total,
      currency: invoice.currency,
      issuedAt: invoice.issuedAt?.toISOString() ?? null,
      customerName: invoice.client?.name ?? null,
      customerNif: invoice.client?.taxId ?? null,
      emitterNif,
      queueStatus: latestQueue?.status ?? null,
      queueRetries: latestQueue?.retries ?? null,
      queueMaxRetries: latestQueue?.maxRetries ?? null,
      lastError: latestQueue?.lastError ?? latestLog?.errorMessage ?? null,
      verifactuStatus,
      aeatReference: aeatFields.aeatReference,
      verificationCode: aeatFields.verificationCode,
      currentHash: aeatFields.currentHash,
      qrCode,
      qrValidationUrl,
      timeline: buildVerifactuTimeline(
        invoice.verifactuQueue,
        invoice.verifactuLogs,
      ),
      invoiceKind: invoice.invoiceKind,
      rectificationType: invoice.rectificationType,
      rectificationReason: invoice.rectificationReason,
      rectifiesInvoice: invoice.rectifiesInvoice
        ? {
            id: invoice.rectifiesInvoice.id,
            number: invoice.rectifiesInvoice.number,
            issuedAt: invoice.rectifiesInvoice.issuedAt?.toISOString() ?? null,
          }
        : null,
      rectifications: invoice.rectifications.map((r) => ({
        id: r.id,
        number: r.number,
        total: r.total,
        status: r.status,
        rectificationType: r.rectificationType,
        issuedAt: r.issuedAt?.toISOString() ?? null,
      })),
      rectificationTypeLabel: invoice.rectificationType
        ? (RECTIFICATION_TYPE_LABELS[invoice.rectificationType] ??
          invoice.rectificationType)
        : null,
      canRectify:
        verifactuStatus === 'sent' && invoice.invoiceKind !== 'RECTIFICATIVE',
      canCancel:
        verifactuStatus === 'sent' && invoice.status !== 'CANCELLED',
    };
  }

  async createRectificativa(
    tenantId: string,
    originalInvoiceId: string,
    dto: CreateRectificativaDto,
  ) {
    const original = await this.prisma.invoice.findFirst({
      where: { id: originalInvoiceId, tenantId },
      include: {
        verifactuQueue: true,
        verifactuLogs: true,
      },
    });
    if (!original) {
      throw new NotFoundException('Factura original no encontrada.');
    }
    if (original.invoiceKind === 'RECTIFICATIVE') {
      throw new BadRequestException(
        'No se puede rectificar directamente otra rectificativa.',
      );
    }

    const verifactuStatus = resolveVerifactuInvoiceStatus(
      original.verifactuQueue,
      original.verifactuLogs,
    );
    if (verifactuStatus !== 'sent') {
      throw new BadRequestException(
        'La factura original debe estar enviada correctamente a AEAT.',
      );
    }

    const baseNumber =
      original.number?.trim() || `FAC-${original.id.slice(0, 8)}`;
    const rectNumber =
      dto.number?.trim() || `R-${baseNumber.replace(/^R-/, '')}`;

    const rect = await this.prisma.invoice.create({
      data: {
        tenantId,
        clientId: original.clientId,
        number: rectNumber,
        total: dto.total ?? original.total,
        currency: original.currency,
        status: 'ISSUED',
        issuedAt: new Date(),
        invoiceKind: 'RECTIFICATIVE',
        rectifiesInvoiceId: original.id,
        rectificationType: dto.rectificationType,
        rectificationReason: dto.reason.trim(),
      },
    });

    const queued = await this.enqueue(tenantId, rect.id);
    return {
      ok: true as const,
      rectificativaInvoiceId: rect.id,
      number: rect.number,
      queueItemId: queued.id,
    };
  }

  async cancelInvoice(
    tenantId: string,
    invoiceId: string,
    dto: CancelVerifactuInvoiceDto,
  ) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: {
        verifactuQueue: true,
        verifactuLogs: true,
      },
    });
    if (!invoice) {
      throw new NotFoundException('Factura no encontrada.');
    }
    if (invoice.status === 'CANCELLED') {
      throw new BadRequestException('La factura ya está anulada.');
    }

    const verifactuStatus = resolveVerifactuInvoiceStatus(
      invoice.verifactuQueue,
      invoice.verifactuLogs,
    );
    if (verifactuStatus !== 'sent') {
      throw new BadRequestException(
        'Solo se pueden anular facturas ya enviadas a AEAT.',
      );
    }

    await this.verifactu.appendCancellationBlock(tenantId, invoiceId, {
      motivoAnulacion: dto.motivoAnulacion,
      additionalInfo: dto.additionalInfo?.trim() || null,
    });

    return {
      ok: true as const,
      motivoLabel:
        MOTIVO_ANULACION_LABELS[dto.motivoAnulacion] ?? dto.motivoAnulacion,
    };
  }
}
