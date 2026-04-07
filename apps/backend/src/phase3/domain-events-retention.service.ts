import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@josanz-erp/shared-infrastructure';

@Injectable()
export class DomainEventsRetentionService {
  private readonly logger = new Logger(DomainEventsRetentionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /** Domingo 03:00 UTC — purga `domain_events` por antigüedad (configurable). */
  @Cron('0 3 * * 0')
  async purgeStaleDomainEvents(): Promise<void> {
    const days = parseInt(
      this.config.get<string>('DOMAIN_EVENTS_RETENTION_DAYS') ?? '365',
      10,
    );
    if (!Number.isFinite(days) || days <= 0) {
      return;
    }
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - days);
    const result = await this.prisma.domainEventRecord.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    if (result.count > 0) {
      this.logger.log(
        `Retención domain_events: eliminadas ${result.count} filas anteriores a ${cutoff.toISOString()} (${days} días)`,
      );
    }
  }
}
