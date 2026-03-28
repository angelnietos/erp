import { Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-data-access';
import { FLEET_REPOSITORY } from '@josanz-erp/fleet-core';

/**
 * Fleet Backend Module
 * NestJS module that provides backend infrastructure for the fleet feature
 */
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: FLEET_REPOSITORY,
      useValue: {}, // TODO: Implement PrismaFleetRepository
    },
  ],
  exports: [FLEET_REPOSITORY],
})
export class FleetBackendModule {}