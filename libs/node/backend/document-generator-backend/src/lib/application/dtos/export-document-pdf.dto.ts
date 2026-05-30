import { IsString, MaxLength } from 'class-validator';

export class ExportDocumentPdfDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(2_000_000)
  html!: string;
}
