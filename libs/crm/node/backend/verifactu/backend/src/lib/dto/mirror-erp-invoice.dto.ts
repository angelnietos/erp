import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class MirrorErpInvoiceDto {
  @IsUUID()
  invoiceId!: string;

  @IsUUID()
  tenantId!: string;

  @IsString()
  invoiceNumber!: string;

  @IsNumber()
  total!: number;

  @IsOptional()
  @IsString()
  issuedAt?: string;
}
