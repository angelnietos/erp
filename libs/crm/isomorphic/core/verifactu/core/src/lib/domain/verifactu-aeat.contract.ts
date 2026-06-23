/**
 * Contrato de envío Verifactu / AEAT para este producto.
 *
 * **Rol del editor (tú):** quien desarrolla este CRM es quien debe implementar el
 * adaptador que cumpla la normativa (firma, registros, huella, entornos de prueba
 * y producción). AEAT define el estándar; tu código lo materializa.
 *
 * **“Proveedor homologado” (opcional):** solo aplica si contratas un tercero
 * (p. ej. servicios de factura electrónica certificados). No sustituye tu
 * responsabilidad como editor; es un integrador externo opcional.
 *
 * Los tipos aquí son una base para endurecer payloads y logs; amplía campos
 * según la especificación oficial vigente (CSV, encadenamiento, etc.).
 */

/** Entorno lógico del envío (no confundir solo con URL). */
export type AeatSubmissionEnvironment = 'stub' | 'test' | 'production';

/**
 * Campos AEAT habituales para auditoría y soporte (sin certificados ni claves).
 * Completa según la respuesta real / tu gateway.
 */
export interface VerifactuAeatAuditSnapshot {
  /** Código seguro de verificación (o equivalente devuelto por AEAT). */
  csv?: string;
  /** Huella del registro aceptado en AEAT, si aplica. */
  huella?: string;
  /** Identificador del registro en el sistema AEAT / tu trazabilidad. */
  idRegistro?: string;
  /** Huella previa usada en encadenamiento (solo referencia, no secreto). */
  encadenamientoHuellaAnterior?: string;
  /** Huella sobre el mensaje enviado (p. ej. previa a firma PKCS#7). */
  huellaMensajeEnviado?: string;
}

/** Reconocimiento auditables devuelto tras un envío simulado o real. */
export interface VerifactuSubmissionAck {
  environment: AeatSubmissionEnvironment;
  /** Instant ISO UTC del procesamiento en tu adaptador. */
  processedAt: string;
  /** Datos AEAT estructurados para informes y logs. */
  aeat?: VerifactuAeatAuditSnapshot;
  /**
   * Metadatos adicionales (ids internos, modo dry-run, resúmenes).
   * No incluir certificados, claves ni datos personales innecesarios.
   */
  audit: Record<string, unknown>;
}

/** Resultado unificado del puerto `VerifactuSubmissionPort.submit`. */
export interface VerifactuSubmissionResult {
  /**
   * Código de verificación / CSV / identificador según tu mapeo desde la
   * respuesta AEAT o tu capa intermedia.
   */
  verificationCode: string;
  ack: VerifactuSubmissionAck;
}
