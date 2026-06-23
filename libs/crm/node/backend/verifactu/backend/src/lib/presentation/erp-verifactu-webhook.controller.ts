import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicTenant } from '@generic-crm/shared-infrastructure';
import { CrmErpWebhookSignatureGuard } from '../guards/crm-erp-webhook-signature.guard';
import { ErpVerifactuWebhookEventDto } from '../dto/erp-verifactu-webhook-event.dto';
import { PrismaVerifactuRepository } from '../infrastructure/persistence/prisma-verifactu.repository';

@ApiTags('internal')
@PublicTenant()
@UseGuards(CrmErpWebhookSignatureGuard)
@Controller('internal/erp/verifactu')
export class ErpVerifactuWebhookController {
  constructor(private readonly verifactuRepo: PrismaVerifactuRepository) {}

  @Post('webhook-event')
  @ApiOperation({
    summary: 'Recibe eventos invoice.sent / invoice.error del ERP (HMAC)',
  })
  async webhookEvent(@Body() dto: ErpVerifactuWebhookEventDto) {
    await this.verifactuRepo.applyErpWebhookEvent(dto);
    return { ok: true };
  }
}
