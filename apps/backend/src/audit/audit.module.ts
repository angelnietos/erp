import { Module } from '@nestjs/common';
import { SharedInfrastructureModule } from '@josanz-erp/shared-infrastructure';
import { AuditLogsController } from './audit-logs.controller';

@Module({
  imports: [SharedInfrastructureModule],
  controllers: [AuditLogsController],
})
export class AuditModule {}
