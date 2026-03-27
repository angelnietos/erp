import { createHash } from 'crypto';

export interface HashChainInput {
  invoiceId: string;
  tenantId: string;
  total: number;
  previousHash?: string;
}

export class HashChainService {
  buildCurrentHash(input: HashChainInput): string {
    const payload = `${input.tenantId}|${input.invoiceId}|${input.total.toFixed(2)}|${input.previousHash ?? ''}`;
    return createHash('sha256').update(payload).digest('hex');
  }
}

