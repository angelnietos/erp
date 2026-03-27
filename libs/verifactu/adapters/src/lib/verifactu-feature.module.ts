import { Module } from '@nestjs/common';
import {
  AEAT_CLIENT,
  VERIFACTU_INVOICE_REPOSITORY,
  VerifactuHashService,
  VerifactuQrService,
  VerifactuService,
  VerifactuXmlBuilderService,
  WEBHOOK_NOTIFIER,
} from '../../../core/src';
import { MockAeatClient } from './aeat/mock-aeat.client';
import { RealAeatClient } from './aeat/real-aeat.client';
import { VerifactuController } from './http/verifactu.controller';
import { VerifactuComplianceController } from './http/verifactu-compliance.controller';
import { VerifactuCustomersController } from './http/verifactu-customers.controller';
import { VerifactuQueueController } from './http/verifactu-queue.controller';
import { VerifactuRecordQueryController } from './http/verifactu-record-query.controller';
import { VerifactuSeriesController } from './http/verifactu-series.controller';
import { VerifactuWebhooksController } from './http/verifactu-webhooks.controller';
import { PrismaVerifactuRepository } from './persistence/prisma-verifactu.repository';
import { VerifactuApiKeyGuard } from './security/verifactu-api-key.guard';
import { VerifactuQueueService } from './services/verifactu-queue.service';
import { VerifactuPrismaService } from './services/verifactu-prisma.service';
import { PrismaWebhookNotifierService } from './webhooks/prisma-webhook-notifier.service';

@Module({
  controllers: [
    VerifactuController,
    VerifactuQueueController,
    VerifactuWebhooksController,
    VerifactuCustomersController,
    VerifactuSeriesController,
    VerifactuRecordQueryController,
    VerifactuComplianceController,
  ],
  providers: [
    VerifactuService,
    VerifactuHashService,
    VerifactuXmlBuilderService,
    VerifactuQrService,
    VerifactuPrismaService,
    VerifactuQueueService,
    RealAeatClient,
    VerifactuApiKeyGuard,
    {
      provide: VERIFACTU_INVOICE_REPOSITORY,
      useClass: PrismaVerifactuRepository,
    },
    {
      provide: WEBHOOK_NOTIFIER,
      useClass: PrismaWebhookNotifierService,
    },
    {
      provide: AEAT_CLIENT,
      useFactory: (realAeatClient: RealAeatClient) => {
        const mode = process.env.VERIFACTU_MODE ?? 'mock';
        return mode === 'real' ? realAeatClient : new MockAeatClient();
      },
      inject: [RealAeatClient],
    },
  ],
  exports: [VerifactuService],
})
export class VerifactuFeatureModule {}

