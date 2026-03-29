import { Module } from '@nestjs/common';
import {
  AEAT_CLIENT,
  VERIFACTU_INVOICE_REPOSITORY,
  VerifactuHashService,
  VerifactuQrService,
  VerifactuService,
  VerifactuXmlBuilderService,
  WEBHOOK_NOTIFIER,
} from '@josanz-erp/verifactu-core';
import { MockAeatClient } from './aeat/mock-aeat.client';
import { RealAeatClient } from './aeat/real-aeat.client';
import { PrismaVerifactuRepository } from './persistence/prisma-verifactu.repository';
import { VerifactuApiKeyGuard } from './security/verifactu-api-key.guard';
import { VerifactuQueueService } from './services/verifactu-queue.service';
import { VerifactuPrismaService } from './services/verifactu-prisma.service';
import { PrismaWebhookNotifierService } from './webhooks/prisma-webhook-notifier.service';

@Module({
  controllers: [],
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
  exports: [
    VerifactuService,
    VerifactuPrismaService,
    VerifactuQueueService,
    VerifactuApiKeyGuard,
  ],
})
export class VerifactuFeatureModule {}

