import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  number?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  floor?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  door?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ default: 'ES' })
  @IsString()
  @IsOptional()
  country?: string;
}

export class CreateCustomerDto {
  @ApiProperty({ enum: ['CLIENT', 'PROVIDER', 'BOTH'] })
  @IsEnum(['CLIENT', 'PROVIDER', 'BOTH'])
  type: string;

  @ApiProperty({ enum: ['NIF', 'NIE', 'PASSPORT', 'OTHER'] })
  @IsEnum(['NIF', 'NIE', 'PASSPORT', 'OTHER'])
  idType: string;

  @ApiProperty()
  @IsString()
  taxId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tradeName?: string;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  web?: string;

  @ApiPropertyOptional({ enum: ['GENERAL', 'SIMPLIFIED', 'EXEMPT'] })
  @IsEnum(['GENERAL', 'SIMPLIFIED', 'EXEMPT'])
  @IsOptional()
  ivaRegime?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  ivaIncluded?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  retention?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  autonomousCommunity?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  province?: string;
}

export class UpdateCustomerDto extends CreateCustomerDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class CustomerResponseDto {
  id: string;
  type: string;
  idType: string;
  taxId: string;
  name: string;
  tradeName?: string;
  address?: AddressDto;
  phone?: string;
  email?: string;
  web?: string;
  ivaRegime?: string;
  ivaIncluded: boolean;
  retention?: number;
  autonomousCommunity?: string;
  province?: string;
  sellerNif: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
