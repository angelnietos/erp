import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService, ClsStore } from 'nestjs-cls';
import { isTenantUuid } from '../utils/tenant-uuid';

export interface TenantContext extends ClsStore {
  tenantId: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService<TenantContext>) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant ID from headers or JWT payload (in a real scenario, this would likely be part of the JWT validator)
    const raw = req.headers['x-tenant-id'] as string | undefined;
    const tenantId = raw?.trim();
    if (tenantId && isTenantUuid(tenantId)) {
      this.cls.set('tenantId', tenantId);
    }
    
    next();
  }
}
