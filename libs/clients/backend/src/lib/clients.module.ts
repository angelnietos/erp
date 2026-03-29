import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-data-access';
import { ClientsController } from './presentation/controllers/clients.controller';
import { CLIENTS_REPOSITORY, ClientsService } from '@josanz-erp/clients-core';
import { PrismaClientsRepository } from './infrastructure/repositories/prisma-clients.repository';

export interface ClientsConfig {
  _isClientsConfig?: boolean;
}

@Module({})
export class ClientsModule {
  static forRoot(options?: ClientsConfig): DynamicModule {
    return {
      module: ClientsModule,
      imports: [PrismaModule],
      controllers: [ClientsController],
      providers: [
        ClientsService,
        {
          provide: CLIENTS_REPOSITORY,
          useClass: PrismaClientsRepository,
        },
        {
          provide: 'CLIENTS_CONFIG',
          useValue: options || {},
        },
      ],
      exports: [],
    };
  }
}

