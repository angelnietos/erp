import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard, TenantGuard } from '@generic-crm/shared-infrastructure';
import { requireRequestTenantId } from '@generic-crm/shared-infrastructure';
import { ClientsApplicationService } from '../application/clients.application.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clients: ClientsApplicationService) {}

  @Get()
  list(@Req() req: Request) {
    const tenantId = requireRequestTenantId(req);
    return this.clients.list(tenantId);
  }

  @Get(':id')
  get(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    const tenantId = requireRequestTenantId(req);
    return this.clients.get(tenantId, id);
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateClientDto) {
    const tenantId = requireRequestTenantId(req);
    return this.clients.create(tenantId, dto);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClientDto,
  ) {
    const tenantId = requireRequestTenantId(req);
    return this.clients.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    const tenantId = requireRequestTenantId(req);
    return this.clients.remove(tenantId, id);
  }
}
