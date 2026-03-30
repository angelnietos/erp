import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@josanz-erp/shared-infrastructure';
import { RentalsService } from '../../application/rentals.service';

type AnyPayload = { [key: string]: string | number | boolean | unknown };

@Controller('api/rentals')
@UseGuards(JwtAuthGuard)
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.rentalsService.findAll(r.tenantId || r.headers['x-tenant-id'] || 'default');
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.rentalsService.findOne(r.tenantId || r.headers['x-tenant-id'] || 'default', id);
  }

  @Post()
  async create(@Req() req: Request, @Body() data: AnyPayload) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.rentalsService.create(r.tenantId || r.headers['x-tenant-id'] || 'default', data as Record<string, unknown>);
  }

  @Put(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() data: AnyPayload) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.rentalsService.update(r.tenantId || r.headers['x-tenant-id'] || 'default', id, data);
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.rentalsService.delete(r.tenantId || r.headers['x-tenant-id'] || 'default', id);
  }
}
