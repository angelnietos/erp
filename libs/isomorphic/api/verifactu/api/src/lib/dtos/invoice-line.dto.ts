export class InvoiceLineDto {
  description!: string;
  quantity!: number;
  unitPrice!: number;
  discount?: number;
  total!: number;
}
