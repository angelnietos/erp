import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../shared/infrastructure/guards/jwt-auth.guard';
import { CreateTimeOffRequestDto } from './time-off.dto';
import { TimeOffService } from './time-off.service';

type JwtUser = { sub?: string; permissions?: string[] };

function getTenantId(req: Request): string {
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) {
    throw new UnauthorizedException('TenantID missing');
  }
  return tenantId;
}

function jwtUser(req: Request): JwtUser {
  const u = req['user'] as JwtUser | undefined;
  if (!u?.sub) {
    throw new UnauthorizedException('Usuario no autenticado');
  }
  return u;
}

function canManageUsers(permissions?: string[]): boolean {
  if (!permissions?.length) {
    return false;
  }
  return permissions.includes('*') || permissions.includes('users.manage');
}

@Controller('time-off-requests')
export class TimeOffController {
  constructor(private readonly timeOffService: TimeOffService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: Request, @Body() dto: CreateTimeOffRequestDto) {
    const tenantId = getTenantId(req);
    const user = jwtUser(req);
    return this.timeOffService.create(
      tenantId,
      user.sub!,
      dto,
      canManageUsers(user.permissions),
    );
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async listMine(@Req() req: Request) {
    const tenantId = getTenantId(req);
    const user = jwtUser(req);
    return this.timeOffService.listMine(tenantId, user.sub!);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  async listPending(@Req() req: Request) {
    const tenantId = getTenantId(req);
    const user = jwtUser(req);
    if (!canManageUsers(user.permissions)) {
      throw new ForbiddenException(
        'No tienes permiso para ver solicitudes pendientes',
      );
    }
    return this.timeOffService.listPending(tenantId);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard)
  async approve(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const tenantId = getTenantId(req);
    const user = jwtUser(req);
    return this.timeOffService.approve(
      tenantId,
      id,
      user.sub!,
      canManageUsers(user.permissions),
    );
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard)
  async reject(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const tenantId = getTenantId(req);
    const user = jwtUser(req);
    return this.timeOffService.reject(
      tenantId,
      id,
      user.sub!,
      canManageUsers(user.permissions),
    );
  }
}
