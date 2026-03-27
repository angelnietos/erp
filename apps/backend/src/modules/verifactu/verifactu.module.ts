import { Module } from '@nestjs/common';
import { SharedInfrastructureModule } from '../../shared/infrastructure/shared-infrastructure.module';
import { VerifactuController } from './presentation/controllers/verifactu.controller';
import { VerifactuService } from './application/services/verifactu.service';
import { PrismaVerifactuRepository } from './infrastructure/persistence/prisma-verifactu.repository';
import { MockAeatClient } from './infrastructure/adapters/aeat/mock-aeat.client';
import { AEAT_CLIENT } from './domain/ports/aeat-client.port';
import { VERIFACTU_INVOICE_REPOSITORY } from './domain/ports/verifactu-invoice.repository.port';

@Module({
  imports: [SharedInfrastructureModule],
  controllers: [VerifactuController],
  providers: [
    VerifactuService,
    {
      provide: VERIFACTU_INVOICE_REPOSITORY,
      useClass: PrismaVerifactuRepository,
    },
    {
      provide: AEAT_CLIENT,
      useClass: MockAeatClient,
    },
  ],
  exports: [VerifactuService],
})
export class VerifactuModule {}

