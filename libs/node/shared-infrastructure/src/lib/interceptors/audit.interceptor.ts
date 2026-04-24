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
import { AuditLogWriterService } from '../audit/audit-log-writer.service';
import { JwtRequestUser, getRequestTenantId } from '../utils/request-tenant';

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
    if (url.includes('/audit-logs') || url.includes('/health') || url.includes('/docs')) {
      return next.handle();
    }

    const tenantId = getRequestTenantId(request);

    return next.handle().pipe(
      tap({
        next: (response) => {
          this.logAction(user, method, url, body, response, tenantId);
        },
        error: (err) => {
          // Opcional: auditar intentos fallidos con flag de error
          this.logger.debug(`Mutation failed: ${method} ${url} - ${err.message}`);
        },
      }),
    );
  }

  private async logAction(
    user: JwtRequestUser,
    method: string,
    url: string,
    body: any,
    response: any,
    tenantId?: string,
  ) {
    try {
      const action = this.mapMethodToAction(method);
      const entity = this.inferEntityFromUrl(url);
      
      // Intentamos extraer un nombre legible si es una creación/actualización
      const entityName = body?.name || body?.title || response?.name || response?.title || undefined;
      const targetId = response?.id || url.split('/').pop() || 'unknown';

      await this.auditLogWriter.record(user.sub, {
        action,
        targetEntity: `${entity}:${targetId}`,
        changesJson: {
          tenantId, // Guardamos el tenantId explícitamente para búsquedas y Platform Users
          entityType: entity.toUpperCase(),
          entityName,
          details: `Acción automática via API: ${method} ${url}`,
          metadata: {
            path: url,
            method
          }
        },
      });
    } catch (err) {
      this.logger.error('Failed to auto-audit action', err);
    }
  }

  private mapMethodToAction(method: string): string {
    switch (method) {
      case 'POST': return 'CREATE';
      case 'PUT':
      case 'PATCH': return 'UPDATE';
      case 'DELETE': return 'DELETE';
      default: return 'ACTION';
    }
  }

  private inferEntityFromUrl(url: string): string {
    const parts = url.split('/').filter(p => p && p !== 'api');
    return parts[0] || 'System';
  }
}
