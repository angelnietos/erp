import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-data-access';

export interface FleetConfig {
  _isFleetConfig?: boolean;
}

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

