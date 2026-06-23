import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsUUID } from 'class-validator';
import { PublicTenant } from '@josanz-erp/shared-infrastructure';
import { ErpInternalSyncApiKeyGuard } from '@josanz-erp/verifactu-adapters';
import { SubmitInvoiceToVerifactuUseCase } from '../../application/use-cases/submit-invoice-to-verifactu.use-case';

class InternalVerifactuEnqueueDto {
  @IsUUID()
  invoiceId!: string;

  @IsUUID()
  tenantId!: string;
}

/** Encolado interno (CRM / integraciones) → cola ERP procesada por verifactu-worker. */
@PublicTenant()
@UseGuards(ErpInternalSyncApiKeyGuard)
@Controller('internal/verifactu')
export class InternalVerifactuController {
  constructor(
    private readonly submitInvoiceToVerifactuUseCase: SubmitInvoiceToVerifactuUseCase,
  ) {}

  @Post('enqueue')
  async enqueue(@Body() dto: InternalVerifactuEnqueueDto) {
    const item = await this.submitInvoiceToVerifactuUseCase.execute({
      invoiceId: dto.invoiceId,
      tenantId: dto.tenantId,
    });
    return {
      queueItemId: item.id,
      status: item.status,
      invoiceId: dto.invoiceId,
      tenantId: dto.tenantId,
    };
  }
}
