import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../shared/infrastructure/guards/jwt-auth.guard';
import { SubmitVerifactuInvoiceDto } from '../../application/dtos/submit-verifactu-invoice.dto';
import { VerifactuService } from '../../application/services/verifactu.service';

@Controller('verifactu')
@UseGuards(JwtAuthGuard)
export class VerifactuController {
  constructor(private readonly verifactuService: VerifactuService) {}

  @Post('submit')
  async submitInvoice(@Body() dto: SubmitVerifactuInvoiceDto) {
    return this.verifactuService.submitInvoice(dto);
  }
}

