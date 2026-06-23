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
import { isCredentialEncryptionConfigured } from '../infrastructure/credentials/verifactu-credential-crypto';
import { PrismaVerifactuCredentialRepository } from '../infrastructure/credentials/prisma-verifactu-credential.repository';
import { isErpWorkerMode } from '../config/verifactu-worker-mode';
import { ErpVerifactuQueueForwardClient } from '../infrastructure/http/erp-verifactu-queue-forward.client';

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
          'Encadenamiento: al reclamar la cola se carga la cabeza por tenant y entorno; el worker la persiste tras éxito. AEAT_ENCADENAMIENTO_* sigue como respaldo si no hay historial en BD.',
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
    const log = await this.prisma.verifactuLog.findFirst({
      where: { tenantId, invoiceId },
      orderBy: { createdAt: 'desc' },
      include: { 
        invoice: {
          include: { client: true }
        } 
      }
    });

    if (!log) {
      throw new NotFoundException('No se han encontrado registros de Verifactu para esta factura.');
    }

    const response = log.responsePayload as any;

    return {
      id: log.id,
      invoiceId: log.invoiceId,
      series: '',
      number: log.invoice.number,
      issueDate: log.invoice.issuedAt?.toISOString(),
      customerNif: log.invoice.client?.taxId || '',
      customerName: log.invoice.client?.name || '',
      subtotal: log.invoice.total,
      taxAmount: 0,
      total: log.invoice.total,
      status: log.invoice.status,
      verifactuStatus: log.status === 'SUCCESS' ? 'sent' : 'error',
      createdAt: log.createdAt.toISOString(),
      aeatReference: response?.ack?.aeat?.idRegistro || null,
      qrCode: response?.verificationCode || null,
      hashChain: {
        currentHash: response?.ack?.aeat?.huella || '',
      }
    };
  }
}
