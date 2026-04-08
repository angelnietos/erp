import { Controller, Get, Post, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AiInsightsService, CreateAiInsightDto } from './ai-insights.service';

@Controller('ai-insights')
export class AiInsightsController {
  constructor(private readonly insightsService: AiInsightsService) {}

  @Post()
  async createInsight(@Req() req: any, @Body() data: CreateAiInsightDto) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) throw new UnauthorizedException('TenantID missing');
    return this.insightsService.createEvent(tenantId as string, data);
  }

  @Get()
  async listInsights(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) throw new UnauthorizedException('TenantID missing');
    return this.insightsService.findByTenant(tenantId as string);
  }
}
