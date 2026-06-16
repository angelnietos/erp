import { Injectable, NestMiddleware, Logger, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { BFF_SESSION_STORE, BffSessionStorePort } from './bff-session.store';
import { ERP_BFF_COOKIE_NAMES, PLATFORM_BFF_COOKIE_NAMES } from './bff-session.entity';
import { readCookie } from './bff-cookie.util';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const CSRF_EXEMPT_PREFIXES = [
  '/api/bff/auth/login',
  '/api/bff/auth/logout',
  '/api/bff/platform/auth/login',
  '/api/bff/platform/auth/logout',
  '/api/auth/login',
  '/api/platform/auth/login',
  '/api/health',
];

function isCsrfExempt(path: string): boolean {
  return CSRF_EXEMPT_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));
}

@Injectable()
export class BffSessionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(BffSessionMiddleware.name);

  constructor(
    @Inject(BFF_SESSION_STORE) private readonly sessions: BffSessionStorePort,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const path = (req.originalUrl ?? req.url ?? req.path ?? '').split('?')[0];
    const cookies = (req as Request & { cookies?: Record<string, string> }).cookies ?? {};

    const platformSid = readCookie(cookies, PLATFORM_BFF_COOKIE_NAMES.session);
    const erpSid = readCookie(cookies, ERP_BFF_COOKIE_NAMES.session);
    const sessionId = platformSid ?? erpSid;
    const cookieNames = platformSid ? PLATFORM_BFF_COOKIE_NAMES : ERP_BFF_COOKIE_NAMES;

    if (sessionId) {
      const session = await this.sessions.get(sessionId);
      if (session) {
        if (!req.headers.authorization) {
          req.headers.authorization = `Bearer ${session.accessToken}`;
        }
        if (session.tenantId && !req.headers['x-tenant-id']) {
          req.headers['x-tenant-id'] = session.tenantId;
        }
        (req as Request & { bffSessionId?: string; bffCsrfToken?: string }).bffSessionId = sessionId;
        (req as Request & { bffCsrfToken?: string }).bffCsrfToken = session.csrfToken;

        if (MUTATING.has(req.method) && !isCsrfExempt(path)) {
          const headerToken = req.headers['x-csrf-token'];
          const cookieToken = readCookie(cookies, cookieNames.csrf);
          const token = typeof headerToken === 'string' ? headerToken : Array.isArray(headerToken) ? headerToken[0] : '';
          if (!token || !cookieToken || token !== cookieToken || token !== session.csrfToken) {
            res.status(403).json({
              statusCode: 403,
              message: 'CSRF token inválido o ausente',
              error: 'Forbidden',
            });
            return;
          }
        }
      } else {
        this.logger.debug(`Stale BFF session cookie: ${sessionId}`);
      }
    }

    next();
  }
}
