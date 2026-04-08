import { Module } from '@nestjs/common';
import { TechniciansController } from './technicians.controller';
import { TechniciansService } from './technicians.service';
import { SharedInfrastructureModule } from '@josanz-erp/shared-infrastructure';

@Module({
  imports: [SharedInfrastructureModule],
  controllers: [TechniciansController],
  providers: [TechniciansService],
  exports: [TechniciansService],
})
export class TechniciansModule {}
