import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class OidcCallbackDto {
  @ApiProperty({ description: 'Authorization code de Keycloak' })
  @IsString()
  @MinLength(1)
  code!: string;

  @ApiProperty({ description: 'PKCE code_verifier' })
  @IsString()
  @MinLength(43)
  codeVerifier!: string;

  @ApiProperty({ example: 'http://localhost:4230/login/callback' })
  @IsString()
  @MinLength(1)
  redirectUri!: string;

  /** Tenant CRM (slug); por defecto `demo` en dev. */
  @ApiPropertyOptional({ example: 'demo' })
  @IsOptional()
  @IsString()
  tenantSlug?: string;
}
