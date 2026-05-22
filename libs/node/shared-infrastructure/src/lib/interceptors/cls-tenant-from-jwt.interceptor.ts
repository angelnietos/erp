import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import { Request } from 'express';
import { TenantContext } from '../middleware/tenant.middleware';
import { JwtRequestUser } from '../utils/request-tenant';
import { isTenantUuid } from '../utils/tenant-uuid';

/**
 * Tras `JwtAuthGuard`, alinea `ClsService.tenantId` con el tenant del JWT.
 * Repositorios que solo leen CLS (p. ej. proyectos) quedan coherentes con `getRequestTenantId`.
 */
@Injectable()
export class ClsTenantFromJwtInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService<TenantContext>) {}

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
