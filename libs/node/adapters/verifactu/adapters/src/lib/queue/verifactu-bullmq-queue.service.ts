import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { VerifactuPrismaService } from '../services/verifactu-prisma.service';
import { VerifactuService } from '@josanz-erp/verifactu-core';

export interface VerifactuQueueItemPayload {
  invoiceId: string;
  tenantId: string;
  attempt?: number;
}

@Injectable()
export class VerifactuBullmqQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(VerifactuBullmqQueueService.name);
  private queue: Queue<VerifactuQueueItemPayload>;
  private worker: Worker<VerifactuQueueItemPayload>;
  private queueEvents: QueueEvents;

  constructor(
    private readonly prisma: VerifactuPrismaService,
    private readonly verifactuService: VerifactuService,
  ) {
    const connection = {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    };
    this.queue = new Queue<VerifactuQueueItemPayload>('verifactu-submission', {
      connection,
    });
    
    this.queueEvents = new QueueEvents('verifactu-submission', { connection });
  }

  onModuleInit() {
    const connection = {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    };

    this.worker = new Worker<VerifactuQueueItemPayload>(
      'verifactu-submission',
      async (job: Job<VerifactuQueueItemPayload>) => {
        const { invoiceId, tenantId } = job.data;
        this.logger.log(`Processing invoice ${invoiceId} for tenant ${tenantId}`);

        try {
          const result = await this.verifactuService.submitInvoice({
            invoiceId,
            tenantId,
          });

          // Update queue item status
          await this.prisma.verifactuQueueItem.updateMany({
            where: { invoiceId, tenantId },
            data: {
              status: 'COMPLETED',
              updatedAt: new Date(),
            },
          });

          return result;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Unknown Verifactu error';
          await this.prisma.verifactuQueueItem.updateMany({
            where: { invoiceId, tenantId },
            data: {
              status: 'FAILED',
              lastError: message,
              retries: { increment: 1 },
            },
          });
          throw error;
        }
      },
      {
        connection,
        concurrency: 5,
        removeOnComplete: { age: 3600 }, // Remove after 1 hour
        removeOnFail: { age: 86400 }, // Remove after 24 hours
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed:`, err?.message);
    });

    this.queueEvents.on('failed', ({ jobId }, err) => {
      this.logger.error(`Queue event failed for ${jobId}:`, err?.message);
    });

    this.logger.log('Verifactu BullMQ worker initialized');
  }

  async onModuleDestroy() {
    await this.worker.close();
    await this.queue.close();
    await this.queueEvents.close();
    this.logger.log('Verifactu BullMQ worker closed');
  }

  async enqueue(invoiceId: string, tenantId: string): Promise<string> {
    const job = await this.queue.add('submit', { invoiceId, tenantId }, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 60000, // Start at 1 minute
      },
      removeOnFail: true,
    });
    return job.id ?? '';
  }

  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  async cleanupOldJobs(): Promise<void> {
    // Handled by removeOnComplete/removeOnFail options
    this.logger.log('Old job cleanup handled by queue configuration');
  }
}