import { createHash } from 'crypto';

export type OperationType = 'INVOICE' | 'RECTIFICATIVE' | 'CANCELLATION';

export interface HashChainInput {
  invoiceId: string;
  tenantId: string;
  total: number;
  previousHash?: string;
  operationType?: OperationType;
}

export class HashChainService {
  buildCurrentHash(input: HashChainInput): string {
    const opType = input.operationType ?? 'INVOICE';
    const payload = `${input.tenantId}|${input.invoiceId}|${input.total.toFixed(2)}|${input.previousHash ?? ''}|${opType}`;
    return createHash('sha256').update(payload).digest('hex');
  }
}

