import { Module } from '@nestjs/common';
import { VerifactuSubmissionHttpClient } from './http/verifactu-submission-http.client';
import { CrmErpInvoiceMirrorHttpClient } from './http/crm-erp-invoice-mirror-http.client';
import { ErpInternalSyncApiKeyGuard } from './security/erp-internal-sync-api-key.guard';

@Module({
  providers: [
    VerifactuSubmissionHttpClient,
    CrmErpInvoiceMirrorHttpClient,
    ErpInternalSyncApiKeyGuard,
  ],
  exports: [
    VerifactuSubmissionHttpClient,
    CrmErpInvoiceMirrorHttpClient,
    ErpInternalSyncApiKeyGuard,
  ],
})
export class VerifactuErpAdapterModule {}

