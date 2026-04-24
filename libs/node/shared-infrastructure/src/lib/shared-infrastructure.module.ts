import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuditLogWriterService } from './audit/audit-log-writer.service';
import { AuditInterceptor } from './interceptors/audit.interceptor';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    AuditLogWriterService,
    AuditInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [PrismaModule, AuditLogWriterService, AuditInterceptor],
})
export class SharedInfrastructureModule {}
