import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PublicTenant } from '@generic-crm/shared-infrastructure';

@ApiTags('health')
@Controller('health')
export class AppController {
  @PublicTenant()
  @Get()
  health() {
    return {
      status: 'ok',
      service: 'generic-crm-api',
      time: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    };
  }
}
