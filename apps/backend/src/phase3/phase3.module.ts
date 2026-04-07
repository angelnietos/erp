import { Module } from '@nestjs/common';
import { PrismaModule } from '@josanz-erp/shared-infrastructure';
import { DomainEventsService } from './domain-events.service';
import { DomainEventsController } from './domain-events.controller';
import { IntegrationsController } from './integrations.controller';
import { WebhookDispatcherService } from './webhook-dispatcher.service';
import { IntegrationWebhooksService } from './integration-webhooks.service';
import { WebhookQueueWorker } from './webhook-queue.worker';
import { DomainEventsRetentionService } from './domain-events-retention.service';

@Module({
  imports: [PrismaModule],
  controllers: [DomainEventsController, IntegrationsController],
  providers: [
    WebhookDispatcherService,
    DomainEventsService,
    IntegrationWebhooksService,
    WebhookQueueWorker,
    DomainEventsRetentionService,
  ],
  exports: [DomainEventsService, IntegrationWebhooksService],
})
export class Phase3Module {}
