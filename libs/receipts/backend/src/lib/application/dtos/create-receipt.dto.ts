import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  Min,
  IsIn,
  IsDateString,
} from 'class-validator';

const PAYMENT_METHODS = [
  'BANK_TRANSFER',
  'CASH',
  'CARD',
  'CHECK',
] as const;

const PAYMENT_STATUSES = [
  'PENDING',
  'PAID',
  'OVERDUE',
  'CANCELLED',
] as const;

export class CreateReceiptDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId!: string;

  @IsUUID()
  @IsNotEmpty()
  invoiceId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsDateString()
  @IsNotEmpty()
  dueDate!: string;

  @IsIn(PAYMENT_METHODS)
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateReceiptDto {
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @IsIn(PAYMENT_STATUSES)
  @IsOptional()
  status?: string;

  @IsIn(PAYMENT_METHODS)
  @IsOptional()
  paymentMethod?: string;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
