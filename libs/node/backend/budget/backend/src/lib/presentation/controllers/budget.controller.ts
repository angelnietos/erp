import { Body, Controller, Get, Param, Post, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { BudgetService } from '../../application/services/budget.service';
import { CreateBudgetDto } from '../../application/dtos/create-budget.dto';
import { JwtAuthGuard, requireRequestTenantId } from '@josanz-erp/shared-infrastructure';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  async findAll(@Req() req: Request) {
    return this.budgetService.findAll(requireRequestTenantId(req));
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
    return budget
      ? {
          id: budget.id.value,
          clientId: budget.clientId.value,
          startDate: budget.startDate.toISOString().split('T')[0],
          endDate: budget.endDate.toISOString().split('T')[0],
          total: budget.total,
          status: budget.status,
          version: budget.version,
          createdAt: budget.createdAt.toISOString().split('T')[0],
          items: budget.items.map((i) => ({
            id: i.id.value,
            productId: i.productId.value,
            quantity: i.quantity,
            price: i.price,
            tax: i.tax,
            discount: i.discount,
          })),
        }
      : null;
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

  @Patch(':id')
  async updateDraft(@Param('id') id: string, @Body() dto: CreateBudgetDto) {
    const budget = await this.budgetService.updateDraft(id, dto);
    return {
      id: budget.id.value,
      clientId: budget.clientId.value,
      startDate: budget.startDate.toISOString().split('T')[0],
      endDate: budget.endDate.toISOString().split('T')[0],
      total: budget.total,
      status: budget.status,
      version: budget.version,
      createdAt: budget.createdAt.toISOString().split('T')[0],
      items: budget.items.map((i) => ({
        id: i.id.value,
        productId: i.productId.value,
        quantity: i.quantity,
        price: i.price,
        tax: i.tax,
        discount: i.discount,
      })),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.budgetService.delete(id);
    return { success: true };
  }
}
