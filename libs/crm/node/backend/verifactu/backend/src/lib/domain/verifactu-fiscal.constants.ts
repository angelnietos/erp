export type VerifactuChainRecordKind =
  | 'INVOICE'
  | 'RECTIFICATIVE'
  | 'CANCELLATION';

export type VerifactuInvoiceKind = 'NORMAL' | 'RECTIFICATIVE';

export function resolveChainRecordKind(input: {
  invoiceKind?: string | null;
  operation?: 'CANCELLATION' | null;
}): VerifactuChainRecordKind {
  if (input.operation === 'CANCELLATION') {
    return 'CANCELLATION';
  }
  if (input.invoiceKind === 'RECTIFICATIVE') {
    return 'RECTIFICATIVE';
  }
  return 'INVOICE';
}

export const MOTIVO_ANULACION_LABELS: Record<string, string> = {
  '01': 'Factura incorrecta',
  '02': 'Devolución de bienes o servicios',
  '03': 'Otros motivos',
};

export const RECTIFICATION_TYPE_LABELS: Record<string, string> = {
  S: 'Por sustitución',
  I: 'Por diferencias',
};
