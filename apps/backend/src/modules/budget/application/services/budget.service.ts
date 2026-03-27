import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IBudgetRepository, BUDGET_REPOSITORY } from '../../domain/repositories/budget.repository';
import { Budget } from '../../domain/entities/budget.entity';
import { EntityId } from '@josanz-erp/shared-model';
import { CreateBudgetDto } from '../dtos/create-budget.dto';
import { OutboxService } from '../../../../shared/infrastructure/outbox/outbox.service';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class BudgetService {
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly budgetRepository: IBudgetRepository,
    private readonly outboxService: OutboxService,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateBudgetDto): Promise<Budget> {
    const budget = Budget.create(new EntityId(dto.clientId));
    
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
