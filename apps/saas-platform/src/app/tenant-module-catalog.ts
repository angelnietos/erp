/**
 * Debe alinearse con identity-api / PluginStore (lista de módulos ERP).
 */
export const TENANT_MODULE_IDS: readonly string[] = [
  'dashboard',
  'ai-insights',
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
  'ai-insights': 'AI Insights',
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

export type TenantModuleCategory = 'core' | 'operations' | 'finance' | 'intelligence';

export const TENANT_MODULE_CATEGORY_LABELS_ES: Readonly<
  Record<TenantModuleCategory, string>
> = {
  core: 'Core ERP',
  operations: 'Operaciones',
  finance: 'Finanzas',
  intelligence: 'Inteligencia y control',
};

export const TENANT_MODULE_METADATA: Readonly<
  Record<string, { category: TenantModuleCategory; icon: string }>
> = {
  dashboard: { category: 'core', icon: 'grid' },
  clients: { category: 'core', icon: 'users' },
  projects: { category: 'core', icon: 'briefcase' },
  identity: { category: 'core', icon: 'key' },
  events: { category: 'operations', icon: 'calendar' },
  availability: { category: 'operations', icon: 'clock' },
  services: { category: 'operations', icon: 'wrench' },
  inventory: { category: 'operations', icon: 'box' },
  delivery: { category: 'operations', icon: 'truck' },
  fleet: { category: 'operations', icon: 'car' },
  rentals: { category: 'operations', icon: 'repeat' },
  budgets: { category: 'finance', icon: 'calculator' },
  billing: { category: 'finance', icon: 'receipt' },
  verifactu: { category: 'finance', icon: 'shield' },
  'ai-insights': { category: 'intelligence', icon: 'sparkles' },
  reports: { category: 'intelligence', icon: 'chart' },
  audit: { category: 'intelligence', icon: 'history' },
};

export type TenantModuleCatalogEntry = {
  id: string;
  label: string;
  category: TenantModuleCategory;
  icon: string;
};

/** Lista id + etiqueta para UI (panel SaaS). */
export const TENANT_MODULE_CATALOG: readonly TenantModuleCatalogEntry[] =
  TENANT_MODULE_IDS.map((id) => ({
    id,
    label: TENANT_MODULE_LABELS_ES[id] ?? id,
    category: TENANT_MODULE_METADATA[id]?.category ?? 'core',
    icon: TENANT_MODULE_METADATA[id]?.icon ?? 'grid',
  }));

export function normalizeTenantModuleIds(ids: readonly string[]): string[] {
  const allowed = new Set(TENANT_MODULE_IDS);
  return [...new Set(ids.filter((id) => allowed.has(id)))];
}
