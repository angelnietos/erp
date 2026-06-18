import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { randomBytes } from 'crypto';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import {
  ERP_BFF_COOKIE_NAMES,
  PLATFORM_BFF_COOKIE_NAMES,
  BFF_SESSION_STORE,
  BffSessionStorePort,
  KeycloakTokenClient,
  clearBffSessionCookies,
  setBffSessionCookies,
  readCookie,
} from '@josanz-erp/auth-keycloak';
import {
  getTenantKeycloakConfig,
  normalizeAuthTenantSlug,
  tenantUsesKeycloakLogin,
} from '@josanz-erp/identity-api';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../../application/dtos/login.dto';
import { PlatformLoginDto } from '../../application/dtos/platform-login.dto';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class BffAuthService {
  constructor(
    private readonly authService: AuthService,
    @Inject(BFF_SESSION_STORE) private readonly sessions: BffSessionStorePort,
    private readonly keycloak: KeycloakTokenClient,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private sessionMaxAgeMs(): number {
    const hours = parseInt(this.config.get<string>('BFF_SESSION_MAX_AGE_HOURS') ?? '24', 10);
    return Number.isFinite(hours) && hours > 0 ? hours * 60 * 60 * 1000 : SESSION_TTL_MS;
  }

  private newCsrf(): string {
    return randomBytes(32).toString('hex');
  }

  async loginErp(
    dto: LoginDto,
    res: Response,
  ): Promise<{
    user: unknown;
    tenantId: string;
    tenantSlug?: string;
    authMode: 'keycloak' | 'local';
    csrfToken: string;
    accessToken: string;
  }> {
    const slug = normalizeAuthTenantSlug(dto.tenantSlug) || 'josanz';
    const kcConfig = tenantUsesKeycloakLogin(slug)
      ? getTenantKeycloakConfig(slug)
      : undefined;
    let accessToken: string | null = null;
    let refreshToken: string | undefined;
    let expiresAt = Date.now() + this.sessionMaxAgeMs();
    let authMode: 'keycloak' | 'local' = 'local';

    if (kcConfig && this.keycloak.isEnabled()) {
      const reachable = await this.keycloak.isRealmReachable(kcConfig.realm);
      if (reachable) {
        const secret = this.config.get<string>('KEYCLOAK_SPA_CLIENT_SECRET');
        const token = await this.keycloak.passwordGrant({
          realm: kcConfig.realm,
          clientId: kcConfig.clientId,
          clientSecret: secret,
          username: dto.email,
          password: dto.password,
        });
        if (token) {
          accessToken = token.accessToken;
          refreshToken = token.refreshToken;
          authMode = 'keycloak';
        }
      }
    }

    let enriched: Awaited<ReturnType<AuthService['refreshSession']>> | null = null;

    if (accessToken) {
      const payload = this.decodeJwt(accessToken);
      if (!payload?.sub) {
        throw new UnauthorizedException('Token Keycloak inválido');
      }
      const email =
        (typeof payload.email === 'string' && payload.email) ||
        (typeof payload.preferred_username === 'string' && payload.preferred_username) ||
        dto.email;
      const tenantId = await this.resolveTenantIdFromSlug(slug);
      const dbUserId = await this.authService.resolveExistingUserIdByEmail(email, tenantId);
      enriched = await this.authService.refreshSession(dbUserId, tenantId);
      // JWT local firmado por el ERP (incluye tenantId/roles); Keycloak solo valida identidad.
      accessToken = enriched.accessToken;
    } else {
      const local = await this.authService.login(dto);
      accessToken = local.accessToken;
      enriched = {
        accessToken: local.accessToken,
        user: local.user,
        tenantId: local.tenantId,
        tenantSlug: local.tenantSlug,
      };
      authMode = 'local';
    }

    const csrf = this.newCsrf();
    const sessionTtlMs = this.sessionMaxAgeMs();
    expiresAt = Date.now() + sessionTtlMs;
    const session = await this.sessions.create({
      kind: authMode === 'keycloak' ? 'keycloak' : 'local',
      accessToken,
      refreshToken,
      expiresAt,
      tenantId: enriched.tenantId,
      tenantSlug: enriched.tenantSlug,
      csrfToken: csrf,
    });

    setBffSessionCookies(res, ERP_BFF_COOKIE_NAMES, session.id, csrf, sessionTtlMs);

    return {
      user: enriched.user,
      tenantId: enriched.tenantId,
      tenantSlug: enriched.tenantSlug,
      authMode,
      csrfToken: csrf,
      accessToken,
    };
  }

  async loginPlatform(
    dto: PlatformLoginDto,
    res: Response,
  ): Promise<{ user: unknown; authMode: 'keycloak' | 'local'; csrfToken: string; accessToken: string }> {
    const realm =
      this.config.get<string>('KEYCLOAK_PLATFORM_REALM') ?? 'babooni-platform';
    const clientId =
      this.config.get<string>('KEYCLOAK_PLATFORM_CLIENT_ID') ?? 'babooni-saas-platform';

    let accessToken: string | null = null;
    let refreshToken: string | undefined;
    let expiresAt = Date.now() + this.sessionMaxAgeMs();
    let authMode: 'keycloak' | 'local' = 'local';

    if (this.keycloak.isEnabled()) {
      const reachable = await this.keycloak.isRealmReachable(realm);
      if (reachable) {
        const token = await this.keycloak.passwordGrant({
          realm,
          clientId,
          username: dto.email,
          password: dto.password,
        });
        if (token) {
          accessToken = token.accessToken;
          refreshToken = token.refreshToken;
          authMode = 'keycloak';
        }
      }
    }

    let enriched: Awaited<ReturnType<AuthService['refreshPlatformSession']>>;

    if (accessToken) {
      const payload = this.decodeJwt(accessToken);
      const userId = payload?.sub as string | undefined;
      if (!userId) {
        throw new UnauthorizedException('Token Keycloak inválido');
      }
      enriched = await this.authService.refreshPlatformSession(userId);
      accessToken = enriched.accessToken;
    } else {
      enriched = await this.authService.platformLogin(dto);
      accessToken = enriched.accessToken;
      authMode = 'local';
    }

    const csrf = this.newCsrf();
    const sessionTtlMs = this.sessionMaxAgeMs();
    expiresAt = Date.now() + sessionTtlMs;
    const session = await this.sessions.create({
      kind: 'platform',
      accessToken,
      refreshToken,
      expiresAt,
      csrfToken: csrf,
    });

    setBffSessionCookies(res, PLATFORM_BFF_COOKIE_NAMES, session.id, csrf, sessionTtlMs);

    return { user: enriched.user, authMode, csrfToken: csrf, accessToken };
  }

  /** Renueva JWT en la sesión BFF (p. ej. tras GET /bff/auth/session). */
  async touchErpSession(
    sessionId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<void> {
    const ttlMs = this.sessionMaxAgeMs();
    await this.sessions.update(sessionId, {
      accessToken,
      ...(refreshToken ? { refreshToken } : {}),
      expiresAt: Date.now() + ttlMs,
    });
  }

  async touchPlatformSession(
    sessionId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<void> {
    const ttlMs = this.sessionMaxAgeMs();
    await this.sessions.update(sessionId, {
      accessToken,
      ...(refreshToken ? { refreshToken } : {}),
      expiresAt: Date.now() + ttlMs,
    });
  }

  async logoutErp(
    res: Response,
    cookies: Record<string, string | undefined>,
    sessionId?: string,
  ): Promise<{ ok: true }> {
    const sid = sessionId ?? readCookie(cookies, ERP_BFF_COOKIE_NAMES.session);
    if (sid) {
      await this.sessions.delete(sid);
    }
    clearBffSessionCookies(res, ERP_BFF_COOKIE_NAMES);
    return { ok: true };
  }

  async logoutPlatform(
    res: Response,
    cookies: Record<string, string | undefined>,
    sessionId?: string,
  ): Promise<{ ok: true }> {
    const sid = sessionId ?? readCookie(cookies, PLATFORM_BFF_COOKIE_NAMES.session);
    if (sid) {
      await this.sessions.delete(sid);
    }
    clearBffSessionCookies(res, PLATFORM_BFF_COOKIE_NAMES);
    return { ok: true };
  }

  private decodeJwt(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        return null;
      }
      const segment = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = segment.padEnd(segment.length + ((4 - (segment.length % 4)) % 4), '=');
      return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private async resolveTenantIdFromSlug(slug: string): Promise<string> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, isActive: true },
    });
    if (!tenant?.isActive) {
      throw new BadRequestException(`Unknown or inactive tenant slug: ${slug}`);
    }
    return tenant.id;
  }
}
