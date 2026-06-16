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
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PublicTenant, JwtAuthGuard, TenantGuard, SkipTenantGuard } from '@josanz-erp/shared-infrastructure';
import { PlatformJwtGuard } from '../guards/platform-jwt.guard';
import { LoginDto } from '../../application/dtos/login.dto';
import { PlatformLoginDto } from '../../application/dtos/platform-login.dto';
import { BffAuthService } from '../../application/services/bff-auth.service';
import { AuthService } from '../../application/services/auth.service';

type SessionRequest = Request & {
  user?: {
    sub?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    roles?: string[];
    permissions?: string[];
    tenantId?: string;
  };
  bffSessionId?: string;
  bffCsrfToken?: string;
  cookies?: Record<string, string>;
};

@Controller('bff/auth')
export class BffAuthController {
  constructor(
    private readonly bffAuth: BffAuthService,
    private readonly authService: AuthService,
  ) {}

  @PublicTenant()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.bffAuth.loginErp(dto, res);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('session')
  async getSession(@Req() req: SessionRequest) {
    const user = req.user;
    const userId = user?.id ?? user?.sub;
    const rawTenant = req.headers['x-tenant-id'];
    const headerTenant =
      typeof rawTenant === 'string'
        ? rawTenant
        : Array.isArray(rawTenant)
          ? rawTenant[0]
          : undefined;
    const tenantId = headerTenant ?? user?.tenantId;
    const isPlatAdmin = user?.roles?.some((r) =>
      ['PlatformOwner', 'PlatformAdmin'].includes(r),
    );
    if (user && isPlatAdmin) {
      return {
        user: {
          id: userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles ?? [],
          permissions: user.permissions ?? [],
        },
        tenantId: tenantId || undefined,
        csrfToken: req.bffCsrfToken,
      };
    }
    if (!userId || !tenantId) {
      throw new UnauthorizedException('Invalid session context');
    }
    const session = await this.authService.refreshSession(userId, tenantId);
    return {
      user: session.user,
      tenantId: session.tenantId,
      tenantSlug: session.tenantSlug,
      csrfToken: req.bffCsrfToken,
    };
  }

  @PublicTenant()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Req() req: SessionRequest, @Res({ passthrough: true }) res: Response) {
    return this.bffAuth.logoutErp(res, req.cookies ?? {}, req.bffSessionId);
  }
}

@Controller('bff/platform/auth')
export class BffPlatformAuthController {
  constructor(
    private readonly bffAuth: BffAuthService,
    private readonly authService: AuthService,
  ) {}

  @PublicTenant()
  @SkipTenantGuard()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: PlatformLoginDto, @Res({ passthrough: true }) res: Response) {
    return this.bffAuth.loginPlatform(dto, res);
  }

  @SkipTenantGuard()
  @UseGuards(JwtAuthGuard, PlatformJwtGuard)
  @Get('session')
  async getSession(@Req() req: SessionRequest) {
    const userId = req.user?.id ?? req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Invalid session context');
    }
    const session = await this.authService.refreshPlatformSession(userId);
    return { user: session.user, csrfToken: req.bffCsrfToken };
  }

  @PublicTenant()
  @SkipTenantGuard()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Req() req: SessionRequest, @Res({ passthrough: true }) res: Response) {
    return this.bffAuth.logoutPlatform(res, req.cookies ?? {}, req.bffSessionId);
  }
}
