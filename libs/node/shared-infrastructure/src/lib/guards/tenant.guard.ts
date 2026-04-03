import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TenantContext } from '../middleware/tenant.middleware';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private cls: ClsService<TenantContext>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const tenantId = this.cls.get('tenantId');
    if (!tenantId) {
      throw new UnauthorizedException(
        'Missing or invalid x-tenant-id: send the tenant UUID from login (not a slug or external code like TENANT-PRO-2026).',
      );
    }

    return true;
  }
}
