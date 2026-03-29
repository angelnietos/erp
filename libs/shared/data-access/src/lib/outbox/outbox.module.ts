import { Module } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [OutboxService],
  exports: [PrismaModule, OutboxService],
})
export class OutboxModule {}
