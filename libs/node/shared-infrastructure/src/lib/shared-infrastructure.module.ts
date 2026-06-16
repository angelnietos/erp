import { Module, Global } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuditLogWriterService } from './audit/audit-log-writer.service';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { PiiRedactionInterceptor } from './interceptors/pii-redaction.interceptor';
import { PiiCryptoService } from './privacy/pii-crypto.service';
import { PermissionsGuard } from './guards/permissions.guard';
import { EMAIL_PORT } from './email/email.port';
import { ConsoleEmailAdapter } from './email/console-email.adapter';
import { SmtpEmailAdapter } from './email/smtp-email.adapter';
import { provideEmailPort } from './email/provide-email-port';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    AuditLogWriterService,
    AuditInterceptor,
    PiiRedactionInterceptor,
    PiiCryptoService,
    PermissionsGuard,
    ConsoleEmailAdapter,
    SmtpEmailAdapter,
    provideEmailPort(),
  ],
  exports: [
    PrismaModule,
    AuditLogWriterService,
    AuditInterceptor,
    PiiRedactionInterceptor,
    PiiCryptoService,
    PermissionsGuard,
    EMAIL_PORT,
  ],
})
export class SharedInfrastructureModule {}
