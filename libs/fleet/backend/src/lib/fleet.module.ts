import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-data-access';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FleetConfig {}

@Module({})
export class FleetModule {
  static forRoot(options?: FleetConfig): DynamicModule {
    return {
      module: FleetModule,
      imports: [PrismaModule],
      controllers: [],
      providers: [
        {
          provide: 'FLEET_CONFIG',
          useValue: options || {},
        },
      ],
      exports: [],
    };
  }
}

