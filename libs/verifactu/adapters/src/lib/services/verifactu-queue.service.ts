import { Injectable } from '@nestjs/common';
import { VerifactuService } from '../../../../core/src';
import { VerifactuPrismaService } from './verifactu-prisma.service';

@Injectable()
export class VerifactuQueueService {
  constructor(
    private readonly prisma: VerifactuPrismaService,
    private readonly verifactuService: VerifactuService,
  ) {}

  async enqueue(invoiceId: string, tenantId: string): Promise<{ queueItemId: string; status: string }> {
    const item = await this.prisma.verifactuQueueItem.create({
      data: {
        invoiceId,
        tenantId,
        status: 'PENDING',
      },
    });
    return { queueItemId: item.id, status: item.status };
  }

  async processPending(limit = 20): Promise<{ processed: number; success: number; failed: number }> {
    const now = new Date();
    const items = await this.prisma.verifactuQueueItem.findMany({
      where: {
        status: { in: ['PENDING', 'RETRYING'] },
        OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }],
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    let success = 0;
    let failed = 0;
    for (const item of items) {
      try {
        await this.verifactuService.submitInvoice({
          invoiceId: item.invoiceId,
          tenantId: item.tenantId,
        });
        await this.prisma.verifactuQueueItem.update({
          where: { id: item.id },
          data: { status: 'DONE', lastError: null },
        });
        success++;
      } catch (error) {
        const retries = item.retries + 1;
        const exceeded = retries >= item.maxRetries;
        await this.prisma.verifactuQueueItem.update({
          where: { id: item.id },
          data: {
            retries,
            status: exceeded ? 'FAILED' : 'RETRYING',
            nextRetryAt: exceeded ? null : new Date(Date.now() + retries * 60_000),
            lastError: error instanceof Error ? error.message : 'Unknown queue error',
          },
        });
        failed++;
      }
    }

    return { processed: items.length, success, failed };
  }
}

