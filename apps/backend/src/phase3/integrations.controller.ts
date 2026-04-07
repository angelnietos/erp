import { Body, Controller, Get, Header, Post, Patch, Param, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import { IntegrationWebhooksService } from './integration-webhooks.service';

const TENANT_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function icsEscape(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function toIcsUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly webhooks: IntegrationWebhooksService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('calendar/feed.ics')
  @Header('Content-Type', 'text/calendar; charset=utf-8')
  @ApiOperation({
    summary: 'Feed iCalendar con eventos del tenant (tabla `events`)',
  })
  async calendarFeed(@Req() req: Request): Promise<string> {
    const raw = (req.headers['x-tenant-id'] as string) || '';
    const tenantId = raw.trim();
    const now = new Date();
    const stamp = toIcsUtc(now);

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Josanz ERP//Calendar//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    if (!TENANT_UUID_RE.test(tenantId)) {
      lines.push(
        'BEGIN:VEVENT',
        'UID:josanz-no-tenant@josanz-erp.local',
        'DTSTAMP:' + stamp,
        'DTSTART:' + stamp,
        'SUMMARY:Calendario Josanz',
        'DESCRIPTION:' +
          icsEscape(
            'Indica un x-tenant-id válido (UUID) para ver los eventos del tenant.',
          ),
        'END:VEVENT',
      );
    } else {
      const events = await this.prisma.event.findMany({
        where: { tenantId },
        orderBy: { startDate: 'asc' },
        take: 500,
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          summary: true,
          status: true,
          location: true,
        },
      });

      if (events.length === 0) {
        lines.push(
          'BEGIN:VEVENT',
          `UID:josanz-empty-${tenantId}@josanz-erp.local`,
          'DTSTAMP:' + stamp,
          'DTSTART:' + stamp,
          'SUMMARY:Sin eventos',
          'DESCRIPTION:' +
            icsEscape('No hay eventos en el rango consultable para este tenant.'),
          'END:VEVENT',
        );
      } else {
        for (const ev of events) {
          const desc = [ev.summary, ev.status && `Estado: ${ev.status}`]
            .filter(Boolean)
            .join('\n');
          const block: string[] = [
            'BEGIN:VEVENT',
            `UID:${ev.id}@josanz-erp.local`,
            'DTSTAMP:' + stamp,
            'DTSTART:' + toIcsUtc(ev.startDate),
            'DTEND:' + toIcsUtc(ev.endDate),
            'SUMMARY:' + icsEscape(ev.name.slice(0, 200)),
          ];
          if (desc) {
            block.push('DESCRIPTION:' + icsEscape(desc.slice(0, 1000)));
          }
          if (ev.location) {
            block.push('LOCATION:' + icsEscape(ev.location.slice(0, 200)));
          }
          block.push('END:VEVENT');
          lines.push(...block);
        }
      }
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
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
  async rotateWebhookSecret(@Req() req: Request, @Param('id') id: string) {
    const tenantId =
      (req.headers['x-tenant-id'] as string) ||
      '00000000-0000-0000-0000-000000000000';
    return this.webhooks.rotateSecret(tenantId, id);
  }
}
