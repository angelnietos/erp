import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { SharedInfrastructureModule } from '@josanz-erp/shared-infrastructure';

@Module({
  imports: [SharedInfrastructureModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsBackendModule {}
