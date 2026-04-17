/**
 * Debe alinearse con `@josanz-erp/identity-api` / PluginStore (lista de módulos ERP).
 */
export const TENANT_MODULE_IDS: readonly string[] = [
  'dashboard',
  'clients',
  'projects',
  'events',
  'identity',
  'availability',
  'services',
  'reports',
  'audit',
  'inventory',
  'budgets',
  'delivery',
  'fleet',
  'rentals',
  'billing',
  'verifactu',
];

export const TENANT_MODULE_LABELS_ES: Readonly<Record<string, string>> = {
  dashboard: 'Dashboard',
  clients: 'Clientes',
  projects: 'Proyectos',
  events: 'Eventos',
  identity: 'Identidad y usuarios',
  availability: 'Disponibilidad',
  services: 'Servicios',
  reports: 'Informes',
  audit: 'Auditoría',
  inventory: 'Inventario',
  budgets: 'Presupuestos',
  delivery: 'Entregas',
  fleet: 'Flota',
  rentals: 'Alquileres',
  billing: 'Facturación',
  verifactu: 'Verifactu',
};

export function normalizeTenantModuleIds(ids: readonly string[]): string[] {
  const allowed = new Set(TENANT_MODULE_IDS);
  const next = [...new Set(ids.filter((id) => allowed.has(id)))];
  if (!next.includes('dashboard')) {
    next.unshift('dashboard');
  }
  return next;
}
