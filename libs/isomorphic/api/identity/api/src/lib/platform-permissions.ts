/** Permisos del panel SaaS (`apps/saas-platform`). Namespace separado del ERP. */

export interface PlatformPermissionEntry {
  id: string;
  label: string;
}

export const PLATFORM_PERMISSIONS_CATALOG: readonly PlatformPermissionEntry[] = [
  { id: 'platform.tenants.read', label: 'Ver organizaciones' },
  { id: 'platform.tenants.manage', label: 'Gestionar módulos por tenant' },
  { id: 'platform.modules.manage', label: 'Configurar catálogo de módulos' },
  { id: 'platform.metrics.read', label: 'Ver métricas' },
] as const;

export const ALL_PLATFORM_PERMISSION_IDS: readonly string[] =
  PLATFORM_PERMISSIONS_CATALOG.map((p) => p.id);

/** Permisos efectivos de PlatformOwner / PlatformAdmin (local y Keycloak). */
export const PLATFORM_OWNER_PERMISSIONS: readonly string[] = [
  ...ALL_PLATFORM_PERMISSION_IDS,
];

const PLATFORM_ADMIN_KC_ROLES = ['PlatformOwner', 'PlatformAdmin'] as const;

export function isPlatformAdminRole(role: string): boolean {
  return (PLATFORM_ADMIN_KC_ROLES as readonly string[]).includes(role);
}

/** Mismos permisos de plataforma para login local HS256 y tokens Keycloak. */
export function resolvePlatformPermissionsForRoles(
  roles: readonly string[],
): string[] {
  if (roles.some(isPlatformAdminRole)) {
    return [...PLATFORM_OWNER_PERMISSIONS];
  }
  return [];
}

export function userHasPlatformPermission(
  permissions: readonly string[] | undefined,
  required: string,
): boolean {
  const p = permissions ?? [];
  return p.includes(required) || p.includes('platform.tenants.manage');
}
