import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/prisma/prisma.module';
import { ClientsController } from './presentation/controllers/clients.controller';
import { CLIENTS_REPOSITORY, ClientsService } from '@josanz-erp/clients-core';
import { PrismaClientsRepository } from './infrastructure/repositories/prisma-clients.repository';

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
  exports: [],
})
export class ClientsModule {}
