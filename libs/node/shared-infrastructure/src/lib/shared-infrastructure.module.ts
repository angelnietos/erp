import { Module, Global } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuditLogWriterService } from './audit/audit-log-writer.service';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { PiiRedactionInterceptor } from './interceptors/pii-redaction.interceptor';
import { PiiCryptoService } from './privacy/pii-crypto.service';
import { PermissionsGuard } from './guards/permissions.guard';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    AuditLogWriterService,
    AuditInterceptor,
    PiiRedactionInterceptor,
    PiiCryptoService,
    PermissionsGuard,
  ],
  exports: [
    PrismaModule,
    AuditLogWriterService,
    AuditInterceptor,
    PiiRedactionInterceptor,
    PiiCryptoService,
    PermissionsGuard,
  ],
})
export class SharedInfrastructureModule {}
