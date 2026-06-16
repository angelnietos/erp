import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import {
  canViewUnmaskedPii,
  redactPiiDeep,
} from '@josanz-erp/shared-utils';
import { JwtRequestUser } from '../utils/request-tenant';

/** Rutas que devuelven datos completos (export RGPD, auth profile). */
const SKIP_PREFIXES = ['/api/privacy/export', '/api/auth/me', '/api/docs'];

@Injectable()
export class PiiRedactionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const url = req.url ?? '';
    if (SKIP_PREFIXES.some((p) => url.includes(p))) {
      return next.handle();
    }

    const user = req.user as JwtRequestUser | undefined;
    if (canViewUnmaskedPii(user?.permissions)) {
      return next.handle();
    }

    return next.handle().pipe(map((data) => redactPiiDeep(data)));
  }
}
