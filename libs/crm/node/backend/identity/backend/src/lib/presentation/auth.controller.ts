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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  JwtAuthGuard,
  JwtRequestUser,
  PublicTenant,
  TenantGuard,
} from '@generic-crm/shared-infrastructure';
import { AuthApplicationService } from '../application/auth.application.service';
import { LoginDto } from '../dto/login.dto';
import { OidcCallbackDto } from '../dto/oidc-callback.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthApplicationService) {}

  @PublicTenant()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @PublicTenant()
  @HttpCode(HttpStatus.OK)
  @Post('oidc/callback')
  oidcCallback(@Body() dto: OidcCallbackDto) {
    return this.auth.loginWithOidc(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('session')
  session(@Req() req: Request) {
    const u = req.user as JwtRequestUser;
    const userId = u?.id ?? u?.sub;
    const tenantId = u?.tenantId;
    if (!userId || !tenantId) {
      throw new UnauthorizedException('Sesión inválida');
    }
    return this.auth.getSession(userId, tenantId);
  }
}
