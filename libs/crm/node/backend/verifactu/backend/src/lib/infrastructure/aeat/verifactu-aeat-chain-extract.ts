import { createHash } from 'node:crypto';
import type { VerifactuSubmissionResult } from '@generic-crm/verifactu-core';

/**
 * Extrae huella + identificador de registro para persistir encadenamiento.
 * Si AEAT solo devuelve CSV, se usa como id y una huella sintética (SHA-256) solo para continuidad interna;
 * en producción conviene que la respuesta real incluya la huella oficial.
 */
export function extractAeatChainHead(
  result: VerifactuSubmissionResult,
): { huella: string; idRegistro: string } | null {
  const aeat = result.ack.aeat;
  const idRegistro =
    aeat?.idRegistro?.trim() ||
    aeat?.csv?.trim() ||
    result.verificationCode?.trim() ||
    '';
  if (!idRegistro) {
    return null;
  }
  const huella =
    aeat?.huella?.trim() ||
    createHash('sha256').update(idRegistro, 'utf8').digest('hex');
  return { huella, idRegistro };
}
