import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  JwtAuthGuard,
  TenantGuard,
} from '@josanz-erp/shared-infrastructure';
import { PrivacyService } from './privacy.service';

@ApiTags('privacy')
@Controller('privacy')
export class PrivacyController {
  constructor(private readonly privacy: PrivacyService) {}

  @Get('policy')
  @ApiOperation({ summary: 'Política de privacidad y retención (RGPD / ISO 27001)' })
  getPolicy() {
    return this.privacy.getPolicy();
  }

  @Get('status')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Estado de controles de seguridad y cumplimiento' })
  getStatus() {
    return this.privacy.getSecurityStatus();
  }

  @Get('export/me')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Exportar mis datos personales (RGPD art. 15)' })
  exportMe(@Req() req: Request) {
    return this.privacy.exportMyData(req);
  }

  @Post('erasure/me')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({
    summary: 'Anonimizar telemetría IA del usuario (RGPD art. 17 — fase 1)',
  })
  erasureMe(@Req() req: Request) {
    return this.privacy.anonymizeMyTelemetry(req);
  }
}
