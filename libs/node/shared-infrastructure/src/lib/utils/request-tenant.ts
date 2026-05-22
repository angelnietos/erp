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
 * Tenant efectivo para APIs del ERP.
 *
 * Si el JWT trae `tenantId` (usuario de tenant), **ese valor manda** frente a `x-tenant-id`:
 * el header puede quedar desalineado con `localStorage` tras login o cambio de sesión.
 * Sin JWT (p. ej. rutas públicas) se usa solo la cabecera.
 */
export function getRequestTenantId(req: Request): string | undefined {
  const user = req.user as JwtRequestUser | undefined;
  const jwtTenant =
    user?.tenantId && isTenantUuid(user.tenantId) ? user.tenantId.trim() : undefined;
  if (jwtTenant) {
    return jwtTenant;
  }
  const raw = req.headers['x-tenant-id'];
  if (typeof raw === 'string' && isTenantUuid(raw)) {
    return raw.trim();
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
