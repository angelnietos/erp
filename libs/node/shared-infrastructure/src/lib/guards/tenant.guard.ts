import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SKIP_TENANT_GUARD_KEY } from '../decorators/skip-tenant.decorator';
import { TenantContext } from '../middleware/tenant.middleware';
import { PrismaService } from '../prisma/prisma.service';
import { JwtRequestUser, isPlatformAdmin } from '../utils/request-tenant';
import { isTenantUuid } from '../utils/tenant-uuid';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private cls: ClsService<TenantContext>,
    private prisma: PrismaService,
  ) {}

  private extractTenantIdFromJwt(request: any): string | null {
    const authHeader = request.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.substring(7);
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      // Handle base64url encoding (JWT uses base64url, not base64)
      let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if needed
      const pad = payload.length % 4;
      if (pad) payload += '='.repeat(4 - pad);
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
      const tenantId = decoded?.tenant_id ?? decoded?.tenantId;
      if (typeof tenantId === 'string' && isTenantUuid(tenantId)) {
        return tenantId.trim();
      }
    } catch {
      // ignore JWT parsing errors
    }
    return null;
  }

  private hasPlatformAdminRoles(request: any): boolean {
    const authHeader = request.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    const token = authHeader.substring(7);
    try {
      const parts = token.split('.');
      if (parts.length < 2) return false;
      let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const pad = payload.length % 4;
      if (pad) payload += '='.repeat(4 - pad);
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
      const realmRoles = decoded?.realm_access?.roles ?? [];
      const clientRoles = Array.isArray(decoded?.client_roles)
        ? decoded.client_roles
        : decoded?.client_roles && typeof decoded.client_roles === 'object'
          ? Object.values(decoded.client_roles).flat()
          : [];
      const allRoles = [...realmRoles, ...clientRoles];
      return allRoles.some((r: string) =>
        ['PlatformAdmin', 'PlatformOwner'].includes(r),
      );
    } catch {
      return false;
    }
  }

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

    const request = context.switchToHttp().getRequest();

    // Check if user is platform admin (cross-tenant access) - check JWT without relying on JwtAuthGuard
    const isPlatformAdminJwt = this.hasPlatformAdminRoles(request);
    if (isPlatformAdminJwt) {
      // Still extract tenantId from JWT for platform admins to access tenant-specific endpoints
      const extractedId = this.extractTenantIdFromJwt(request);
      if (extractedId) {
        this.cls.set('tenantId', extractedId);
        return true;
      }
      // Platform admins can provide tenantId via query/header - allow them to proceed
      return true;
    }
    
    // Check from CLS/user (if JwtAuthGuard already ran)
    const user = request.user as JwtRequestUser | undefined;
    if (user && isPlatformAdmin(user as JwtRequestUser)) {
      // Still extract tenantId from user for platform admins
      if (user.tenantId && isTenantUuid(user.tenantId)) {
        this.cls.set('tenantId', user.tenantId.trim());
        return true;
      }
      // Platform admins can provide tenantId via query/header - allow them to proceed
      return true;
    }

    // Primero intentar conseguir tenantId del CLS (establecido por middleware)
    let tenantId: string | undefined = this.cls.get('tenantId');
    
    // Si no hay en CLS, intentar obtener del JWT (para Keycloak tokens sin header)
    if (!tenantId) {
      const extractedId = this.extractTenantIdFromJwt(request);
      if (extractedId) {
        tenantId = extractedId;
        this.cls.set('tenantId', tenantId);
      }
    }
    
    // Finalmente, intentar desde req.user (si ya fue autenticado por JwtAuthGuard)
    if (!tenantId) {
      if (user?.tenantId && isTenantUuid(user.tenantId)) {
        tenantId = user.tenantId.trim();
        this.cls.set('tenantId', tenantId);
      }
    }
    
    if (!tenantId) {
      throw new UnauthorizedException(
        'Missing or invalid x-tenant-id: send the tenant UUID from login (not a slug or external code like TENANT-PRO-2026).',
      );
    }

    // Validate tenant existence in DB to prevent spoofing or invalid UUIDs
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId, isActive: true },
      select: { id: true },
    });

    if (!tenant) {
      throw new ForbiddenException(
        `Tenant with ID "${tenantId}" not found or is inactive.`,
      );
    }

    return true;
  }
}
