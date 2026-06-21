import { IsOptional, IsString, IsUrl } from 'class-validator';

export class BffLogoutDto {
  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  postLogoutRedirectUri?: string;
}
