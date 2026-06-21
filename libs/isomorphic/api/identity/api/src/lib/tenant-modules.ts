/**
 * Módulos ERP activables (PluginStore / rutas). Debe coincidir con la lista del cliente.
 */

export type TenantModuleCategory = 'core' | 'vertical' | 'experimental';

export interface TenantModuleDescriptor {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: TenantModuleCategory;
}

/** Módulos que no pueden desactivarse (mínimo operativo del tenant). */
export const PROTECTED_TENANT_MODULE_IDS: readonly string[] = ['dashboard', 'identity'];

/** Etiquetas para UI (p. ej. panel SaaS). */
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

export const DEFAULT_TENANT_MODULE_IDS: readonly string[] = [
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
] as const;

export const TENANT_MODULE_CATALOG: readonly TenantModuleDescriptor[] = [
  { id: 'dashboard', name: 'Dashboard', description: 'Panel principal con KPIs y resumen operativo del tenant.', icon: 'layout-dashboard', category: 'core' },
  { id: 'ai-insights', name: 'AI Insights', description: 'Módulo de inteligencia artificial con análisis predictivo.', icon: 'cpu', category: 'experimental' },
  { id: 'clients', name: 'Gestión de Clientes', description: 'Módulo CRM para seguimiento de clientes y leads.', icon: 'users', category: 'core' },
  { id: 'projects', name: 'Proyectos y Tareas', description: 'Planificación de producciones y asignación de recursos.', icon: 'file-text', category: 'core' },
  { id: 'events', name: 'Calendario de Eventos', description: 'Gestión de fechas críticas y rodajes.', icon: 'calendar', category: 'core' },
  { id: 'identity', name: 'Identidad y Usuarios', description: 'Control de acceso, roles y seguridad.', icon: 'id-card', category: 'core' },
  { id: 'availability', name: 'Disponibilidad', description: 'Control horario y cuadrante de vacaciones.', icon: 'clock', category: 'vertical' },
  { id: 'services', name: 'Catálogo de Servicios', description: 'Definición de tarifas y servicios prestados.', icon: 'wrench', category: 'vertical' },
  { id: 'reports', name: 'Análisis y Reportes', description: 'KPIs, métricas y exportación de datos.', icon: 'pie-chart', category: 'vertical' },
  { id: 'audit', name: 'Auditoría de Sistema', description: 'Registro de actividad y trazabilidad de cambios.', icon: 'shield-check', category: 'vertical' },
  { id: 'inventory', name: 'Inventario Pro', description: 'Control de stock y trazabilidad de material.', icon: 'package', category: 'core' },
  { id: 'budgets', name: 'Presupuestos', description: 'Gestor de cotizaciones cinematográficas.', icon: 'receipt', category: 'core' },
  { id: 'delivery', name: 'Logística y Albaranes', description: 'Gestión de entregas y salidas de material.', icon: 'truck', category: 'vertical' },
  { id: 'fleet', name: 'Gestión de Flota', description: 'Control de vehículos y transportes de producción.', icon: 'car', category: 'vertical' },
  { id: 'rentals', name: 'Alquileres', description: 'Sistema de reservas y devoluciones.', icon: 'key', category: 'vertical' },
  { id: 'billing', name: 'Facturación', description: 'Gestión de facturas y cobros.', icon: 'history', category: 'core' },
  { id: 'verifactu', name: 'VeriFactu Compliance', description: 'Integración mandatoria con la AEAT.', icon: 'file-check', category: 'vertical' },
] as const;

/**
 * Qué módulos deben estar contratados/activos para que un permiso tenga sentido.
 * `[]` = siempre asignable (p. ej. meta `*`).
 * Clave ausente = permiso desconocido (se trata como permitido por compatibilidad).
 */
const PERMISSION_REQUIRES_MODULES: Record<string, readonly string[]> = {
  '*': [],
  'modules.manage': ['identity'],
  'dashboard.view': ['dashboard'],
  'ai.view': ['ai-insights'],
  'users.view': ['identity'],
  'users.manage': ['identity'],
  'roles.manage': ['identity'],
  'tenants.manage': ['identity'],
  'clients.view': ['clients'],
  'clients.manage': ['clients'],
  'products.view': ['inventory'],
  'products.manage': ['inventory'],
  'inventory.movement': ['inventory'],
  'budgets.view': ['budgets'],
  'budgets.create': ['budgets'],
  'budgets.approve': ['budgets'],
  'invoices.view': ['billing'],
  'invoices.submit': ['verifactu'],
  'rentals.view': ['rentals'],
  'rentals.manage': ['rentals'],
  'rentals.approve': ['rentals'],
  'projects.view': ['projects'],
  'projects.manage': ['projects'],
  'fleet.view': ['fleet'],
  'fleet.manage': ['fleet'],
  'events.view': ['events'],
  'events.manage': ['events'],
  'services.view': ['services'],
  'services.manage': ['services'],
  'reports.view': ['reports'],
  'audit.view': ['audit'],
  'availability.view': ['availability'],
  'delivery.view': ['delivery'],
  'delivery.manage': ['delivery'],
  'billing.view': ['billing'],
  'verifactu.view': ['verifactu'],
  'receipts.view': ['billing'],
};

export function requiredModuleIdsForPermission(
  permissionId: string,
): readonly string[] | undefined {
  if (permissionId === '*') return [];
  return PERMISSION_REQUIRES_MODULES[permissionId];
}

export function isPermissionAllowedForModules(
  permissionId: string,
  enabledModuleIds: readonly string[],
): boolean {
  const required = requiredModuleIdsForPermission(permissionId);
  if (required === undefined) {
    return true;
  }
  if (required.length === 0) {
    return true;
  }
  const set = new Set(enabledModuleIds);
  return required.every((id) => set.has(id));
}

/** Deja solo permisos coherentes con los módulos activos del tenant. */
export function filterPermissionsToEnabledModules(
  permissions: readonly string[],
  enabledModuleIds: readonly string[],
): string[] {
  return permissions.filter((p) =>
    isPermissionAllowedForModules(p, enabledModuleIds),
  );
}

export function normalizeTenantModuleIds(
  ids: readonly string[],
): string[] {
  const allowed = new Set(DEFAULT_TENANT_MODULE_IDS);
  return [...new Set(ids.filter((id) => allowed.has(id)))];
}

/** Permisos ERP agrupados por módulo (para panel SaaS y documentación). */
export function permissionsGroupedByModule(): Readonly<
  Record<string, readonly string[]>
> {
  const byModule: Record<string, Set<string>> = {};
  for (const [permissionId, moduleIds] of Object.entries(
    PERMISSION_REQUIRES_MODULES,
  )) {
    if (permissionId === '*') continue;
    const targets = moduleIds.length === 0 ? ['_global'] : moduleIds;
    for (const moduleId of targets) {
      if (!byModule[moduleId]) {
        byModule[moduleId] = new Set();
      }
      byModule[moduleId].add(permissionId);
    }
  }
  return Object.fromEntries(
    Object.entries(byModule).map(([moduleId, perms]) => [
      moduleId,
      [...perms].sort(),
    ]),
  );
}

/** Permisos ERP activos cuando un módulo está contratado. */
export function permissionsForEnabledModules(
  enabledModuleIds: readonly string[],
): string[] {
  const grouped = permissionsGroupedByModule();
  const enabled = new Set(enabledModuleIds);
  const result = new Set<string>();
  for (const [moduleId, permissionIds] of Object.entries(grouped)) {
    if (moduleId === '_global' || enabled.has(moduleId)) {
      for (const p of permissionIds) {
        result.add(p);
      }
    }
  }
  return [...result].sort();
}
