import { Injectable } from '@nestjs/common';
import {
  SubmitToVerifactuCommand,
  SubmitToVerifactuResult,
  VerifactuSubmissionPort,
} from '../../../application/ports/verifactu-submission.port';

@Injectable()
export class VerifactuSubmissionAdapter implements VerifactuSubmissionPort {
  async submitInvoice(command: SubmitToVerifactuCommand): Promise<SubmitToVerifactuResult> {
    const baseUrl = process.env.VERIFACTU_API_URL ?? 'http://localhost:3100/api';
    const response = await fetch(`${baseUrl}/verifactu/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.VERIFACTU_API_KEY ? { 'x-api-key': process.env.VERIFACTU_API_KEY } : {}),
      },
      body: JSON.stringify({
        invoiceId: command.invoiceId,
        tenantId: command.tenantId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Verifactu API error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<SubmitToVerifactuResult>;
  }
}

