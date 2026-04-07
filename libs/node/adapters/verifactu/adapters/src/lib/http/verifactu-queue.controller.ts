import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { VerifactuApiKeyGuard } from '../security/verifactu-api-key.guard';
import { VerifactuQueueService } from '../services/verifactu-queue.service';

class QueueInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  invoiceId!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}

@Controller('verifactu/queue')
@UseGuards(VerifactuApiKeyGuard)
export class VerifactuQueueController {
  constructor(private readonly queueService: VerifactuQueueService) {}

  @Post('enqueue')
  async enqueue(@Body() dto: QueueInvoiceDto) {
    return this.queueService.enqueue(dto.invoiceId, dto.tenantId);
  }

  @Post('process')
  async process(@Query('limit') limit?: string) {
    return this.queueService.processPending(limit ? Number(limit) : 20);
  }
}

