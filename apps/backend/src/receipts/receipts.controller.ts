import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../shared/infrastructure/guards/jwt-auth.guard';

@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptsController {
  @Get()
  async findAll() {
    // Mock data for now
    return [
      {
        id: '1',
        invoiceId: '001',
        amount: 500.0,
        status: 'PENDING',
        dueDate: '2024-02-01',
        createdAt: '2024-01-01',
      },
      {
        id: '2',
        invoiceId: '002',
        amount: 1200.5,
        status: 'PAID',
        dueDate: '2024-01-15',
        paymentDate: '2024-01-10',
        createdAt: '2024-01-01',
      },
    ];
  }

  @Post()
  async create(@Body() dto: any) {
    // Mock implementation
    return {
      id: Date.now().toString(),
      ...dto,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    // Mock implementation
    return {
      id,
      invoiceId: '001',
      amount: 500.0,
      status: 'PENDING',
      dueDate: '2024-02-01',
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    // Mock implementation
    return {
      id,
      ...dto,
      updatedAt: new Date().toISOString(),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    // Mock implementation
    return { success: true };
  }
}
