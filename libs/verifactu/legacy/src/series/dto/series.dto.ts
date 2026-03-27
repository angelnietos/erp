import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreateSeriesDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  prefix: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  nextNumber?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  padding?: number;

  @ApiProperty({ enum: ['INVOICE', 'RECTIFICATION', 'CREDIT', 'DEBIT'] })
  @IsEnum(['INVOICE', 'RECTIFICATION', 'CREDIT', 'DEBIT'])
  type: string;

  @ApiProperty()
  @IsNumber()
  year: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  automaticNumbering?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  resetYearly?: boolean;
}

export class UpdateSeriesDto extends CreateSeriesDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class SeriesResponseDto {
  id: string;
  name: string;
  prefix: string;
  nextNumber: number;
  padding: number;
  type: string;
  year: number;
  active: boolean;
  automaticNumbering: boolean;
  resetYearly: boolean;
  sellerNif: string;
  createdAt: Date;
  updatedAt: Date;
}

export class NextNumberDto {
  invoiceNumber: string;
}
