import {
  IsString,
  IsDateString,
  IsArray,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

export class DocumentLineDto {
  @IsString() description: string;
  @IsNumber() @Min(0) quantity: number;
  @IsNumber() @Min(0) unitPrice: number;
  @IsNumber() @Min(0) @IsOptional() discount?: number;
  @IsNumber() @Min(0) total: number;
}

export class DocumentTaxItemDto {
  @IsString() @IsOptional() impuesto?: string;
  @IsNumber() tipoImpositivo: number;
  @IsNumber() baseImponible: number;
  @IsNumber() cuota: number;
}

export class CreateCommercialDocumentDto {
  @IsString() documentNumber: string;
  @IsDateString() issueDate: string;
  @IsString() sellerNif: string;
  @IsString() @IsOptional() sellerName?: string;
  @IsString() @IsOptional() buyerNif?: string;
  @IsString() @IsOptional() buyerName?: string;
  @IsString() @IsOptional() buyerCountry?: string;
  @IsString() @IsOptional() description?: string;
  @IsArray()
  @ValidateNested({ each: true })
  lines: DocumentLineDto[];
  @IsArray()
  @ValidateNested({ each: true })
  taxItems: DocumentTaxItemDto[];
  @IsNumber() @Min(0) totalAmount: number;
  @IsDateString() @IsOptional() validUntil?: string;
  @IsString() @IsOptional() customerId?: string;
}
