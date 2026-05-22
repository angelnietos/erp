import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard, requireRequestTenantId } from '@josanz-erp/shared-infrastructure';
import { InventoryService } from '../../application/services/inventory.service';

type AnyPayload = { [key: string]: string | number | boolean | unknown };

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async findAll(@Req() req: Request) {
    return this.inventoryService.findAll(requireRequestTenantId(req));
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.findOne(requireRequestTenantId(req), id);
  }

  @Post()
  async create(@Req() req: Request, @Body() data: AnyPayload) {
    const actorUserId = (req.user as any)?.sub;
    return this.inventoryService.create(requireRequestTenantId(req), data, actorUserId);
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: AnyPayload,
  ) {
    const actorUserId = (req.user as any)?.sub;
    return this.inventoryService.update(requireRequestTenantId(req), id, data, actorUserId);
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    const actorUserId = (req.user as any)?.sub;
    return this.inventoryService.delete(requireRequestTenantId(req), id, actorUserId);
  }
}
