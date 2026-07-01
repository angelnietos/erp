import type { JosanzSidebarIconKey } from '../components/sidebar';

export interface JosanzFigmaNavItem {
  path: string;
  label: string;
  icon: JosanzSidebarIconKey;
  /** Módulo tenant (`PluginStore`) requerido para mostrar la entrada. */
  moduleId?: string;
  /** Permiso RBAC requerido (omitir = visible si el módulo está activo). */
  permission?: string;
  exact?: boolean;
}

interface JosanzFigmaRouteAccessRule {
  path: string;
  moduleId?: string;
  permission?: string;
  settingsOnly?: boolean;
  exact?: boolean;
}

/** Navegación principal del shell Figma (`josanz-web-app`). */
export const JOSANZ_FIGMA_NAV_ITEMS: readonly JosanzFigmaNavItem[] = [
  { path: '/dashboard', label: 'Inicio', icon: 'inicio', moduleId: 'dashboard', exact: true },
  {
    path: '/events',
    label: 'Eventos',
    icon: 'eventos',
    moduleId: 'events',
    permission: 'events.view',
  },
  {
    path: '/clients',
    label: 'Clientes',
    icon: 'clientes',
    moduleId: 'clients',
    permission: 'clients.view',
  },
  {
    path: '/equipment',
    label: 'Material AV',
    icon: 'material',
    moduleId: 'inventory',
    permission: 'products.view',
  },
  {
    path: '/stock',
    label: 'Stock',
    icon: 'stock',
    moduleId: 'inventory',
    permission: 'products.view',
  },
  {
    path: '/vehicles',
    label: 'Vehículos',
    icon: 'vehiculos',
    moduleId: 'fleet',
    permission: 'fleet.view',
  },
  {
    path: '/staff',
    label: 'Staff',
    icon: 'staff',
    moduleId: 'identity',
    permission: 'users.view',
  },
  {
    path: '/budgets',
    label: 'Presupuestos',
    icon: 'presupuestos',
    moduleId: 'budgets',
    permission: 'budgets.view',
  },
  {
    path: '/billing',
    label: 'Facturación',
    icon: 'facturacion',
    moduleId: 'billing',
    permission: 'billing.view',
  },
];

export const JOSANZ_FIGMA_ROUTE_ACCESS_RULES: readonly JosanzFigmaRouteAccessRule[] = [
  ...JOSANZ_FIGMA_NAV_ITEMS,
  {
    path: '/reports/new',
    moduleId: 'reports',
    permission: 'reports.view',
  },
  {
    path: '/export',
    moduleId: 'reports',
    permission: 'reports.view',
  },
  {
    path: '/users',
    moduleId: 'identity',
    permission: 'users.view',
  },
  {
    path: '/settings',
    settingsOnly: true,
  },
];

export function canAccessJosanzSettings(permissions: readonly string[]): boolean {
  return (
    permissions.includes('*') ||
    permissions.includes('users.view') ||
    permissions.includes('users.manage') ||
    permissions.includes('roles.manage') ||
    permissions.includes('modules.manage')
  );
}

export function filterJosanzFigmaNavItems(
  items: readonly JosanzFigmaNavItem[],
  permissions: readonly string[],
  enabledModules: readonly string[],
): JosanzFigmaNavItem[] {
  const wildcard = permissions.includes('*');

  return items.filter((item) => {
    if (item.moduleId && !enabledModules.includes(item.moduleId)) {
      return false;
    }
    if (!item.permission) {
      return true;
    }
    if (wildcard) {
      return true;
    }
    return permissions.includes(item.permission);
  });
}

export function canAccessJosanzFigmaPath(
  path: string,
  permissions: readonly string[],
  enabledModules: readonly string[],
): boolean {
  const normalized = normalizePath(path);
  const rule = JOSANZ_FIGMA_ROUTE_ACCESS_RULES
    .filter((candidate) => routeMatches(candidate, normalized))
    .sort((a, b) => b.path.length - a.path.length)[0];

  if (!rule) {
    return true;
  }

  if (rule.settingsOnly) {
    return canAccessJosanzSettings(permissions);
  }

  if (rule.moduleId && !enabledModules.includes(rule.moduleId)) {
    return false;
  }

  if (!rule.permission || permissions.includes('*')) {
    return true;
  }

  return permissions.includes(rule.permission);
}

function normalizePath(path: string): string {
  const [withoutQuery] = path.split('?');
  const [withoutHash] = withoutQuery.split('#');
  const trimmed = withoutHash.replace(/\/+$/, '');
  return trimmed || '/';
}

function routeMatches(rule: JosanzFigmaRouteAccessRule, path: string): boolean {
  const base = normalizePath(rule.path);
  if (rule.exact) {
    return path === base;
  }
  return path === base || path.startsWith(`${base}/`);
}
