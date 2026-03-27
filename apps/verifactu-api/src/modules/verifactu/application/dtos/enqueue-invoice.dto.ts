import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class EnqueueInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  invoiceId!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}

