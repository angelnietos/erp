import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../../application/services/auth.service';
import { PlatformLoginDto } from '../../application/dtos/platform-login.dto';
import {
  JwtAuthGuard,
  PublicTenant,
  SkipTenantGuard,
} from '@josanz-erp/shared-infrastructure';
import { PlatformJwtGuard } from '../guards/platform-jwt.guard';

@Controller('platform/auth')
export class PlatformAuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicTenant()
  @SkipTenantGuard()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: PlatformLoginDto) {
    return this.authService.platformLogin(dto);
  }

  @SkipTenantGuard()
  @UseGuards(JwtAuthGuard, PlatformJwtGuard)
  @Get('session')
  async session(@Req() req: Request) {
    const user = req.user as { sub?: string; id?: string; kind?: string; roles?: string[]; permissions?: string[]; email?: string; firstName?: string; lastName?: string } | undefined;
    // For Keycloak platform users, return the JWT user directly
    if (user?.kind === 'platform' || user?.roles?.some(r => ['PlatformOwner', 'PlatformAdmin'].includes(r))) {
      const userId = user.sub ?? user.id;
      if (!userId) {
        throw new UnauthorizedException();
      }
      return {
        accessToken: req.headers.authorization?.substring(7) ?? '',
        user: {
          id: userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles ?? [],
          permissions: user.permissions ?? [],
          extraPermissions: undefined,
        },
        tenantId: undefined,
      };
    }
    const userId = user?.sub ?? user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.authService.refreshPlatformSession(userId);
  }
}
