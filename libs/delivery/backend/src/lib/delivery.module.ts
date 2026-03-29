import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-data-access';

export interface DeliveryConfig {
  _isDeliveryConfig?: boolean;
}

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

