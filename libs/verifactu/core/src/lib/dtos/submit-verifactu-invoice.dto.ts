import { IsNotEmpty, IsUUID } from 'class-validator';

export class SubmitVerifactuInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  invoiceId!: string;

  @IsUUID()
  @IsNotEmpty()
  tenantId!: string;
}

