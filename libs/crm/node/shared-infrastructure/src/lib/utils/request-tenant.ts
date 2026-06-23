import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { isTenantUuid } from './tenant-uuid';

export type JwtRequestUser = {
  tenantId?: string;
  sub?: string;
  id?: string;
  email?: string;
};

export function getRequestTenantId(req: Request): string | undefined {
  const user = req.user as JwtRequestUser | undefined;
  const jwtTenant =
    user?.tenantId && isTenantUuid(user.tenantId)
      ? user.tenantId.trim()
      : undefined;
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
      'Falta contexto de tenant (cabecera x-tenant-id o tenantId en JWT)',
    );
  }
  return id;
}
