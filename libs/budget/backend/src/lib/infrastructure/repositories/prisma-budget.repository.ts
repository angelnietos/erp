import { Injectable } from '@nestjs/common';
import { Budget as PrismaBudgetModel, BudgetItem as PrismaBudgetItemModel } from '@prisma/client';
import { PrismaService } from '@josanz-erp/shared-data-access';
import { BudgetRepositoryPort, Budget, BudgetItem, BudgetStatus } from '@josanz-erp/budget-core';
import { EntityId } from '@josanz-erp/shared-model';
import { TenantContext } from '@josanz-erp/shared-infrastructure';

type BudgetWithItems = PrismaBudgetModel & { items: PrismaBudgetItemModel[] };
type BudgetPersistenceView = {
  createdAt: Date;
  idempotencyKey?: string;
};

@Injectable()
export class PrismaBudgetRepository implements BudgetRepositoryPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  async findById(id: EntityId): Promise<Budget | null> {
    const tenantId = this.tenantContext.getRequiredTenantId();
    const data = await this.prisma.budget.findFirst({
      where: { id: id.value, tenantId },
      include: { items: true },
    });
    return data ? this.mapToDomain(data) : null;
  }

  async findAll(clientId?: EntityId): Promise<Budget[]> {
    const tenantId = this.tenantContext.getRequiredTenantId();
    const data = await this.prisma.budget.findMany({
      where: {
        tenantId,
        ...(clientId ? { clientId: clientId.value } : {}),
      },
      include: { items: true },
    });
    return data.map((d) => this.mapToDomain(d));
  }

  async save(budget: Budget): Promise<void> {
    const tenantId = this.tenantContext.getRequiredTenantId();
    const persistenceBudget = budget as unknown as BudgetPersistenceView;

    await this.prisma.$transaction([
      this.prisma.budgetItem.deleteMany({ where: { budgetId: budget.id.value } }),
      this.prisma.budget.upsert({
        where: { id: budget.id.value },
        update: { 
          startDate: budget.startDate,
          endDate: budget.endDate,
          status: budget.status,
          total: budget.total,
          version: { increment: 1 } 
        },
        create: {
          id: budget.id.value,
          tenantId,
          clientId: budget.clientId.value,
          startDate: budget.startDate,
          endDate: budget.endDate,
          total: budget.total,
          status: budget.status,
          version: budget.version,
          idempotencyKey: persistenceBudget.idempotencyKey,
          createdAt: persistenceBudget.createdAt,
        },
      }),
      this.prisma.budgetItem.createMany({
        data: budget.items.map((item: BudgetItem) => ({
          id: item.id.value,
          budgetId: budget.id.value,
          productId: item.productId.value,
          quantity: item.quantity,
          price: item.price,
          tax: item.tax,
          discount: item.discount,
        })),
      }),
    ]);
  }

  async delete(id: EntityId): Promise<void> {
    const tenantId = this.tenantContext.getRequiredTenantId();
    await this.prisma.budget.delete({ where: { id: id.value, tenantId } });
  }

  private mapToDomain(data: BudgetWithItems): Budget {
    return Budget.reconstitute(data.id, {
      clientId: new EntityId(data.clientId),
      startDate: data.startDate,
      endDate: data.endDate,
      total: data.total,
      status: data.status as BudgetStatus,
      items: (data.items || []).map((i) => ({
        id: new EntityId(i.id),
        productId: new EntityId(i.productId),
        quantity: i.quantity,
        price: i.price,
        tax: i.tax,
        discount: i.discount,
      })),
      version: data.version,
      createdAt: data.createdAt,
    });
  }
}
