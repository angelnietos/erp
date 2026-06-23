import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class PatchVerifactuSettingsDto {
  /**
   * NIF/CIF del obligado emisor (España). `null` o cadena vacía borra el valor guardado.
   * Omitir el campo no modifica el valor actual.
   */
  @ApiPropertyOptional({
    description:
      'NIF/CIF del obligado emisor. `null` borra el valor; omitir no modifica.',
    nullable: true,
    maxLength: 32,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null) {
      return null;
    }
    if (value === '' || value === undefined) {
      return undefined;
    }
    return String(value).trim();
  })
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  @MaxLength(32)
  @Matches(/^[A-Z0-9]{5,32}$/i, {
    message: 'NIF/CIF: 5–32 caracteres alfanuméricos',
  })
  emitterTaxId?: string | null;
}
