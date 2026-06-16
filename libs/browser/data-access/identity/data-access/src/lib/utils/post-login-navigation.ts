import { getErpTenantSlug } from './erp-tenant-theme';
import {
  getTenantUiShell,
  isDocumentGeneratorUiShell,
  isJosanzFigmaUiShell,
} from './tenant-ui-shell';

export interface PostLoginRouteCandidate {
  path: string;
  plugin?: string;
  permission?: string;
}

/** Rutas ERP clásico (gaming shell). */
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

/** Rutas apps/josanz-web-app (shell Figma / tenant alexis). */
export const FIGMA_POST_LOGIN_ROUTE_CANDIDATES: readonly PostLoginRouteCandidate[] = [
  { path: '/dashboard' },
  { path: '/events', permission: 'events.view' },
  { path: '/clients', permission: 'clients.view' },
  { path: '/equipment', permission: 'products.view' },
  { path: '/vehicles', permission: 'fleet.view' },
  { path: '/staff', permission: 'users.view' },
  { path: '/billing', permission: 'billing.view' },
  { path: '/budgets', permission: 'budgets.view' },
  { path: '/stock', permission: 'products.view' },
  { path: '/users', permission: 'users.view' },
  { path: '/settings' },
];

function hasPermission(permissions: readonly string[], permission: string): boolean {
  return permissions.includes('*') || permissions.includes(permission);
}

/** Home por shell de tenant (sin comprobar permisos). */
export function resolveTenantHomePath(tenantSlug?: string | null): string {
  const slug = tenantSlug ?? getErpTenantSlug();
  const shell = getTenantUiShell(slug);
  if (shell === 'document-generator') {
    return '/documents/list';
  }
  if (shell === 'josanz-figma') {
    return '/dashboard';
  }
  return '/dashboard';
}

export function resolvePostLoginPath(
  enabledPlugins: readonly string[],
  permissions: readonly string[],
  tenantSlug?: string | null,
): string {
  const slug = tenantSlug ?? getErpTenantSlug();
  if (isDocumentGeneratorUiShell(slug)) {
    return '/documents/list';
  }
  const candidates = isJosanzFigmaUiShell(slug)
    ? FIGMA_POST_LOGIN_ROUTE_CANDIDATES
    : POST_LOGIN_ROUTE_CANDIDATES;

  for (const route of candidates) {
    const pluginOk = !route.plugin || enabledPlugins.includes(route.plugin);
    const permissionOk = !route.permission || hasPermission(permissions, route.permission);
    if (pluginOk && permissionOk) {
      return route.path;
    }
  }
  if (isJosanzFigmaUiShell(slug)) {
    return '/dashboard';
  }
  return '/settings';
}
