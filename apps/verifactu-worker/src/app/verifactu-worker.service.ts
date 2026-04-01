import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  VerifactuPrismaService,
  VerifactuSubmissionHttpClient,
} from '@josanz-erp/verifactu-adapters';

@Injectable()
export class VerifactuWorkerService implements OnModuleInit {
  private readonly logger = new Logger(VerifactuWorkerService.name);
  private isProcessing = false;

  constructor(
    private readonly prisma: VerifactuPrismaService,
    private readonly verifactuClient: VerifactuSubmissionHttpClient,
  ) {}

  onModuleInit() {
    this.logger.log('🚀 Verifactu Outbox Worker Initialized');
  }

  // Poll every 10 seconds for pending items
  // Using Cron for standard NestJS approach
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      await this.processQueue();
    } catch (error) {
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.logger.error('Error during Verifactu queue processing', (error as any).stack);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processQueue() {
    // We search for PENDING items or FAILED items with retries left
    const items = await this.prisma.verifactuQueueItem.findMany({
      where: {
        OR: [
          { status: 'PENDING' },
          { 
            status: 'FAILED', 
            retries: { lt: 5 },
            // Optional: only retry after 5 mins
            nextRetryAt: { lte: new Date() }
          }
        ]
      },
      take: 10, // Process in batches
      orderBy: { createdAt: 'asc' }
    });

    if (items.length === 0) return;

    this.logger.log(`Processing ${items.length} Verifactu items...`);

    for (const item of items) {
      await this.processItem(item);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async processItem(item: any) {
    this.logger.debug(`Submiting Invoice ${item.invoiceId} for Tenant ${item.tenantId}...`);

    try {
      const response = await this.verifactuClient.submitInvoice({
        invoiceId: item.invoiceId,
        tenantId: item.tenantId
      });

      // Success
      await this.prisma.verifactuQueueItem.update({
        where: { id: item.id },
        data: {
          status: 'COMPLETED',
          updatedAt: new Date()
        }
      });

      // Update Invoice status too
      await this.prisma.invoice.update({
        where: { id: item.invoiceId },
        data: {
          verifactuStatus: 'SENT',
          currentHash: response.currentHash,
          previousHash: response.previousHash
        }
      });

      this.logger.log(`✅ Success for Invoice ${item.invoiceId}`);
      
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      const nextRetries = item.retries + 1;
      const nextRetryAt = new Date();
      nextRetryAt.setMinutes(nextRetryAt.getMinutes() + Math.pow(2, nextRetries)); // Exponential backoff

      this.logger.warn(`❌ Failed for Invoice ${item.invoiceId}. Retries: ${nextRetries}. Error: ${err.message}`);

      await this.prisma.verifactuQueueItem.update({
        where: { id: item.id },
        data: {
          status: 'FAILED',
          retries: nextRetries,
          lastError: err.message,
          nextRetryAt,
          updatedAt: new Date()
        }
      });
    }
  }
}
