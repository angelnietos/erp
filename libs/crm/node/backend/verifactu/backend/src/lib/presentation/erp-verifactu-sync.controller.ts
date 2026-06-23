import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { PublicTenant, PrismaService } from '@generic-crm/shared-infrastructure';
import { CrmErpSyncApiKeyGuard } from '../guards/crm-erp-sync-api-key.guard';
import { PrismaVerifactuRepository } from '../infrastructure/persistence/prisma-verifactu.repository';

class SyncErpQueueStatusDto {
  @IsUUID()
  invoiceId!: string;

  @IsUUID()
  tenantId!: string;

  @IsIn(['COMPLETED', 'FAILED'])
  status!: 'COMPLETED' | 'FAILED';

  @IsOptional()
  @IsString()
  lastError?: string;
}

@ApiTags('internal')
@PublicTenant()
@UseGuards(CrmErpSyncApiKeyGuard)
@Controller('internal/erp/verifactu')
export class ErpVerifactuSyncController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verifactuRepo: PrismaVerifactuRepository,
  ) {}

  @Post('queue-status')
  @ApiOperation({
    summary: 'Actualiza espejo de cola CRM tras procesar verifactu-worker',
  })
  async queueStatus(@Body() dto: SyncErpQueueStatusDto) {
    await this.verifactuRepo.applyErpQueueStatus(dto.tenantId, dto.invoiceId, {
      status: dto.status,
      lastError: dto.lastError,
    });

    if (dto.status === 'COMPLETED') {
      await this.prisma.invoice.updateMany({
        where: { id: dto.invoiceId, tenantId: dto.tenantId },
        data: { status: 'ISSUED' },
      });
    }

    return { ok: true };
  }
}
