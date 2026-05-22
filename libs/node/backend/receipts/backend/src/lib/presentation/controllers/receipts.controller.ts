import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Query,
  Req,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { requireRequestTenantId } from '@josanz-erp/shared-infrastructure';
import { ReceiptsService } from '../../application/services/receipts.service';
import {
  CreateReceiptDto,
  UpdateReceiptDto,
} from '../../application/dtos/create-receipt.dto';

/** Tenant: `x-tenant-id` (UUID) o `tenantId` del JWT (`requireRequestTenantId`). */
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get()
  async findAll(@Req() req: Request, @Query('status') status?: string) {
    return this.receiptsService.getReceiptsList(requireRequestTenantId(req), status);
  }

  @Get('active')
  async findActive(@Req() req: Request) {
    const receipts = await this.receiptsService.findActive(requireRequestTenantId(req));
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
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const receipt = await this.receiptsService.findById(id);
    if (!receipt) {
      throw new NotFoundException('Recibo no encontrado');
    }
    return {
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
    };
  }

  @Patch(':id/pay')
  async markAsPaid(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { paymentMethod: string; paymentDate?: string }
  ) {
    const paymentDate = body.paymentDate ? new Date(body.paymentDate) : undefined;
    const receipt = await this.receiptsService.markAsPaid(id, body.paymentMethod, paymentDate);
    return {
      id: receipt.id.value,
      status: receipt.status,
      paymentMethod: receipt.paymentMethod,
      paymentDate: receipt.paymentDate?.toISOString().split('T')[0],
      message: 'Recibo marcado como pagado correctamente',
    };
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateReceiptDto) {
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

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.receiptsService.delete(id);
    return { success: true };
  }
}
