export interface VerifactuQueueRow {
  id: string;
  tenantId: string;
  invoiceId: string;
  status: string;
  retries: number;
  maxRetries: number;
  nextRetryAt: Date | null;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
  invoice: { id: string; number: string | null; status: string };
}

export interface VerifactuSeriesRow {
  id: string;
  tenantId: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface VerifactuLogRow {
  id: string;
  invoiceId: string;
  tenantId: string;
  requestPayload: unknown;
  responsePayload: unknown;
  status: string;
  errorMessage: string | null;
  createdAt: Date;
}

/** Trabajo ya bloqueado en PROCESSING para el worker. */
export interface ClaimedVerifactuJob {
  queueItemId: string;
  tenantId: string;
  invoiceId: string;
  retries: number;
  maxRetries: number;
  /**
   * NIF emisor desde `tenants.emitter_tax_id` si está definido.
   */
  emitterTaxId: string | null;
  /**
   * Cabeza de cadena AEAT ya cargada (mismo entorno que `AEAT_SUBMISSION_ENV`).
   */
  previousRegistry: { huella: string; idRegistro: string } | null;
  invoice: {
    id: string;
    number: string | null;
    total: number;
    currency: string;
    status: string;
    /** Fecha de expedición en BD (emisión); alimenta fecha AEAT si existe. */
    issuedAt: Date | null;
    client: { taxId: string | null; name: string } | null;
  };
}

export interface VerifactuSubmissionPayload {
  tenantId: string;
  invoiceId: string;
  invoiceNumber: string | null;
  total: number;
  currency: string;
  customerTaxId: string | null;
  customerName: string | null;
  /**
   * Fecha de expedición para el registro (YYYY-MM-DD). Si es null, el mapper
   * puede usar la fecha actual según política del producto.
   */
  issuedOn: string | null;
  /**
   * NIF del obligado emisor. Si es null, el adaptador HTTP suele tomar
   * `AEAT_EMISOR_NIF` o el NIF del tenant cuando lo modeles en BD.
   */
  emitterTaxId: string | null;
  /**
   * Encadenamiento con el registro AEAT inmediatamente anterior (misma serie
   * / política que definas). Origen típico: último envío aceptado persistido.
   */
  previousRegistry: { huella: string; idRegistro: string } | null;
}
