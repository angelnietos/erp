import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BUDGET_REPOSITORY, BudgetRepositoryPort, Budget } from '@josanz-erp/budget-core';
import { EntityId } from '@josanz-erp/shared-model';
import { CreateBudgetDto } from '../dtos/create-budget.dto';
import { OutboxService, PrismaService } from '@josanz-erp/shared-infrastructure';

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
    if (!budget) throw new NotFoundException('Presupuesto no encontrado');

    budget.send();

    await this.prisma.$transaction(async (tx) => {
      await this.budgetRepository.save(budget);
      await this.outboxService.saveEvents(budget.pullEvents(), tx);
    });
  }

  async accept(id: string): Promise<void> {
    const budget = await this.budgetRepository.findById(new EntityId(id));
    if (!budget) throw new NotFoundException('Presupuesto no encontrado');

    budget.accept();

    await this.prisma.$transaction(async (tx) => {
      await this.budgetRepository.save(budget);
      await this.outboxService.saveEvents(budget.pullEvents(), tx);
    });
  }

  async findById(id: string): Promise<Budget | null> {
    return await this.budgetRepository.findById(new EntityId(id));
  }

  async updateDraft(id: string, dto: CreateBudgetDto): Promise<Budget> {
    const budget = await this.budgetRepository.findById(new EntityId(id));
    if (!budget) {
      throw new NotFoundException('Presupuesto no encontrado');
    }
    try {
      budget.replaceDraftContent(
        new EntityId(dto.clientId),
        new Date(dto.startDate),
        new Date(dto.endDate),
        dto.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          tax: i.tax,
          discount: i.discount,
        })),
      );
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }

    await this.prisma.$transaction(async (tx) => {
      await this.budgetRepository.save(budget);
      await this.outboxService.saveEvents(budget.pullEvents(), tx);
    });

    return budget;
  }

  async findAll(tenantId: string): Promise<any[]> {
    const budgets = await this.prisma.budget.findMany({
      where: { tenantId },
      include: {
        client: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return budgets.map((b: any) => ({
      id: b.id,
      clientId: b.clientId,
      clientName: b.client?.name || 'Cliente Desconocido',
      startDate: b.startDate.toISOString().split('T')[0],
      endDate: b.endDate.toISOString().split('T')[0],
      total: b.total,
      status: b.status,
      items: b.items.map((i: any) => ({
        id: i.id,
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
        tax: i.tax,
        discount: i.discount
      })),
      createdAt: b.createdAt.toISOString().split('T')[0]
    }));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.budgetItem.deleteMany({ where: { budgetId: id } });
      await tx.budget.delete({ where: { id } });
    });
  }
}
