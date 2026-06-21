import type { JosanzStatusPillVariant } from '../components/main-template-card';

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
  client?: string;
  operator?: string;
  values?: string[];
  pillLabel: string;
  pillVariant: JosanzStatusPillVariant;
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
