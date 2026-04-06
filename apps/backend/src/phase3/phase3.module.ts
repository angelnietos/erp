import { Module } from '@nestjs/common';
import { DomainEventsService } from './domain-events.service';
import { DomainEventsController } from './domain-events.controller';
import { IntegrationsController } from './integrations.controller';

@Module({
  controllers: [DomainEventsController, IntegrationsController],
  providers: [DomainEventsService],
  exports: [DomainEventsService],
})
export class Phase3Module {}
