import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  JwtAuthGuard,
  PermissionsGuard,
  RequirePermissions,
  TenantGuard,
  requireRequestTenantId,
  requireRequestUserId,
} from '@josanz-erp/shared-infrastructure';
import { EventsService, type EventWriteBody } from '../../application/events.service';

@Controller('events')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@RequirePermissions('events.view', 'events.manage', '*')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(@Req() req: Request, @Query('clientId') clientId?: string) {
    return this.eventsService.findAll(requireRequestTenantId(req), clientId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findOne(requireRequestTenantId(req), id);
  }

  @Post()
  @RequirePermissions('events.manage', '*')
  async create(@Req() req: Request, @Body() data: EventWriteBody) {
    return this.eventsService.create(
      requireRequestTenantId(req),
      data,
      requireRequestUserId(req),
    );
  }

  @Put(':id')
  @RequirePermissions('events.manage', '*')
  async update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: EventWriteBody,
  ) {
    return this.eventsService.update(
      requireRequestTenantId(req),
      id,
      data,
      requireRequestUserId(req),
    );
  }

  @Patch(':id/status')
  @RequirePermissions('events.manage', '*')
  async updateStatus(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: { status: string; statusPillColor?: string | null },
  ) {
    return this.eventsService.updateStatus(
      requireRequestTenantId(req),
      id,
      data,
      requireRequestUserId(req),
    );
  }

  @Delete(':id')
  @RequirePermissions('events.manage', '*')
  async delete(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.delete(
      requireRequestTenantId(req),
      id,
      requireRequestUserId(req),
    );
  }
}
