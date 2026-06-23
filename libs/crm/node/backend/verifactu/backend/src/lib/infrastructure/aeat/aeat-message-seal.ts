import { createHash } from 'node:crypto';
import type { AeatFacturaAltaSolicitud } from '@generic-crm/verifactu-core';

export type AeatSealMode = 'none' | 'sha256-canonical-json';

export interface AeatSealedTransmission {
  /** Cuerpo enviado por HTTP (JSON u otro según tu gateway). */
  body: unknown;
  /** Huella de apoyo para auditoría (no sustituye firma X.509 AEAT). */
  huellaMensaje?: string;
}

/**
 * Paso previo al envío: aquí iría la firma/sellado conforme a AEAT (PKCS#7, XML…).
 * Modos actuales:
 * - `none`: envía la solicitud tal cual (solo desarrollo / gateway que firme él).
 * - `sha256-canonical-json`: hash SHA-256 del JSON estable (solo trazabilidad interna).
 */
export function sealAeatTransmission(
  solicitud: AeatFacturaAltaSolicitud,
  mode: AeatSealMode,
): AeatSealedTransmission {
  if (mode === 'none') {
    return { body: solicitud };
  }
  const canonical = stableStringify(solicitud);
  const huellaMensaje = createHash('sha256')
    .update(canonical, 'utf8')
    .digest('hex');
  return {
    body: solicitud,
    huellaMensaje,
  };
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((x) => stableStringify(x)).join(',')}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const parts = keys.map(
    (k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`,
  );
  return `{${parts.join(',')}}`;
}
