export const invoicesPaths = {
  collection: 'invoices',
  issue: (id: string) => `invoices/${id}/issue`,
} as const;

/** Fila de GET /api/invoices (JSON con fechas ISO). */
export interface InvoiceRowDto {
  id: string;
  tenantId?: string;
  clientId?: string | null;
  number?: string | null;
  total?: number;
  currency?: string;
  status?: string;
  issuedAt?: string | null;
  createdAt?: string;
  verifactuStatus?: string;
  client?: {
    id: string;
    name: string;
    taxId?: string | null;
  } | null;
}
