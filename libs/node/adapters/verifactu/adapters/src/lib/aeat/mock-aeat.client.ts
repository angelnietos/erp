import { Injectable } from '@nestjs/common';
import { AeatClientPort, AeatSubmissionRequest, AeatSubmissionResponse } from '@josanz-erp/verifactu-core';

@Injectable()
export class MockAeatClient implements AeatClientPort {
  async submitRecord(request: AeatSubmissionRequest): Promise<AeatSubmissionResponse> {
    return {
      accepted: true,
      aeatReference: `AEAT-${request.invoiceId.slice(0, 8).toUpperCase()}`,
      rawResponse: {
        accepted: true,
        reference: `AEAT-${request.invoiceId.slice(0, 8).toUpperCase()}`,
        mode: 'mock',
      },
    };
  }
}

