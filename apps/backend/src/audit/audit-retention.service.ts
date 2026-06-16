import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@josanz-erp/shared-infrastructure';

/** ISO 27001 / RGPD — retención limitada de logs de auditoría. */
@Injectable()
export class AuditRetentionService {
  private readonly logger = new Logger(AuditRetentionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /** Domingo 04:00 UTC — purga audit_logs antiguos. */
  @Cron('0 4 * * 0')
  async purgeStaleAuditLogs(): Promise<void> {
    const days = parseInt(
      this.config.get<string>('AUDIT_LOG_RETENTION_DAYS') ?? '730',
      10,
    );
    if (!Number.isFinite(days) || days <= 0) {
      return;
    }
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - days);
    const result = await this.prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    if (result.count > 0) {
      this.logger.log(
        `Retención audit_logs: eliminadas ${result.count} filas anteriores a ${cutoff.toISOString()} (${days} días)`,
      );
    }
  }
}
