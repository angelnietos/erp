import { Injectable, Logger } from '@nestjs/common';

export interface MirrorErpInvoiceToCrmRequest {
  invoiceId: string;
  tenantId: string;
  invoiceNumber: string;
  total: number;
  issuedAt?: string;
}

export interface SyncCrmQueueStatusRequest {
  invoiceId: string;
  tenantId: string;
  status: 'COMPLETED' | 'FAILED';
  lastError?: string;
}

@Injectable()
export class CrmErpInvoiceMirrorHttpClient {
  private readonly logger = new Logger(CrmErpInvoiceMirrorHttpClient.name);

  isConfigured(): boolean {
    const baseUrl = process.env.VERIFACTU_CRM_API_URL?.trim();
    const apiKey = process.env.CRM_ERP_SYNC_API_KEY?.trim();
    return Boolean(baseUrl && apiKey);
  }

  async mirrorInvoice(payload: MirrorErpInvoiceToCrmRequest): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    const baseUrl = process.env.VERIFACTU_CRM_API_URL!.replace(/\/$/, '');
    const apiKey = process.env.CRM_ERP_SYNC_API_KEY!.trim();

    const response = await fetch(`${baseUrl}/internal/erp/invoices/mirror`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-tenant-id': payload.tenantId,
      },
      body: JSON.stringify({
        invoiceId: payload.invoiceId,
        tenantId: payload.tenantId,
        invoiceNumber: payload.invoiceNumber,
        total: payload.total,
        issuedAt: payload.issuedAt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CRM invoice mirror error (${response.status}): ${errorText}`);
    }
  }

  async mirrorInvoiceSafe(payload: MirrorErpInvoiceToCrmRequest): Promise<void> {
    try {
      await this.mirrorInvoice(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`CRM mirror skipped for invoice ${payload.invoiceId}: ${message}`);
    }
  }

  async syncQueueStatus(payload: SyncCrmQueueStatusRequest): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    const baseUrl = process.env.VERIFACTU_CRM_API_URL!.replace(/\/$/, '');
    const apiKey = process.env.CRM_ERP_SYNC_API_KEY!.trim();

    const response = await fetch(`${baseUrl}/internal/erp/verifactu/queue-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-tenant-id': payload.tenantId,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CRM queue sync error (${response.status}): ${errorText}`);
    }
  }

  async syncQueueStatusSafe(payload: SyncCrmQueueStatusRequest): Promise<void> {
    try {
      await this.syncQueueStatus(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `CRM queue sync skipped for invoice ${payload.invoiceId}: ${message}`,
      );
    }
  }
}
