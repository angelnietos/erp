import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateVerifactuSeriesDto {
  @ApiProperty({
    description: 'Código único de la serie (facturación)',
    minLength: 1,
    maxLength: 32,
    example: 'A',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  code!: string;

  @ApiPropertyOptional({
    description: 'Descripción opcional',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
