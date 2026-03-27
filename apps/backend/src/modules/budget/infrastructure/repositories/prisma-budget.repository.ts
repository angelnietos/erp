import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { IBudgetRepository } from '../../domain/repositories/budget.repository';
import { Budget } from '../../domain/entities/budget.entity';
import { EntityId } from '@josanz-erp/shared-model';

@Injectable()
export class PrismaBudgetRepository implements IBudgetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: EntityId): Promise<Budget | null> {
    const data = await this.prisma.budget.findUnique({
      where: { id: id.value },
      include: { items: true },
    });
    return data ? this.mapToDomain(data) : null;
  }

  async findAll(clientId?: EntityId): Promise<Budget[]> {
    const data = await this.prisma.budget.findMany({
      where: clientId ? { clientId: clientId.value } : {},
      include: { items: true },
    });
    return data.map((d) => this.mapToDomain(d));
  }

  async save(budget: Budget): Promise<void> {
    const {
      id,
      clientId,
      startDate,
      endDate,
      total,
      status,
      version,
      idempotencyKey,
      createdAt,
      items,
    } = budget as any;
    
    await this.prisma.$transaction([
      (this.prisma as any).budgetItem.deleteMany({ where: { budgetId: id.value } }),
      (this.prisma as any).budget.upsert({
        where: { id: id.value },
        update: { 
          startDate,
          endDate,
          status, 
          total, 
          version: { increment: 1 } 
        },
        create: {
          id: id.value,
          clientId: clientId.value,
          startDate,
          endDate,
          total,
          status,
          version,
          idempotencyKey,
          createdAt,
        },
      }),
      (this.prisma as any).budgetItem.createMany({
        data: items.map((item: any) => ({
          id: item.id.value,
          budgetId: id.value,
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
    await this.prisma.budget.delete({ where: { id: id.value } });
  }

  private mapToDomain(data: any): Budget {
    return Budget.reconstitute(data.id, {
      clientId: new EntityId(data.clientId),
      startDate: data.startDate,
      endDate: data.endDate,
      total: data.total,
      status: data.status,
      items: (data.items || []).map((i: any) => ({
        id: new EntityId(i.id),
        productId: new EntityId(i.productId),
        quantity: i.quantity,
        price: i.price,
        tax: i.tax,
        discount: i.discount,
      })),
      version: data.version,
      idempotencyKey: data.idempotencyKey,
      createdAt: data.createdAt,
    });
  }
}
