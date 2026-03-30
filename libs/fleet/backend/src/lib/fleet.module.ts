import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-infrastructure';
import { FleetController } from './infrastructure/http/fleet.controller';
import { FleetService } from './application/fleet.service';

export interface FleetConfig {
  _isFleetConfig?: boolean;
}

@Module({})
export class FleetModule {
  static forRoot(options?: FleetConfig): DynamicModule {
    return {
      module: FleetModule,
      imports: [PrismaModule],
      controllers: [FleetController],
      providers: [
        FleetService,
        {
          provide: 'FLEET_CONFIG',
          useValue: options || {},
        },
      ],
      exports: [],
    };
  }
}


