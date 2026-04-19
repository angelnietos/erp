import { Module, Global } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuditLogWriterService } from './audit/audit-log-writer.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [AuditLogWriterService],
  exports: [PrismaModule, AuditLogWriterService],
})
export class SharedInfrastructureModule {}
