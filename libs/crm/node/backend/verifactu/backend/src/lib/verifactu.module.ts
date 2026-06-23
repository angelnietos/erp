import { Module } from '@nestjs/common';
import { SharedInfrastructureModule } from '@generic-crm/shared-infrastructure';
import { VERIFACTU_REPOSITORY } from '@generic-crm/verifactu-core';
import { VerifactuApplicationService } from './application/verifactu.application.service';
import { VerifactuQueueProcessorService } from './application/verifactu-queue-processor.service';
import { HttpAeatVerifactuSubmissionAdapter } from './infrastructure/aeat/http-aeat-verifactu-submission.adapter';
import { StubVerifactuSubmissionAdapter } from './infrastructure/aeat/stub-verifactu-submission.adapter';
import { VERIFACTU_SUBMISSION_FACTORY } from './infrastructure/aeat/verifactu-submission.adapter.provider';
import { PrismaVerifactuCredentialRepository } from './infrastructure/credentials/prisma-verifactu-credential.repository';
import { VerifactuTenantTlsService } from './infrastructure/credentials/verifactu-tenant-tls.service';
import { PrismaVerifactuRepository } from './infrastructure/persistence/prisma-verifactu.repository';
import { VerifactuController } from './presentation/verifactu.controller';

@Module({
  imports: [SharedInfrastructureModule],
  controllers: [VerifactuController],
  providers: [
    VerifactuApplicationService,
    VerifactuQueueProcessorService,
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
