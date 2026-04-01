import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSeriesDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

