import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  Optional,
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
  readJwtSubject,
  BFF_SESSION_RENEWER,
  BffSessionRenewerPort,
} from '@josanz-erp/auth-keycloak';
import {
  getTenantKeycloakConfig,
  normalizeAuthTenantSlug,
  tenantUsesKeycloakLogin,
} from '@josanz-erp/identity-api';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../../application/dtos/login.dto';
import { PlatformLoginDto } from '../../application/dtos/platform-login.dto';
import { BffAuthCallbackDto } from '../../application/dtos/bff-auth-callback.dto';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class BffAuthService {
  private readonly logger = new Logger(BffAuthService.name);

  constructor(
    private readonly authService: AuthService,
    @Inject(BFF_SESSION_STORE) private readonly sessions: BffSessionStorePort,
    private readonly keycloak: KeycloakTokenClient,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    @Optional() @Inject(BFF_SESSION_RENEWER) private readonly renewer?: BffSessionRenewerPort,
  ) {}

  private sessionMaxAgeMs(): number {
    const hours = parseInt(this.config.get<string>('BFF_SESSION_MAX_AGE_HOURS') ?? '24', 10);
    return Number.isFinite(hours) && hours > 0 ? hours * 60 * 60 * 1000 : SESSION_TTL_MS;
  }

  /** TTL de sesión BFF (ms) para cookies y almacén. */
  getSessionMaxAgeMs(): number {
    return this.sessionMaxAgeMs();
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
    keycloakReachable?: boolean;
  }> {
    const slug = normalizeAuthTenantSlug(dto.tenantSlug) || 'josanz';
    const kcConfig = tenantUsesKeycloakLogin(slug)
      ? getTenantKeycloakConfig(slug)
      : undefined;
    let accessToken: string | null = null;
    let refreshToken: string | undefined;
    let idToken: string | undefined;
    let expiresAt = Date.now() + this.sessionMaxAgeMs();
    let authMode: 'keycloak' | 'local' = 'local';

    let enriched: Awaited<ReturnType<AuthService['refreshSession']>> | null = null;
    let keycloakReachable = false;

    if (kcConfig && this.keycloak.isEnabled()) {
      keycloakReachable = await this.keycloak.isRealmReachable(kcConfig.realm);
      if (keycloakReachable) {
        const secret = this.config.get<string>('KEYCLOAK_SPA_CLIENT_SECRET');
        const token = await this.keycloak.passwordGrant({
          realm: kcConfig.realm,
          clientId: kcConfig.clientId,
          clientSecret: secret,
          username: dto.email,
          password: dto.password,
        });
        if (token) {
          idToken = token.idToken;
          try {
            const payload = this.decodeJwt(token.accessToken);
            if (!payload?.sub) {
              throw new UnauthorizedException('Token Keycloak inválido');
            }
            const email =
              (typeof payload.email === 'string' && payload.email) ||
              (typeof payload.preferred_username === 'string' &&
                payload.preferred_username) ||
              dto.email;
            const tenantId = await this.resolveTenantIdFromSlug(slug);
            const dbUserId = await this.authService.resolveDbUserIdFromKeycloakClaims({
              email,
              tenantId,
              sub: String(payload.sub),
              firstName:
                typeof payload.given_name === 'string' ? payload.given_name : undefined,
              lastName:
                typeof payload.family_name === 'string' ? payload.family_name : undefined,
            });
            enriched = await this.authService.refreshSession(dbUserId, tenantId);
            accessToken = enriched.accessToken;
            refreshToken = token.refreshToken;
            authMode = 'keycloak';
          } catch (err) {
            if (err instanceof UnauthorizedException) {
              throw err;
            }
            this.logger.debug(
              `Keycloak OK pero falló resolución ERP (${slug}), probando login local`,
            );
          }
        }
      }
    }

    if (!enriched) {
      try {
        const local = await this.authService.login(dto);
        accessToken = local.accessToken;
        enriched = {
          accessToken: local.accessToken,
          user: local.user,
          tenantId: local.tenantId,
          tenantSlug: local.tenantSlug,
        };
        authMode = 'local';
      } catch (err) {
        throw this.mapLoginFailure(err, { kcConfig, keycloakReachable });
      }
    }

    const csrf = this.newCsrf();
    const sessionTtlMs = this.sessionMaxAgeMs();
    expiresAt = Date.now() + sessionTtlMs;
    const session = await this.sessions.create({
      kind: authMode === 'keycloak' ? 'keycloak' : 'local',
      accessToken,
      refreshToken,
      idToken: authMode === 'keycloak' ? idToken : undefined,
      keycloakRealm: authMode === 'keycloak' && kcConfig ? kcConfig.realm : undefined,
      keycloakClientId: authMode === 'keycloak' && kcConfig ? kcConfig.clientId : undefined,
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
      ...(kcConfig ? { keycloakReachable } : {}),
    };
  }

  /** Login ERP vía Authorization Code + PKCE (redirect OIDC → callback → BFF). */
  async loginErpWithAuthorizationCode(
    dto: BffAuthCallbackDto,
    res: Response,
  ): Promise<{
    user: unknown;
    tenantId: string;
    tenantSlug?: string;
    authMode: 'keycloak' | 'local';
    csrfToken: string;
    accessToken: string;
    keycloakReachable: true;
  }> {
    const slug = normalizeAuthTenantSlug(dto.tenantSlug) || 'josanz';
    const kcConfig = getTenantKeycloakConfig(slug);
    if (!kcConfig) {
      throw new BadRequestException(`Tenant "${slug}" no usa Keycloak`);
    }
    if (!this.keycloak.isEnabled()) {
      throw new BadRequestException('Keycloak no está habilitado');
    }

    const secret = this.config.get<string>('KEYCLOAK_SPA_CLIENT_SECRET');
    const token = await this.keycloak.authorizationCodeGrant({
      realm: kcConfig.realm,
      clientId: kcConfig.clientId,
      clientSecret: secret,
      code: dto.code,
      codeVerifier: dto.codeVerifier,
      redirectUri: dto.redirectUri,
    });
    if (!token) {
      throw new UnauthorizedException(
        'No se pudo canjear el código de autorización. Vuelve a iniciar sesión.',
      );
    }

    const payload = this.decodeJwt(token.accessToken);
    if (!payload?.sub) {
      throw new UnauthorizedException('Token Keycloak inválido');
    }
    const email =
      (typeof payload.email === 'string' && payload.email) ||
      (typeof payload.preferred_username === 'string' && payload.preferred_username) ||
      '';
    if (!email.trim()) {
      throw new UnauthorizedException('Token Keycloak sin email');
    }

    const tenantId = await this.resolveTenantIdFromSlug(slug);
    const dbUserId = await this.authService.resolveDbUserIdFromKeycloakClaims({
      email,
      tenantId,
      sub: String(payload.sub),
      firstName:
        typeof payload.given_name === 'string' ? payload.given_name : undefined,
      lastName:
        typeof payload.family_name === 'string' ? payload.family_name : undefined,
    });
    const enriched = await this.authService.refreshSession(dbUserId, tenantId);

    const csrf = this.newCsrf();
    const sessionTtlMs = this.sessionMaxAgeMs();
    const session = await this.sessions.create({
      kind: 'keycloak',
      accessToken: enriched.accessToken,
      refreshToken: token.refreshToken,
      idToken: token.idToken,
      keycloakRealm: kcConfig.realm,
      keycloakClientId: kcConfig.clientId,
      expiresAt: Date.now() + sessionTtlMs,
      tenantId: enriched.tenantId,
      tenantSlug: enriched.tenantSlug,
      csrfToken: csrf,
    });

    setBffSessionCookies(res, ERP_BFF_COOKIE_NAMES, session.id, csrf, sessionTtlMs);

    return {
      user: enriched.user,
      tenantId: enriched.tenantId,
      tenantSlug: enriched.tenantSlug,
      authMode: 'keycloak',
      csrfToken: csrf,
      accessToken: enriched.accessToken,
      keycloakReachable: true,
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
    let idToken: string | undefined;
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
          idToken = token.idToken;
          authMode = 'keycloak';
        }
      }
    }

    let enriched: Awaited<ReturnType<AuthService['refreshPlatformSession']>>;

    if (accessToken) {
      const payload = this.decodeJwt(accessToken);
      const email =
        (typeof payload?.email === 'string' && payload.email) ||
        (typeof payload?.preferred_username === 'string' &&
          payload.preferred_username) ||
        dto.email;
      const realmAccess = payload?.realm_access as { roles?: string[] } | undefined;
      enriched = await this.authService.refreshPlatformSessionByEmail(email, {
        firstName:
          typeof payload?.given_name === 'string' ? payload.given_name : undefined,
        lastName:
          typeof payload?.family_name === 'string' ? payload.family_name : undefined,
        realmRoles: realmAccess?.roles ?? [],
      });
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
      idToken: authMode === 'keycloak' ? idToken : undefined,
      keycloakRealm: authMode === 'keycloak' ? realm : undefined,
      keycloakClientId: authMode === 'keycloak' ? clientId : undefined,
      expiresAt,
      csrfToken: csrf,
    });

    setBffSessionCookies(res, PLATFORM_BFF_COOKIE_NAMES, session.id, csrf, sessionTtlMs);

    return { user: enriched.user, authMode, csrfToken: csrf, accessToken };
  }

  /** Login panel SaaS vía Authorization Code + PKCE (redirect OIDC → callback → BFF). */
  async loginPlatformWithAuthorizationCode(
    dto: BffAuthCallbackDto,
    res: Response,
  ): Promise<{
    user: unknown;
    authMode: 'keycloak';
    csrfToken: string;
    accessToken: string;
  }> {
    const realm =
      this.config.get<string>('KEYCLOAK_PLATFORM_REALM') ?? 'babooni-platform';
    const clientId =
      this.config.get<string>('KEYCLOAK_PLATFORM_CLIENT_ID') ??
      'babooni-saas-platform';

    if (!this.keycloak.isEnabled()) {
      throw new BadRequestException('Keycloak no está habilitado');
    }

    const token = await this.keycloak.authorizationCodeGrant({
      realm,
      clientId,
      code: dto.code,
      codeVerifier: dto.codeVerifier,
      redirectUri: dto.redirectUri,
    });
    if (!token) {
      throw new UnauthorizedException(
        'No se pudo canjear el código de autorización. Vuelve a iniciar sesión.',
      );
    }

    const payload = this.decodeJwt(token.accessToken);
    const email =
      (typeof payload?.email === 'string' && payload.email) ||
      (typeof payload?.preferred_username === 'string' &&
        payload.preferred_username) ||
      '';
    if (!email.trim()) {
      throw new UnauthorizedException('Token Keycloak sin email');
    }

    const realmAccess = payload?.realm_access as { roles?: string[] } | undefined;
    const enriched = await this.authService.refreshPlatformSessionByEmail(email, {
      firstName:
        typeof payload?.given_name === 'string' ? payload.given_name : undefined,
      lastName:
        typeof payload?.family_name === 'string' ? payload.family_name : undefined,
      realmRoles: realmAccess?.roles ?? [],
    });

    const csrf = this.newCsrf();
    const sessionTtlMs = this.sessionMaxAgeMs();
    const session = await this.sessions.create({
      kind: 'platform',
      accessToken: enriched.accessToken,
      refreshToken: token.refreshToken,
      idToken: token.idToken,
      keycloakRealm: realm,
      keycloakClientId: clientId,
      expiresAt: Date.now() + sessionTtlMs,
      csrfToken: csrf,
    });

    setBffSessionCookies(res, PLATFORM_BFF_COOKIE_NAMES, session.id, csrf, sessionTtlMs);

    return {
      user: enriched.user,
      authMode: 'keycloak',
      csrfToken: csrf,
      accessToken: enriched.accessToken,
    };
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

  /**
   * Renueva JWT ERP desde la cookie BFF sin depender de JwtAuthGuard
   * (el access token almacenado puede estar caducado).
   */
  async refreshErpSessionFromStore(sessionId: string): Promise<{
    user: Awaited<ReturnType<AuthService['refreshSession']>>['user'];
    tenantId: string;
    tenantSlug?: string;
    accessToken: string;
    csrfToken: string;
    authMode: 'keycloak' | 'local';
  } | null> {
    const session = await this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    const tenantId = session.tenantId?.trim();
    const userId = readJwtSubject(session.accessToken);
    if (!userId || !tenantId) {
      await this.sessions.delete(sessionId);
      return null;
    }

    try {
      if (this.renewer) {
        const renewal = await this.renewer.renewAccessToken(session);
        if (renewal?.refreshToken && renewal.refreshToken !== session.refreshToken) {
          await this.sessions.update(sessionId, { refreshToken: renewal.refreshToken });
        }
      }

      const enriched = await this.authService.refreshSession(userId, tenantId);
      await this.touchErpSession(sessionId, enriched.accessToken, session.refreshToken);
      return {
        user: enriched.user,
        tenantId: enriched.tenantId,
        tenantSlug: enriched.tenantSlug,
        accessToken: enriched.accessToken,
        csrfToken: session.csrfToken,
        authMode: session.kind === 'keycloak' ? 'keycloak' : 'local',
      };
    } catch {
      await this.sessions.delete(sessionId);
      return null;
    }
  }

  async refreshPlatformSessionFromStore(sessionId: string): Promise<{
    user: Awaited<ReturnType<AuthService['refreshPlatformSession']>>['user'];
    accessToken: string;
    csrfToken: string;
    authMode: 'keycloak' | 'local';
  } | null> {
    const session = await this.sessions.get(sessionId);
    if (!session || session.kind !== 'platform') {
      return null;
    }

    const userId = readJwtSubject(session.accessToken);
    if (!userId) {
      await this.sessions.delete(sessionId);
      return null;
    }

    try {
      if (this.renewer) {
        await this.renewer.renewAccessToken(session);
      }
      const enriched = await this.authService.refreshPlatformSession(userId);
      await this.touchPlatformSession(sessionId, enriched.accessToken, session.refreshToken);
      return {
        user: enriched.user,
        accessToken: enriched.accessToken,
        csrfToken: session.csrfToken,
        authMode: 'keycloak',
      };
    } catch {
      await this.sessions.delete(sessionId);
      return null;
    }
  }

  async logoutErp(
    res: Response,
    cookies: Record<string, string | undefined>,
    sessionId?: string,
    postLogoutRedirectUri?: string,
  ): Promise<{ ok: true; keycloakLogoutUrl?: string }> {
    const sid = sessionId ?? readCookie(cookies, ERP_BFF_COOKIE_NAMES.session);
    let keycloakLogoutUrl: string | undefined;

    if (sid) {
      const session = await this.sessions.get(sid);
      if (
        session?.kind === 'keycloak' &&
        session.keycloakRealm &&
        session.keycloakClientId
      ) {
        keycloakLogoutUrl = this.keycloak.buildRpInitiatedLogoutUrl({
          realm: session.keycloakRealm,
          clientId: session.keycloakClientId,
          idTokenHint: session.idToken,
          postLogoutRedirectUri,
        });
      }
      await this.sessions.delete(sid);
    }
    clearBffSessionCookies(res, ERP_BFF_COOKIE_NAMES);
    return keycloakLogoutUrl ? { ok: true, keycloakLogoutUrl } : { ok: true };
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

  /** Comprueba realm + redirect_uri registrado antes del redirect PKCE del panel SaaS. */
  async checkPlatformSso(redirectUri: string): Promise<{
    realmReachable: boolean;
    redirectUriAllowed: boolean;
    realm: string;
    clientId: string;
    redirectUri: string;
    hint?: string;
  }> {
    const realm =
      this.config.get<string>('KEYCLOAK_PLATFORM_REALM') ?? 'babooni-platform';
    const clientId =
      this.config.get<string>('KEYCLOAK_PLATFORM_CLIENT_ID') ??
      'babooni-saas-platform';
    const normalizedRedirect = redirectUri.trim();

    const realmReachable = this.keycloak.isEnabled()
      ? await this.keycloak.isRealmReachable(realm)
      : false;

    let redirectUriAllowed = false;
    if (realmReachable && normalizedRedirect) {
      const patterns = await this.fetchKeycloakClientRedirectUris(realm, clientId);
      redirectUriAllowed =
        patterns !== null &&
        patterns.some((p) =>
          this.keycloakRedirectUriMatches(p, normalizedRedirect),
        );
    }

    let hint: string | undefined;
    if (realmReachable && !redirectUriAllowed) {
      hint =
        'Ejecuta `pnpm keycloak:sync` para registrar el redirect URI del panel SaaS en Keycloak.';
    }

    return {
      realmReachable,
      redirectUriAllowed,
      realm,
      clientId,
      redirectUri: normalizedRedirect,
      hint,
    };
  }

  private keycloakRedirectUriMatches(pattern: string, redirectUri: string): boolean {
    const p = pattern.trim();
    const r = redirectUri.trim();
    if (!p || !r) {
      return false;
    }
    if (p === r) {
      return true;
    }
    if (p.endsWith('*')) {
      return r.startsWith(p.slice(0, -1));
    }
    return false;
  }

  private async fetchKeycloakClientRedirectUris(
    realm: string,
    clientId: string,
  ): Promise<string[] | null> {
    const adminUser = this.config.get<string>('KEYCLOAK_ADMIN_USER');
    const adminPassword = this.config.get<string>('KEYCLOAK_ADMIN_PASSWORD');
    if (!adminUser || !adminPassword) {
      return null;
    }

    try {
      const form = new URLSearchParams({
        grant_type: 'password',
        client_id: this.config.get<string>('KEYCLOAK_ADMIN_CLIENT_ID') ?? 'admin-cli',
        username: adminUser,
        password: adminPassword,
        scope: 'openid',
      });
      const tokenRes = await fetch(
        `${this.keycloak.authServerUrl}/realms/master/protocol/openid-connect/token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString(),
        },
      );
      if (!tokenRes.ok) {
        return null;
      }
      const tokenJson = (await tokenRes.json()) as { access_token?: string };
      const token = tokenJson.access_token;
      if (!token) {
        return null;
      }

      const clientsRes = await fetch(
        `${this.keycloak.authServerUrl}/admin/realms/${realm}/clients?clientId=${encodeURIComponent(clientId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      if (!clientsRes.ok) {
        return null;
      }
      const clients = (await clientsRes.json()) as Array<{ redirectUris?: string[] }>;
      return clients[0]?.redirectUris ?? [];
    } catch (err) {
      this.logger.debug(`Platform SSO redirect check failed: ${String(err)}`);
      return null;
    }
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

  private mapLoginFailure(
    err: unknown,
    ctx: { kcConfig?: { realm: string }; keycloakReachable: boolean },
  ): UnauthorizedException | BadRequestException {
    if (err instanceof UnauthorizedException || err instanceof BadRequestException) {
      return err;
    }
    if (ctx.kcConfig && ctx.keycloakReachable) {
      return new UnauthorizedException(
        'Credenciales incorrectas. Keycloak está activo; si usas cuenta local, verifica email y contraseña del ERP.',
      );
    }
    if (ctx.kcConfig && !ctx.keycloakReachable) {
      return new UnauthorizedException(
        'Credenciales incorrectas. Keycloak no responde; solo está disponible el acceso local.',
      );
    }
    return new UnauthorizedException('Credenciales incorrectas.');
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
