export class DocumentLineDto {
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  total: number;
}

export class DocumentTaxItemDto {
  impuesto?: string;
  tipoImpositivo: number;
  baseImponible: number;
  cuota: number;
}

export class CreateCommercialDocumentDto {
  documentNumber: string;
  issueDate: string;
  sellerNif: string;
  sellerName?: string;
  buyerNif?: string;
  buyerName?: string;
  buyerCountry?: string;
  description?: string;
  lines: DocumentLineDto[];
  taxItems: DocumentTaxItemDto[];
  totalAmount: number;
  validUntil?: string;
  customerId?: string;
}
