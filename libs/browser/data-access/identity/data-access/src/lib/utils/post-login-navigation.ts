export interface PostLoginRouteCandidate {
  path: string;
  plugin?: string;
  permission?: string;
}

/** Debe alinearse con `app.routes.ts` (plugin + permiso por módulo). */
export const POST_LOGIN_ROUTE_CANDIDATES: readonly PostLoginRouteCandidate[] = [
  { path: '/dashboard', plugin: 'dashboard', permission: 'dashboard.view' },
  { path: '/projects', plugin: 'projects', permission: 'projects.view' },
  { path: '/events', plugin: 'events', permission: 'events.view' },
  { path: '/services', plugin: 'services', permission: 'services.view' },
  { path: '/reports', plugin: 'reports', permission: 'reports.view' },
  { path: '/audit', plugin: 'audit', permission: 'audit.view' },
  { path: '/receipts', plugin: 'receipts', permission: 'receipts.view' },
  { path: '/budgets', plugin: 'budgets', permission: 'budgets.view' },
  { path: '/inventory', plugin: 'inventory', permission: 'products.view' },
  { path: '/delivery', plugin: 'delivery', permission: 'delivery.view' },
  { path: '/fleet', plugin: 'fleet', permission: 'fleet.view' },
  { path: '/billing', plugin: 'billing', permission: 'billing.view' },
  { path: '/verifactu', plugin: 'verifactu', permission: 'verifactu.view' },
  { path: '/clients', plugin: 'clients', permission: 'clients.view' },
  { path: '/rentals', plugin: 'rentals', permission: 'rentals.view' },
  { path: '/ai-insights', plugin: 'ai-insights', permission: 'ai.view' },
  { path: '/users', plugin: 'identity', permission: 'users.view' },
  { path: '/users', plugin: 'availability', permission: 'users.view' },
];

function hasPermission(permissions: readonly string[], permission: string): boolean {
  return permissions.includes('*') || permissions.includes(permission);
}

export function resolvePostLoginPath(
  enabledPlugins: readonly string[],
  permissions: readonly string[],
): string {
  for (const route of POST_LOGIN_ROUTE_CANDIDATES) {
    const pluginOk = !route.plugin || enabledPlugins.includes(route.plugin);
    const permissionOk =
      !route.permission || hasPermission(permissions, route.permission);
    if (pluginOk && permissionOk) {
      return route.path;
    }
  }
  return '/settings';
}
