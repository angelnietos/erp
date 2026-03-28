import { Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-data-access';
import { DELIVERY_REPOSITORY, DeliveryRepositoryPort } from '@josanz-erp/delivery-core';

/**
 * Delivery Backend Module
 * NestJS module that provides backend infrastructure for the delivery feature
 * Re-exports domain ports and sets up the repository pattern
 */
@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [
    {
      provide: DELIVERY_REPOSITORY,
      useValue: {}, // TODO: Implement PrismaDeliveryRepository
    },
  ],
  exports: [DELIVERY_REPOSITORY],
})
export class DeliveryBackendModule {}