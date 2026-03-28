import { Module } from '@nestjs/common';
import { INVENTORY_REPOSITORY } from '@josanz-erp/inventory-core';
import { SharedInfrastructureModule } from '@josanz-erp/shared-infrastructure';

/**
 * Inventory Backend Module
 * NestJS module that provides backend infrastructure for the inventory feature
 */
@Module({
  imports: [SharedInfrastructureModule],
  providers: [
    {
      provide: INVENTORY_REPOSITORY,
      useValue: {}, // TODO: Implement PrismaInventoryRepository
    },
  ],
  exports: [INVENTORY_REPOSITORY],
})
export class InventoryBackendModule {}