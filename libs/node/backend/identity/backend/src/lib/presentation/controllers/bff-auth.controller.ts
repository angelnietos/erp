import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PublicTenant } from '@josanz-erp/shared-infrastructure';
import {
  ERP_BFF_COOKIE_NAMES,
  PLATFORM_BFF_COOKIE_NAMES,
  clearBffSessionCookies,
  setBffSessionCookies,
} from '@josanz-erp/auth-keycloak';
import { LoginDto } from '../../application/dtos/login.dto';
import { PlatformLoginDto } from '../../application/dtos/platform-login.dto';
import { BffAuthCallbackDto } from '../../application/dtos/bff-auth-callback.dto';
import { BffLogoutDto } from '../../application/dtos/bff-logout.dto';
import { BffAuthService } from '../../application/services/bff-auth.service';

type SessionRequest = Request & {
  bffSessionId?: string;
  bffCsrfToken?: string;
  cookies?: Record<string, string>;
};

@Controller('bff/auth')
export class BffAuthController {
  constructor(private readonly bffAuth: BffAuthService) {}

  @PublicTenant()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.bffAuth.loginErp(dto, res);
  }

  /** Canje Authorization Code + PKCE tras redirect desde Keycloak. */
  @PublicTenant()
  @HttpCode(HttpStatus.OK)
  @Post('callback')
  async callback(
    @Body() dto: BffAuthCallbackDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.bffAuth.loginErpWithAuthorizationCode(dto, res);
  }

  /**
   * Renueva sesión desde la cookie HttpOnly — sin JwtAuthGuard (el JWT almacenado puede estar caducado).
   */
  @PublicTenant()
  @Get('session')
  async getSession(
    @Req() req: SessionRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = req.bffSessionId;
    if (!sessionId) {
      throw new UnauthorizedException('No active session');
    }

    const refreshed = await this.bffAuth.refreshErpSessionFromStore(sessionId);
    if (!refreshed) {
      clearBffSessionCookies(res, ERP_BFF_COOKIE_NAMES);
      throw new UnauthorizedException('Session expired');
    }

    setBffSessionCookies(
      res,
      ERP_BFF_COOKIE_NAMES,
      sessionId,
      refreshed.csrfToken,
      this.bffAuth.getSessionMaxAgeMs(),
    );

    return {
      user: refreshed.user,
      tenantId: refreshed.tenantId,
      tenantSlug: refreshed.tenantSlug,
      authMode: refreshed.authMode,
      accessToken: refreshed.accessToken,
      csrfToken: refreshed.csrfToken,
    };
  }

  @PublicTenant()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(
    @Body() dto: BffLogoutDto,
    @Req() req: SessionRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.bffAuth.logoutErp(
      res,
      req.cookies ?? {},
      req.bffSessionId,
      dto.postLogoutRedirectUri,
    );
  }
}

@Controller('bff/platform/auth')
export class BffPlatformAuthController {
  constructor(private readonly bffAuth: BffAuthService) {}

  @PublicTenant()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: PlatformLoginDto, @Res({ passthrough: true }) res: Response) {
    return this.bffAuth.loginPlatform(dto, res);
  }

  @PublicTenant()
  @Get('session')
  async getSession(
    @Req() req: SessionRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = req.bffSessionId;
    if (!sessionId) {
      throw new UnauthorizedException('No active session');
    }

    const refreshed = await this.bffAuth.refreshPlatformSessionFromStore(sessionId);
    if (!refreshed) {
      clearBffSessionCookies(res, PLATFORM_BFF_COOKIE_NAMES);
      throw new UnauthorizedException('Session expired');
    }

    setBffSessionCookies(
      res,
      PLATFORM_BFF_COOKIE_NAMES,
      sessionId,
      refreshed.csrfToken,
      this.bffAuth.getSessionMaxAgeMs(),
    );

    return {
      user: refreshed.user,
      authMode: refreshed.authMode,
      accessToken: refreshed.accessToken,
      csrfToken: refreshed.csrfToken,
    };
  }

  @PublicTenant()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Req() req: SessionRequest, @Res({ passthrough: true }) res: Response) {
    return this.bffAuth.logoutPlatform(res, req.cookies ?? {}, req.bffSessionId);
  }
}
