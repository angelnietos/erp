import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import {
  canViewUnmaskedPii,
  redactPiiDeep,
} from '@josanz-erp/shared-utils';
import { JwtRequestUser } from '../utils/request-tenant';

/** Rutas que devuelven datos completos (export RGPD, auth profile, binarios). */
const SKIP_PREFIXES = [
  '/api/privacy/export',
  '/api/auth/me',
  '/api/docs',
  '/api/reports/export',
];

function isNonJsonResponseBody(data: unknown): boolean {
  return data instanceof StreamableFile || Buffer.isBuffer(data);
}

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

    return next.handle().pipe(
      map((data) => (isNonJsonResponseBody(data) ? data : redactPiiDeep(data))),
    );
  }
}
