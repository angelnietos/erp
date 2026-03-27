import { Injectable } from '@nestjs/common';
import { AeatClientPort, AeatSubmissionRequest, AeatSubmissionResponse } from '../../../../core/src';

@Injectable()
export class RealAeatClient implements AeatClientPort {
  private readonly endpoint = process.env.VERIFACTU_AEAT_ENDPOINT ?? '';

  async submitRecord(request: AeatSubmissionRequest): Promise<AeatSubmissionResponse> {
    if (!this.endpoint) {
      throw new Error('VERIFACTU_AEAT_ENDPOINT is required in real mode');
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(`AEAT request failed with status ${response.status}`);
    }

    return {
      accepted: true,
      aeatReference: String((raw as { aeatReference?: string }).aeatReference ?? `AEAT-${request.invoiceId.slice(0, 8)}`),
      rawResponse: raw as Record<string, unknown>,
    };
  }
}

