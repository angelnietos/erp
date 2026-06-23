import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import { CrmErpInvoiceMirrorHttpClient } from '@josanz-erp/verifactu-adapters';

@Injectable()
export class SubmitInvoiceToVerifactuUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crmMirror: CrmErpInvoiceMirrorHttpClient,
  ) {}

  async execute(input: { invoiceId: string; tenantId: string }) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: input.invoiceId, tenantId: input.tenantId },
      select: {
        id: true,
        invoiceNumber: true,
        total: true,
        issueDate: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${input.invoiceId} not found for tenant`);
    }

    const queueItem = await this.prisma.verifactuQueueItem.create({
      data: {
        invoiceId: input.invoiceId,
        tenantId: input.tenantId,
        status: 'PENDING',
        retries: 0,
        maxRetries: 5,
      },
    });

    await this.crmMirror.mirrorInvoiceSafe({
      invoiceId: invoice.id,
      tenantId: input.tenantId,
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.total,
      issuedAt: invoice.issueDate.toISOString(),
    });

    return queueItem;
  }
}
