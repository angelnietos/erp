import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsArray,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DocumentLineDto {
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsNumber() @Min(0) quantity: number;
  @ApiProperty() @IsNumber() @Min(0) unitPrice: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @IsOptional() discount?: number;
  @ApiProperty() @IsNumber() @Min(0) total: number;
}

export class DocumentTaxItemDto {
  @ApiPropertyOptional() @IsString() @IsOptional() impuesto?: string;
  @ApiProperty() @IsNumber() tipoImpositivo: number;
  @ApiProperty() @IsNumber() baseImponible: number;
  @ApiProperty() @IsNumber() cuota: number;
}

export class CreateCommercialDocumentDto {
  @ApiProperty({ example: 'PRE-2024-001' }) @IsString() documentNumber: string;
  @ApiProperty() @IsDateString() issueDate: string;
  @ApiProperty() @IsString() sellerNif: string;
  @ApiPropertyOptional() @IsString() @IsOptional() sellerName?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() buyerNif?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() buyerName?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() buyerCountry?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiProperty({ type: [DocumentLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentLineDto)
  lines: DocumentLineDto[];
  @ApiProperty({ type: [DocumentTaxItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentTaxItemDto)
  taxItems: DocumentTaxItemDto[];
  @ApiProperty() @IsNumber() @Min(0) totalAmount: number;
  @ApiPropertyOptional() @IsDateString() @IsOptional() validUntil?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() customerId?: string;
}
