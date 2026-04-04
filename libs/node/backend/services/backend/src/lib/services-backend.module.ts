import { Module } from '@nestjs/common';
import {
  OutboxModule,
  PrismaModule,
  SharedInfrastructureModule,
} from '@josanz-erp/shared-infrastructure';
import { ServicesService } from './application/services/services.service';
import { ServicesController } from './presentation/controllers/services.controller';
import { SERVICES_REPOSITORY } from '@josanz-erp/services-core';
import { PrismaServicesRepository } from './infrastructure/repositories/prisma-services.repository';

@Module({
  imports: [SharedInfrastructureModule, OutboxModule, PrismaModule],
  controllers: [ServicesController],
  providers: [
    ServicesService,
    {
      provide: SERVICES_REPOSITORY,
      useClass: PrismaServicesRepository,
    },
  ],
  exports: [ServicesService],
})
export class ServicesBackendModule {}
