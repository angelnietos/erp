import { createHash } from 'crypto';

/** Huella del bloque génesis (sin registro AEAT previo). */
export const VERIFACTU_CHAIN_GENESIS_HASH = '0'.repeat(64);

export interface VerifactuChainBlockInput {
  blockIndex: number;
  tenantId: string;
  environment: string;
  invoiceId: string;
  invoiceNumber: string | null;
  invoiceTotal: number;
  previousHash: string;
  aeatHuella: string;
  aeatIdRegistro: string;
  verificationCode: string | null;
}

export interface VerifactuChainBlockRecord {
  id: string;
  blockIndex: number;
  tenantId: string;
  environment: string;
  invoiceId: string;
  invoiceNumber: string | null;
  invoiceTotal: number;
  previousHash: string;
  currentHash: string;
  aeatHuella: string;
  aeatIdRegistro: string;
  verificationCode: string | null;
  queueItemId: string | null;
  logId: string | null;
  createdAt: Date;
}

export interface VerifactuChainVerificationError {
  blockId: string;
  blockIndex: number;
  error: string;
}

export interface VerifactuChainVerificationResult {
  isValid: boolean;
  totalRecords: number;
  verifiedAt: string;
  environment: string;
  headBlockIndex: number | null;
  errors: VerifactuChainVerificationError[];
}

export class VerifactuChainService {
  buildBlockHash(input: VerifactuChainBlockInput): string {
    const canonical = [
      String(input.blockIndex),
      input.tenantId,
      input.environment,
      input.invoiceId,
      input.invoiceNumber ?? '',
      input.invoiceTotal.toFixed(2),
      input.previousHash,
      input.aeatHuella,
      input.aeatIdRegistro,
      input.verificationCode ?? '',
    ].join('|');
    return createHash('sha256').update(canonical, 'utf8').digest('hex');
  }

  verifyChain(
    blocks: VerifactuChainBlockRecord[],
    environment: string,
  ): VerifactuChainVerificationResult {
    const sorted = [...blocks].sort((a, b) => a.blockIndex - b.blockIndex);
    const errors: VerifactuChainVerificationError[] = [];
    let expectedPrevious = VERIFACTU_CHAIN_GENESIS_HASH;

    for (let i = 0; i < sorted.length; i++) {
      const block = sorted[i];
      const expectedIndex = i === 0 ? 0 : sorted[i - 1].blockIndex + 1;

      if (block.environment !== environment) {
        errors.push({
          blockId: block.id,
          blockIndex: block.blockIndex,
          error: `Entorno del bloque (${block.environment}) no coincide con ${environment}`,
        });
      }

      if (block.blockIndex !== expectedIndex) {
        errors.push({
          blockId: block.id,
          blockIndex: block.blockIndex,
          error: `Índice discontinuo: se esperaba ${expectedIndex}, hay ${block.blockIndex}`,
        });
      }

      if (block.previousHash !== expectedPrevious) {
        errors.push({
          blockId: block.id,
          blockIndex: block.blockIndex,
          error: 'previousHash no encadena con el bloque anterior',
        });
      }

      const recomputed = this.buildBlockHash({
        blockIndex: block.blockIndex,
        tenantId: block.tenantId,
        environment: block.environment,
        invoiceId: block.invoiceId,
        invoiceNumber: block.invoiceNumber,
        invoiceTotal: block.invoiceTotal,
        previousHash: block.previousHash,
        aeatHuella: block.aeatHuella,
        aeatIdRegistro: block.aeatIdRegistro,
        verificationCode: block.verificationCode,
      });

      if (recomputed !== block.currentHash) {
        errors.push({
          blockId: block.id,
          blockIndex: block.blockIndex,
          error: 'currentHash no coincide con el payload canónico',
        });
      }

      expectedPrevious = block.currentHash;
    }

    return {
      isValid: errors.length === 0,
      totalRecords: sorted.length,
      verifiedAt: new Date().toISOString(),
      environment,
      headBlockIndex:
        sorted.length > 0 ? sorted[sorted.length - 1].blockIndex : null,
      errors,
    };
  }
}
