import { Body, Controller, Post, HttpCode, HttpStatus, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../../application/dtos/login.dto';
import { PublicTenant, JwtAuthGuard, TenantGuard } from '@josanz-erp/shared-infrastructure';

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
  async getSession(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    const tenantId = req.headers['x-tenant-id'] || req.user.tenantId;
    return await this.authService.refreshSession(userId, tenantId);
  }
}
