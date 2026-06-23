import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicTenant, PrismaService } from '@generic-crm/shared-infrastructure';
import { CrmErpSyncApiKeyGuard } from '../guards/crm-erp-sync-api-key.guard';
import { MirrorErpInvoiceDto } from '../dto/mirror-erp-invoice.dto';

@ApiTags('internal')
@PublicTenant()
@UseGuards(CrmErpSyncApiKeyGuard)
@Controller('internal/erp/invoices')
export class ErpInvoiceMirrorController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('mirror')
  @ApiOperation({
    summary: 'Replica factura ERP en generic_crm (sin encolar envío AEAT)',
  })
  async mirror(@Body() dto: MirrorErpInvoiceDto) {
    const issuedAt = dto.issuedAt ? new Date(dto.issuedAt) : new Date();
    const existing = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, tenantId: dto.tenantId },
    });

    if (existing) {
      await this.prisma.invoice.update({
        where: { id: existing.id },
        data: {
          number: dto.invoiceNumber,
          total: dto.total,
          status: 'ISSUED',
          issuedAt,
        },
      });
    } else {
      await this.prisma.invoice.create({
        data: {
          id: dto.invoiceId,
          tenantId: dto.tenantId,
          number: dto.invoiceNumber,
          total: dto.total,
          status: 'ISSUED',
          issuedAt,
        },
      });
    }

    return { ok: true, invoiceId: dto.invoiceId, tenantId: dto.tenantId };
  }
}
