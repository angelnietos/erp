import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-infrastructure';

export interface RentalsConfig {
  _isRentalsConfig?: boolean;
}

@Module({})
export class RentalsModule {
  static forRoot(options?: RentalsConfig): DynamicModule {
    return {
      module: RentalsModule,
      imports: [PrismaModule],
      controllers: [],
      providers: [
        {
          provide: 'RENTALS_CONFIG',
          useValue: options || {},
        },
      ],
      exports: [],
    };
  }
}

