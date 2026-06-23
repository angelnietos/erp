import { Module } from '@nestjs/common';
import { SharedInfrastructureModule } from '@generic-crm/shared-infrastructure';
import { CLIENTS_REPOSITORY } from '@generic-crm/clients-core';
import { ClientsApplicationService } from './application/clients.application.service';
import { PrismaClientsRepository } from './infrastructure/persistence/prisma-clients.repository';
import { ClientsController } from './presentation/clients.controller';

@Module({
  imports: [SharedInfrastructureModule],
  controllers: [ClientsController],
  providers: [
    ClientsApplicationService,
    PrismaClientsRepository,
    {
      provide: CLIENTS_REPOSITORY,
      useExisting: PrismaClientsRepository,
    },
  ],
  exports: [ClientsApplicationService],
})
export class ClientsModule {}
