import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/** JWT debe incluir el rol `PlatformOwner` (cuenta en tabla `platform_users`, panel SaaS). */
export const PLATFORM_OWNER_ROLE = 'PlatformOwner';

@Injectable()
export class PlatformOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: { roles?: string[] } }>();
    const roles = req.user?.roles ?? [];
    if (!roles.includes(PLATFORM_OWNER_ROLE)) {
      throw new ForbiddenException('Se requiere rol PlatformOwner.');
    }
    return true;
  }
}
