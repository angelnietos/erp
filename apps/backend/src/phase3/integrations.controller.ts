import { Body, Controller, Get, Header, Post, Patch, Param, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { IntegrationWebhooksService } from './integration-webhooks.service';

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly webhooks: IntegrationWebhooksService) {}

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
  @ApiOperation({ summary: 'Registrar webhook saliente (persistido en BD)' })
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
    return this.webhooks.register(tenantId, body);
  }

  @Get('webhooks')
  @ApiOperation({ summary: 'Listar webhooks del tenant actual' })
  async listWebhooks(@Req() req: Request) {
    const tenantId =
      (req.headers['x-tenant-id'] as string) ||
      '00000000-0000-0000-0000-000000000000';
    return this.webhooks.listForTenant(tenantId);
  }

  @Patch('webhooks/:id/rotate-secret')
  @ApiOperation({ summary: 'Rotar el secreto de un webhook' })
  async rotateWebhookSecret(
    @Req() req: Request,
    @Param('id') id: string
  ) {
    const tenantId =
      (req.headers['x-tenant-id'] as string) ||
      '00000000-0000-0000-0000-000000000000';
    return this.webhooks.rotateSecret(tenantId, id);
  }
}
