import { Inject, Injectable } from '@nestjs/common';
import { Service } from '../domain/entities/service.entity';
import {
  SERVICES_REPOSITORY,
  ServicesRepositoryPort,
} from '../domain/ports/services.repository.port';
import { ServiceType } from '@josanz-erp/services-api';
import { EntityId } from '@josanz-erp/shared-model';

export interface CreateServiceDto {
  tenantId: string;
  name: string;
  description?: string;
  type: ServiceType;
  basePrice: number;
  hourlyRate?: number;
  configuration?: Record<string, unknown>;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  type?: ServiceType;
  basePrice?: number;
  hourlyRate?: number;
  configuration?: Record<string, unknown>;
  isActive?: boolean;
}

@Injectable()
export class ServicesService {
  constructor(
    @Inject(SERVICES_REPOSITORY)
    private readonly repository: ServicesRepositoryPort,
  ) {}

  async createService(dto: CreateServiceDto): Promise<Service> {
    const tenantId = new EntityId(dto.tenantId);

    const service = Service.create({
      tenantId,
      name: dto.name,
      description: dto.description,
      type: dto.type,
      basePrice: dto.basePrice,
      hourlyRate: dto.hourlyRate,
      configuration: dto.configuration,
    });

    await this.repository.save(service);
    return service;
  }

  async getServiceById(id: string): Promise<Service | null> {
    const serviceId = new EntityId(id);
    return this.repository.findById(serviceId);
  }

  async getServices(tenantId: string, type?: ServiceType): Promise<Service[]> {
    const tenantEntityId = new EntityId(tenantId);
    return this.repository.findAll(tenantEntityId, type);
  }

  async getActiveServices(
    tenantId: string,
    type?: ServiceType,
  ): Promise<Service[]> {
    const tenantEntityId = new EntityId(tenantId);
    return this.repository.findActive(tenantEntityId, type);
  }

  async updateService(id: string, dto: UpdateServiceDto): Promise<Service> {
    const serviceId = new EntityId(id);
    const service = await this.repository.findById(serviceId);

    if (!service) {
      throw new Error('Service not found');
    }

    if (dto.name !== undefined || dto.description !== undefined) {
      service.updateBasicInfo(dto.name || service.name, dto.description);
    }

    if (dto.basePrice !== undefined || dto.hourlyRate !== undefined) {
      service.updatePricing(dto.basePrice ?? service.basePrice, dto.hourlyRate);
    }

    if (dto.configuration !== undefined) {
      service.updateConfiguration(dto.configuration);
    }

    if (dto.type !== undefined) {
      service.changeType(dto.type);
    }

    if (dto.isActive !== undefined) {
      if (dto.isActive) {
        service.activate();
      } else {
        service.deactivate();
      }
    }

    await this.repository.save(service);
    return service;
  }

  async deleteService(id: string): Promise<void> {
    const serviceId = new EntityId(id);
    await this.repository.delete(serviceId);
  }

  async deactivateService(id: string): Promise<Service> {
    const serviceId = new EntityId(id);
    const service = await this.repository.findById(serviceId);

    if (!service) {
      throw new Error('Service not found');
    }

    service.deactivate();
    await this.repository.save(service);
    return service;
  }

  async activateService(id: string): Promise<Service> {
    const serviceId = new EntityId(id);
    const service = await this.repository.findById(serviceId);

    if (!service) {
      throw new Error('Service not found');
    }

    service.activate();
    await this.repository.save(service);
    return service;
  }
}
