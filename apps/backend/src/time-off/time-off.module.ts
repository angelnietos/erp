import { Module } from '@nestjs/common';
import { SharedInfrastructureModule } from '@josanz-erp/shared-infrastructure';
import { TechniciansModule } from '../technicians/technicians.module';
import { TimeOffController } from './time-off.controller';
import { TimeOffService } from './time-off.service';

@Module({
  imports: [SharedInfrastructureModule, TechniciansModule],
  controllers: [TimeOffController],
  providers: [TimeOffService],
  exports: [TimeOffService],
})
export class TimeOffModule {}
