import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelVerifactuInvoiceDto {
  @IsIn(['01', '02', '03'])
  motivoAnulacion!: '01' | '02' | '03';

  @IsOptional()
  @IsString()
  @MaxLength(512)
  additionalInfo?: string;
}
