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
import { JwtAuthGuard, requireRequestTenantId } from '@josanz-erp/shared-infrastructure';

type DeliveryRequestPayload = { [key: string]: string | number | boolean | unknown };

@Controller('delivery')
@UseGuards(JwtAuthGuard)
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get()
  async findAll(@Req() req: Request) {
    return this.deliveryService.findAll(requireRequestTenantId(req));
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    return this.deliveryService.findOne(requireRequestTenantId(req), id);
  }

  @Post()
  async create(@Req() req: Request, @Body() data: DeliveryRequestPayload) {
    return this.deliveryService.create(requireRequestTenantId(req), data);
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() data: DeliveryRequestPayload
  ) {
    return this.deliveryService.update(requireRequestTenantId(req), id, data);
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    return this.deliveryService.delete(requireRequestTenantId(req), id);
  }

  @Put(':id/sign')
  async sign(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('signature') signature: string
  ) {
    return this.deliveryService.sign(requireRequestTenantId(req), id, signature);
  }

  @Put(':id/complete')
  async complete(@Req() req: Request, @Param('id') id: string) {
    return this.deliveryService.complete(requireRequestTenantId(req), id);
  }
}
