import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@josanz-erp/shared-infrastructure';
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
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.invoiceService.findAll(r.tenantId || r.headers['x-tenant-id'] || 'default');
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.invoiceService.findOne(r.tenantId || r.headers['x-tenant-id'] || 'default', id);
  }

  @Post()
  async create(@Req() req: Request, @Body() data: AnyPayload) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.invoiceService.create(r.tenantId || r.headers['x-tenant-id'] || 'default', data);
  }

  @Put(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() data: AnyPayload) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.invoiceService.update(r.tenantId || r.headers['x-tenant-id'] || 'default', id, data);
  }

  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.invoiceService.delete(r.tenantId || r.headers['x-tenant-id'] || 'default', id);
  }

  @Put(':id/verifactu-submit')
  async submitInvoiceToVerifactu(@Req() req: Request, @Param('id') id: string) {
    const r = req as unknown as { tenantId: string, headers: { [key: string]: string } };
    return this.submitInvoiceToVerifactuUseCase.execute({
      invoiceId: id,
      tenantId: r.tenantId || r.headers['x-tenant-id'] || 'default',
    });
  }
}


