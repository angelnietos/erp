import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-infrastructure';

export interface DeliveryConfig {
  _isDeliveryConfig?: boolean;
}

import { DeliveryController } from './infrastructure/http/delivery.controller';
import { DeliveryService } from './application/delivery.service';

@Module({})
export class DeliveryModule {
  static forRoot(options?: DeliveryConfig): DynamicModule {
    return {
      module: DeliveryModule,
      imports: [PrismaModule],
      controllers: [DeliveryController],
      providers: [
        DeliveryService,
        {
          provide: 'DELIVERY_CONFIG',
          useValue: options || {},
        },
      ],
      exports: [],
    };
  }
}

