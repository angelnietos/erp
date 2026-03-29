import { Injectable } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-data-access';

@Injectable()
export class SubmitInvoiceToVerifactuUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { invoiceId: string; tenantId: string }) {
    // We create a PENDING item in the queue.
    // The worker will process it.
    return this.prisma.verifactuQueueItem.create({
      data: {
        invoiceId: input.invoiceId,
        status: 'PENDING',
        retries: 0,
        maxRetries: 5,
        // tenantId is handled automatically by PrismaService proxy if in context
      },
    });
  }
}

