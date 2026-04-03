import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({
    description: 'Tax type (Impuesto): 01=IVA, 02=IPSI, 03=IGIC, 04=Otros',
    enum: Impuesto,
    default: Impuesto.IVA,
    example: '01',
  })
  @IsEnum(Impuesto)
  @IsOptional()
  impuesto?: Impuesto = Impuesto.IVA;

  @ApiProperty({
    description: 'Tax scheme key (Clave de régimen)',
    enum: ClaveRegimen,
    default: ClaveRegimen.RegimenGeneral,
    example: '01',
  })
  @IsEnum(ClaveRegimen)
  @IsOptional()
  taxScheme?: ClaveRegimen = ClaveRegimen.RegimenGeneral;

  @ApiProperty({
    description: 'Operation qualification (Calificación de la operación)',
    enum: CalificacionOperacion,
    default: CalificacionOperacion.S1,
    example: 'S1',
  })
  @IsEnum(CalificacionOperacion)
  @IsOptional()
  taxType?: CalificacionOperacion = CalificacionOperacion.S1;

  @ApiProperty({
    description: 'Tax rate percentage (Tipo impositivo %)',
    example: 21,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  taxRate: number;

  @ApiProperty({
    description: 'Tax base amount (Base imponible)',
    example: 100.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  taxBase: number;

  @ApiProperty({
    description: 'Tax amount (Cuota tributaria)',
    example: 21.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  taxAmount: number;

  @ApiProperty({
    description:
      'Equivalence surcharge rate percentage (Recargo de equivalencia %)',
    example: 5.2,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  equivalenceSurchargeRate?: number;

  @ApiProperty({
    description: 'Equivalence surcharge amount (Cuota recargo de equivalencia)',
    example: 5.2,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  equivalenceSurchargeAmount?: number;
}
