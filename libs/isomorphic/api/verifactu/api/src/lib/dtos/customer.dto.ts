import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  ValidateNested,
} from 'class-validator';

export class AddressDto {
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  number?: string;

  @IsString()
  @IsOptional()
  floor?: string;

  @IsString()
  @IsOptional()
  door?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  country?: string;
}

export class CreateCustomerDto {
  @IsEnum(['CLIENT', 'PROVIDER', 'BOTH'])
  type: string;

  @IsEnum(['NIF', 'NIE', 'PASSPORT', 'OTHER'])
  idType: string;

  @IsString()
  taxId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  tradeName?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  web?: string;

  @IsEnum(['GENERAL', 'SIMPLIFIED', 'EXEMPT'])
  @IsOptional()
  ivaRegime?: string;

  @IsBoolean()
  @IsOptional()
  ivaIncluded?: boolean;

  @IsNumber()
  @IsOptional()
  retention?: number;

  @IsString()
  @IsOptional()
  autonomousCommunity?: string;

  @IsString()
  @IsOptional()
  province?: string;
}

export class UpdateCustomerDto extends CreateCustomerDto {
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
