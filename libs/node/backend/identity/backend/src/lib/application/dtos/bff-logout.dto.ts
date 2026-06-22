import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/** RP-initiated logout redirect (same origin as ERP SPA; query params allowed). */
export class BffLogoutDto {
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Matches(/^https?:\/\/[^\s]+$/i, {
    message: 'postLogoutRedirectUri must be an http(s) URL',
  })
  postLogoutRedirectUri?: string;
}
