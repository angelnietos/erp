import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AiInsightsService,
  CreateAiInsightDto,
} from './ai-insights.service';
import type { Request } from 'express';

@Controller('ai-insights')
export class AiInsightsController {
  constructor(private readonly insightsService: AiInsightsService) {}

  private tenantId(req: Request): string {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) throw new UnauthorizedException('TenantID missing');
    return tenantId as string;
  }

  @Get('summary')
  async summary(@Req() req: Request) {
    return this.insightsService.getSummary(this.tenantId(req));
  }

  @Get('training-dataset')
  async trainingDataset(
    @Req() req: Request,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('eventType') eventType?: string,
  ) {
    return this.insightsService.getTrainingDataset(this.tenantId(req), {
      limit: limit ? Number(limit) : undefined,
      userId: userId || undefined,
      eventType: eventType || undefined,
    });
  }

  @Get('users')
  async userActivity(@Req() req: Request) {
    return this.insightsService.getUserActivity(this.tenantId(req));
  }

  @Post()
  async createInsight(@Req() req: Request, @Body() data: CreateAiInsightDto) {
    return this.insightsService.createEvent(this.tenantId(req), data);
  }

  @Get()
  async listInsights(
    @Req() req: Request,
    @Query('userId') userId?: string,
    @Query('feature') feature?: string,
    @Query('botId') botId?: string,
    @Query('eventType') eventType?: string,
    @Query('limit') limit?: string,
  ) {
    return this.insightsService.findByTenant(this.tenantId(req), {
      userId: userId || undefined,
      feature: feature || undefined,
      botId: botId || undefined,
      eventType: eventType || undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
