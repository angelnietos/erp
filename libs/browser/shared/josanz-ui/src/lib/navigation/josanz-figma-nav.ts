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
