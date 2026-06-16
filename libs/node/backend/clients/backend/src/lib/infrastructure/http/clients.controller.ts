import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Request } from 'express';
import {
  JwtAuthGuard,
  TenantGuard,
  PermissionsGuard,
  RequirePermissions,
  requireRequestTenantId,
  requireRequestUserId,
} from '@josanz-erp/shared-infrastructure';
import { ClientsService } from '../../application/clients.service';

type AnyPayload = { [key: string]: string | number | boolean | unknown };

@Controller('clients')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@RequirePermissions('clients.view', 'clients.manage', '*')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async findAll(@Req() req: Request) {
    return this.clientsService.findAll(requireRequestTenantId(req));
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.findOne(requireRequestTenantId(req), id);
  }

  @Post()
  @RequirePermissions('clients.manage', '*')
  async create(@Req() req: Request, @Body() data: AnyPayload) {
    return this.clientsService.create(
      requireRequestTenantId(req),
      data,
      requireRequestUserId(req),
    );
  }

  @Put(':id')
  @RequirePermissions('clients.manage', '*')
  async update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: AnyPayload,
  ) {
    return this.clientsService.update(
      requireRequestTenantId(req),
      id,
      data,
      requireRequestUserId(req),
    );
  }

  @Delete(':id')
  @RequirePermissions('clients.manage', '*')
  async delete(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.delete(
      requireRequestTenantId(req),
      id,
      requireRequestUserId(req),
    );
  }
}
