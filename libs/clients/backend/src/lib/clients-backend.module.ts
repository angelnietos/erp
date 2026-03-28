import { Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-data-access';
import { ClientsController } from './presentation/controllers/clients.controller';
import { CLIENTS_REPOSITORY, ClientsService } from '@josanz-erp/clients-core';
import { PrismaClientsRepository } from './infrastructure/repositories/prisma-clients.repository';

/**
 * Clients Backend Module
 * NestJS module that provides backend infrastructure for the clients feature
 * This module re-exports the ClientsService and sets up the repository pattern
 */
@Module({
  imports: [PrismaModule],
  controllers: [ClientsController],
  providers: [
    ClientsService,
    {
      provide: CLIENTS_REPOSITORY,
      useClass: PrismaClientsRepository,
    },
  ],
  exports: [ClientsService],
})
export class ClientsBackendModule {}