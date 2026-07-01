import { pillVariantForCatalogStatus, eventStatusLabel } from '@josanz-erp/josanz-ui';
import type { JosanzStatusPillKey } from '@josanz-erp/josanz-ui';
import type { JosanzEventRecord } from './services/josanz-event-api.service';

export const JOSANZ_EVENT_UI_TYPES = ['Evento externo', 'Hotel', 'Espacio'] as const;
export type JosanzEventUiType = (typeof JOSANZ_EVENT_UI_TYPES)[number];

export const JOSANZ_EVENT_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'BUDGET', label: 'En presupuesto' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'IN_PRODUCTION', label: 'En producción' },
  { value: 'IN_EXECUTION', label: 'En ejecución' },
  { value: 'CLOSED', label: 'Cerrado' },
  { value: 'INVOICED', label: 'Facturado' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'FINALIZED', label: 'Finalizado' },
] as const;

export function typologyLabelFromApi(typology?: string | null): JosanzEventUiType {
  switch ((typology ?? '').toUpperCase()) {
    case 'HOTEL':
      return 'Hotel';
    case 'SPACE':
      return 'Espacio';
    default:
      return 'Evento externo';
  }
}

export function statusPillKeyFromApi(status?: string | null): JosanzStatusPillKey {
  const label = eventStatusLabel(status ?? 'DRAFT');
  return pillVariantForCatalogStatus(label) as JosanzStatusPillKey;
}

export function formatEventMetaLine(event: JosanzEventRecord): string {
  const date = new Date(event.startDate);
  const dateLabel = Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
  const operator = event.operator?.name ?? '—';
  const location = event.location?.trim() || '—';
  return `Fecha: ${dateLabel} · Operador: ${operator} · Lugar: ${location}`;
}

export function isoDatePart(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso.slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}
