import type { UserPayload } from '@josanz-erp/identity-api';

const EVENT_DELETE_ADMIN_ROLES = new Set([
  'SuperAdmin',
  'Administrador',
  'clientAdmin',
  'admin',
  'TenantAdmin',
]);

export function isEventDeleteAdmin(user: Pick<UserPayload, 'roles' | 'permissions'> | null): boolean {
  if (!user) {
    return false;
  }
  if (user.permissions.includes('*')) {
    return true;
  }
  return user.roles.some((role) => EVENT_DELETE_ADMIN_ROLES.has(role));
}

export function canUserDeleteEvent(
  event: { createdByUserId?: string | null },
  user: UserPayload | null,
): boolean {
  if (!user) {
    return false;
  }
  if (isEventDeleteAdmin(user)) {
    return true;
  }
  if (!event.createdByUserId) {
    return false;
  }
  return event.createdByUserId === user.id;
}
