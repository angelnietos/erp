import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BUDGET_REPOSITORY, BudgetRepositoryPort, Budget } from '@josanz-erp/budget-core';
import { EntityId } from '@josanz-erp/shared-model';
import { CreateBudgetDto } from '../dtos/create-budget.dto';
import { OutboxService, PrismaService } from '@josanz-erp/shared-data-access';

@Injectable()
export class BudgetService {
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepository: BudgetRepositoryPort,
    private readonly outboxService: OutboxService,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateBudgetDto): Promise<Budget> {
    const budget = Budget.create(
      new EntityId(dto.clientId),
      new Date(dto.startDate),
      new Date(dto.endDate),
    );
    
    // Add items first so total is calculated correctly
    for (const item of dto.items) {
      budget.addItem(
        new EntityId(item.productId), 
        item.quantity, 
        item.price, 
        item.tax, 
        item.discount
      );
    }

    // Transactional save: entity + outbox events (ADR-006)
    await this.prisma.$transaction(async (tx) => {
      await this.budgetRepository.save(budget);
      await this.outboxService.saveEvents(budget.pullEvents(), tx);
    });

    return budget;
  }

  async send(id: string): Promise<void> {
    const budget = await this.budgetRepository.findById(new EntityId(id));
    if (!budget) throw new NotFoundException('Budget not found');

    budget.send();

    await this.prisma.$transaction(async (tx) => {
      await this.budgetRepository.save(budget);
      await this.outboxService.saveEvents(budget.pullEvents(), tx);
    });
  }

  async accept(id: string): Promise<void> {
    const budget = await this.budgetRepository.findById(new EntityId(id));
    if (!budget) throw new NotFoundException('Budget not found');

    budget.accept();

    await this.prisma.$transaction(async (tx) => {
      await this.budgetRepository.save(budget);
      await this.outboxService.saveEvents(budget.pullEvents(), tx);
    });
  }

  async findById(id: string): Promise<Budget | null> {
    return await this.budgetRepository.findById(new EntityId(id));
  }
}
