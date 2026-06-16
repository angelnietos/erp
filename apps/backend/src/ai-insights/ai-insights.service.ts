import { Injectable } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';

export type AiInsightEventType =
  | 'workflow'
  | 'chat'
  | 'feedback'
  | 'delegation'
  | 'prediction'
  | 'system';

export interface CreateAiInsightDto {
  botId: string;
  feature: string;
  title: string;
  summary: string;
  metrics?: Record<string, string | number>;
  metadata?: Record<string, string | number | boolean>;
  priority?: string;
  userId?: string;
  userEmail?: string;
  sessionId?: string;
  eventType?: AiInsightEventType;
}

export interface AiInsightListFilters {
  userId?: string;
  feature?: string;
  botId?: string;
  eventType?: string;
  limit?: number;
}

export interface AiInsightsSummaryDto {
  total: number;
  today: number;
  last7Days: number;
  activeUsers: number;
  lastInsightAt: string | null;
  byEventType: Record<string, number>;
  byFeature: Record<string, number>;
  byBot: Record<string, number>;
}

export interface AiTrainingRowDto {
  id: string;
  createdAt: string;
  userId: string | null;
  userEmail: string | null;
  sessionId: string | null;
  eventType: string;
  feature: string;
  botId: string;
  title: string;
  summary: string;
  priority: string;
  metrics: Record<string, unknown>;
  metadata: Record<string, unknown>;
  /** Etiqueta sugerida para fine-tuning (p. ej. feedback positivo/negativo). */
  label: string | null;
}

@Injectable()
export class AiInsightsService {
  constructor(private prisma: PrismaService) {}

  async createEvent(tenantId: string, data: CreateAiInsightDto) {
    return this.prisma.aiInsight.create({
      data: {
        tenantId,
        userId: data.userId ?? null,
        userEmail: data.userEmail ?? null,
        sessionId: data.sessionId ?? null,
        eventType: data.eventType ?? 'system',
        botId: data.botId,
        feature: data.feature,
        title: data.title,
        summary: data.summary,
        metrics: data.metrics ?? {},
        metadata: data.metadata ?? {},
        priority: data.priority ?? 'MEDIUM',
      },
    });
  }

  async findByTenant(tenantId: string, filters: AiInsightListFilters = {}) {
    const limit = Math.min(Math.max(filters.limit ?? 100, 1), 500);
    return this.prisma.aiInsight.findMany({
      where: {
        tenantId,
        ...(filters.userId ? { userId: filters.userId } : {}),
        ...(filters.feature ? { feature: filters.feature } : {}),
        ...(filters.botId ? { botId: filters.botId } : {}),
        ...(filters.eventType ? { eventType: filters.eventType } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getSummary(tenantId: string): Promise<AiInsightsSummaryDto> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [total, today, last7Days, lastRow, byEventType, byFeature, byBot, users] =
      await Promise.all([
        this.prisma.aiInsight.count({ where: { tenantId } }),
        this.prisma.aiInsight.count({
          where: { tenantId, createdAt: { gte: startOfToday } },
        }),
        this.prisma.aiInsight.count({
          where: { tenantId, createdAt: { gte: weekAgo } },
        }),
        this.prisma.aiInsight.findFirst({
          where: { tenantId },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        }),
        this.prisma.aiInsight.groupBy({
          by: ['eventType'],
          where: { tenantId },
          _count: { _all: true },
        }),
        this.prisma.aiInsight.groupBy({
          by: ['feature'],
          where: { tenantId },
          _count: { _all: true },
        }),
        this.prisma.aiInsight.groupBy({
          by: ['botId'],
          where: { tenantId },
          _count: { _all: true },
        }),
        this.prisma.aiInsight.findMany({
          where: { tenantId, userId: { not: null } },
          distinct: ['userId'],
          select: { userId: true },
        }),
      ]);

    const mapGroup = (rows: { _count: { _all: number }; [k: string]: unknown }[], key: string) =>
      Object.fromEntries(rows.map((r) => [String(r[key]), r._count._all]));

    return {
      total,
      today,
      last7Days,
      activeUsers: users.length,
      lastInsightAt: lastRow?.createdAt?.toISOString() ?? null,
      byEventType: mapGroup(byEventType as never, 'eventType'),
      byFeature: mapGroup(byFeature as never, 'feature'),
      byBot: mapGroup(byBot as never, 'botId'),
    };
  }

  async getTrainingDataset(
    tenantId: string,
    opts: { limit?: number; userId?: string; eventType?: string } = {},
  ) {
    const limit = Math.min(Math.max(opts.limit ?? 200, 1), 1000);
    const rows = await this.prisma.aiInsight.findMany({
      where: {
        tenantId,
        ...(opts.userId ? { userId: opts.userId } : {}),
        ...(opts.eventType ? { eventType: opts.eventType } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const mapped: AiTrainingRowDto[] = rows.map((r) => {
      const metadata = (r.metadata ?? {}) as Record<string, unknown>;
      let label: string | null = null;
      if (r.eventType === 'feedback' && typeof metadata['sentiment'] === 'string') {
        label = metadata['sentiment'] as string;
      } else if (r.eventType === 'workflow') {
        label = 'orchestration_success';
      } else if (r.eventType === 'chat') {
        label = 'assistant_turn';
      }

      return {
        id: r.id,
        createdAt: r.createdAt.toISOString(),
        userId: r.userId,
        userEmail: r.userEmail,
        sessionId: r.sessionId,
        eventType: r.eventType,
        feature: r.feature,
        botId: r.botId,
        title: r.title,
        summary: r.summary,
        priority: r.priority,
        metrics: (r.metrics ?? {}) as Record<string, unknown>,
        metadata,
        label,
      };
    });

    return {
      generatedAt: new Date().toISOString(),
      tenantId,
      total: mapped.length,
      rows: mapped,
    };
  }

  async getUserActivity(tenantId: string) {
    const grouped = await this.prisma.aiInsight.groupBy({
      by: ['userId', 'userEmail'],
      where: { tenantId, userId: { not: null } },
      _count: { _all: true },
      _max: { createdAt: true },
    });

    return grouped
      .map((g) => ({
        userId: g.userId as string,
        userEmail: g.userEmail ?? '(sin email)',
        count: g._count._all,
        lastActivityAt: g._max.createdAt?.toISOString() ?? null,
      }))
      .sort((a, b) => b.count - a.count);
  }
}
