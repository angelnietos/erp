import { Injectable } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';

@Injectable()
export class SubmitInvoiceToVerifactuUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: { invoiceId: string; tenantId: string }) {
    // We create a PENDING item in the queue.
    // The worker will process it.
    return this.prisma.verifactuQueueItem.create({
      data: {
        invoiceId: input.invoiceId,
        tenantId: input.tenantId,
        status: 'PENDING',
        retries: 0,
        maxRetries: 5,
      },
    });
  }
}

