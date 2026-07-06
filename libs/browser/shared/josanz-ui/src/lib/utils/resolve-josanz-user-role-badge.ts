/** Insignia visual de rol elevado en shell Figma. */
export type JosanzUserRoleBadge = 'superadmin' | 'admin' | 'manager' | 'operator';

const SUPER_ADMIN_ROLE_NAMES = new Set(['superadmin', 'office_superadmin', 'SuperAdmin']);
const ADMIN_ROLE_NAMES = new Set(['administrador', 'admin babooni', 'office_admin', 'Administrador']);
const MANAGER_ROLE_NAMES = new Set(['manager', 'office_manager', 'Jefe de proyecto', 'Project Manager']);
const OPERATOR_ROLE_NAMES = new Set(['operador', 'operator', 'staff', 'technical']);

function normalizeRoleName(role: string): string {
  return role.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function resolveJosanzUserRoleBadge(
  roles: readonly string[] | null | undefined,
): JosanzUserRoleBadge | null {
  if (!roles?.length) {
    return null;
  }

  const normalized = roles.map(normalizeRoleName);
  if (normalized.some((role) => SUPER_ADMIN_ROLE_NAMES.has(role))) {
    return 'superadmin';
  }
  if (normalized.some((role) => ADMIN_ROLE_NAMES.has(role))) {
    return 'admin';
  }
  if (normalized.some((role) => MANAGER_ROLE_NAMES.has(role))) {
    return 'manager';
  }
  if (normalized.some((role) => OPERATOR_ROLE_NAMES.has(role))) {
    return 'operator';
  }
  return null;
}

export function josanzUserRoleBadgeLabel(badge: JosanzUserRoleBadge): string {
  if (badge === 'superadmin') return 'Super Admin';
  if (badge === 'admin') return 'Admin';
  if (badge === 'manager') return 'Manager';
  return 'Operator';
}
