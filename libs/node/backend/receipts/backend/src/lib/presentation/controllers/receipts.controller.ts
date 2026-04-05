import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ReceiptsService } from '../../application/services/receipts.service';
import {
  CreateReceiptDto,
  UpdateReceiptDto,
} from '../../application/dtos/create-receipt.dto';
import { JwtAuthGuard } from '@josanz-erp/shared-infrastructure';

@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get()
  async findAll(@Req() req: Request, @Query('status') status?: string) {
    const r = req as unknown as {
      tenantId?: string;
      headers: { [key: string]: string };
    };
    const tenantId = r.tenantId || r.headers['x-tenant-id'];
    return this.receiptsService.getReceiptsList(tenantId, status);
  }

  @Get('active')
  async findActive(@Req() req: Request) {
    const r = req as unknown as {
      tenantId?: string;
      headers: { [key: string]: string };
    };
    const tenantId = r.tenantId || r.headers['x-tenant-id'];
    const receipts = await this.receiptsService.findActive(tenantId);
    return receipts.map(receipt => ({
      id: receipt.id.value,
      tenantId: receipt.tenantId.value,
      invoiceId: receipt.invoiceId.value,
      amount: receipt.amount,
      status: receipt.status,
      paymentMethod: receipt.paymentMethod,
      dueDate: receipt.dueDate.toISOString().split('T')[0],
      paymentDate: receipt.paymentDate?.toISOString().split('T')[0],
      notes: receipt.notes,
      createdAt: receipt.createdAt.toISOString().split('T')[0],
    }));
  }

  @Post()
  async create(@Body() dto: CreateReceiptDto) {
    const receipt = await this.receiptsService.create(dto);
    return {
      id: receipt.id.value,
      invoiceId: receipt.invoiceId.value,
      amount: receipt.amount,
      status: receipt.status,
      dueDate: receipt.dueDate.toISOString().split('T')[0],
      createdAt: receipt.createdAt,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const receipt = await this.receiptsService.findById(id);
    return receipt
      ? {
          id: receipt.id.value,
          tenantId: receipt.tenantId.value,
          invoiceId: receipt.invoiceId.value,
          amount: receipt.amount,
          status: receipt.status,
          paymentMethod: receipt.paymentMethod,
          dueDate: receipt.dueDate.toISOString().split('T')[0],
          paymentDate: receipt.paymentDate?.toISOString().split('T')[0],
          notes: receipt.notes,
          createdAt: receipt.createdAt.toISOString().split('T')[0],
        }
      : null;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateReceiptDto) {
    const receipt = await this.receiptsService.update(id, dto);
    return {
      id: receipt.id.value,
      amount: receipt.amount,
      status: receipt.status,
      paymentMethod: receipt.paymentMethod,
      dueDate: receipt.dueDate.toISOString().split('T')[0],
      paymentDate: receipt.paymentDate?.toISOString().split('T')[0],
      notes: receipt.notes,
    };
  }

  @Patch(':id/pay')
  async markAsPaid(
    @Param('id') id: string,
    @Body() body: { paymentMethod: string; paymentDate?: string }
  ) {
    const paymentDate = body.paymentDate ? new Date(body.paymentDate) : undefined;
    const receipt = await this.receiptsService.markAsPaid(id, body.paymentMethod, paymentDate);
    return {
      id: receipt.id.value,
      status: receipt.status,
      paymentMethod: receipt.paymentMethod,
      paymentDate: receipt.paymentDate?.toISOString().split('T')[0],
      message: 'Receipt marked as paid successfully',
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.receiptsService.delete(id);
    return { success: true };
  }
}
