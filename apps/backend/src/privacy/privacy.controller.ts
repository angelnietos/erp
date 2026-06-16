import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  JwtAuthGuard,
  TenantGuard,
  PermissionsGuard,
  RequirePermissions,
  requireRequestTenantId,
} from '@josanz-erp/shared-infrastructure';
import { PrivacyService } from './privacy.service';
import { PrivacyRequestService } from './privacy-request.service';
import {
  CreatePrivacyRequestBody,
  PrivacyRequestStatus,
  ReviewPrivacyRequestBody,
} from './privacy-request.dto';

@ApiTags('privacy')
@Controller('privacy')
export class PrivacyController {
  constructor(
    private readonly privacy: PrivacyService,
    private readonly requests: PrivacyRequestService,
  ) {}

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

  @Get('ropa')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'ROPA — Registro de Actividades de Tratamiento (RGPD art. 30)' })
  getRopa() {
    return this.privacy.getRopa();
  }

  @Get('dpia')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'DPIA — Evaluación de impacto (RGPD art. 35)' })
  getDpia() {
    return this.privacy.getDpia();
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

  // --- Solicitudes DPO (usuario) ---

  @Post('requests')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Crear solicitud de derechos RGPD (cola DPO)' })
  createRequest(@Req() req: Request, @Body() body: CreatePrivacyRequestBody) {
    return this.requests.createRequest(req, body);
  }

  @Get('requests/me')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Mis solicitudes de privacidad' })
  myRequests(@Req() req: Request) {
    return this.requests.listMyRequests(req);
  }

  // --- Admin DPO ---

  @Get('requests')
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
  @RequirePermissions('privacy.manage', '*')
  @ApiOperation({ summary: 'Cola DPO del tenant' })
  listQueue(
    @Req() req: Request,
    @Query('status') status?: PrivacyRequestStatus,
  ) {
    return this.requests.listQueue(requireRequestTenantId(req), status);
  }

  @Get('requests/:id')
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
  @RequirePermissions('privacy.manage', '*')
  getRequest(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.requests.getById(requireRequestTenantId(req), id);
  }

  @Patch('requests/:id')
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
  @RequirePermissions('privacy.manage', '*')
  reviewRequest(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ReviewPrivacyRequestBody,
  ) {
    return this.requests.reviewRequest(req, id, body);
  }

  @Post('requests/:id/execute')
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
  @RequirePermissions('privacy.manage', '*')
  executeRequest(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.requests.executeRequest(req, id);
  }

  @Get('export/users/:userId')
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
  @RequirePermissions('privacy.manage', 'privacy.export', '*')
  exportUser(
    @Req() req: Request,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.privacy.exportUserDataAdmin(req, userId);
  }

  @Get('export/clients/:clientId')
  @UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
  @RequirePermissions('privacy.manage', 'privacy.export', '*')
  exportClient(
    @Req() req: Request,
    @Param('clientId', ParseUUIDPipe) clientId: string,
  ) {
    return this.privacy.exportClientDataAdmin(req, clientId);
  }
}
