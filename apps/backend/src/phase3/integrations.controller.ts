import { Body, Controller, Get, Header, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { DomainEventsService } from './domain-events.service';

interface WebhookRegistration {
  id: string;
  url: string;
  events: string[];
  secret: string;
  createdAt: string;
}

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationsController {
  private static hooks: WebhookRegistration[] = [];

  constructor(private readonly domainEvents: DomainEventsService) {}

  @Get('calendar/feed.ics')
  @Header('Content-Type', 'text/calendar; charset=utf-8')
  @ApiOperation({ summary: 'Feed iCalendar mínimo (suscripción externa)' })
  calendarFeed(@Req() req: Request) {
    const tenantId = (req.headers['x-tenant-id'] as string) || 'tenant';
    const now =
      new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Josanz ERP//Fase 3//ES',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:josanz-phase3-' + tenantId + '@josanz-erp.local',
      'DTSTAMP:' + now,
      'DTSTART:' + now,
      'SUMMARY:Resumen operativo Josanz ERP',
      'DESCRIPTION:Feed de calendario de integración (placeholder configurable).',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }

  @Post('webhooks')
  @ApiOperation({ summary: 'Registrar webhook saliente (stub)' })
  @ApiBody({
    schema: {
      example: { url: 'https://example.com/hook', events: ['invoice.paid'] },
    },
  })
  registerWebhook(
    @Req() req: Request,
    @Body() body: { url: string; events?: string[] },
  ) {
    const tenantId =
      (req.headers['x-tenant-id'] as string) ||
      '00000000-0000-0000-0000-000000000000';
    const reg: WebhookRegistration = {
      id: `wh_${Date.now()}`,
      url: body.url,
      events: body.events?.length ? body.events : ['*'],
      secret: `sec_${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
    };
    IntegrationsController.hooks.push(reg);
    this.domainEvents.append(tenantId, {
      eventType: 'WebhookRegistered',
      aggregateType: 'Integration',
      aggregateId: reg.id,
      payload: { url: reg.url, events: reg.events },
    });
    return { ...reg, tenantId };
  }

  @Get('webhooks')
  @ApiOperation({ summary: 'Listar webhooks registrados (memoria)' })
  listWebhooks() {
    return IntegrationsController.hooks;
  }
}
