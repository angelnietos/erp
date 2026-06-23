/**
 * Formas de petición/respuesta **orientativas** para integrar con un endpoint
 * Veri*Factu (o tu gateway interno que ya traduzca a XML firmado AEAT).
 *
 * Los nombres siguen la idea de “registro de factura” y encadenamiento; debes
 * alinearlos al XSD / manual oficial vigente cuando conectes a producción.
 * Este fichero sirve para tipar logs y el cuerpo HTTP JSON de ejemplo.
 */

/** Solicitud de alta de registro (ejemplo anónimo). */
export interface AeatFacturaAltaSolicitud {
  meta: {
    /** Referencia de versión de esquema que uses internamente. */
    versionEsquema: string;
    entorno: 'preproduccion' | 'produccion';
  };
  registro: {
    /** NIF del obligado tributario emisor (tu cliente / tenant facturador). */
    idEmisorFactura: string;
    numSerieFactura: string;
    /** Fecha expedición (YYYY-MM-DD). */
    fechaExpedicion: string;
    /** Ej. F1 factura completa — códigos según normativa. */
    tipoFactura: string;
    descripcionOperacion: string;
    destinatario?: {
      nif: string | null;
      nombre: string | null;
    };
    /** Importe total como string decimal para evitar errores de float. */
    importeTotal: string;
    moneda: string;
    encadenamiento: {
      registroAnterior?: {
        huella: string;
        idRegistro: string;
      };
    };
  };
}

/** Respuesta de aceptación/rechazo (ejemplo anónimo). */
export interface AeatFacturaAltaRespuesta {
  estado: string;
  /** Código seguro de verificación u homólogo devuelto por AEAT / gateway. */
  csv?: string;
  /** Instant ISO si el sistema remoto lo envía. */
  timestampPresentacion?: string;
  codigoError?: string;
  descripcionError?: string;
  idRegistro?: string;
  huella?: string;
}
