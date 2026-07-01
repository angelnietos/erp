import type { JosanzStatusPillVariant } from '../components/main-template-card';
import {
  getEventOutlinePill,
} from '../theme/event-status-outline';
import type { JosanzStatusPillKey } from '../theme/josanz-figma-tokens';
import {
  JOSANZ_FIGMA_EVENT_TYPOLOGY_RAILS,
  JOSANZ_FIGMA_HOTEL_RAIL_COLORS,
  JOSANZ_FIGMA_EXTERNAL_CLIENT_RAIL_COLORS,
} from '../theme/josanz-figma-tokens';
import { normalizeHexColor } from './client-rail-presets';

export interface JosanzCatalogListRow {
  id: string;
  /** Título visible en la fila (p. ej. nombre cliente). Por defecto `id`. */
  title?: string;
  leadingMark?: string;
  /** Coincide con pestaña tipología activa (excepto «Todos»). */
  typology?: string;
  /** Filtra por almacén cuando la pestaña contiene «Almacén». */
  warehouse?: string;
  eventName?: string;
  date?: string;
  /** Fecha ISO del evento para filtros temporales (tablero kanban). */
  eventDateIso?: string;
  client?: string;
  operator?: string;
  values?: string[];
  pillLabel: string;
  /** Valor API del estado (p. ej. DRAFT) para tablero kanban. */
  statusValue?: string;
  pillVariant: JosanzStatusPillVariant;
  /** Color personalizado de la pastilla de estado/tipo. */
  pillColor?: string;
  /** Barra lateral izquierda (tipo de evento / hotel). */
  railColor?: string;
  /** Ubicación o nombre de venue (para color de hotel en eventos). */
  venue?: string;
}

export function pillVariantForCatalogStatus(
  status: string,
): JosanzStatusPillVariant {
  const s = status.toLowerCase();
  if (s.includes('borrador')) {
    return 'borrador';
  }
  if (s.includes('sin presupuesto')) {
    return 'sin-presupuesto';
  }
  if (s.includes('en presupuesto') || s.includes('presupuesto')) {
    return 'presupuesto';
  }
  if (s.includes('en preparación') || s.includes('preparacion')) {
    return 'en-preparacion';
  }
  if (s.includes('confirm') || s.includes('aceptado')) {
    return 'confirmado';
  }
  if (s.includes('producción') || s.includes('produccion') || s.includes('alquiler')) {
    return 'en-produccion';
  }
  if (
    s.includes('ejecución') ||
    s.includes('ejecucion') ||
    s.includes('proceso') ||
    s.includes('ruta')
  ) {
    return 'en-ejecucion';
  }
  if (s.includes('cerrado')) {
    return 'cerrado';
  }
  if (s.includes('facturado')) {
    return 'facturado';
  }
  if (s.includes('cancel') || s.includes('rechaz') || s.includes('agotado')) {
    return 'cancelado';
  }
  if (s.includes('incidencia') || s.includes('revisión') || s.includes('revision')) {
    return 'incidencia';
  }
  if (s.includes('inasistencia') || s.includes('ausente')) {
    return 'inasistencia';
  }
  if (s.includes('pospuesto')) {
    return 'pospuesto';
  }
  if (s.includes('finalizado') || s.includes('activo') || s.includes('disponible') || s.includes('stock')) {
    return 'finalizado';
  }
  if (s.includes('técnico') || s.includes('tecnico')) {
    return 'staff-tecnico';
  }
  if (s.includes('prácticas') || s.includes('practicas')) {
    return 'staff-practicas';
  }
  if (s.includes('freelance')) {
    return 'staff-freelance';
  }
  if (s.includes('pendiente') || s.includes('enviado')) {
    return 'presupuesto';
  }
  if (s.includes('nuevo')) {
    return 'cliente-nuevo';
  }
  return 'en-proceso';
}

/** Normaliza texto de venue para comparar nombres de hotel. */
function normalizeVenueKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

/** Color de hotel según nombre/ubicación (Figma: cada hotel tiene su color). */
export function railColorForHotelVenue(venue: string): string | undefined {
  const key = normalizeVenueKey(venue);
  if (!key) {
    return undefined;
  }
  if (key.includes('chamartin')) {
    return JOSANZ_FIGMA_HOTEL_RAIL_COLORS[0];
  }
  if (key.includes('soma')) {
    return JOSANZ_FIGMA_HOTEL_RAIL_COLORS[1];
  }
  if (key.includes('soho')) {
    return JOSANZ_FIGMA_HOTEL_RAIL_COLORS[2];
  }
  if (key.includes('posada')) {
    return JOSANZ_FIGMA_HOTEL_RAIL_COLORS[3];
  }
  if (key.includes('capitol')) {
    return JOSANZ_FIGMA_HOTEL_RAIL_COLORS[4];
  }
  return undefined;
}

function isEventosExternosLabel(text: string): boolean {
  const key = normalizeVenueKey(text);
  return key.includes('eventos externos') || key.includes('externos madrid');
}

function isEspaciosLabel(text: string): boolean {
  const key = normalizeVenueKey(text);
  return key.includes('ifema') || key.includes('espacios');
}

function stablePaletteIndex(seed: string, size: number): number {
  let hash = 0;
  for (const char of normalizeVenueKey(seed)) {
    hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  }
  return hash % size;
}

/** Color estable para clientes externos que no son la categoría «Eventos externos». */
export function railColorForExternalClient(seed: string): string {
  const palette = JOSANZ_FIGMA_EXTERNAL_CLIENT_RAIL_COLORS;
  return palette[stablePaletteIndex(seed, palette.length)] ?? palette[0];
}

/** Tipología Figma (hotel / espacio / externo) a partir del cliente. */
export function clientCategoryTypology(
  name: string,
  sector?: string | null,
): 'Hoteles' | 'Espacios' | 'Externos' {
  const sectorKey = normalizeVenueKey(sector ?? '');
  if (sectorKey.includes('hoteles') || railColorForHotelVenue(name)) {
    return 'Hoteles';
  }
  if (sectorKey.includes('espacios') || isEspaciosLabel(name)) {
    return 'Espacios';
  }
  return 'Externos';
}

export function railColorForClientName(
  id: string,
  name: string,
  sector?: string | null,
): string {
  const typology = clientCategoryTypology(name, sector);
  return railColorForCatalogRow({
    id,
    typology,
    venue: name,
    client: name,
  });
}

/** Color de barra: custom guardado > inferencia Figma (clientes y eventos). */
export function resolveEntityRailColor(params: {
  storedRailColor?: string | null;
  entityId: string;
  name: string;
  sector?: string | null;
  typology?: string;
  venue?: string;
}): string {
  const custom = normalizeHexColor(params.storedRailColor ?? '');
  if (custom) {
    return custom;
  }
  if (params.typology) {
    return railColorForCatalogRow({
      id: params.entityId,
      typology: params.typology,
      venue: params.venue ?? '',
      client: params.name,
    });
  }
  return railColorForClientName(params.entityId, params.name, params.sector);
}

/** Color de la barra lateral según tipología (no el estado del evento). */
export function railColorForCatalogRow(
  row: Pick<JosanzCatalogListRow, 'typology' | 'railColor' | 'id' | 'venue' | 'client'>,
  hotelIndex = 0,
): string {
  if (row.railColor) {
    return row.railColor;
  }

  const typology = row.typology ?? '';
  const venue = row.venue ?? '';
  const client = row.client ?? '';

  if (typology === 'Hoteles') {
    const fromVenue =
      railColorForHotelVenue(venue) ?? railColorForHotelVenue(client);
    if (fromVenue) {
      return fromVenue;
    }
    const idx =
      hotelIndex >= 0
        ? hotelIndex % JOSANZ_FIGMA_HOTEL_RAIL_COLORS.length
        : Number.parseInt(row.id.replace(/\D/g, ''), 10) %
          JOSANZ_FIGMA_HOTEL_RAIL_COLORS.length;
    return JOSANZ_FIGMA_HOTEL_RAIL_COLORS[idx] ?? JOSANZ_FIGMA_HOTEL_RAIL_COLORS[0];
  }

  if (
    typology === 'Espacios' ||
    isEspaciosLabel(venue) ||
    isEspaciosLabel(client)
  ) {
    return JOSANZ_FIGMA_EVENT_TYPOLOGY_RAILS.Espacios;
  }

  const hotelColor =
    railColorForHotelVenue(venue) ?? railColorForHotelVenue(client);
  if (hotelColor) {
    return hotelColor;
  }

  if (isEventosExternosLabel(client) || isEventosExternosLabel(venue)) {
    return JOSANZ_FIGMA_EVENT_TYPOLOGY_RAILS.Externos;
  }

  if (typology === 'Externos') {
    return railColorForExternalClient(client || venue || row.id);
  }

  return '#94A3B8';
}

export function statusPillKeyFromVariant(variant: JosanzStatusPillVariant): JosanzStatusPillKey {
  if (variant === 'primary') {
    return 'borrador';
  }
  if (variant === 'success') {
    return 'confirmado';
  }
  if (variant === 'warning') {
    return 'en-proceso';
  }
  if (variant === 'error') {
    return 'cancelado';
  }
  return variant;
}

/** Color de barra lateral alineado con la pastilla de estado (Figma outline). */
export function railColorForStatusVariant(
  variant: JosanzStatusPillVariant,
  badgeStyle: 'filled' | 'outline' = 'outline',
): string {
  const key = statusPillKeyFromVariant(variant);
  const pill = getEventOutlinePill(key);
  return badgeStyle === 'outline' ? pill.border : pill.text;
}

export const JOSANZ_CATALOG_EVENT_STATUS_ROWS: JosanzCatalogListRow[] = [
  {
    id: '0000000001',
    eventName: 'Nombre del evento',
    date: 'dd/mm/aaaa',
    client: 'Cliente ejemplo',
    operator: 'Operador A',
    typology: 'Externos',
    pillLabel: 'Borrador',
    pillVariant: 'borrador',
  },
  {
    id: '0000000002',
    eventName: 'Nombre del evento',
    date: 'dd/mm/aaaa',
    client: 'Cliente ejemplo',
    operator: 'Operador A',
    typology: 'Hoteles',
    pillLabel: 'En presupuesto',
    pillVariant: 'presupuesto',
  },
  {
    id: '0000000003',
    eventName: 'Nombre del evento',
    date: 'dd/mm/aaaa',
    client: 'Cliente ejemplo',
    operator: 'Operador A',
    typology: 'Espacios',
    pillLabel: 'Confirmado',
    pillVariant: 'confirmado',
  },
  {
    id: '0000000004',
    eventName: 'Nombre del evento',
    date: 'dd/mm/aaaa',
    client: 'Cliente ejemplo',
    operator: 'Operador A',
    typology: 'Externos',
    pillLabel: 'En producción',
    pillVariant: 'en-produccion',
  },
  {
    id: '0000000005',
    eventName: 'Nombre del evento',
    date: 'dd/mm/aaaa',
    client: 'Cliente ejemplo',
    operator: 'Operador A',
    typology: 'Hoteles',
    pillLabel: 'En ejecución',
    pillVariant: 'en-ejecucion',
  },
  {
    id: '0000000006',
    eventName: 'Nombre del evento',
    date: 'dd/mm/aaaa',
    client: 'Cliente ejemplo',
    operator: 'Operador A',
    typology: 'Espacios',
    pillLabel: 'Cerrado',
    pillVariant: 'cerrado',
  },
  {
    id: '0000000007',
    eventName: 'Nombre del evento',
    date: 'dd/mm/aaaa',
    client: 'Cliente ejemplo',
    operator: 'Operador A',
    typology: 'Externos',
    pillLabel: 'Facturado',
    pillVariant: 'facturado',
  },
];

export const JOSANZ_CATALOG_WAREHOUSE_TABS = [
  'Todos',
  'Almacén 01',
  'Almacén 02',
  'Almacén 03',
];

export const JOSANZ_CATALOG_BILLING_TABS = [
  'Todos',
  'Facturas',
  'Abonos',
  'Pendientes',
];

export const JOSANZ_CATALOG_VEHICLE_TABS = [
  'Todos',
  'Disponibles',
  'En ruta',
  'Reservados',
  'Incidencias',
];

export const JOSANZ_CATALOG_STAFF_TABS = [
  'Todos',
  'Oficina',
  'Técnicos',
  'Freelance',
  'Prácticas',
  'Inasistencias',
];

export const JOSANZ_CATALOG_CLIENT_TABS = [
  'Todos',
  'Tipo cliente 1',
  'Tipo cliente 2',
  'Tipo cliente 3',
  'Tipo cliente 4',
];

export const JOSANZ_CATALOG_BUDGET_TABS = [
  'Todos',
  'Enviados',
  'Aceptados',
  'Borradores',
  'Rechazados',
];

export const JOSANZ_CATALOG_USER_TABS = [
  'Todos',
  'Administradores',
  'Operarios',
  'Logística',
];

export const JOSANZ_CATALOG_STATUS_FILTERS = [
  'Todos (80)',
  'Borrador',
  'En presupuesto',
  'Confirmado',
  'En producción (21)',
  'Cerrado (4)',
];
