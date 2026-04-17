import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/** JWT must include this role name (seed: tenant `josanz-platform`, rol `PlatformOwner`). */
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
