import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { Prisma } from '@prisma/client';
import { AuditLogWriterService } from '../audit/audit-log-writer.service';
import { JwtRequestUser, getRequestTenantId } from '../utils/request-tenant';
import { redactPiiDeep } from '@josanz-erp/shared-utils';

/**
 * Interceptor global para auditar automáticamente mutaciones (POST, PUT, PATCH, DELETE).
 * Captura quién hizo qué y sobre qué recurso base.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditLogWriter: AuditLogWriterService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body } = request;
    const user = request.user as JwtRequestUser | undefined;

    // Solo auditamos mutaciones
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    if (!isMutation || !user) {
      return next.handle();
    }

    // Evitamos auditar el propio log de auditoría o rutas de salud/docs
    if (
      url.includes('/audit-logs') ||
      url.includes('/health') ||
      url.includes('/docs') ||
      url.includes('/privacy')
    ) {
      return next.handle();
    }

    const tenantId = getRequestTenantId(request);
    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.ip ||
      request.socket?.remoteAddress;
    const userAgent = request.headers['user-agent'];

    return next.handle().pipe(
      tap({
        next: (response) => {
          this.logAction(user, method, url, body, response, tenantId, ipAddress, userAgent);
        },
        error: (err) => {
          // Opcional: auditar intentos fallidos con flag de error
          this.logger.debug(
            `Mutation failed: ${method} ${url} - ${err.message}`,
          );
        },
      }),
    );
  }

  private async logAction(
    user: JwtRequestUser,
    method: string,
    url: string,
    body: unknown,
    response: unknown,
    tenantId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      const action = this.mapMethodToAction(method);
      const entity = this.inferEntityFromUrl(url);
      const safeBody =
        body && typeof body === 'object' ? redactPiiDeep(body) : body;
      const safeResponse =
        response && typeof response === 'object'
          ? redactPiiDeep(response)
          : response;

      const bodyRec = safeBody as Record<string, unknown> | undefined;
      const responseRec = safeResponse as Record<string, unknown> | undefined;

      const entityName =
        (bodyRec?.['name'] as string | undefined) ||
        (bodyRec?.['title'] as string | undefined) ||
        (responseRec?.['name'] as string | undefined) ||
        (responseRec?.['title'] as string | undefined) ||
        undefined;
      const targetId =
        (responseRec?.['id'] as string | undefined) ||
        url.split('/').pop() ||
        'unknown';

      // Skip audit if userId is "unknown" (platform users without platformUser record)
      const userId = user.sub;
      if (!userId || userId === 'unknown') {
        return;
      }

      await this.auditLogWriter.record(userId, {
        action,
        targetEntity: `${entity}:${targetId}`,
        tenantId,
        ipAddress,
        userAgent,
        changesJson: {
          tenantId,
          entityType: entity.toUpperCase(),
          entityName,
          details: `Acción automática via API: ${method} ${url}`,
          requestBody: safeBody as Prisma.InputJsonValue,
          metadata: {
            path: url,
            method,
          },
        } as Prisma.InputJsonValue,
      });
    } catch (err) {
      this.logger.error('Failed to auto-audit action', err);
    }
  }

  private mapMethodToAction(method: string): string {
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return 'ACTION';
    }
  }

  private inferEntityFromUrl(url: string): string {
    const parts = url.split('/').filter((p) => p && p !== 'api');
    return parts[0] || 'System';
  }
}
