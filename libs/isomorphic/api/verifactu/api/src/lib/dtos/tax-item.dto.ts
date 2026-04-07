import {
  ClaveRegimen,
  CalificacionOperacion,
  Impuesto,
} from './tipo-factura.enum';

/**
 * Tax item DTO - Represents a tax line in an invoice
 * Línea de impuestos - Representa una línea de impuestos en una factura
 */
export class TaxItemDto {
  impuesto?: Impuesto = Impuesto.IVA;
  taxScheme?: ClaveRegimen = ClaveRegimen.RegimenGeneral;
  taxType?: CalificacionOperacion = CalificacionOperacion.S1;
  taxRate!: number;
  taxBase!: number;
  taxAmount!: number;
  equivalenceSurchargeRate?: number;
  equivalenceSurchargeAmount?: number;
}
