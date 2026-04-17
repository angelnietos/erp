import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard, requireRequestTenantId } from '@josanz-erp/shared-infrastructure';
import { ClientsService } from '../../application/clients.service';

type AnyPayload = { [key: string]: string | number | boolean | unknown };

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async findAll(@Req() req: Request) {
    return this.clientsService.findAll(requireRequestTenantId(req));
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    return this.clientsService.findOne(requireRequestTenantId(req), id);
  }

  @Post()
  async create(@Req() req: Request, @Body() data: AnyPayload) {
    return this.clientsService.create(requireRequestTenantId(req), data);
  }

  @Put(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() data: AnyPayload) {
    return this.clientsService.update(requireRequestTenantId(req), id, data);
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    return this.clientsService.delete(requireRequestTenantId(req), id);
  }
}
