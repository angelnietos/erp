import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
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
  @ApiProperty({
    description: 'Invoice number/series (Número de factura)',
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
    description: 'Invoice type (Tipo de factura)',
    enum: TipoFactura,
    default: TipoFactura.F1,
    example: 'F1',
  })
  @IsEnum(TipoFactura)
  @IsOptional()
  invoiceType?: TipoFactura = TipoFactura.F1;

  @ApiPropertyOptional({
    description: 'Buyer ID type (Tipo de identificador del destinatario)',
    enum: TipoIdFiscal,
    default: TipoIdFiscal.NIF,
    example: 'N',
  })
  @IsEnum(TipoIdFiscal)
  @IsOptional()
  buyerIDType?: TipoIdFiscal = TipoIdFiscal.NIF;

  @ApiPropertyOptional({
    description: 'Buyer NIF/CIF (NIF del destinatario)',
    example: 'B44531218',
  })
  @IsString()
  @IsOptional()
  buyerID?: string;

  @ApiPropertyOptional({
    description: 'Buyer name (Razón social del destinatario)',
    example: 'WEFINZ SOLUTIONS SL',
    maxLength: 120,
  })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  buyerName?: string;

  @ApiPropertyOptional({
    description:
      'Buyer country code (Código país del destinatario) - ISO 3166-1 alpha-2',
    example: 'ES',
    maxLength: 2,
  })
  @IsString()
  @MaxLength(2)
  @IsOptional()
  buyerCountry?: string;

  @ApiPropertyOptional({
    description: 'Invoice description/text (Descripción de la factura)',
    example: 'PRESTACION SERVICIOS DESARROLLO SOFTWARE',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  text?: string;

  @ApiProperty({
    description: 'Tax items (Líneas de impuestos)',
    type: [TaxItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxItemDto)
  taxItems: TaxItemDto[];

  @ApiPropertyOptional({
    description: 'Invoice lines (Líneas de factura)',
    type: [InvoiceLineDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineDto)
  @IsOptional()
  lines?: InvoiceLineDto[];

  @ApiPropertyOptional({
    description: 'Total invoice amount (Importe total de la factura)',
    example: 131.4,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  // Rectification fields
  @ApiPropertyOptional({
    description: 'Rectification type (Tipo de rectificativa)',
    enum: TipoRectificativa,
    example: 'S',
  })
  @IsEnum(TipoRectificativa)
  @IsOptional()
  rectificationType?: TipoRectificativa;

  @ApiPropertyOptional({
    description:
      'Original invoice number being rectified (Número de factura original)',
    example: 'GIT-EJ-0001',
  })
  @IsString()
  @IsOptional()
  originalInvoiceNumber?: string;

  @ApiPropertyOptional({
    description:
      'Original invoice date being rectified (Fecha de factura original)',
    example: '2024-11-10',
  })
  @IsDateString()
  @IsOptional()
  originalInvoiceDate?: string;

  @ApiPropertyOptional({
    description: 'Rectification reason (Motivo de la rectificación)',
    example: 'Corrección de importe',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  rectificationReason?: string;

  @ApiPropertyOptional({
    description:
      'Subsanación (Correction flag) - S if correcting previously rejected invoice',
    example: 'S',
  })
  @IsString()
  @IsOptional()
  subsanacion?: 'S';

  // Additional fields
  @ApiPropertyOptional({
    description:
      'Method of issue (Modo de emisión) - C=Contingencia, I=Inmediato',
    enum: ['C', 'I'],
    default: 'I',
  })
  @IsString()
  @IsOptional()
  issueMethod?: 'C' | 'I' = 'I';

  @ApiPropertyOptional({
    description:
      'Start date of rental (for rental invoices) - Fecha inicio alquiler',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsOptional()
  rentalStartDate?: string;

  @ApiPropertyOptional({
    description:
      'End date of rental (for rental invoices) - Fecha fin alquiler',
    example: '2024-12-31',
  })
  @IsDateString()
  @IsOptional()
  rentalEndDate?: string;

  @ApiPropertyOptional({
    description: 'Payment method (Forma de pago)',
    example: 'Transferencia',
    maxLength: 60,
  })
  @IsString()
  @MaxLength(60)
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Bank account for payment (IBAN)',
    example: 'ES1234567890123456789012',
  })
  @IsString()
  @IsOptional()
  bankAccount?: string;

  @ApiPropertyOptional({
    description: 'Payment due date (Fecha de vencimiento del pago)',
    example: '2024-12-15',
  })
  @IsDateString()
  @IsOptional()
  paymentDueDate?: string;
}
