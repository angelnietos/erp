import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import {
  TipoFactura,
  TipoIdFiscal,
  ClaveRegimen,
  CalificacionOperacion,
  TipoRectificativa,
  MotivoAnulacion,
} from './tipo-factura.enum';
import { TaxItemDto } from './tax-item.dto';

/**
 * VeriFactu Invoice DTO
 * DTO para facturas del sistema VeriFactu
 */
export class VeriFactuInvoiceDto {
  @IsString()
  @IsNotEmpty()
  invoiceNumber!: string;

  @IsDateString()
  invoiceDate!: string;

  @IsEnum(TipoFactura)
  tipoFactura!: TipoFactura;

  @IsString()
  @IsNotEmpty()
  sellerNif!: string;

  @IsString()
  @IsNotEmpty()
  sellerName!: string;

  @IsOptional()
  @IsString()
  buyerNif?: string;

  @IsOptional()
  @IsString()
  buyerName?: string;

  @IsOptional()
  @IsEnum(TipoIdFiscal)
  buyerIdType?: TipoIdFiscal;

  @IsOptional()
  @IsString()
  buyerCountry?: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @Min(0)
  baseImponible!: number;

  @IsArray()
  @ValidateNested({ each: true })
  taxItems!: TaxItemDto[];

  @IsNumber()
  @Min(0)
  totalInvoice!: number;

  @IsEnum(ClaveRegimen)
  claveRegimen!: ClaveRegimen;

  @IsEnum(CalificacionOperacion)
  calificacionOperacion!: CalificacionOperacion;

  @IsOptional()
  @IsEnum(TipoRectificativa)
  tipoRectificativa?: TipoRectificativa;

  @IsOptional()
  @IsString()
  invoiceRectified?: string;

  @IsOptional()
  @IsString()
  motivoRectificacion?: string;
}

/**
 * VeriFactu Response DTO
 * DTO de respuesta del sistema VeriFactu
 */
export class VeriFactuResponseDto {
  @IsBoolean()
  success!: boolean;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsOptional()
  @IsString()
  hash?: string;

  @IsOptional()
  @IsString()
  qrUrl?: string;

  @IsOptional()
  @IsBoolean()
  aeatSent?: boolean;

  @IsOptional()
  @IsString()
  aeatResponseCode?: string;

  @IsOptional()
  @IsString()
  aeatResponseMessage?: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}

/**
 * VeriFactu Query DTO
 * DTO para consultas del sistema VeriFactu
 */
export class VeriFactuQueryDto {
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  sellerNif?: string;

  @IsOptional()
  @IsString()
  buyerNif?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

/**
 * VeriFactu Cancel DTO
 * DTO para anulación de facturas
 */
export class VeriFactuCancelDto {
  @IsString()
  @IsNotEmpty()
  invoiceNumber!: string;

  @IsEnum(MotivoAnulacion)
  motivoAnulacion!: MotivoAnulacion;

  @IsOptional()
  @IsString()
  additionalInfo?: string;
}

/**
 * VeriFactu Blockchain Verification DTO
 * DTO para verificación blockchain
 */
export class VeriFactuBlockchainVerificationDto {
  @IsBoolean()
  isValid!: boolean;

  @IsNumber()
  totalRecords!: number;

  @IsDateString()
  verifiedAt!: string;

  @IsArray()
  errors!: Array<{
    recordId: string;
    error: string;
  }>;
}
