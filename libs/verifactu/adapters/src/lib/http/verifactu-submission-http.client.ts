import { Injectable } from '@nestjs/common';

export interface SubmitInvoiceToVerifactuRequest {
  invoiceId: string;
  tenantId?: string;
}

export interface SubmitInvoiceToVerifactuResponse {
  invoiceId: string;
  tenantId: string;
  status: 'SENT' | 'ERROR';
  currentHash: string;
  previousHash?: string;
  aeatReference?: string;
}

@Injectable()
export class VerifactuSubmissionHttpClient {
  async submitInvoice(
    payload: SubmitInvoiceToVerifactuRequest,
  ): Promise<SubmitInvoiceToVerifactuResponse> {
    const baseUrl = process.env.VERIFACTU_API_URL ?? 'http://localhost:3100/api';
    const response = await fetch(`${baseUrl}/verifactu/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.VERIFACTU_API_KEY ? { 'x-api-key': process.env.VERIFACTU_API_KEY } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Verifactu API error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<SubmitInvoiceToVerifactuResponse>;
  }
}

