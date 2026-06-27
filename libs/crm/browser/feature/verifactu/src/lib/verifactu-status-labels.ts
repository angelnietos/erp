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

export function verifactuStatusLabel(status: string | undefined): string {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'Pendiente AEAT';
    case 'SENT':
      return 'Enviada AEAT';
    case 'ERROR':
      return 'Error AEAT';
    case 'REJECTED':
      return 'Rechazada AEAT';
    case 'CANCELLED':
      return 'Anulada AEAT';
    default:
      return status ?? 'Sin envío';
  }
}
