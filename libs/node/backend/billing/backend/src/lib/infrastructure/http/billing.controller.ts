import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard, requireRequestTenantId } from '@josanz-erp/shared-infrastructure';
import { SubmitInvoiceVerifactuDto } from '../../application/dtos/submit-invoice-verifactu.dto';
import { SubmitInvoiceToVerifactuUseCase } from '../../application/use-cases/submit-invoice-to-verifactu.use-case';
import { InvoiceService } from '../../application/services/invoice.service';

type AnyPayload = { [key: string]: string | number | boolean | unknown };

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(
    private readonly submitInvoiceToVerifactuUseCase: SubmitInvoiceToVerifactuUseCase,
    private readonly invoiceService: InvoiceService
  ) {}

  @Get()
  async findAll(@Req() req: Request) {
    return this.invoiceService.findAll(requireRequestTenantId(req));
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    return this.invoiceService.findOne(requireRequestTenantId(req), id);
  }

  @Post()
  async create(@Req() req: Request, @Body() data: AnyPayload) {
    return this.invoiceService.create(requireRequestTenantId(req), data);
  }

  @Put(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() data: AnyPayload) {
    return this.invoiceService.update(requireRequestTenantId(req), id, data);
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    return this.invoiceService.delete(requireRequestTenantId(req), id);
  }

  @Put(':id/verifactu-submit')
  async submitInvoiceToVerifactu(@Req() req: Request, @Param('id') id: string) {
    return this.submitInvoiceToVerifactuUseCase.execute({
      invoiceId: id,
      tenantId: requireRequestTenantId(req),
    });
  }
}


