import { MotivoAnulacion } from './tipo-factura.enum';

/**
 * Invoice cancellation DTO - Represents a cancellation request for an invoice
 * DTO de anulación de factura - Representa una solicitud de anulación de factura
 */
export class CancelInvoiceDto {
  invoiceNumber!: string;
  invoiceDate!: string;
  sellerID!: string;
  sellerName?: string;
  cancellationReason!: MotivoAnulacion;
  cancellationDetails?: string;
}
