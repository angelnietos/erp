import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SharedInfrastructureModule } from '@generic-crm/shared-infrastructure';
import { VERIFACTU_REPOSITORY } from '@generic-crm/verifactu-core';
import { VerifactuApplicationService } from './application/verifactu.application.service';
import { VerifactuQueueProcessorService } from './application/verifactu-queue-processor.service';
import { VerifactuCrmQueueSchedulerService } from './application/verifactu-crm-queue-scheduler.service';
import { HttpAeatVerifactuSubmissionAdapter } from './infrastructure/aeat/http-aeat-verifactu-submission.adapter';
import { StubVerifactuSubmissionAdapter } from './infrastructure/aeat/stub-verifactu-submission.adapter';
import { VERIFACTU_SUBMISSION_FACTORY } from './infrastructure/aeat/verifactu-submission.adapter.provider';
import { PrismaVerifactuCredentialRepository } from './infrastructure/credentials/prisma-verifactu-credential.repository';
import { VerifactuTenantTlsService } from './infrastructure/credentials/verifactu-tenant-tls.service';
import { PrismaVerifactuRepository } from './infrastructure/persistence/prisma-verifactu.repository';
import { ErpVerifactuQueueForwardClient } from './infrastructure/http/erp-verifactu-queue-forward.client';
import { VerifactuController } from './presentation/verifactu.controller';
import { ErpInvoiceMirrorController } from './presentation/erp-invoice-mirror.controller';
import { ErpVerifactuSyncController } from './presentation/erp-verifactu-sync.controller';
import { CrmErpSyncApiKeyGuard } from './guards/crm-erp-sync-api-key.guard';

@Module({
  imports: [SharedInfrastructureModule, ScheduleModule.forRoot()],
  controllers: [
    VerifactuController,
    ErpInvoiceMirrorController,
    ErpVerifactuSyncController,
  ],
  providers: [
    VerifactuApplicationService,
    VerifactuQueueProcessorService,
    VerifactuCrmQueueSchedulerService,
    ErpVerifactuQueueForwardClient,
    CrmErpSyncApiKeyGuard,
    StubVerifactuSubmissionAdapter,
    HttpAeatVerifactuSubmissionAdapter,
    PrismaVerifactuRepository,
    PrismaVerifactuCredentialRepository,
    VerifactuTenantTlsService,
    {
      provide: VERIFACTU_REPOSITORY,
      useExisting: PrismaVerifactuRepository,
    },
    VERIFACTU_SUBMISSION_FACTORY,
  ],
  exports: [VerifactuApplicationService, VerifactuQueueProcessorService],
})
export class VerifactuModule {}
