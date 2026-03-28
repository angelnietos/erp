import { Module } from '@nestjs/common';
import { InventoryService } from './application/services/inventory.service';
import { INVENTORY_REPOSITORY } from '@josanz-erp/inventory-core';
import { PrismaInventoryRepository } from './infrastructure/repositories/prisma-inventory.repository';
import { SharedInfrastructureModule } from '@josanz-erp/shared-infrastructure/shared-infrastructure.module';
import { ProductsController } from './presentation/controllers/inventory.controller';

@Module({
  imports: [SharedInfrastructureModule],
  controllers: [ProductsController],
  providers: [
    InventoryService,
    {
      provide: INVENTORY_REPOSITORY,
      useClass: PrismaInventoryRepository,
    },
  ],
  exports: [InventoryService],
})
export class InventoryModule {}

