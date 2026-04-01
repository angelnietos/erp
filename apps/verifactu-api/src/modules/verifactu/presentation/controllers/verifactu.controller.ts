import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubmitVerifactuInvoiceDto } from '@josanz-erp/verifactu-core';
import { VerifactuApiKeyGuard } from '@josanz-erp/verifactu-adapters';
import { EnqueueInvoiceDto } from '../../application/dtos/enqueue-invoice.dto';
import { CreateWebhookEndpointDto } from '../../application/dtos/create-webhook-endpoint.dto';
import { CreateCustomerDto } from '../../application/dtos/create-customer.dto';
import { CreateSeriesDto } from '../../application/dtos/create-series.dto';
import { CancelInvoiceDto } from '../../application/dtos/cancel-invoice.dto';
import { VerifactuAppService } from '../../application/services/verifactu-app.service';

@Controller('verifactu')
@UseGuards(VerifactuApiKeyGuard)
export class VerifactuController {
  constructor(private readonly appService: VerifactuAppService) {}

  @Post('submit')
  async submit(@Body() dto: SubmitVerifactuInvoiceDto) {
    const r = await this.appService.submitInvoice(dto);
    return {
      success: r.status === 'SENT',
      queueItemId: r.invoiceId,
      message:
        r.status === 'SENT' ? 'Registro fiscal enviado correctamente.' : 'El envío a Verifactu ha fallado.',
      aeatReference: r.aeatReference,
    };
  }

  @Post('queue/enqueue')
  enqueue(@Body() dto: EnqueueInvoiceDto) {
    return this.appService.enqueueInvoice(dto.invoiceId, dto.tenantId);
  }

  @Post('queue/process')
  processQueue(@Query('limit') limit?: string) {
    return this.appService.processQueue(limit ? Number(limit) : 20);
  }

  @Get('webhooks/:tenantId')
  listWebhooks(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.appService.listWebhookEndpoints(tenantId);
  }

  @Post('webhooks')
  createWebhook(@Body() dto: CreateWebhookEndpointDto) {
    return this.appService.createWebhookEndpoint(dto);
  }

  @Delete('webhooks/:endpointId')
  deleteWebhook(@Param('endpointId') endpointId: string) {
    return this.appService.deleteWebhookEndpoint(endpointId);
  }

  @Get('customers/:tenantId')
  listCustomers(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.appService.listCustomers(tenantId);
  }

  @Post('customers')
  createCustomer(@Body() dto: CreateCustomerDto) {
    return this.appService.createCustomer(dto);
  }

  @Get('series/:tenantId')
  listSeries(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.appService.listSeries(tenantId);
  }

  @Post('series')
  createSeries(@Body() dto: CreateSeriesDto) {
    return this.appService.createSeries(dto);
  }

  @Get('records/:tenantId')
  queryRecords(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.appService.queryRecords(tenantId, status, from, to);
  }

  @Get('compliance/summary/:tenantId')
  summary(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.appService.complianceSummary(tenantId);
  }

  @Get('invoices/:invoiceId/qr')
  invoiceQr(@Param('invoiceId') invoiceId: string) {
    return this.appService.getInvoiceQr(invoiceId);
  }

  @Get('invoices/:invoiceId')
  invoiceDetail(@Param('invoiceId') invoiceId: string) {
    return this.appService.getInvoiceDetail(invoiceId);
  }

  @Post('invoices/:invoiceId/cancel')
  cancelInvoice(
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @Body() body: CancelInvoiceDto,
  ) {
    return this.appService.cancelInvoice(invoiceId, body.tenantId);
  }
}

