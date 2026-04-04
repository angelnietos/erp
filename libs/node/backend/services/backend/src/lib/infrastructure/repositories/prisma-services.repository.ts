import { Injectable } from '@nestjs/common';
import { Service as PrismaServiceModel } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import {
  ServicesRepositoryPort,
  Service,
  ServiceType,
} from '@josanz-erp/services-core';
import { EntityId } from '@josanz-erp/shared-model';
import { TenantContext } from '@josanz-erp/shared-infrastructure';

@Injectable()
export class PrismaServicesRepository implements ServicesRepositoryPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService<TenantContext>,
  ) {}

  private getTenantId(): string {
    const tenantId = this.cls.get('tenantId');
    if (!tenantId) {
      throw new Error('Tenant ID is not set in the request context');
    }
    return tenantId;
  }

  async findById(id: EntityId): Promise<Service | null> {
    const tenantId = this.getTenantId();
    const data = await this.prisma.service.findFirst({
      where: { id: id.value, tenantId },
    });
    return data ? this.mapToDomain(data) : null;
  }

  async findAll(tenantId: EntityId, type?: ServiceType): Promise<Service[]> {
    const data = await this.prisma.service.findMany({
      where: {
        tenantId: tenantId.value,
        ...(type ? { type } : {}),
      },
    });
    return data.map((d) => this.mapToDomain(d));
  }

  async findActive(tenantId: EntityId, type?: ServiceType): Promise<Service[]> {
    const data = await this.prisma.service.findMany({
      where: {
        tenantId: tenantId.value,
        isActive: true,
        ...(type ? { type } : {}),
      },
    });
    return data.map((d) => this.mapToDomain(d));
  }

  async save(service: Service): Promise<void> {
    const tenantId = this.getTenantId();

    await this.prisma.service.upsert({
      where: { id: service.id.value },
      update: {
        name: service.name,
        description: service.description,
        type: service.type,
        basePrice: service.basePrice,
        hourlyRate: service.hourlyRate,
        configuration: service.configuration,
        isActive: service.isActive,
        updatedAt: new Date(),
      },
      create: {
        id: service.id.value,
        tenantId,
        name: service.name,
        description: service.description,
        type: service.type,
        basePrice: service.basePrice,
        hourlyRate: service.hourlyRate,
        configuration: service.configuration,
        isActive: service.isActive,
        createdAt: service.createdAt,
      },
    });
  }

  async delete(id: EntityId): Promise<void> {
    const tenantId = this.getTenantId();
    await this.prisma.service.delete({ where: { id: id.value, tenantId } });
  }

  private mapToDomain(data: PrismaServiceModel): Service {
    return Service.reconstitute(data.id, {
      tenantId: new EntityId(data.tenantId),
      name: data.name,
      description: data.description || undefined,
      type: data.type as ServiceType,
      basePrice: data.basePrice,
      hourlyRate: data.hourlyRate || undefined,
      configuration: (data.configuration as Record<string, any>) || undefined,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt || undefined,
    });
  }
}
