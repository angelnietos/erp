import type { VerifactuSubmissionPayload } from './verifactu.types';
import type { AeatFacturaAltaSolicitud } from './verifactu-aeat.messages';

export interface AeatMapperContext {
  /** NIF del emisor obligado (configuración por despliegue o por tenant). */
  emisorNif: string;
  /** Versión interna del JSON que envías a tu capa de firma/gateway. */
  versionEsquema: string;
  entorno: 'preproduccion' | 'produccion';
  /**
   * Huella e id del registro anterior (encadenamiento). En producción deben
   * obtenerse del último registro aceptado del emisor/serie.
   */
  encadenamiento?: { huella: string; idRegistro: string };
}

/**
 * Construye un cuerpo de solicitud **de ejemplo** a partir del agregado CRM.
 * Amplía con líneas de IVA, rectificativas, etc., según tu modelo de factura.
 */
export function buildAeatFacturaAltaSolicitud(
  payload: VerifactuSubmissionPayload,
  ctx: AeatMapperContext,
): AeatFacturaAltaSolicitud {
  const numSerie =
    payload.invoiceNumber?.trim() ||
    `PEND-${payload.invoiceId.replace(/-/g, '').slice(0, 12)}`;
  const fechaExpedicion =
    payload.issuedOn?.trim().slice(0, 10) ||
    new Date().toISOString().slice(0, 10);

  const enc =
    payload.previousRegistry ??
    (ctx.encadenamiento
      ? {
          huella: ctx.encadenamiento.huella,
          idRegistro: ctx.encadenamiento.idRegistro,
        }
      : undefined);

  return {
    meta: {
      versionEsquema: ctx.versionEsquema,
      entorno: ctx.entorno,
    },
    registro: {
      idEmisorFactura: (payload.emitterTaxId?.trim() || ctx.emisorNif).trim(),
      numSerieFactura: numSerie,
      fechaExpedicion,
      tipoFactura: 'F1',
      descripcionOperacion: 'Prestación de bienes o servicios',
      destinatario: {
        nif: payload.customerTaxId,
        nombre: payload.customerName,
      },
      importeTotal: payload.total.toFixed(2),
      moneda: payload.currency || 'EUR',
      encadenamiento: {
        ...(enc ? { registroAnterior: enc } : {}),
      },
    },
  };
}
