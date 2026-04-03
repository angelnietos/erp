import { TaxItemDto } from './tax-item.dto';
import { InvoiceLineDto } from './invoice-line.dto';
import {
  TipoFactura,
  TipoIdFiscal,
  TipoRectificativa,
} from './tipo-factura.enum';

/**
 * Invoice DTO - Represents an invoice for VeriFactu
 * Factura DTO - Representa una factura para VeriFactu
 */
export class CreateInvoiceDto {
  invoiceNumber!: string;
  invoiceDate!: string;
  sellerID!: string;
  sellerName?: string;
  invoiceType?: TipoFactura = TipoFactura.F1;
  buyerIDType?: TipoIdFiscal = TipoIdFiscal.NIF;

  buyerID?: string;
  buyerName?: string;
  buyerCountry?: string;
  text?: string;
  taxItems!: TaxItemDto[];
  lines?: InvoiceLineDto[];
  totalAmount?: number;

  // Rectification fields
  rectificationType?: TipoRectificativa;
  originalInvoiceNumber?: string;
  originalInvoiceDate?: string;
  rectificationReason?: string;
  subsanacion?: 'S';

  // Additional fields
  issueMethod?: 'C' | 'I' = 'I';
  rentalStartDate?: string;
  rentalEndDate?: string;
  paymentMethod?: string;
  bankAccount?: string;
  paymentDueDate?: string;
}
