import { Module, Global } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuditLogWriterService } from './audit/audit-log-writer.service';
import { AuditInterceptor } from './interceptors/audit.interceptor';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [AuditLogWriterService, AuditInterceptor],
  exports: [PrismaModule, AuditLogWriterService, AuditInterceptor],
})
export class SharedInfrastructureModule {}
