const EVENT_DELETE_ADMIN_ROLES = new Set([
  'SuperAdmin',
  'Administrador',
  'clientAdmin',
  'admin',
  'TenantAdmin',
]);

export function isEventDeleteAdmin(roles: string[], permissions: string[]): boolean {
  if (permissions.includes('*')) {
    return true;
  }
  return roles.some((role) => EVENT_DELETE_ADMIN_ROLES.has(role));
}

export function canUserDeleteEvent(
  createdByUserId: string | null | undefined,
  actorUserId: string,
  roles: string[],
  permissions: string[],
): boolean {
  if (isEventDeleteAdmin(roles, permissions)) {
    return true;
  }
  if (!createdByUserId) {
    return false;
  }
  return createdByUserId === actorUserId;
}
