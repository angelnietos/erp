import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

export interface TenantContext {
  tenantId: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService<TenantContext>) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant ID from headers or JWT payload (in a real scenario, this would likely be part of the JWT validator)
    const tenantId = req.headers['x-tenant-id'] as string;
    
    // In local dev/testing mode, fallback to trying to parse from subdomain if needed, or simply let it be null.
    if (tenantId) {
      this.cls.set('tenantId', tenantId);
    }
    
    next();
  }
}
