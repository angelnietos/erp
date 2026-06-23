import type { VerifactuSubmissionResult } from '@generic-crm/verifactu-core';
import { createHash } from 'node:crypto';
import { extractAeatChainHead } from '../aeat/verifactu-aeat-chain-extract';

/**
 * Normaliza respuestas AEAT completas o webhooks ERP mínimos a un resultado encadenable.
 */
export function submissionResultFromPayload(
  payload: unknown,
): VerifactuSubmissionResult | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const p = payload as Record<string, unknown>;
  if (
    typeof p['verificationCode'] === 'string' &&
    p['ack'] &&
    typeof p['ack'] === 'object'
  ) {
    return p as VerifactuSubmissionResult;
  }

  const currentHash =
    typeof p['currentHash'] === 'string' ? p['currentHash'].trim() : '';
  if (!currentHash) {
    return null;
  }
  const previousHash =
    typeof p['previousHash'] === 'string' ? p['previousHash'].trim() : '';

  return {
    verificationCode: currentHash,
    ack: {
      environment: 'test',
      processedAt: new Date().toISOString(),
      aeat: {
        huella: currentHash,
        idRegistro: currentHash,
        encadenamientoHuellaAnterior: previousHash || undefined,
      },
      audit: { source: 'normalized-webhook' },
    },
  };
}

export function chainHeadFromSubmission(
  result: VerifactuSubmissionResult,
): { huella: string; idRegistro: string; verificationCode: string | null } | null {
  const head = extractAeatChainHead(result);
  if (!head) {
    return null;
  }
  return {
    ...head,
    verificationCode: result.verificationCode?.trim() || null,
  };
}

export function syntheticChainHeadFromHashes(input: {
  currentHash: string;
  verificationCode?: string | null;
}): { huella: string; idRegistro: string; verificationCode: string | null } {
  const id = input.currentHash.trim();
  return {
    huella: id,
    idRegistro: id,
    verificationCode: input.verificationCode?.trim() || id,
  };
}

export function fallbackChainHead(invoiceId: string): {
  huella: string;
  idRegistro: string;
  verificationCode: string | null;
} {
  const id = createHash('sha256').update(invoiceId, 'utf8').digest('hex');
  return { huella: id, idRegistro: id, verificationCode: null };
}
