import type { JosanzCatalogListRow } from './catalog-status';
import { pillVariantForCatalogStatus, resolveEntityRailColor, statusPillKeyFromVariant } from './catalog-status';
import { resolveCatalogPillColor } from './status-pill-presets';
import {
  tenantClientTariffColor,
  tenantEventStatusColor,
  type TenantCatalogTheme,
} from './catalog-theme';
import type { JosanzStatusPillKey } from '../theme/josanz-figma-tokens';

const EVENT_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  BUDGET: 'En presupuesto',
  CONFIRMED: 'Confirmado',
  IN_PRODUCTION: 'En producción',
  IN_EXECUTION: 'En ejecución',
  CLOSED: 'Cerrado',
  INVOICED: 'Facturado',
  CANCELLED: 'Cancelado',
  FINALIZED: 'Finalizado',
  PLANNED: 'Confirmado',
  COMPLETED: 'Finalizado',
};

export interface FigmaCatalogEventSource {
  id: string;
  name: string;
  typology: string;
  status: string;
  statusPillColor?: string | null;
  startDate: string;
  location?: string | null;
  client?: {
    id?: string;
    name: string;
    sector?: string | null;
    railColor?: string | null;
    pillColor?: string | null;
  } | null;
  operator?: { name: string } | null;
}

export interface FigmaCatalogClientSource {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  sector?: string | null;
  tariffLabel?: string | null;
  railColor?: string | null;
  pillColor?: string | null;
  contacts?: Array<{ name: string }>;
}

export function formatCatalogDisplayId(index: number): string {
  return String(index + 1).padStart(10, '0');
}

export function formatCatalogDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function typologyTabFromApi(typology: string): string {
  switch ((typology ?? '').toUpperCase()) {
    case 'HOTEL':
      return 'Hoteles';
    case 'SPACE':
      return 'Espacios';
    case 'EXTERNAL':
    default:
      return 'Externos';
  }
}

export function eventStatusLabel(status: string): string {
  return EVENT_STATUS_LABELS[status.toUpperCase()] ?? status;
}

export function mapEventToCatalogRow(
  event: FigmaCatalogEventSource,
  index: number,
  catalogTheme?: TenantCatalogTheme | null,
): JosanzCatalogListRow {
  const label = eventStatusLabel(event.status);
  const typology = typologyTabFromApi(event.typology);
  const venue = (event.location ?? event.name ?? '').trim();
  const client = event.client?.name ?? '';
  const pillVariant = pillVariantForCatalogStatus(label);
  return {
    id: event.id,
    title: formatCatalogDisplayId(index),
    typology,
    venue,
    eventName: event.name,
    date: formatCatalogDate(event.startDate),
    client,
    operator: event.operator?.name ?? '—',
    pillLabel: label,
    pillVariant,
    pillColor: resolveCatalogPillColor(
      event.statusPillColor,
      pillVariant,
      'outline',
      tenantEventStatusColor(catalogTheme, statusPillKeyFromVariant(pillVariant)),
    ),
    railColor: resolveEntityRailColor({
      storedRailColor: event.client?.railColor,
      entityId: event.client?.id ?? event.id,
      name: client,
      sector: event.client?.sector,
      typology,
      venue,
    }),
  };
}

export function clientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return 'CL';
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function tariffPillVariant(tariff?: string | null): JosanzStatusPillKey {
  const value = (tariff ?? '').toLowerCase();
  if (value.includes('02')) {
    return 'cliente-tipo-green';
  }
  if (value.includes('estándar') || value.includes('estandar')) {
    return 'cliente-tipo-yellow';
  }
  if (value.includes('especial 01') || value.includes('especial')) {
    return 'cliente-tipo-pink';
  }
  return 'cliente-nuevo';
}

function clientTypologyTab(tariff?: string | null): string {
  const value = (tariff ?? '').toLowerCase();
  if (value.includes('02')) {
    return 'Tipo cliente 2';
  }
  if (value.includes('estándar') || value.includes('estandar')) {
    return 'Tipo cliente 3';
  }
  if (value.includes('especial 01')) {
    return 'Tipo cliente 1';
  }
  return 'Tipo cliente 4';
}

export function mapClientToCatalogRow(
  client: FigmaCatalogClientSource,
  index: number,
  catalogTheme?: TenantCatalogTheme | null,
): JosanzCatalogListRow {
  void index;
  const operators = (client.contacts ?? []).map((c) => c.name).filter(Boolean);
  const tariff = client.tariffLabel ?? 'Especial 01';
  const name = client.name;
  const pillVariant = tariffPillVariant(tariff);
  return {
    id: client.id,
    title: name,
    leadingMark: clientInitials(name),
    typology: clientTypologyTab(tariff),
    client: name,
    values: [
      client.phone || '—',
      client.email || '—',
      operators.length ? operators.join(', ') : '—',
    ],
    pillLabel: tariff,
    pillVariant,
    pillColor: resolveCatalogPillColor(
      client.pillColor,
      pillVariant,
      'filled',
      tenantClientTariffColor(catalogTheme, tariff),
    ),
    railColor: resolveEntityRailColor({
      storedRailColor: client.railColor,
      entityId: client.id,
      name,
      sector: client.sector,
    }),
  };
}

export function countActiveEvents(events: FigmaCatalogEventSource[]): number {
  const activeStatuses = new Set([
    'CONFIRMED',
    'IN_PRODUCTION',
    'IN_EXECUTION',
    'BUDGET',
    'PLANNED',
  ]);
  return events.filter((event) => activeStatuses.has(event.status.toUpperCase())).length;
}
