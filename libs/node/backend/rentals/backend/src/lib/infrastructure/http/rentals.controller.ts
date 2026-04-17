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
import { JwtAuthGuard, requireRequestTenantId } from '@josanz-erp/shared-infrastructure';
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
    return this.rentalsService.findAll(requireRequestTenantId(req), { status, search });
  }

  @Post(':id/annexes')
  async addAnnex(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string },
  ) {
    return this.rentalsService.addAnnex(requireRequestTenantId(req), id, {
      title: String(body?.title ?? ''),
      description: body?.description,
    });
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    return this.rentalsService.findOne(requireRequestTenantId(req), id);
  }

  @Post()
  async create(@Req() req: Request, @Body() data: AnyPayload) {
    return this.rentalsService.create(requireRequestTenantId(req), data as Record<string, unknown>);
  }

  @Put(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() data: AnyPayload) {
    return this.rentalsService.update(requireRequestTenantId(req), id, data);
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    return this.rentalsService.delete(requireRequestTenantId(req), id);
  }
}
