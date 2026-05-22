import type { JosanzStatusPillVariant } from '@josanz-erp/josanz-ui';

export interface JosanzCatalogListRow {
  id: string;
  eventName: string;
  date: string;
  client: string;
  operator: string;
  pillLabel: string;
  pillVariant: JosanzStatusPillVariant;
}

export function pillVariantForCatalogStatus(status: string): JosanzStatusPillVariant {
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
  if (s.includes('confirm')) {
    return 'confirmado';
  }
  if (s.includes('producción') || s.includes('produccion')) {
    return 'en-produccion';
  }
  if (s.includes('ejecución') || s.includes('ejecucion') || s.includes('proceso')) {
    return 'en-ejecucion';
  }
  if (s.includes('cerrado')) {
    return 'cerrado';
  }
  if (s.includes('facturado')) {
    return 'facturado';
  }
  if (s.includes('cancel')) {
    return 'cancelado';
  }
  if (s.includes('incidencia')) {
    return 'incidencia';
  }
  if (s.includes('inasistencia')) {
    return 'inasistencia';
  }
  if (s.includes('pospuesto')) {
    return 'pospuesto';
  }
  if (s.includes('finalizado')) {
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
  return 'en-proceso';
}

/** Filas de ejemplo con las 7 pastillas de estado del listado Eventos (Figma). */
export const JOSANZ_CATALOG_EVENT_STATUS_ROWS: JosanzCatalogListRow[] = [
  { id: '0000000001', eventName: 'Nombre del evento', date: 'dd/mm/aaaa', client: 'Cliente ejemplo', operator: 'Operador A', pillLabel: 'Borrador', pillVariant: 'borrador' },
  { id: '0000000002', eventName: 'Nombre del evento', date: 'dd/mm/aaaa', client: 'Cliente ejemplo', operator: 'Operador A', pillLabel: 'En presupuesto', pillVariant: 'presupuesto' },
  { id: '0000000003', eventName: 'Nombre del evento', date: 'dd/mm/aaaa', client: 'Cliente ejemplo', operator: 'Operador A', pillLabel: 'Confirmado', pillVariant: 'confirmado' },
  { id: '0000000004', eventName: 'Nombre del evento', date: 'dd/mm/aaaa', client: 'Cliente ejemplo', operator: 'Operador A', pillLabel: 'En producción', pillVariant: 'en-produccion' },
  { id: '0000000005', eventName: 'Nombre del evento', date: 'dd/mm/aaaa', client: 'Cliente ejemplo', operator: 'Operador A', pillLabel: 'En ejecución', pillVariant: 'en-ejecucion' },
  { id: '0000000006', eventName: 'Nombre del evento', date: 'dd/mm/aaaa', client: 'Cliente ejemplo', operator: 'Operador A', pillLabel: 'Cerrado', pillVariant: 'cerrado' },
  { id: '0000000007', eventName: 'Nombre del evento', date: 'dd/mm/aaaa', client: 'Cliente ejemplo', operator: 'Operador A', pillLabel: 'Facturado', pillVariant: 'facturado' },
];

export const JOSANZ_CATALOG_WAREHOUSE_TABS = ['Todos', 'Almacén 01', 'Almacén 02', 'Almacén 03'];

export const JOSANZ_CATALOG_STATUS_FILTERS = [
  'Todos (80)',
  'Borrador',
  'En presupuesto',
  'Confirmado',
  'En producción (21)',
  'Cerrado (4)',
];
