import { Module } from '@nestjs/common';
import {
  AEAT_CLIENT,
  VERIFACTU_INVOICE_REPOSITORY,
  VerifactuService,
  WEBHOOK_NOTIFIER,
} from '../../../core/src';
import { MockAeatClient } from './aeat/mock-aeat.client';
import { RealAeatClient } from './aeat/real-aeat.client';
import { VerifactuController } from './http/verifactu.controller';
import { PrismaVerifactuRepository } from './persistence/prisma-verifactu.repository';
import { VerifactuApiKeyGuard } from './security/verifactu-api-key.guard';
import { VerifactuPrismaService } from './services/verifactu-prisma.service';
import { PrismaWebhookNotifierService } from './webhooks/prisma-webhook-notifier.service';

@Module({
  controllers: [VerifactuController],
  providers: [
    VerifactuService,
    VerifactuPrismaService,
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
      useFactory: () => {
        const mode = process.env.VERIFACTU_MODE ?? 'mock';
        return mode === 'real' ? new RealAeatClient() : new MockAeatClient();
      },
    },
  ],
  exports: [VerifactuService],
})
export class VerifactuFeatureModule {}

