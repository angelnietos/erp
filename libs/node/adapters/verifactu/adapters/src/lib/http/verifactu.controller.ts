import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SubmitVerifactuInvoiceDto, VerifactuService } from '@josanz-erp/verifactu-core';
import { VerifactuApiKeyGuard } from '../security/verifactu-api-key.guard';

@Controller('verifactu')
@UseGuards(VerifactuApiKeyGuard)
export class VerifactuController {
  constructor(private readonly verifactuService: VerifactuService) {}

  @Post('submit')
  async submitInvoice(@Body() dto: SubmitVerifactuInvoiceDto) {
    return this.verifactuService.submitInvoice(dto);
  }
}

