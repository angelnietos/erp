import {
  ALL_APP_PERMISSION_IDS,
  filterPermissionsToEnabledModules,
} from '@josanz-erp/identity-api';

/** Fusiona permisos de roles + extra, resta denegados y filtra por módulos activos. */
export function mergeEffectiveUserPermissions(
  rolePermissions: readonly string[],
  extraPermissions: readonly string[],
  deniedPermissions: readonly string[],
  enabledModuleIds: readonly string[],
): string[] {
  const denied = new Set(deniedPermissions);
  if (denied.has('*')) {
    return [];
  }

  const hasWildcard =
    rolePermissions.includes('*') || extraPermissions.includes('*');

  if (hasWildcard) {
    const expanded = ALL_APP_PERMISSION_IDS.filter((p) => !denied.has(p));
    const merged =
      denied.size === 0
        ? ['*', ...expanded]
        : expanded;
    return filterPermissionsToEnabledModules(merged, enabledModuleIds);
  }

  const merged = new Set<string>();
  for (const p of rolePermissions) {
    if (!denied.has(p)) {
      merged.add(p);
    }
  }
  for (const p of extraPermissions) {
    if (!denied.has(p)) {
      merged.add(p);
    }
  }
  return filterPermissionsToEnabledModules(Array.from(merged), enabledModuleIds);
}

export function userHasAnyPermission(
  permissions: readonly string[] | undefined,
  required: readonly string[],
): boolean {
  const p = permissions ?? [];
  if (p.includes('*')) {
    return true;
  }
  return required.some((perm) => p.includes(perm));
}
