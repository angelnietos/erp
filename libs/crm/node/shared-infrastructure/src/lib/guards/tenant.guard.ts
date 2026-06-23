import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClsService, ClsStore } from 'nestjs-cls';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SKIP_TENANT_GUARD_KEY } from '../decorators/skip-tenant.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { getRequestTenantId } from '../utils/request-tenant';

export interface TenantClsStore extends ClsStore {
  tenantId?: string;
}

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cls: ClsService<TenantClsStore>,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const skipTenant = this.reflector.getAllAndOverride<boolean>(
      SKIP_TENANT_GUARD_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skipTenant) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const tenantId = getRequestTenantId(req) ?? this.cls.get('tenantId');
    if (tenantId) {
      this.cls.set('tenantId', tenantId);
    }
    if (!tenantId) {
      throw new UnauthorizedException(
        'Falta x-tenant-id (UUID del tenant) o sesión JWT con tenantId.',
      );
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId, isActive: true },
      select: { id: true },
    });
    if (!tenant) {
      // Auto-provision tenant if it comes from an external app unauthenticated or if we want to allow it
      await this.prisma.tenant.create({
        data: {
          id: tenantId,
          name: `External Tenant ${tenantId.slice(0, 8)}`,
          slug: `ext-${tenantId}`,
          isActive: true,
        },
      });
    }
    return true;
  }
}
