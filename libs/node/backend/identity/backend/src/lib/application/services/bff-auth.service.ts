import {
  BadRequestException,
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
  InMemoryBffSessionStore,
  KeycloakTokenClient,
  clearBffSessionCookies,
  setBffSessionCookies,
  readCookie,
} from '@josanz-erp/auth-keycloak';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../../application/dtos/login.dto';
import { PlatformLoginDto } from '../../application/dtos/platform-login.dto';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const TENANT_KEYCLOAK: Record<string, { realm: string; clientId: string }> = {
  josanz: { realm: 'josanz-web-app-realm', clientId: 'josanz-web-app-spa' },
  babooni: { realm: 'babooni-tenant', clientId: 'josanz-web-app-spa' },
};

@Injectable()
export class BffAuthService {
  constructor(
    private readonly authService: AuthService,
    private readonly sessions: InMemoryBffSessionStore,
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
  }> {
    const slug = dto.tenantSlug?.trim().toLowerCase() || 'josanz';
    const kcConfig = TENANT_KEYCLOAK[slug] ?? TENANT_KEYCLOAK['josanz'];
    let accessToken: string | null = null;
    let refreshToken: string | undefined;
    let expiresAt = Date.now() + this.sessionMaxAgeMs();
    let authMode: 'keycloak' | 'local' = 'local';

    if (this.keycloak.isEnabled()) {
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
          expiresAt = Date.now() + token.expiresIn * 1000;
          authMode = 'keycloak';
        }
      }
    }

    let enriched: Awaited<ReturnType<AuthService['refreshSession']>> | null = null;

    if (accessToken) {
      const keycloakAccessToken = accessToken;
      const payload = this.decodeJwt(keycloakAccessToken);
      if (!payload?.sub) {
        throw new UnauthorizedException('Token Keycloak inválido');
      }
      const email =
        (typeof payload.email === 'string' && payload.email) ||
        (typeof payload.preferred_username === 'string' && payload.preferred_username) ||
        dto.email;
      const tenantId =
        (typeof payload.tenant_id === 'string' ? payload.tenant_id : undefined) ??
        (await this.resolveTenantIdFromSlug(slug));
      const dbUserId = await this.authService.resolveDbUserIdFromKeycloakClaims({
        email,
        tenantId,
        sub: String(payload.sub),
        firstName: typeof payload.given_name === 'string' ? payload.given_name : undefined,
        lastName: typeof payload.family_name === 'string' ? payload.family_name : undefined,
      });
      enriched = await this.authService.refreshSession(dbUserId, tenantId);
      accessToken = keycloakAccessToken;
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
    const session = this.sessions.create({
      kind: authMode === 'keycloak' ? 'keycloak' : 'local',
      accessToken,
      refreshToken,
      expiresAt,
      tenantId: enriched.tenantId,
      tenantSlug: enriched.tenantSlug,
      csrfToken: csrf,
    });

    setBffSessionCookies(res, ERP_BFF_COOKIE_NAMES, session.id, csrf, this.sessionMaxAgeMs());

    return {
      user: enriched.user,
      tenantId: enriched.tenantId,
      tenantSlug: enriched.tenantSlug,
      authMode,
      csrfToken: csrf,
    };
  }

  async loginPlatform(
    dto: PlatformLoginDto,
    res: Response,
  ): Promise<{ user: unknown; authMode: 'keycloak' | 'local'; csrfToken: string }> {
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
          expiresAt = Date.now() + token.expiresIn * 1000;
          authMode = 'keycloak';
        }
      }
    }

    let enriched: Awaited<ReturnType<AuthService['refreshPlatformSession']>>;

    if (accessToken) {
      const keycloakAccessToken = accessToken;
      const payload = this.decodeJwt(keycloakAccessToken);
      const userId = payload?.sub as string | undefined;
      if (!userId) {
        throw new UnauthorizedException('Token Keycloak inválido');
      }
      enriched = await this.authService.refreshPlatformSession(userId);
      accessToken = keycloakAccessToken;
    } else {
      enriched = await this.authService.platformLogin(dto);
      accessToken = enriched.accessToken;
      authMode = 'local';
    }

    const csrf = this.newCsrf();
    const session = this.sessions.create({
      kind: 'platform',
      accessToken,
      refreshToken,
      expiresAt,
      csrfToken: csrf,
    });

    setBffSessionCookies(res, PLATFORM_BFF_COOKIE_NAMES, session.id, csrf, this.sessionMaxAgeMs());

    return { user: enriched.user, authMode, csrfToken: csrf };
  }

  logoutErp(
    res: Response,
    cookies: Record<string, string | undefined>,
    sessionId?: string,
  ): { ok: true } {
    const sid = sessionId ?? readCookie(cookies, ERP_BFF_COOKIE_NAMES.session);
    if (sid) {
      this.sessions.delete(sid);
    }
    clearBffSessionCookies(res, ERP_BFF_COOKIE_NAMES);
    return { ok: true };
  }

  logoutPlatform(
    res: Response,
    cookies: Record<string, string | undefined>,
    sessionId?: string,
  ): { ok: true } {
    const sid = sessionId ?? readCookie(cookies, PLATFORM_BFF_COOKIE_NAMES.session);
    if (sid) {
      this.sessions.delete(sid);
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
