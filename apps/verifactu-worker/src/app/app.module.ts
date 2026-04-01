import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import {
  VerifactuErpAdapterModule,
  VerifactuPrismaService,
} from '@josanz-erp/verifactu-adapters';
import { VerifactuWorkerService } from './verifactu-worker.service';

@Module({
  imports: [ScheduleModule.forRoot(), VerifactuErpAdapterModule],
  providers: [VerifactuPrismaService, VerifactuWorkerService],
})
export class AppModule {}
