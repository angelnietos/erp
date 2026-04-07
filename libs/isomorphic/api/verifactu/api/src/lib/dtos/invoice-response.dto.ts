/**
 * Invoice submission status types
 * Tipos de estado de envío de factura
 */
export type InvoiceStatus =
  | 'Correcto' // Successfully sent to AEAT
  | 'Error' // Error in submission
  | 'Unknown' // Unknown status
  | 'PendienteEnvio' // Queued for later submission (AEAT unavailable)
  | 'AceptadoConErrores'; // Accepted with warnings

/**
 * Invoice response DTO - Represents the response from AEAT after sending an invoice
 * DTO de respuesta de factura - Representa la respuesta de la AEAT después de enviar una factura
 */
export class InvoiceResponseDto {
  status!: InvoiceStatus;
  csv?: string;
  errorCode?: string;
  errorDescription?: string;
  response?: string;
  invoiceNumber?: string;
  hash?: string;
  qrUrl?: string;
  qrImageBase64?: string;
  timestamp?: string;
  waitSeconds?: number;
  pendingSubmission?: boolean;
  queueItemId?: string;
}

/**
 * Invoice queue item - Represents an item in the processing queue
 * Elemento de cola de facturas - Representa un elemento en la cola de procesamiento
 */
export class InvoiceQueueItemDto {
  id!: string;
  invoice: any;
  status!: 'pending' | 'processing' | 'sent' | 'error';
  response?: InvoiceResponseDto;
  createdAt!: Date;
  processedAt?: Date;
}
