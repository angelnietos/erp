import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { VerifactuErpAdapterModule, VerifactuFeatureModule } from '@josanz-erp/verifactu-adapters';
import { VerifactuWorkerService } from './verifactu-worker.service';

@Module({
  imports: [ScheduleModule.forRoot(), VerifactuErpAdapterModule, VerifactuFeatureModule],
  providers: [VerifactuWorkerService],
})
export class AppModule {}
