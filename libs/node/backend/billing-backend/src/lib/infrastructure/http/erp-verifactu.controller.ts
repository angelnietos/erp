import { Controller, Get, Param, ParseUUIDPipe, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard, requireRequestTenantId } from '@josanz-erp/shared-infrastructure';
import { ErpVerifactuTenantService } from '../../application/services/erp-verifactu-tenant.service';

@Controller('verifactu')
@UseGuards(JwtAuthGuard)
export class ErpVerifactuController {
  constructor(private readonly verifactu: ErpVerifactuTenantService) {}

  @Get('overview')
  overview(@Req() req: Request) {
    return this.verifactu.overview(requireRequestTenantId(req));
  }

  @Get('invoices/:invoiceId/fiscal')
  fiscalDetail(
    @Req() req: Request,
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
  ) {
    return this.verifactu.fiscalDetail(requireRequestTenantId(req), invoiceId);
  }
}
