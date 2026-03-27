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
    });
    return data ? this.mapToDomain(data) : null;
  }

  async findAll(clientId?: EntityId): Promise<Budget[]> {
    const data = await this.prisma.budget.findMany({
      where: clientId ? { clientId: clientId.value } : {},
    });
    return data.map((d) => this.mapToDomain(d));
  }

  async save(budget: Budget): Promise<void> {
    const { id, clientId, total, status, version, idempotencyKey, createdAt } = budget as any;
    
    await this.prisma.budget.upsert({
      where: { id: id.value },
      update: { 
        status, 
        total, 
        version: { increment: 1 } 
      },
      create: {
        id: id.value,
        clientId: clientId.value,
        total,
        status,
        version,
        idempotencyKey,
        createdAt,
      },
    });
  }

  async delete(id: EntityId): Promise<void> {
    await this.prisma.budget.delete({ where: { id: id.value } });
  }

  private mapToDomain(data: any): Budget {
    return Budget.reconstitute(data.id, {
      clientId: new EntityId(data.clientId),
      total: data.total,
      status: data.status,
      version: data.version,
      idempotencyKey: data.idempotencyKey,
      createdAt: data.createdAt,
    });
  }
}
