import { Module } from '@nestjs/common';
import { VerifactuSubmissionHttpClient } from './http/verifactu-submission-http.client';
import { CrmErpInvoiceMirrorHttpClient } from './http/crm-erp-invoice-mirror-http.client';

@Module({
  providers: [VerifactuSubmissionHttpClient, CrmErpInvoiceMirrorHttpClient],
  exports: [VerifactuSubmissionHttpClient, CrmErpInvoiceMirrorHttpClient],
})
export class VerifactuErpAdapterModule {}

