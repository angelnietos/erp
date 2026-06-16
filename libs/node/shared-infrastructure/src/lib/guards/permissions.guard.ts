import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { REQUIRE_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { JwtRequestUser } from '../utils/request-tenant';

function hasAnyPermission(
  permissions: readonly string[] | undefined,
  required: readonly string[],
): boolean {
  const p = permissions ?? [];
  if (p.includes('*')) return true;
  return required.some((perm) => p.includes(perm));
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as JwtRequestUser | undefined;
    if (!hasAnyPermission(user?.permissions, required)) {
      throw new ForbiddenException(
        'Permiso insuficiente para esta operación',
      );
    }
    return true;
  }
}
