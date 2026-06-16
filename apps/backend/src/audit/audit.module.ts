import { Module } from '@nestjs/common';
import { SharedInfrastructureModule } from '@josanz-erp/shared-infrastructure';
import { AuditLogsController } from './audit-logs.controller';
import { AuditRetentionService } from './audit-retention.service';

@Module({
  imports: [SharedInfrastructureModule],
  controllers: [AuditLogsController],
  providers: [AuditRetentionService],
})
export class AuditModule {}
