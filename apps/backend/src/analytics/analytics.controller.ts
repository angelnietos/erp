import { Controller, Get, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AnalyticsService, DashboardSummaryDto } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('dashboard-summary')
  @ApiOperation({ summary: 'KPIs agregados para el dashboard (Fase 3)' })
  @ApiResponse({ status: 200, description: 'Resumen calculado o valores demo' })
  async dashboardSummary(@Req() req: Request): Promise<DashboardSummaryDto> {
    const tenantId = (req.headers['x-tenant-id'] as string) || '00000000-0000-0000-0000-000000000000';
    return this.analytics.getDashboardSummary(tenantId);
  }
}
