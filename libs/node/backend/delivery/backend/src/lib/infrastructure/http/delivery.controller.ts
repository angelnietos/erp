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
} from '@nestjs/common';
import { Request } from 'express';
import { DeliveryService } from '../../application/delivery.service';
import { JwtAuthGuard } from '@josanz-erp/shared-infrastructure';

type DeliveryRequestPayload = { [key: string]: string | number | boolean | unknown };

@Controller('delivery')
@UseGuards(JwtAuthGuard)
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.deliveryService.findAll(r.tenantId || r.headers['x-tenant-id'] || 'default');
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.deliveryService.findOne(r.tenantId || r.headers['x-tenant-id'] || 'default', id);
  }

  @Post()
  async create(@Req() req: Request, @Body() data: DeliveryRequestPayload) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.deliveryService.create(r.tenantId || r.headers['x-tenant-id'] || 'default', data);
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() data: DeliveryRequestPayload
  ) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.deliveryService.update(r.tenantId || r.headers['x-tenant-id'] || 'default', id, data);
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.deliveryService.delete(r.tenantId || r.headers['x-tenant-id'] || 'default', id);
  }

  @Put(':id/sign')
  async sign(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('signature') signature: string
  ) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.deliveryService.sign(r.tenantId || r.headers['x-tenant-id'] || 'default', id, signature);
  }

  @Put(':id/complete')
  async complete(@Req() req: Request, @Param('id') id: string) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.deliveryService.complete(r.tenantId || r.headers['x-tenant-id'] || 'default', id);
  }
}
