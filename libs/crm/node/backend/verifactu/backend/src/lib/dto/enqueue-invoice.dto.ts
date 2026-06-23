import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class EnqueueInvoiceDto {
  @ApiProperty({
    description: 'Identificador UUID v4 de la factura a encolar',
    format: 'uuid',
  })
  @IsUUID('4')
  invoiceId!: string;
}
