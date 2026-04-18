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
import { JwtAuthGuard, requireRequestTenantId } from '@josanz-erp/shared-infrastructure';
import { FleetService } from '../../application/fleet.service';

type AnyPayload = { [key: string]: string | number | boolean | unknown };

@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Get()
  async findAll(@Req() req: Request) {
    return this.fleetService.findAll(requireRequestTenantId(req));
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.fleetService.findOne(requireRequestTenantId(req), id);
  }

  @Post()
  async create(@Req() req: Request, @Body() data: AnyPayload) {
    return this.fleetService.create(requireRequestTenantId(req), data as Record<string, unknown>);
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: AnyPayload,
  ) {
    return this.fleetService.update(requireRequestTenantId(req), id, data);
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.fleetService.delete(requireRequestTenantId(req), id);
  }
}
