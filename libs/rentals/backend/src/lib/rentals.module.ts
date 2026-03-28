import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-data-access';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RentalsConfig {}

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

