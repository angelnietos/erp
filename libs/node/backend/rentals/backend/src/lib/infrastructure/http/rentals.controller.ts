import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@josanz-erp/shared-infrastructure';
import { RentalsService } from '../../application/rentals.service';

type AnyPayload = { [key: string]: string | number | boolean | unknown };

@Controller('rentals')
@UseGuards(JwtAuthGuard)
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const r = req as unknown as { tenantId: string; headers: { [key: string]: string } };
    return this.rentalsService.findAll(
      r.tenantId || r.headers['x-tenant-id'] || 'default',
      { status, search },
    );
  }

  @Post(':id/annexes')
  async addAnnex(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string },
  ) {
    const r = req as unknown as { tenantId: string; headers: { [key: string]: string } };
    return this.rentalsService.addAnnex(
      r.tenantId || r.headers['x-tenant-id'] || 'default',
      id,
      { title: String(body?.title ?? ''), description: body?.description },
    );
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
