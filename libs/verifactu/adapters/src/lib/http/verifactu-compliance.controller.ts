import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { VerifactuApiKeyGuard } from '../security/verifactu-api-key.guard';
import { VerifactuPrismaService } from '../services/verifactu-prisma.service';

@Controller('verifactu/compliance')
@UseGuards(VerifactuApiKeyGuard)
export class VerifactuComplianceController {
  constructor(private readonly prisma: VerifactuPrismaService) {}

  @Get('summary/:tenantId')
  async getSummary(@Param('tenantId') tenantId: string) {
    const [totalLogs, sentLogs, errorLogs, webhookSuccess, webhookFailed] = await Promise.all([
      this.prisma.verifactuLog.count({ where: { tenantId } }),
      this.prisma.verifactuLog.count({ where: { tenantId, status: 'SENT' } }),
      this.prisma.verifactuLog.count({ where: { tenantId, status: 'ERROR' } }),
      this.prisma.verifactuWebhookDelivery.count({ where: { tenantId, status: 'SUCCESS' } }),
      this.prisma.verifactuWebhookDelivery.count({ where: { tenantId, status: 'FAILED' } }),
    ]);

    return {
      tenantId,
      verifactu: {
        totalLogs,
        sentLogs,
        errorLogs,
        successRate: totalLogs > 0 ? Number(((sentLogs / totalLogs) * 100).toFixed(2)) : 0,
      },
      webhooks: {
        success: webhookSuccess,
        failed: webhookFailed,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}

