import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../../application/dtos/login.dto';
import { PublicTenant, JwtAuthGuard, TenantGuard } from '@josanz-erp/shared-infrastructure';

type SessionRequest = Request & {
  user?: { id?: string; sub?: string; tenantId?: string };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    if (!userId || !tenantId) {
      throw new UnauthorizedException('Invalid session context');
    }
    return await this.authService.refreshSession(userId, tenantId);
  }
}
