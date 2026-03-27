import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSeriesDto {
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

