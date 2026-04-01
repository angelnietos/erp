import { IsNotEmpty, IsUUID } from 'class-validator';

export class CancelInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId!: string;
}
