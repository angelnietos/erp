import { Module } from '@nestjs/common';
import { VerifactuSubmissionHttpClient } from './http/verifactu-submission-http.client';
import { CrmErpInvoiceMirrorHttpClient } from './http/crm-erp-invoice-mirror-http.client';
import { ErpInternalSyncApiKeyGuard } from './security/erp-internal-sync-api-key.guard';
import { PrismaWebhookNotifierService } from './webhooks/prisma-webhook-notifier.service';
import { CrmWebhookBootstrapService } from './webhooks/crm-webhook-bootstrap.service';
import { VerifactuPrismaService } from './services/verifactu-prisma.service';

@Module({
  providers: [
    VerifactuPrismaService,
    VerifactuSubmissionHttpClient,
    CrmErpInvoiceMirrorHttpClient,
    ErpInternalSyncApiKeyGuard,
    PrismaWebhookNotifierService,
    CrmWebhookBootstrapService,
  ],
  exports: [
    VerifactuPrismaService,
    VerifactuSubmissionHttpClient,
    CrmErpInvoiceMirrorHttpClient,
    ErpInternalSyncApiKeyGuard,
    PrismaWebhookNotifierService,
    CrmWebhookBootstrapService,
  ],
})
export class VerifactuErpAdapterModule {}

