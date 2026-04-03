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
  @IsString()
  @MaxLength(60)
  invoiceNumber!: string;

  @IsDateString()
  invoiceDate!: string;

  @IsString()
  @Matches(/^[A-Za-z0-9]{9}$/, {
    message: 'Seller ID must be a valid 9-character NIF/CIF',
  })
  sellerID!: string;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  sellerName?: string;

  @IsEnum(MotivoAnulacion)
  cancellationReason!: MotivoAnulacion;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  cancellationDetails?: string;
}
