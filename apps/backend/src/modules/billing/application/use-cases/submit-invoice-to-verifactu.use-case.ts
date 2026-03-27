import { Inject, Injectable } from '@nestjs/common';
import {
  VERIFACTU_SUBMISSION_PORT,
  VerifactuSubmissionPort,
} from '../ports/verifactu-submission.port';

@Injectable()
export class SubmitInvoiceToVerifactuUseCase {
  constructor(
    @Inject(VERIFACTU_SUBMISSION_PORT)
    private readonly verifactuSubmission: VerifactuSubmissionPort,
  ) {}

  async execute(input: { invoiceId: string; tenantId: string }) {
    return this.verifactuSubmission.submitInvoice({
      invoiceId: input.invoiceId,
      tenantId: input.tenantId,
    });
  }
}

