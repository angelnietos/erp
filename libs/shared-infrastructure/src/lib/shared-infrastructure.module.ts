import { Module, Global } from '@nestjs/common';
import { PrismaModule, OutboxModule } from '@josanz-erp/shared-data-access';

@Global()
@Module({
  imports: [PrismaModule, OutboxModule],
  exports: [PrismaModule, OutboxModule],
})
export class SharedInfrastructureModule {}