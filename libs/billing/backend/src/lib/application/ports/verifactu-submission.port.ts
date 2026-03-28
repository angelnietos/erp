export interface SubmitToVerifactuCommand {
  invoiceId: string;
  tenantId: string;
}

export interface SubmitToVerifactuResult {
  invoiceId: string;
  tenantId: string;
  status: 'SENT' | 'ERROR';
  currentHash: string;
  previousHash?: string;
  aeatReference?: string;
}

export interface VerifactuSubmissionPort {
  submitInvoice(command: SubmitToVerifactuCommand): Promise<SubmitToVerifactuResult>;
}

export const VERIFACTU_SUBMISSION_PORT = Symbol('VERIFACTU_SUBMISSION_PORT');

