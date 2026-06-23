import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRectificativaDto {
  /** S sustitución · I diferencias (AEAT TipoRectificativa). */
  @IsIn(['S', 'I'])
  rectificationType!: 'S' | 'I';

  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  reason!: string;

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  number?: string;
}
