import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { isTenantUuid } from './tenant-uuid';

/** Usuario que expone Passport tras JwtStrategy.validate (payload JWT). */
export type JwtRequestUser = {
  tenantId?: string;
  sub?: string;
  email?: string;
};

/**
 * Tenant efectivo para APIs del ERP: `x-tenant-id` (UUID) o `tenantId` del JWT.
 * No usar `req.tenantId` en crudo: Express no lo rellena; antes se caía en `'default'`
 * y Prisma no devolvía filas del tenant real.
 */
export function getRequestTenantId(req: Request): string | undefined {
  const raw = req.headers['x-tenant-id'];
  if (typeof raw === 'string' && isTenantUuid(raw)) {
    return raw.trim();
  }
  const user = req.user as JwtRequestUser | undefined;
  if (user?.tenantId && isTenantUuid(user.tenantId)) {
    return user.tenantId.trim();
  }
  return undefined;
}

export function requireRequestTenantId(req: Request): string {
  const id = getRequestTenantId(req);
  if (!id) {
    throw new BadRequestException(
      'Missing tenant context (x-tenant-id header or JWT tenantId)',
    );
  }
  return id;
}
