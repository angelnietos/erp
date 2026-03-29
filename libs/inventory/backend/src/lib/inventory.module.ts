import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-data-access';
import { InventoryService } from './application/services/inventory.service';
import { INVENTORY_REPOSITORY } from '@josanz-erp/inventory-core';
import { PrismaInventoryRepository } from './infrastructure/repositories/prisma-inventory.repository';
import { SharedInfrastructureModule } from '@josanz-erp/shared-infrastructure';
import { ProductsController } from './presentation/controllers/inventory.controller';

export interface InventoryConfig {
  _isInventoryConfig?: boolean;
}

@Module({})
export class InventoryModule {
  static forRoot(options?: InventoryConfig): DynamicModule {
    return {
      module: InventoryModule,
      imports: [SharedInfrastructureModule, PrismaModule],
      controllers: [ProductsController],
      providers: [
        InventoryService,
        {
          provide: INVENTORY_REPOSITORY,
          useClass: PrismaInventoryRepository,
        },
        {
          provide: 'INVENTORY_CONFIG',
          useValue: options || {},
        },
      ],
      exports: [InventoryService],
    };
  }
}

