import { Injectable } from '@nestjs/common';
import { SubmitVerifactuInvoiceDto } from '@josanz-erp/verifactu-core';
import { CreateWebhookEndpointDto } from '../dtos/create-webhook-endpoint.dto';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { CreateSeriesDto } from '../dtos/create-series.dto';
import { VerifactuRuntimeFacade } from '../../infrastructure/services/verifactu-runtime.facade';

@Injectable()
export class VerifactuAppService {
  constructor(private readonly runtime: VerifactuRuntimeFacade) {}

  submitInvoice(dto: SubmitVerifactuInvoiceDto) {
    return this.runtime.submitInvoice(dto);
  }

  enqueueInvoice(invoiceId: string, tenantId: string) {
    return this.runtime.enqueueInvoice(invoiceId, tenantId);
  }

  processQueue(limit?: number) {
    return this.runtime.processQueue(limit);
  }

  listWebhookEndpoints(tenantId: string) {
    return this.runtime.listWebhookEndpoints(tenantId);
  }

  createWebhookEndpoint(dto: CreateWebhookEndpointDto) {
    return this.runtime.createWebhookEndpoint(dto);
  }

  async deleteWebhookEndpoint(endpointId: string) {
    return this.runtime.deleteWebhookEndpoint(endpointId);
  }

  listCustomers(tenantId: string) {
    return this.runtime.listCustomers(tenantId);
  }

  createCustomer(dto: CreateCustomerDto) {
    return this.runtime.createCustomer(dto);
  }

  listSeries(tenantId: string) {
    return this.runtime.listSeries(tenantId);
  }

  createSeries(dto: CreateSeriesDto) {
    return this.runtime.createSeries(dto);
  }

  queryRecords(tenantId: string, status?: string, from?: string, to?: string) {
    return this.runtime.queryRecords(tenantId, status, from, to);
  }

  async complianceSummary(tenantId: string) {
    return this.runtime.complianceSummary(tenantId);
  }

  getInvoiceDetail(invoiceId: string) {
    return this.runtime.getInvoiceDetail(invoiceId);
  }

  getInvoiceQr(invoiceId: string) {
    return this.runtime.getInvoiceQr(invoiceId);
  }

  cancelInvoice(invoiceId: string, tenantId: string) {
    return this.runtime.cancelInvoice(invoiceId, tenantId);
  }
}

