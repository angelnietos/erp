import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { ServicesRepositoryPort, Service } from '@josanz-erp/services-core';
import { ServiceType } from '@josanz-erp/services-api';
import { EntityId } from '@josanz-erp/shared-model';
import { TenantContext, PrismaService } from '@josanz-erp/shared-infrastructure';

@Injectable()
export class PrismaServicesRepository implements ServicesRepositoryPort {
  constructor(
    private readonly cls: ClsService<TenantContext>,
    private readonly prisma: PrismaService,
  ) {}

  private toEntity(row: any): Service {
    return Service.reconstitute(row.id, {
      tenantId: new EntityId(row.tenantId),
      name: row.name,
      description: row.description || '',
      type: (row.type || 'STREAMING') as ServiceType,
      basePrice: row.price || 0,
      hourlyRate: row.dailyRate || 0,
      configuration: {}, // Product doesn't have configuration JSON yet, but we use defaults
      isActive: true, // Product doesn't have isActive yet, but conceptually it is
      createdAt: row.createdAt,
      updatedAt: row.updatedAt || undefined,
    });
  }

  async findById(id: EntityId): Promise<Service | null> {
    const row = await this.prisma.product.findUnique({
      where: { id: id.value },
      include: { categoryRef: true },
    });
    if (!row || row.categoryRef?.type !== 'SERVICE') {
      return null;
    }
    return this.toEntity(row);
  }

  async findAll(tenantId: EntityId, type?: ServiceType): Promise<Service[]> {
    const rows = await this.prisma.product.findMany({
      where: {
        tenantId: tenantId.value,
        categoryRef: { type: 'SERVICE' },
        ...(type ? { type } : {}),
      },
      include: { categoryRef: true },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async findActive(tenantId: EntityId, type?: ServiceType): Promise<Service[]> {
    // Current product model doesn't have an isActive field, so we return all visible to tenant
    return this.findAll(tenantId, type);
  }

  async save(service: Service): Promise<void> {
    // Conceptually a service is a product in a category of type SERVICE.
    // If saving a new service, we'd need to ensure it has a category.
    // This is partial as Product model doesn't have configuration or isActive.
    const data = {
      tenantId: service.tenantId.value,
      name: service.name,
      description: service.description,
      type: service.type,
      price: service.basePrice,
      dailyRate: service.hourlyRate,
    };

    await this.prisma.product.upsert({
      where: { id: service.id.value },
      create: {
        id: service.id.value,
        ...data,
      },
      update: {
        ...data,
      },
    });
  }

  async delete(id: EntityId): Promise<void> {
    await this.prisma.product.deleteMany({ where: { id: id.value } });
  }
}
