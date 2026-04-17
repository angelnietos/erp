import { IsArray, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/** Body POST /api/technicians/:id/availability (requerido por ValidationPipe global). */
export class SetAvailabilityBodyDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class BulkSlotDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkAvailabilityBodyDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkSlotDto)
  slots!: BulkSlotDto[];
}
