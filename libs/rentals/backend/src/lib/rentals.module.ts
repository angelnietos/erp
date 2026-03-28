import { Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-data-access';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class RentalsModule {}

