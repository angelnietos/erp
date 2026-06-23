import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import { Request } from 'express';
import { JwtRequestUser } from '../utils/request-tenant';
import { isTenantUuid } from '../utils/tenant-uuid';
import { TenantClsStore } from '../guards/tenant.guard';

@Injectable()
export class ClsTenantFromJwtInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService<TenantClsStore>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as JwtRequestUser | undefined;
    if (user?.tenantId && isTenantUuid(user.tenantId)) {
      this.cls.set('tenantId', user.tenantId.trim());
    }
    return next.handle();
  }
}
