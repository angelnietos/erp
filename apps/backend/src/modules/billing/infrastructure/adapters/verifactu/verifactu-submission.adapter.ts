import { Injectable } from '@nestjs/common';
import { VerifactuSubmissionHttpClient } from '@josanz-erp/verifactu-adapters';
import {
  SubmitToVerifactuCommand,
  SubmitToVerifactuResult,
  VerifactuSubmissionPort,
} from '../../../application/ports/verifactu-submission.port';

@Injectable()
export class VerifactuSubmissionAdapter implements VerifactuSubmissionPort {
  constructor(private readonly verifactuClient: VerifactuSubmissionHttpClient) {}

  async submitInvoice(command: SubmitToVerifactuCommand): Promise<SubmitToVerifactuResult> {
    return this.verifactuClient.submitInvoice({
      invoiceId: command.invoiceId,
      tenantId: command.tenantId,
    }) as Promise<SubmitToVerifactuResult>;
  }
}

