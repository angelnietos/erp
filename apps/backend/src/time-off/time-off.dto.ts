import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateTimeOffRequestDto {
  @IsIn(['VACATION', 'ABSENCE'])
  kind!: 'VACATION' | 'ABSENCE';

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  /** Solo RRHH / `users.manage`: solicitar en nombre de otro técnico. */
  @IsOptional()
  @IsUUID()
  technicianId?: string;

  /** Si kind === ABSENCE: sick | permit | legal */
  @IsOptional()
  @IsIn(['sick', 'permit', 'legal'])
  absenceSubtype?: 'sick' | 'permit' | 'legal';
}
