export interface VerifactuInvoiceData {
  id: string;
  budgetId?: string | null;
  total: number;
  currentHash?: string | null;
  verifactuStatus?: string;
  invoiceKind?: string;
}

export interface CreateChainBlockDto {
  tenantId: string;
  invoiceId: string;
  invoiceTotal: number;
  previousHash: string;
  currentHash: string;
  recordKind: 'INVOICE' | 'RECTIFICATIVE' | 'CANCELLATION';
  aeatHuella?: string;
  aeatIdRegistro?: string;
}

export interface VerifactuInvoiceRepositoryPort {
  findInvoiceById(invoiceId: string): Promise<VerifactuInvoiceData | null>;
  getLastAcceptedHash(): Promise<string | null>;
  markInvoiceAsSent(invoiceId: string, currentHash: string, previousHash?: string): Promise<void>;
  markInvoiceAsError(invoiceId: string): Promise<void>;
  markInvoiceAsCancelled(invoiceId: string): Promise<void>;
  createSubmissionLog(params: {
    invoiceId: string;
    tenantId: string;
    requestPayload: unknown;
    responsePayload: unknown;
    status: 'SENT' | 'ERROR';
    errorMessage?: string;
  }): Promise<void>;
  createRectificativaInvoice(params: {
    originalInvoiceId: string;
    tenantId: string;
    rectificationType: 'S' | 'I';
    rectificationReason: string;
    total?: number;
  }): Promise<string>;
  createChainBlock(params: CreateChainBlockDto): Promise<void>;
}

export const VERIFACTU_INVOICE_REPOSITORY = Symbol('VERIFACTU_INVOICE_REPOSITORY');

