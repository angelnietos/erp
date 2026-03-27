import { Module } from '@nestjs/common';
import { InventoryService } from './application/services/inventory.service';
import { INVENTORY_REPOSITORY } from './domain/repositories/inventory.repository';
import { PrismaInventoryRepository } from './infrastructure/repositories/prisma-inventory.repository';
import { SharedInfrastructureModule } from '../../shared/infrastructure/shared-infrastructure.module';

@Module({
  imports: [SharedInfrastructureModule],
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
