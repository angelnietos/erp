import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  Min,
  IsIn,
} from 'class-validator';

const SERVICE_TYPES = [
  'STREAMING',
  'PRODUCCIÓN',
  'LED',
  'TRANSPORTE',
  'PERSONAL_TÉCNICO',
  'VIDEO_TÉCNICO',
] as const;

export class CreateServiceDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(SERVICE_TYPES)
  @IsNotEmpty()
  type!: string;

  @IsNumber()
  @Min(0)
  basePrice!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  hourlyRate?: number;

  @IsObject()
  @IsOptional()
  configuration?: Record<string, any>;
}

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(SERVICE_TYPES)
  @IsOptional()
  type?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  hourlyRate?: number;

  @IsObject()
  @IsOptional()
  configuration?: Record<string, any>;
}
