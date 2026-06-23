export function queueStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Pendiente';
    case 'PROCESSING':
      return 'Procesando';
    case 'FORWARDED':
      return 'Reenviado ERP';
    case 'COMPLETED':
      return 'Completado';
    case 'FAILED':
      return 'Error';
    default:
      return status;
  }
}

export function logStatusLabel(status: string): string {
  switch (status) {
    case 'SUCCESS':
      return 'Éxito';
    case 'ERROR':
      return 'Error';
    default:
      return status;
  }
}

export function invoiceStatusLabel(status: string | undefined): string {
  switch (status) {
    case 'DRAFT':
      return 'Borrador';
    case 'ISSUED':
      return 'Emitida';
    case 'CANCELLED':
      return 'Anulada';
    default:
      return status ?? '—';
  }
}
