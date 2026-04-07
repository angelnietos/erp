export interface VerifactuInvoiceData {
  id: string;
  budgetId: string;
  total: number;
  currentHash?: string | null;
}

export interface VerifactuInvoiceRepositoryPort {
  findInvoiceById(invoiceId: string): Promise<VerifactuInvoiceData | null>;
  getLastAcceptedHash(): Promise<string | null>;
  markInvoiceAsSent(invoiceId: string, currentHash: string, previousHash?: string): Promise<void>;
  markInvoiceAsError(invoiceId: string): Promise<void>;
  createSubmissionLog(params: {
    invoiceId: string;
    tenantId: string;
    requestPayload: unknown;
    responsePayload: unknown;
    status: 'SENT' | 'ERROR';
    errorMessage?: string;
  }): Promise<void>;
}

export const VERIFACTU_INVOICE_REPOSITORY = Symbol('VERIFACTU_INVOICE_REPOSITORY');

