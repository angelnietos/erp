export class CreateSeriesDto {
  name: string;
  prefix: string;
  nextNumber?: number;
  padding?: number;
  type: string;
  year: number;
  automaticNumbering?: boolean;
  resetYearly?: boolean;
}

export class UpdateSeriesDto extends CreateSeriesDto {
  active?: boolean;
}

export class SeriesResponseDto {
  id: string;
  name: string;
  prefix: string;
  nextNumber: number;
  padding: number;
  type: string;
  year: number;
  active: boolean;
  automaticNumbering: boolean;
  resetYearly: boolean;
  sellerNif: string;
  createdAt: Date;
  updatedAt: Date;
}

export class NextNumberDto {
  invoiceNumber: string;
}
