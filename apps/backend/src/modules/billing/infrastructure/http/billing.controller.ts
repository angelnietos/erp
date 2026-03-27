import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../shared/infrastructure/guards/jwt-auth.guard';
import { SubmitInvoiceVerifactuDto } from '../../application/dtos/submit-invoice-verifactu.dto';
import { SubmitInvoiceToVerifactuUseCase } from '../../application/use-cases/submit-invoice-to-verifactu.use-case';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(
    private readonly submitInvoiceToVerifactuUseCase: SubmitInvoiceToVerifactuUseCase,
  ) {}

  @Patch('invoices/:invoiceId/verifactu-submit')
  async submitInvoiceToVerifactu(
    @Param('invoiceId') invoiceId: string,
    @Body() dto: SubmitInvoiceVerifactuDto,
  ) {
    return this.submitInvoiceToVerifactuUseCase.execute({
      invoiceId,
      tenantId: dto.tenantId,
    });
  }
}

