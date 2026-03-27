export interface AeatSubmissionRequest {
  invoiceId: string;
  tenantId: string;
  currentHash: string;
  previousHash?: string;
  total: number;
}

export interface AeatSubmissionResponse {
  accepted: boolean;
  aeatReference: string;
  rawResponse: Record<string, unknown>;
}

export interface AeatClientPort {
  submitRecord(request: AeatSubmissionRequest): Promise<AeatSubmissionResponse>;
}

export const AEAT_CLIENT = Symbol('AEAT_CLIENT');

