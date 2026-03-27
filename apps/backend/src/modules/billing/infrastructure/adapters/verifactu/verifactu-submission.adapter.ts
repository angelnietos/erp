import { Injectable } from '@nestjs/common';
import {
  SubmitToVerifactuCommand,
  SubmitToVerifactuResult,
  VerifactuSubmissionPort,
} from '../../../application/ports/verifactu-submission.port';
import { VerifactuService } from '../../../../verifactu/application/services/verifactu.service';

@Injectable()
export class VerifactuSubmissionAdapter implements VerifactuSubmissionPort {
  constructor(private readonly verifactuService: VerifactuService) {}

  async submitInvoice(command: SubmitToVerifactuCommand): Promise<SubmitToVerifactuResult> {
    return this.verifactuService.submitInvoice({
      invoiceId: command.invoiceId,
      tenantId: command.tenantId,
    });
  }
}

