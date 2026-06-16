import {
  Body,
  Controller,
  Post,
  Patch,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../../application/services/auth.service';
import { PasswordResetService } from '../../application/services/password-reset.service';
import { LoginDto } from '../../application/dtos/login.dto';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../../application/dtos/password-reset.dto';
import { UpdateMyProfileDto } from '../../application/dtos/update-my-profile.dto';
import { PublicTenant, JwtAuthGuard, TenantGuard } from '@josanz-erp/shared-infrastructure';

type SessionRequest = Request & {
  user?: { sub?: string; id?: string; firstName?: string; lastName?: string; email?: string; roles?: string[]; permissions?: string[]; tenantId?: string };
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordReset: PasswordResetService,
  ) {}

  @PublicTenant()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
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
    // Platform admins don't need a tenant - return JWT user directly
    const isPlatAdmin = user?.roles?.some(r => ['PlatformOwner', 'PlatformAdmin'].includes(r));
    if (user && isPlatAdmin) {
      const token = req.headers.authorization?.substring(7) ?? '';
      return {
        accessToken: token,
        user: {
          id: userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles ?? [],
          permissions: user.permissions ?? [],
          extraPermissions: undefined,
        },
        tenantId: tenantId || undefined,
      };
    }
    if (!userId || !tenantId) {
      throw new UnauthorizedException('Invalid session context');
    }
    return await this.authService.refreshSession(userId, tenantId);
  }

  @PublicTenant()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.passwordReset.requestReset(dto.email, dto.tenantSlug);
  }

  @PublicTenant()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordReset.resetWithToken(dto.token, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  changePassword(@Req() req: SessionRequest, @Body() dto: ChangePasswordDto) {
    const userId = req.user?.id ?? req.user?.sub;
    const rawTenant = req.headers['x-tenant-id'];
    const headerTenant =
      typeof rawTenant === 'string'
        ? rawTenant
        : Array.isArray(rawTenant)
          ? rawTenant[0]
          : undefined;
    const tenantId = headerTenant ?? req.user?.tenantId;
    if (!userId || !tenantId) {
      throw new UnauthorizedException('Invalid session context');
    }
    return this.passwordReset.changePassword(
      userId,
      tenantId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Patch('profile')
  updateProfile(@Req() req: SessionRequest, @Body() dto: UpdateMyProfileDto) {
    const userId = req.user?.id ?? req.user?.sub;
    const rawTenant = req.headers['x-tenant-id'];
    const headerTenant =
      typeof rawTenant === 'string'
        ? rawTenant
        : Array.isArray(rawTenant)
          ? rawTenant[0]
          : undefined;
    const tenantId = headerTenant ?? req.user?.tenantId;
    if (!userId || !tenantId) {
      throw new UnauthorizedException('Invalid session context');
    }
    return this.authService.updateMyProfile(userId, tenantId, dto);
  }
}
