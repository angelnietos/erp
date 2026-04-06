import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicTenant } from '@josanz-erp/shared-infrastructure';

@ApiTags('health')
@PublicTenant()
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Estado del API (sin tenant)' })
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
