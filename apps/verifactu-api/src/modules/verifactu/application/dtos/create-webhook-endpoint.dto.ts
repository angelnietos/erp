import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWebhookEndpointDto {
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  eventType!: string;

  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsString()
  @IsNotEmpty()
  secret!: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

