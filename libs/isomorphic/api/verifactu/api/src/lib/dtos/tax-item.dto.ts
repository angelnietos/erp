import { IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
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
  @IsEnum(Impuesto)
  @IsOptional()
  impuesto?: Impuesto = Impuesto.IVA;

  @IsEnum(ClaveRegimen)
  @IsOptional()
  taxScheme?: ClaveRegimen = ClaveRegimen.RegimenGeneral;

  @IsEnum(CalificacionOperacion)
  @IsOptional()
  taxType?: CalificacionOperacion = CalificacionOperacion.S1;

  @IsNumber()
  @Min(0)
  taxRate!: number;

  @IsNumber()
  @Min(0)
  taxBase!: number;

  @IsNumber()
  @Min(0)
  taxAmount!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  equivalenceSurchargeRate?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  equivalenceSurchargeAmount?: number;
}
