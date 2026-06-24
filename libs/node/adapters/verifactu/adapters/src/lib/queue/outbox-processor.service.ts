import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { VerifactuPrismaService } from './verifactu-prisma.service';

@Injectable()
export class OutboxProcessorService implements OnModuleInit {
  private readonly logger = new Logger(OutboxProcessorService.name);

  constructor(private readonly prisma: VerifactuPrismaService) {}

  onModuleInit() {
    this.logger.log('Outbox Processor initialized');
    void this.processOutbox();
  }

  private async processOutbox() {
    // Poll for pending outbox events every 5 seconds
    const interval = setInterval(async () => {
      await this.processPending();
    }, 5000);

    // Handle graceful shutdown
    const cleanup = () => {
      clearInterval(interval);
    };
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
  }

  private async processPending() {
    const events = await this.prisma.outboxEvent.findMany({
      where: {
        status: 'PENDING',
        OR: [{ processedAt: null }, { processedAt: { gt: new Date() } }],
      },
      take: 10,
      orderBy: { createdAt: 'asc' },
    });

    if (events.length === 0) return;

    for (const event of events) {
      await this.processEvent(event);
    }
  }

  private async processEvent(event: {
    id: string;
    aggregateType: string;
    aggregateId: string;
    eventType: string;
    payload: unknown;
  }) {
    this.logger.log(`Processing outbox event ${event.eventType} for ${event.aggregateType}`);

    try {
      // Process based on event type
      switch (event.eventType) {
        case 'invoice.submitted':
          await this.handleInvoiceSubmitted(event);
          break;
        case 'invoice.cancelled':
          await this.handleInvoiceCancelled(event);
          break;
        case 'invoice.rectificada':
          await this.handleInvoiceRectificada(event);
          break;
        default:
          this.logger.warn(`Unknown event type: ${event.eventType}`);
      }

      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: { status: 'PROCESSED', processedAt: new Date() },
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Outbox event failed: ${err.message}`);

      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: 'FAILED',
          retries: { increment: 1 },
        },
      });
    }
  }

  private async handleInvoiceSubmitted(event: {
    tenantId?: string;
    invoiceId?: string;
    payload: unknown;
  }) {
    // Sync with ERP if needed
    const erpApiUrl = process.env.ERP_API_URL;
    if (!erpApiUrl) return;

    const payload = event.payload as {
      invoiceId?: string;
      tenantId?: string;
      currentHash?: string;
    };

    if (payload.invoiceId && payload.tenantId) {
      await fetch(`${erpApiUrl}/invoices/${payload.invoiceId}/verifactu-sync`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verifactuStatus: 'SENT',
          currentHash: payload.currentHash,
        }),
      }).catch((err) => {
        this.logger.error('ERP sync failed', err);
      });
    }
  }

  private async handleInvoiceCancelled(_event: {
    tenantId?: string;
    invoiceId?: string;
    payload: unknown;
  }) {
    // Sync cancellation with ERP
  }

  private async handleInvoiceRectificada(_event: {
    tenantId?: string;
    invoiceId?: string;
    payload: unknown;
  }) {
    // Sync rectification with ERP
  }
}