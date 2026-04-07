import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-infrastructure';
import { ClientsController } from './infrastructure/http/clients.controller';
import { ClientsService } from './application/clients.service';

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
          provide: 'CLIENTS_CONFIG',
          useValue: options || {},
        },
      ],
      exports: [],
    };
  }
}
