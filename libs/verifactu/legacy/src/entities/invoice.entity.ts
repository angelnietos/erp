import {
  TipoFactura,
  TipoIdFiscal,
  ClaveRegimen,
  CalificacionOperacion,
  TipoRectificativa,
  MotivoAnulacion,
} from '../dto/tipo-factura.enum';
import { TaxItemDto } from '../dto/tax-item.dto';

/**
 * Invoice Entity
 * Entidad de Factura para el sistema VeriFactu
 */
export interface InvoiceEntity {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  tipoFactura: TipoFactura;

  // Seller information
  sellerNif: string;
  sellerName: string;

  // Buyer information
  buyerNif?: string;
  buyerName?: string;
  buyerIdType?: TipoIdFiscal;
  buyerCountry?: string;

  // Invoice details
  description: string;
  baseImponible: number;
  taxItems: TaxItemDto[];
  totalInvoice: number;

  // Regime and operation type
  claveRegimen: ClaveRegimen;
  calificacionOperacion: CalificacionOperacion;

  // Rectification (if applicable)
  tipoRectificativa?: TipoRectificativa;
  invoiceRectified?: string;
  motivoRectificacion?: string;

  // Metadata
  hash: string;
  previousHash?: string;
  qrUrl: string;

  // AEAT submission
  aeatSent: boolean;
  aeatSentAt?: Date;
  aeatResponseCode?: string;
  aeatResponseMessage?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Status
  status: 'active' | 'cancelled' | 'pending' | 'error';
  cancelledAt?: Date;
  cancellationReason?: MotivoAnulacion;
}

/**
 * Invoice Status History
 * Historial de estados de factura
 */
export interface InvoiceStatusHistory {
  invoiceId: string;
  status: InvoiceEntity['status'];
  changedAt: Date;
  changedBy: string;
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Invoice Summary
 * Resumen de factura para listados
 */
export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  sellerNif: string;
  sellerName: string;
  buyerNif?: string;
  buyerName?: string;
  totalInvoice: number;
  status: InvoiceEntity['status'];
  aeatSent: boolean;
  createdAt: Date;
}
