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

  @IsEnum(TipoFactura)
  @IsOptional()
  invoiceType?: TipoFactura = TipoFactura.F1;

  @IsEnum(TipoIdFiscal)
  @IsOptional()
  buyerIDType?: TipoIdFiscal = TipoIdFiscal.NIF;

  @IsString()
  @IsOptional()
  buyerID?: string;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  buyerName?: string;

  @IsString()
  @MaxLength(2)
  @IsOptional()
  buyerCountry?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  text?: string;

  @IsArray()
  @ValidateNested({ each: true })
  taxItems!: TaxItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  lines?: InvoiceLineDto[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  // Rectification fields
  @IsEnum(TipoRectificativa)
  @IsOptional()
  rectificationType?: TipoRectificativa;

  @IsString()
  @IsOptional()
  originalInvoiceNumber?: string;

  @IsDateString()
  @IsOptional()
  originalInvoiceDate?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  rectificationReason?: string;

  @IsString()
  @IsOptional()
  subsanacion?: 'S';

  // Additional fields
  @IsString()
  @IsOptional()
  issueMethod?: 'C' | 'I' = 'I';

  @IsDateString()
  @IsOptional()
  rentalStartDate?: string;

  @IsDateString()
  @IsOptional()
  rentalEndDate?: string;

  @IsString()
  @MaxLength(60)
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  bankAccount?: string;

  @IsDateString()
  @IsOptional()
  paymentDueDate?: string;
}
