import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '@josanz-erp/shared-data-access';
import { VerifactuErpAdapterModule } from '@josanz-erp/verifactu-adapters';
import { VerifactuWorkerService } from './verifactu-worker.service';
import { VerifactuSubmissionHttpClient } from '@josanz-erp/verifactu-adapters';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    VerifactuErpAdapterModule
  ],
  providers: [
    VerifactuWorkerService,
    VerifactuSubmissionHttpClient // Provide the actual client locally or from adapter module it already exports?
  ],
})
export class AppModule {}
