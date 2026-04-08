import { Injectable } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';

export interface CreateAiInsightDto {
  botId: string;
  feature: string;
  title: string;
  summary: string;
  metrics?: any;
  metadata?: any;
  priority?: string;
}

@Injectable()
export class AiInsightsService {
  constructor(private prisma: PrismaService) {}

  async createEvent(tenantId: string, data: CreateAiInsightDto) {
    return this.prisma.aiInsight.create({
      data: {
        tenantId,
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

  async findByTenant(tenantId: string) {
    return this.prisma.aiInsight.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
