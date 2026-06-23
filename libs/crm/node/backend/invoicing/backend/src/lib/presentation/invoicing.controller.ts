import {
  Body,
  Controller,
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
import { InvoicingApplicationService } from '../application/invoicing.application.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('invoices')
export class InvoicingController {
  constructor(private readonly invoicing: InvoicingApplicationService) {}

  @Get()
  list(@Req() req: Request) {
    const tenantId = requireRequestTenantId(req);
    return this.invoicing.list(tenantId);
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateInvoiceDto) {
    const tenantId = requireRequestTenantId(req);
    return this.invoicing.create(tenantId, dto);
  }

  @Patch(':id/issue')
  issue(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    const tenantId = requireRequestTenantId(req);
    return this.invoicing.issue(tenantId, id);
  }
}
