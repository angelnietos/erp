import { Module } from '@nestjs/common';
import {
  OutboxModule,
  PrismaModule,
  SharedInfrastructureModule,
} from '@josanz-erp/shared-infrastructure';
import { ReceiptsService } from './application/services/receipts.service';
import { ReceiptsController } from './presentation/controllers/receipts.controller';
import { RECEIPTS_REPOSITORY } from '@josanz-erp/receipts-core';
import { PrismaReceiptsRepository } from './infrastructure/repositories/prisma-receipts.repository';

@Module({
  imports: [SharedInfrastructureModule, OutboxModule, PrismaModule],
  controllers: [ReceiptsController],
  providers: [
    ReceiptsService,
    {
      provide: RECEIPTS_REPOSITORY,
      useClass: PrismaReceiptsRepository,
    },
  ],
  exports: [ReceiptsService],
})
export class ReceiptsBackendModule {}
