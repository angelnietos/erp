/**
 * Módulos ERP activables (PluginStore / rutas). Debe coincidir con la lista del cliente.
 */
export const DEFAULT_TENANT_MODULE_IDS: readonly string[] = [
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
] as const;

/**
 * Qué módulos deben estar contratados/activos para que un permiso tenga sentido.
 * `[]` = siempre asignable (p. ej. meta `*`).
 * Clave ausente = permiso desconocido (se trata como permitido por compatibilidad).
 */
const PERMISSION_REQUIRES_MODULES: Record<string, readonly string[]> = {
  '*': [],
  'dashboard.view': ['dashboard'],
  'ai.view': ['dashboard'],
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
  const next = [...new Set(ids.filter((id) => allowed.has(id)))];
  if (!next.includes('dashboard')) {
    next.unshift('dashboard');
  }
  return next;
}
