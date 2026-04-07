import { IsUUID, IsNotEmpty, IsArray, ValidateNested, IsNumber, IsOptional, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

// Re-export from shared API - the source of truth for DTOs
export { CreateBudgetDTO, AddBudgetItemDTO } from '@josanz-erp/budget-api';

// Backend-specific validators (decorated DTOs for NestJS validation)
export class CreateBudgetItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @IsOptional()
  tax?: number;

  @IsNumber()
  @IsOptional()
  discount?: number;
}

export class CreateBudgetDto {
  @IsUUID()
  @IsNotEmpty()
  clientId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetItemDto)
  items: CreateBudgetItemDto[] = [];

  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @IsDateString()
  @IsNotEmpty()
  endDate!: string;
}
