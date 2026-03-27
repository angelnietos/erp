import { Injectable } from '@nestjs/common';
import {
  AeatClientPort,
  AeatSubmissionRequest,
  AeatSubmissionResponse,
} from '../../../domain/ports/aeat-client.port';

@Injectable()
export class MockAeatClient implements AeatClientPort {
  async submitRecord(request: AeatSubmissionRequest): Promise<AeatSubmissionResponse> {
    return {
      accepted: true,
      aeatReference: `AEAT-${request.invoiceId.slice(0, 8).toUpperCase()}`,
      rawResponse: {
        accepted: true,
        timestamp: new Date().toISOString(),
        reference: `AEAT-${request.invoiceId.slice(0, 8).toUpperCase()}`,
      },
    };
  }
}

