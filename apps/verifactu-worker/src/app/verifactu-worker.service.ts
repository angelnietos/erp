import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  VerifactuPrismaService,
  CrmErpInvoiceMirrorHttpClient,
  PrismaWebhookNotifierService,
  VerifactuBullmqQueueService,
} from '@josanz-erp/verifactu-adapters';
import { VerifactuService } from '@josanz-erp/verifactu-core';

@Injectable()
export class VerifactuWorkerService implements OnModuleInit {
  private readonly logger = new Logger(VerifactuWorkerService.name);

  constructor(
    private readonly prisma: VerifactuPrismaService,
    private readonly verifactuService: VerifactuService,
    private readonly crmMirror: CrmErpInvoiceMirrorHttpClient,
    private readonly webhookNotifier: PrismaWebhookNotifierService,
    private readonly bullmqQueue: VerifactuBullmqQueueService,
  ) {}

  onModuleInit() {
    this.logger.log('🚀 Verifactu Outbox Worker Initialized (BullMQ mode)');
    this.processPendingQueue().catch((err) =>
      this.logger.error('Initial queue processing failed', err),
    );
  }

  // Poll every minute for health check (BullMQ handles processing)
  @Cron(CronExpression.EVERY_MINUTE)
  async processPendingQueue() {
    const stats = await this.bullmqQueue.getQueueStats();
    if (stats.waiting > 0) {
      this.logger.log(
        `Queue stats: waiting=${stats.waiting}, active=${stats.active}, completed=${stats.completed}, failed=${stats.failed}`,
      );
    }
  }
}
