import { Module } from '@nestjs/common';
import { ReportsExportController } from './reports-export.controller';

@Module({
  controllers: [ReportsExportController],
})
export class ReportsExportModule {}
