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
  async session(@Req() req: { user?: { sub?: string; id?: string } }) {
    const userId = req.user?.sub ?? req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.authService.refreshPlatformSession(userId);
  }
}
