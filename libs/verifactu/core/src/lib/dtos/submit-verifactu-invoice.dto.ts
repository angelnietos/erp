import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SubmitVerifactuInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  invoiceId!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}

