import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { ServicesRepositoryPort, Service } from '@josanz-erp/services-core';
import { ServiceType } from '@josanz-erp/services-api';
import { EntityId } from '@josanz-erp/shared-model';
import { PrismaService } from '@josanz-erp/shared-infrastructure';

/** Producto con categoría; fechas opcionales si el esquema añade columnas más adelante. */
type ProductServiceRow = Prisma.ProductGetPayload<{
  include: { categoryRef: true };
}> & {
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

@Injectable()
export class PrismaServicesRepository implements ServicesRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  /** Sin `categoryId` + categoría tipo SERVICE, el producto no entra en `GET /api/services`. */
  private async ensureServiceCategoryId(tenantId: string): Promise<string> {
    const existing = await this.prisma.category.findFirst({
      where: { tenantId, type: 'SERVICE' },
      orderBy: { createdAt: 'asc' },
    });
    if (existing) {
      return existing.id;
    }
    const created = await this.prisma.category.create({
      data: {
        tenantId,
        name: 'Servicios',
        type: 'SERVICE',
        description: 'Categoría por defecto del catálogo de servicios',
      },
    });
    return created.id;
  }

  private toEntity(row: ProductServiceRow): Service {
    /** Si el modelo no expone `created_at`, usar fecha por defecto para no romper la serialización. */
    const createdAt =
      row.createdAt instanceof Date
        ? row.createdAt
        : typeof row.createdAt === 'string'
          ? new Date(row.createdAt)
          : new Date();
    const updatedAtRaw = row.updatedAt;
    const updatedAt =
      updatedAtRaw instanceof Date
        ? updatedAtRaw
        : typeof updatedAtRaw === 'string'
          ? new Date(updatedAtRaw)
          : undefined;

    return Service.reconstitute(row.id, {
      tenantId: new EntityId(row.tenantId),
      name: row.name,
      description: row.description || '',
      type: (row.type || 'STREAMING') as ServiceType,
      basePrice: row.price || 0,
      hourlyRate: row.dailyRate || 0,
      configuration: {}, // Product doesn't have configuration JSON yet, but we use defaults
      isActive: true, // Product doesn't have isActive yet, but conceptually it is
      createdAt,
      updatedAt,
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
    const tenantId = service.tenantId.value;
    const categoryId = await this.ensureServiceCategoryId(tenantId);
    const data = {
      tenantId,
      name: service.name,
      description: service.description,
      type: service.type,
      price: service.basePrice,
      dailyRate: service.hourlyRate,
      categoryId,
      category: 'SERVICE',
    };

    await this.prisma.product.upsert({
      where: { id: service.id.value },
      create: {
        id: service.id.value,
        ...data,
      },
      update: data,
    });
  }

  async delete(id: EntityId): Promise<void> {
    await this.prisma.product.deleteMany({ where: { id: id.value } });
  }
}
