import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { encrypt } from '@josanz-erp/shared-infrastructure';
import { VerifactuPrismaService } from '../services/verifactu-prisma.service';

const CRM_WEBHOOK_PATH = '/internal/erp/verifactu/webhook-event';
const EVENT_TYPES = ['invoice.sent', 'invoice.error'] as const;

@Injectable()
export class CrmWebhookBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(CrmWebhookBootstrapService.name);

  constructor(private readonly prisma: VerifactuPrismaService) {}

  async onModuleInit(): Promise<void> {
    if (process.env['VERIFACTU_CRM_WEBHOOK_AUTO_REGISTER'] === 'false') {
      return;
    }

    const crmApiBase = process.env['VERIFACTU_CRM_API_URL']?.trim();
    const secret =
      process.env['CRM_ERP_WEBHOOK_SECRET']?.trim() ||
      process.env['CRM_ERP_SYNC_API_KEY']?.trim();

    if (!crmApiBase || !secret) {
      this.logger.debug(
        'CRM webhook auto-register skipped (VERIFACTU_CRM_API_URL or webhook secret missing)',
      );
      return;
    }

    const webhookUrl = `${crmApiBase.replace(/\/$/, '')}${CRM_WEBHOOK_PATH}`;
    const tenants = await this.prisma.tenant.findMany({
      select: { id: true, slug: true },
    });

    if (tenants.length === 0) {
      return;
    }

    let registered = 0;
    for (const tenant of tenants) {
      for (const eventType of EVENT_TYPES) {
        const created = await this.ensureEndpoint(
          tenant.id,
          eventType,
          webhookUrl,
          secret,
        );
        if (created) {
          registered += 1;
        }
      }
    }

    this.logger.log(
      `CRM Verifactu webhooks ready (${registered} new) → ${webhookUrl}`,
    );
  }

  private async ensureEndpoint(
    tenantId: string,
    eventType: string,
    url: string,
    secret: string,
  ): Promise<boolean> {
    const existing = await this.prisma.verifactuWebhookEndpoint.findFirst({
      where: { tenantId, eventType, url },
    });

    if (existing) {
      if (!existing.isActive) {
        await this.prisma.verifactuWebhookEndpoint.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
      }
      return false;
    }

    const stale = await this.prisma.verifactuWebhookEndpoint.findMany({
      where: {
        tenantId,
        eventType,
        url: { contains: CRM_WEBHOOK_PATH },
      },
    });
    for (const row of stale) {
      if (row.url !== url) {
        await this.prisma.verifactuWebhookEndpoint.delete({ where: { id: row.id } });
      }
    }

    await this.prisma.verifactuWebhookEndpoint.create({
      data: {
        tenantId,
        eventType,
        url,
        secretHash: encrypt(secret),
        isActive: true,
      },
    });

    return true;
  }
}
