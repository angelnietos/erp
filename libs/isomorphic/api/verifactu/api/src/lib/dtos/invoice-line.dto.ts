import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class InvoiceLineDto {
  @IsString()
  description!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsNumber()
  total!: number;
}
