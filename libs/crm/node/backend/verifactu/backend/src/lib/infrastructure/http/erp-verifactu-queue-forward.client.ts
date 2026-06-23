import { Injectable, Logger } from '@nestjs/common';

export interface ErpVerifactuEnqueueResponse {
  queueItemId: string;
  status: string;
  invoiceId: string;
  tenantId: string;
}

@Injectable()
export class ErpVerifactuQueueForwardClient {
  private readonly log = new Logger(ErpVerifactuQueueForwardClient.name);

  isConfigured(): boolean {
    const baseUrl = process.env['ERP_API_URL']?.trim();
    const apiKey = process.env['CRM_ERP_SYNC_API_KEY']?.trim();
    return Boolean(baseUrl && apiKey);
  }

  async enqueue(
    tenantId: string,
    invoiceId: string,
  ): Promise<ErpVerifactuEnqueueResponse> {
    const baseUrl = process.env['ERP_API_URL']!.replace(/\/$/, '');
    const apiKey = process.env['CRM_ERP_SYNC_API_KEY']!.trim();

    const response = await fetch(`${baseUrl}/internal/verifactu/enqueue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({ tenantId, invoiceId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ERP Verifactu enqueue error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<ErpVerifactuEnqueueResponse>;
  }

  async enqueueSafe(
    tenantId: string,
    invoiceId: string,
  ): Promise<ErpVerifactuEnqueueResponse | null> {
    try {
      return await this.enqueue(tenantId, invoiceId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.log.warn(`ERP enqueue failed for invoice ${invoiceId}: ${message}`);
      return null;
    }
  }
}
