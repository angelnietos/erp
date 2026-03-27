import { Module, Global } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { OutboxService } from './outbox/outbox.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [OutboxService],
  exports: [PrismaModule, OutboxService],
})
export class SharedInfrastructureModule {}
