import { IsOptional, IsString, MinLength } from 'class-validator';

export class BffAuthCallbackDto {
  @IsString()
  @MinLength(1)
  code!: string;

  @IsString()
  @MinLength(43)
  codeVerifier!: string;

  @IsString()
  @MinLength(1)
  redirectUri!: string;

  @IsOptional()
  @IsString()
  tenantSlug?: string;
}
