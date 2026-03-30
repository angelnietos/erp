import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-infrastructure';
import { RentalsController } from './infrastructure/http/rentals.controller';
import { RentalsService } from './application/rentals.service';

export interface RentalsConfig {
  _isRentalsConfig?: boolean;
}

@Module({})
export class RentalsModule {
  static forRoot(options?: RentalsConfig): DynamicModule {
    return {
      module: RentalsModule,
      imports: [PrismaModule],
      controllers: [RentalsController],
      providers: [
        RentalsService,
        {
          provide: 'RENTALS_CONFIG',
          useValue: options || {},
        },
      ],
      exports: [],
    };
  }
}


