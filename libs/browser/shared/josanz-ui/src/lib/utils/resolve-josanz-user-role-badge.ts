/** Insignia visual de rol elevado en shell Figma. */
export type JosanzUserRoleBadge = 'superadmin' | 'admin';

const SUPER_ADMIN_ROLE_NAMES = new Set(['superadmin', 'office_superadmin', 'SuperAdmin']);
const ADMIN_ROLE_NAMES = new Set(['administrador', 'admin babooni', 'office_admin', 'Administrador']);

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
  return null;
}

export function josanzUserRoleBadgeLabel(badge: JosanzUserRoleBadge): string {
  return badge === 'superadmin' ? 'Super Admin' : 'Admin';
}
