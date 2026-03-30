import { Body, Controller, Get, Param, Post, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { BudgetService } from '../../application/services/budget.service';
import { CreateBudgetDto } from '../../application/dtos/create-budget.dto';
import { JwtAuthGuard } from '@josanz-erp/shared-infrastructure';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const r = req as unknown as { tenantId?: string, headers: { [key: string]: string } };
    return this.budgetService.findAll(r.tenantId || r.headers['x-tenant-id']);
  }

  @Post()
  async create(@Body() dto: CreateBudgetDto) {
    const budget = await this.budgetService.create(dto);
    return {
      id: budget.id.value,
      status: budget.status,
      startDate: budget.startDate,
      endDate: budget.endDate,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const budget = await this.budgetService.findById(id);
    return budget ? {
      id: budget.id.value,
      clientId: budget.clientId.value,
      startDate: budget.startDate,
      endDate: budget.endDate,
      total: budget.total,
      status: budget.status,
      version: budget.version,
    } : null;
  }

  @Patch(':id/send')
  async send(@Param('id') id: string) {
    await this.budgetService.send(id);
    return { message: 'Budget sent successfully' };
  }

  @Patch(':id/accept')
  async accept(@Param('id') id: string) {
    await this.budgetService.accept(id);
    return { message: 'Budget accepted successfully' };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.budgetService.delete(id);
    return { success: true };
  }
}
