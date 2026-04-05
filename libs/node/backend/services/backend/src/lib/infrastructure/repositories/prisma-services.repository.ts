import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { ServicesRepositoryPort, Service } from '@josanz-erp/services-core';
import { ServiceType } from '@josanz-erp/services-api';
import { EntityId } from '@josanz-erp/shared-model';
import { TenantContext } from '@josanz-erp/shared-infrastructure';

@Injectable()
export class PrismaServicesRepository implements ServicesRepositoryPort {
  // Mock in-memory storage for now - TODO: implement Prisma service model
  private services: Service[] = [];

  constructor(private readonly cls: ClsService<TenantContext>) {
    // Initialize with mock data
    this.initializeMockData();
  }

  private getTenantId(): string {
    const tenantId = this.cls.get('tenantId');
    if (!tenantId) {
      throw new Error('Tenant ID is not set in the request context');
    }
    return tenantId;
  }

  private initializeMockData(): void {
    // Mock data for development
    const tenantId = new EntityId('mock-tenant-id');
    this.services = [
      Service.reconstitute('1', {
        tenantId,
        name: 'Servicio de Streaming Básico',
        description: 'Transmisión en vivo básica',
        type: 'STREAMING',
        basePrice: 500,
        hourlyRate: 50,
        configuration: {},
        isActive: true,
        createdAt: new Date('2024-01-01'),
      }),
      Service.reconstitute('2', {
        tenantId,
        name: 'Producción Audio/Video Completa',
        description: 'Producción completa de eventos',
        type: 'PRODUCCIÓN',
        basePrice: 2000,
        hourlyRate: 150,
        configuration: {},
        isActive: true,
        createdAt: new Date('2024-01-02'),
      }),
    ];
  }

  async findById(id: EntityId): Promise<Service | null> {
    return this.services.find((s) => s.id.value === id.value) || null;
  }

  async findAll(tenantId: EntityId, type?: ServiceType): Promise<Service[]> {
    return this.services.filter(
      (s) => s.tenantId.value === tenantId.value && (!type || s.type === type),
    );
  }

  async findActive(tenantId: EntityId, type?: ServiceType): Promise<Service[]> {
    return this.services.filter(
      (s) =>
        s.tenantId.value === tenantId.value &&
        s.isActive &&
        (!type || s.type === type),
    );
  }

  async save(service: Service): Promise<void> {
    const existingIndex = this.services.findIndex(
      (s) => s.id.value === service.id.value,
    );
    if (existingIndex >= 0) {
      this.services[existingIndex] = service;
    } else {
      this.services.push(service);
    }
  }

  async delete(id: EntityId): Promise<void> {
    this.services = this.services.filter((s) => s.id.value !== id.value);
  }
}
