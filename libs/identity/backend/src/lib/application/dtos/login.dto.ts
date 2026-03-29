import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

// Re-export from shared API - the source of truth for DTOs
export { LoginCredentials } from '@josanz-erp/identity-api';

// Backend-specific validators (decorated DTO for NestJS validation)
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  tenantSlug?: string;
}
