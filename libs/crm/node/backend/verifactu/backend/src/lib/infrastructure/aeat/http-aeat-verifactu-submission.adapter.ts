import { createHash } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  AeatFacturaAltaSolicitud,
  AeatFacturaAltaRespuesta,
  AeatSubmissionEnvironment,
  VerifactuAeatAuditSnapshot,
  VerifactuSubmissionPayload,
  VerifactuSubmissionPort,
  VerifactuSubmissionResult,
} from '@generic-crm/verifactu-core';
import {
  buildAeatFacturaAltaSolicitud,
  type AeatMapperContext,
} from '@generic-crm/verifactu-core';
import { VerifactuTenantTlsService } from '../credentials/verifactu-tenant-tls.service';
import { postJson } from './aeat-http-post';
import { sealAeatTransmission, type AeatSealMode } from './aeat-message-seal';

/**
 * Adaptador HTTP: mapea el payload CRM → {@link buildAeatFacturaAltaSolicitud},
 * envía JSON al endpoint configurado y mapea la respuesta a {@link VerifactuSubmissionResult}.
 *
 * - `AEAT_DRY_RUN=true`: no hace red; devuelve un resultado coherente para probar cola/logs.
 * - Sin dry-run: `POST` JSON; ajusta cabeceras/certificados según tu gateway real.
 */
@Injectable()
export class HttpAeatVerifactuSubmissionAdapter
  implements VerifactuSubmissionPort
{
  private readonly log = new Logger(HttpAeatVerifactuSubmissionAdapter.name);

  constructor(
    private readonly config: ConfigService,
    private readonly tenantTls: VerifactuTenantTlsService,
  ) {}

  async submit(
    payload: VerifactuSubmissionPayload,
  ): Promise<VerifactuSubmissionResult> {
    const baseUrl = this.str('AEAT_VERIFACTU_HTTP_BASE_URL');
    const dryRun = this.bool('AEAT_DRY_RUN');

    const emisorNif =
      payload.emitterTaxId?.trim() ||
      this.str('AEAT_EMISOR_NIF') ||
      (() => {
        throw new Error(
          'HttpAeatVerifactuSubmissionAdapter: define tenants.emitter_tax_id o AEAT_EMISOR_NIF (NIF del obligado emisor).',
        );
      })();

    const ctx = this.buildMapperContext(emisorNif);
    const solicitud = buildAeatFacturaAltaSolicitud(payload, ctx);
    const sealMode = this.sealMode();
    const sealed = sealAeatTransmission(solicitud, sealMode);
    const bodyToSend = sealed.body;

    if (dryRun) {
      const processedAt = new Date().toISOString();
      const dryId = `DRY-REG-${payload.invoiceId.replace(/-/g, '').slice(0, 12)}`;
      const dryHuella =
        sealed.huellaMensaje ||
        createHash('sha256').update(dryId, 'utf8').digest('hex');
      const aeatDry: VerifactuAeatAuditSnapshot = {
        csv: `DRY-CSV-${dryId}`,
        idRegistro: dryId,
        huella: dryHuella,
        ...(sealed.huellaMensaje
          ? { huellaMensajeEnviado: sealed.huellaMensaje }
          : {}),
      };
      const tls = await this.tenantTls.resolveForSubmit(payload.tenantId);
      return {
        verificationCode: `DRY-${payload.invoiceId.replace(/-/g, '').slice(0, 12)}`,
        ack: {
          environment: ctx.entorno === 'produccion' ? 'production' : 'test',
          processedAt,
          ...(Object.keys(aeatDry).length ? { aeat: aeatDry } : {}),
          audit: {
            dryRun: true,
            sealMode,
            solicitud,
            tls: tls
              ? { source: tls.source, hasClientCert: true }
              : { source: 'none', hasClientCert: false },
          },
        },
      };
    }

    if (!baseUrl.trim()) {
      throw new Error(
        'Modo AEAT HTTP (sin dry-run): define AEAT_VERIFACTU_HTTP_BASE_URL.',
      );
    }

    const path = this.str('AEAT_VERIFACTU_HTTP_PATH') || '/registro-factura';
    const url = new URL(
      path.replace(/^\//, ''),
      this.ensureTrailingSlash(baseUrl),
    );

    const tls = await this.tenantTls.resolveForSubmit(payload.tenantId);
    const certPath = this.str('AEAT_TLS_CLIENT_CERT_PATH');
    const keyPath = this.str('AEAT_TLS_CLIENT_KEY_PATH');
    const timeoutMs = this.httpTimeoutMs();

    let status: number;
    let text: string;
    try {
      const out = await postJson(url.toString(), bodyToSend, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...this.optionalHeader(
            'AEAT_HTTP_HEADER_AUTHORIZATION',
            'Authorization',
          ),
        },
        ...(tls
          ? {
              clientCertPem: tls.clientCertPem,
              clientKeyPem: tls.clientKeyPem,
            }
          : {
              clientCertPath: certPath || undefined,
              clientKeyPath: keyPath || undefined,
            }),
        tlsInsecure: this.bool('AEAT_TLS_INSECURE'),
        timeoutMs,
      });
      status = out.status;
      text = out.text;
    } catch (e) {
      const name = e instanceof Error ? e.name : '';
      const msg = e instanceof Error ? e.message : String(e);
      if (name === 'AbortError' || msg.includes('timeout')) {
        throw new Error(
          `AEAT HTTP: tiempo de espera agotado (${timeoutMs}ms). Ajusta AEAT_HTTP_TIMEOUT_MS.`,
        );
      }
      throw e;
    }
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Respuesta no JSON (${status}): ${text.slice(0, 500)}`);
    }

    if (status < 200 || status >= 300) {
      this.log.warn(`AEAT HTTP ${status}: ${text.slice(0, 500)}`);
      throw new Error(`AEAT HTTP ${status}: ${text.slice(0, 300)}`);
    }

    const parsed = json as AeatFacturaAltaRespuesta;
    return this.mapRespuesta(
      parsed,
      solicitud,
      ctx.entorno,
      sealed.huellaMensaje,
    );
  }

  private httpTimeoutMs(): number {
    const raw = this.str('AEAT_HTTP_TIMEOUT_MS');
    if (!raw) {
      return 120_000;
    }
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n >= 5_000 ? n : 120_000;
  }

  private sealMode(): AeatSealMode {
    const v = (
      this.str('AEAT_SEAL_MODE') || 'sha256-canonical-json'
    ).toLowerCase();
    if (v === 'none' || v === 'off' || v === 'false') {
      return 'none';
    }
    return 'sha256-canonical-json';
  }

  private buildMapperContext(emisorNif: string): AeatMapperContext {
    const prod =
      (this.str('AEAT_SUBMISSION_ENV') || '').toLowerCase() === 'production';
    const encHuella = this.str('AEAT_ENCADENAMIENTO_HUELLA');
    const encId = this.str('AEAT_ENCADENAMIENTO_ID_REGISTRO');
    return {
      emisorNif,
      versionEsquema: this.str('AEAT_SCHEMA_VERSION') || '1.0.0',
      entorno: prod ? 'produccion' : 'preproduccion',
      ...(encHuella && encId
        ? { encadenamiento: { huella: encHuella, idRegistro: encId } }
        : {}),
    };
  }

  private mapRespuesta(
    resp: AeatFacturaAltaRespuesta,
    solicitud: AeatFacturaAltaSolicitud,
    entorno: AeatMapperContext['entorno'],
    huellaMensajeEnviado?: string,
  ): VerifactuSubmissionResult {
    const lower = (resp.estado || '').toLowerCase();
    const rechazada =
      lower.includes('rechaz') || lower.includes('error') || !!resp.codigoError;
    if (rechazada) {
      throw new Error(
        `${resp.codigoError ?? 'RECHAZO'}: ${resp.descripcionError ?? resp.estado}`,
      );
    }

    const env: AeatSubmissionEnvironment =
      entorno === 'produccion' ? 'production' : 'test';

    const verificationCode =
      resp.csv?.trim() ||
      resp.idRegistro?.trim() ||
      resp.huella?.slice(0, 32) ||
      `OK-${solicitud.registro.numSerieFactura.replace(/\W/g, '').slice(0, 16)}`;

    const prevHuella =
      solicitud.registro.encadenamiento.registroAnterior?.huella;

    const aeat: VerifactuAeatAuditSnapshot = {
      ...(resp.csv?.trim() ? { csv: resp.csv.trim() } : {}),
      ...(resp.huella?.trim() ? { huella: resp.huella.trim() } : {}),
      ...(resp.idRegistro?.trim()
        ? { idRegistro: resp.idRegistro.trim() }
        : {}),
      ...(prevHuella ? { encadenamientoHuellaAnterior: prevHuella } : {}),
      ...(huellaMensajeEnviado
        ? { huellaMensajeEnviado: huellaMensajeEnviado }
        : {}),
    };

    return {
      verificationCode,
      ack: {
        environment: env,
        processedAt: new Date().toISOString(),
        aeat,
        audit: {
          estado: resp.estado,
          timestampPresentacion: resp.timestampPresentacion,
          solicitudMeta: solicitud.meta,
        },
      },
    };
  }

  private optionalHeader(
    envKey: string,
    headerName: string,
  ): Record<string, string> {
    const v = this.str(envKey);
    return v ? { [headerName]: v } : {};
  }

  private str(key: string): string {
    return (this.config.get<string>(key) ?? process.env[key] ?? '').trim();
  }

  private bool(key: string): boolean {
    const v = (this.config.get<string>(key) ?? process.env[key] ?? '')
      .trim()
      .toLowerCase();
    return v === '1' || v === 'true' || v === 'yes';
  }

  private ensureTrailingSlash(base: string): string {
    return base.endsWith('/') ? base : `${base}/`;
  }
}
