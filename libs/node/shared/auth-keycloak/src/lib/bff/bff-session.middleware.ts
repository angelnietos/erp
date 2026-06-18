import { Injectable, NestMiddleware, Logger, Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { BFF_SESSION_STORE, BffSessionStorePort } from './bff-session.store';
import { ERP_BFF_COOKIE_NAMES, PLATFORM_BFF_COOKIE_NAMES } from './bff-session.entity';
import { readCookie, clearBffSessionCookies } from './bff-cookie.util';
import { BFF_SESSION_RENEWER, BffSessionRenewerPort } from './bff-session-renewer.port';
import { readJwtExpiresAtMs } from './jwt-exp.util';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const RENEW_BEFORE_MS = 5 * 60 * 1000;

const CSRF_EXEMPT_PREFIXES = [
  '/api/bff/auth/login',
  '/api/bff/auth/logout',
  '/api/bff/platform/auth/login',
  '/api/bff/platform/auth/logout',
  '/api/auth/login',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/platform/auth/login',
  '/api/health',
];

function isCsrfExempt(path: string): boolean {
  return CSRF_EXEMPT_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));
}

function sessionMaxAgeMs(config: ConfigService): number {
  const hours = parseInt(config.get<string>('BFF_SESSION_MAX_AGE_HOURS') ?? '24', 10);
  return Number.isFinite(hours) && hours > 0 ? hours * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
}

@Injectable()
export class BffSessionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(BffSessionMiddleware.name);

  constructor(
    @Inject(BFF_SESSION_STORE) private readonly sessions: BffSessionStorePort,
    private readonly config: ConfigService,
    @Optional() @Inject(BFF_SESSION_RENEWER) private readonly renewer?: BffSessionRenewerPort,
  ) {}

  private async resolveAccessToken(
    sessionId: string,
    session: NonNullable<Awaited<ReturnType<BffSessionStorePort['get']>>>,
  ): Promise<string> {
    let accessToken = session.accessToken;
    const expMs = readJwtExpiresAtMs(accessToken);
    const needsRenew = !expMs || expMs - Date.now() < RENEW_BEFORE_MS;

    let renewal: Awaited<ReturnType<BffSessionRenewerPort['renewAccessToken']>> = null;
    if (needsRenew && this.renewer) {
      renewal = await this.renewer.renewAccessToken(session);
      if (renewal) {
        accessToken = renewal.accessToken;
      }
    }

    const patch: {
      accessToken?: string;
      refreshToken?: string;
      expiresAt: number;
    } = {
      expiresAt: Date.now() + sessionMaxAgeMs(this.config),
    };
    if (accessToken !== session.accessToken) {
      patch.accessToken = accessToken;
    }
    if (renewal?.refreshToken && renewal.refreshToken !== session.refreshToken) {
      patch.refreshToken = renewal.refreshToken;
    }
    await this.sessions.update(sessionId, patch);

    return accessToken;
  }

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
        const accessToken = await this.resolveAccessToken(sessionId, session);

        if (!req.headers.authorization) {
          req.headers.authorization = `Bearer ${accessToken}`;
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
        clearBffSessionCookies(res, cookieNames);
      }
    }

    next();
  }
}
