import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ format: 'email', example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 1, writeOnly: true })
  @IsString()
  @MinLength(1)
  password!: string;

  /** Resolución de tenant en login (alternativa a x-tenant-id UUID). */
  @ApiPropertyOptional({
    description: 'Slug del tenant (opcional)',
    example: 'mi-empresa',
  })
  @IsOptional()
  @IsString()
  tenantSlug?: string;
}
