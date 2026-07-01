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

export class UpdateTechnicianBodyDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
