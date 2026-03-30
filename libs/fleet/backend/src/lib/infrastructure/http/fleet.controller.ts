import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@josanz-erp/shared-infrastructure';
import { FleetService } from '../../application/fleet.service';

type AnyPayload = { [key: string]: string | number | boolean | unknown };

@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.fleetService.findAll(r.tenantId || r.headers['x-tenant-id'] || 'default');
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.fleetService.findOne(r.tenantId || r.headers['x-tenant-id'] || 'default', id);
  }

  @Post()
  async create(@Req() req: Request, @Body() data: AnyPayload) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.fleetService.create(r.tenantId || r.headers['x-tenant-id'] || 'default', data as Record<string, unknown>);
  }

  @Put(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() data: AnyPayload) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.fleetService.update(r.tenantId || r.headers['x-tenant-id'] || 'default', id, data);
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.fleetService.delete(r.tenantId || r.headers['x-tenant-id'] || 'default', id);
  }
}
