import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { verifactuPaths } from '@generic-crm/verifactu-api';
import {
  API_BASE_URL,
  joinApiUrl,
} from '@generic-crm/shared-browser-data-access';
import type { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VerifactuApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  queue(): Observable<VerifactuQueueItemDto[]> {
    return this.http.get<VerifactuQueueItemDto[]>(
      joinApiUrl(this.baseUrl, verifactuPaths.queue),
    );
  }

  enqueue(invoiceId: string): Observable<unknown> {
    return this.http.post<unknown>(
      joinApiUrl(this.baseUrl, verifactuPaths.queue),
      {
        invoiceId,
      },
    );
  }

  series(): Observable<VerifactuSeriesRowDto[]> {
    return this.http.get<VerifactuSeriesRowDto[]>(
      joinApiUrl(this.baseUrl, verifactuPaths.series),
    );
  }

  createSeries(body: {
    code: string;
    description?: string;
  }): Observable<unknown> {
    return this.http.post<unknown>(
      joinApiUrl(this.baseUrl, verifactuPaths.series),
      body,
    );
  }

  logs(invoiceId?: string, limit?: number): Observable<VerifactuLogRowDto[]> {
    const params: Record<string, string> = {};
    if (invoiceId) {
      params['invoiceId'] = invoiceId;
    }
    if (limit != null) {
      params['limit'] = String(limit);
    }
    return this.http.get<VerifactuLogRowDto[]>(
      joinApiUrl(this.baseUrl, verifactuPaths.logs),
      { params },
    );
  }

  integration(): Observable<VerifactuIntegrationSummaryDto> {
    return this.http.get<VerifactuIntegrationSummaryDto>(
      joinApiUrl(this.baseUrl, verifactuPaths.integration),
    );
  }

  tenantSettings(): Observable<{ emitterTaxId: string | null }> {
    return this.http.get<{ emitterTaxId: string | null }>(
      joinApiUrl(this.baseUrl, verifactuPaths.settings),
    );
  }

  patchTenantSettings(body: {
    emitterTaxId: string | null;
  }): Observable<{ ok: boolean; emitterTaxId: string | null }> {
    return this.http.patch<{ ok: boolean; emitterTaxId: string | null }>(
      joinApiUrl(this.baseUrl, verifactuPaths.settings),
      body,
    );
  }

  credentialsStatus(): Observable<VerifactuCredentialsStatusDto> {
    return this.http.get<VerifactuCredentialsStatusDto>(
      joinApiUrl(this.baseUrl, verifactuPaths.credentialsStatus),
    );
  }

  upsertCredentials(body: {
    environment: 'test' | 'production';
    certificatePem: string;
    privateKeyPem: string;
  }): Observable<{ ok: boolean }> {
    return this.http.put<{ ok: boolean }>(
      joinApiUrl(this.baseUrl, verifactuPaths.credentials),
      body,
    );
  }

  deleteCredentials(
    environment: 'test' | 'production',
  ): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(
      joinApiUrl(this.baseUrl, verifactuPaths.credentials),
      { params: { environment } },
    );
  }

  invoiceDetail(invoiceId: string): Observable<VerifactuInvoiceDetailDto> {
    return this.http.get<VerifactuInvoiceDetailDto>(
      joinApiUrl(this.baseUrl, verifactuPaths.invoiceDetail(invoiceId)),
    );
  }

  chainBlocks(
    invoiceId?: string,
    limit?: number,
  ): Observable<VerifactuChainBlockDto[]> {
    const params: Record<string, string> = {};
    if (invoiceId) {
      params['invoiceId'] = invoiceId;
    }
    if (limit != null) {
      params['limit'] = String(limit);
    }
    return this.http.get<VerifactuChainBlockDto[]>(
      joinApiUrl(this.baseUrl, verifactuPaths.chain),
      { params },
    );
  }

  chainVerify(): Observable<VerifactuChainVerificationDto> {
    return this.http.get<VerifactuChainVerificationDto>(
      joinApiUrl(this.baseUrl, verifactuPaths.chainVerify),
    );
  }
}

export interface VerifactuCredentialSlotDto {
  configured: boolean;
  certSubject: string | null;
  certValidTo: string | null;
  updatedAt: string | null;
}

export interface VerifactuCredentialsStatusDto {
  test: VerifactuCredentialSlotDto;
  production: VerifactuCredentialSlotDto;
}

/** Fila de GET /verifactu/queue (fechas ISO en JSON). */
export interface VerifactuQueueItemDto {
  id: string;
  tenantId: string;
  invoiceId: string;
  status: string;
  retries: number;
  maxRetries: number;
  nextRetryAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
  invoice: { id: string; number: string | null; status: string };
}

/** Fila de GET /verifactu/logs (fechas ISO en JSON). */
export interface VerifactuLogRowDto {
  id: string;
  invoiceId: string;
  tenantId: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  requestPayload?: unknown;
  responsePayload?: unknown;
}

/** Fila de GET /verifactu/series. */
export interface VerifactuSeriesRowDto {
  id: string;
  tenantId: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

/** GET /verifactu/integration (según backend Verifactu). */
export interface VerifactuIntegrationSummaryDto {
  modes?: string[];
  credentials?: {
    encryptionKeyConfigured?: boolean;
    hint?: string;
  };
  aeat?: {
    editorRole?: string;
    submissionMode?: string;
    submissionEnv?: string;
    httpBaseUrl?: string | null;
    httpTimeoutMsDefault?: number;
    emitterNif?: string;
    chainPersistence?: string;
    optionalThirdParty?: string;
  };
  description?: string;
}

export interface VerifactuTimelineEventDto {
  id: string;
  kind:
    | 'enqueued'
    | 'processing'
    | 'forwarded'
    | 'aeat_success'
    | 'aeat_error'
    | 'completed'
    | 'failed'
    | 'retry';
  label: string;
  detail: string | null;
  at: string;
}

/** GET /verifactu/invoices/:id */
export interface VerifactuInvoiceDetailDto {
  invoiceId: string;
  number: string | null;
  status: string;
  total: number;
  currency: string;
  issuedAt: string | null;
  customerName: string | null;
  customerNif: string | null;
  emitterNif: string;
  queueStatus: string | null;
  queueRetries: number | null;
  queueMaxRetries: number | null;
  lastError: string | null;
  verifactuStatus: 'pending' | 'sent' | 'error' | 'none';
  aeatReference: string | null;
  verificationCode: string | null;
  currentHash: string | null;
  qrCode: string | null;
  qrValidationUrl: string | null;
  timeline: VerifactuTimelineEventDto[];
}

/** Fila de GET /verifactu/chain */
export interface VerifactuChainBlockDto {
  id: string;
  tenantId: string;
  environment: string;
  blockIndex: number;
  invoiceId: string;
  invoiceNumber: string | null;
  invoiceTotal: number;
  queueItemId: string | null;
  logId: string | null;
  previousHash: string;
  currentHash: string;
  aeatHuella: string;
  aeatIdRegistro: string;
  verificationCode: string | null;
  createdAt: string;
}

/** GET /verifactu/chain/verify */
export interface VerifactuChainVerificationDto {
  isValid: boolean;
  totalRecords: number;
  verifiedAt: string;
  environment: string;
  headBlockIndex: number | null;
  errors: Array<{
    blockId: string;
    blockIndex: number;
    error: string;
  }>;
}
