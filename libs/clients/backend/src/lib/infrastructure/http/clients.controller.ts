import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@josanz-erp/shared-infrastructure';
import { ClientsService } from '../../application/clients.service';

type AnyPayload = { [key: string]: string | number | boolean | unknown };

@Controller('api/clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.clientsService.findAll(r.tenantId || r.headers['x-tenant-id'] || 'default');
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.clientsService.findOne(r.tenantId || r.headers['x-tenant-id'] || 'default', id);
  }

  @Post()
  async create(@Req() req: Request, @Body() data: AnyPayload) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.clientsService.create(r.tenantId || r.headers['x-tenant-id'] || 'default', data);
  }

  @Put(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() data: AnyPayload) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.clientsService.update(r.tenantId || r.headers['x-tenant-id'] || 'default', id, data);
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.clientsService.delete(r.tenantId || r.headers['x-tenant-id'] || 'default', id);
  }
}
