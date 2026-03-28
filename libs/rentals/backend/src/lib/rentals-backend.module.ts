import { Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-data-access';

/**
 * Rentals Backend Module
 * Provides infrastructure layer for rentals domain
 * Currently imports PrismaModule for database access
 */
@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class RentalsBackendModule {}
