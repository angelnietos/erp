import { ForbiddenException } from '@nestjs/common';
import { userHasAnyPermission } from './permission-merge';

type JwtUser = { permissions?: string[] };

export function assertUserPermissions(
  user: JwtUser | undefined,
  required: readonly string[],
  message = 'No tienes permiso para realizar esta acción.',
): void {
  if (!userHasAnyPermission(user?.permissions, required)) {
    throw new ForbiddenException(message);
  }
}
