import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { DomainEventsService } from './domain-events.service';

@ApiTags('domain-events')
@Controller('domain-events')
export class DomainEventsController {
  constructor(private readonly events: DomainEventsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar eventos de dominio recientes (memoria)' })
  list(@Req() req: Request, @Query('limit') limit?: string) {
    const tenantId = (req.headers['x-tenant-id'] as string) || '00000000-0000-0000-0000-000000000000';
    const n = Math.min(500, Math.max(1, parseInt(limit || '100', 10) || 100));
    return this.events.list(tenantId, n);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar evento de dominio (append-only)' })
  @ApiBody({
    schema: {
      example: {
        eventType: 'ReceiptMarkedPaid',
        aggregateType: 'Receipt',
        aggregateId: 'uuid',
        payload: { status: 'PAID' },
      },
    },
  })
  append(
    @Req() req: Request,
    @Body()
    body: {
      eventType: string;
      aggregateType: string;
      aggregateId: string;
      payload?: Record<string, unknown>;
    },
  ) {
    const tenantId = (req.headers['x-tenant-id'] as string) || '00000000-0000-0000-0000-000000000000';
    return this.events.append(tenantId, {
      eventType: body.eventType,
      aggregateType: body.aggregateType,
      aggregateId: body.aggregateId,
      payload: body.payload ?? {},
    });
  }
}
