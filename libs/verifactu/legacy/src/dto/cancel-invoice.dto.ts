import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsEnum,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';
import { MotivoAnulacion } from './tipo-factura.enum';

/**
 * Invoice cancellation DTO - Represents a cancellation request for an invoice
 * DTO de anulación de factura - Representa una solicitud de anulación de factura
 */
export class CancelInvoiceDto {
  @ApiProperty({
    description: 'Invoice number/series to cancel (Número de factura a anular)',
    example: 'GIT-EJ-0002',
    maxLength: 60,
  })
  @IsString()
  @MaxLength(60)
  invoiceNumber: string;

  @ApiProperty({
    description: 'Invoice date (Fecha de la factura) - ISO 8601 format',
    example: '2024-11-15',
  })
  @IsDateString()
  invoiceDate: string;

  @ApiProperty({
    description: 'Seller NIF/CIF (NIF del emisor)',
    example: 'B72877814',
    pattern: '^[A-Za-z0-9]{9}$',
  })
  @IsString()
  @Matches(/^[A-Za-z0-9]{9}$/, {
    message: 'Seller ID must be a valid 9-character NIF/CIF',
  })
  sellerID: string;

  @ApiPropertyOptional({
    description: 'Seller name (Razón social del emisor)',
    example: 'WEFINZ GANDIA SL',
    maxLength: 120,
  })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  sellerName?: string;

  @ApiProperty({
    description: 'Cancellation reason (Motivo de anulación)',
    enum: MotivoAnulacion,
    example: MotivoAnulacion.FacturaIncorrecta,
  })
  @IsEnum(MotivoAnulacion)
  cancellationReason: MotivoAnulacion;

  @ApiPropertyOptional({
    description:
      'Additional cancellation details (Detalles adicionales de la anulación)',
    example: 'Factura emitida con errores en los importes',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  cancellationDetails?: string;
}
