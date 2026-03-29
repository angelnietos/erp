import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-data-access';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DeliveryConfig {}

@Module({})
export class DeliveryModule {
  static forRoot(options?: DeliveryConfig): DynamicModule {
    return {
      module: DeliveryModule,
      imports: [PrismaModule],
      controllers: [],
      providers: [
        {
          provide: 'DELIVERY_CONFIG',
          useValue: options || {},
        },
      ],
      exports: [],
    };
  }
}

