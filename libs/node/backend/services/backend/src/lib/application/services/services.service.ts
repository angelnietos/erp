import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  SERVICES_REPOSITORY,
  ServicesRepositoryPort,
  Service,
} from '@josanz-erp/services-core';
import { EntityId } from '@josanz-erp/shared-model';
import { CreateServiceDto, UpdateServiceDto } from '../dtos/create-service.dto';
import {
  OutboxService,
  PrismaService,
} from '@josanz-erp/shared-infrastructure';

@Injectable()
export class ServicesService {
  constructor(
    @Inject(SERVICES_REPOSITORY)
    private readonly servicesRepository: ServicesRepositoryPort,
    private readonly outboxService: OutboxService,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateServiceDto): Promise<Service> {
    const service = Service.create({
      tenantId: new EntityId(dto.tenantId),
      name: dto.name,
      description: dto.description,
      type: dto.type as any,
      basePrice: dto.basePrice,
      hourlyRate: dto.hourlyRate,
      configuration: dto.configuration,
    });

    await this.prisma.$transaction(async (tx) => {
      await this.servicesRepository.save(service);
      await this.outboxService.saveEvents(service.pullEvents(), tx);
    });

    return service;
  }

  async findById(id: string): Promise<Service | null> {
    return await this.servicesRepository.findById(new EntityId(id));
  }

  async findAll(tenantId: string, type?: string): Promise<Service[]> {
    return await this.servicesRepository.findAll(
      new EntityId(tenantId),
      type as any,
    );
  }

  async findActive(tenantId: string, type?: string): Promise<Service[]> {
    return await this.servicesRepository.findActive(
      new EntityId(tenantId),
      type as any,
    );
  }

  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    const service = await this.servicesRepository.findById(new EntityId(id));
    if (!service) {
      throw new NotFoundException('Service not found');
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
      service.changeType(dto.type as any);
    }

    await this.prisma.$transaction(async (tx) => {
      await this.servicesRepository.save(service);
      await this.outboxService.saveEvents(service.pullEvents(), tx);
    });

    return service;
  }

  async deactivate(id: string): Promise<Service> {
    const service = await this.servicesRepository.findById(new EntityId(id));
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    service.deactivate();

    await this.prisma.$transaction(async (tx) => {
      await this.servicesRepository.save(service);
      await this.outboxService.saveEvents(service.pullEvents(), tx);
    });

    return service;
  }

  async activate(id: string): Promise<Service> {
    const service = await this.servicesRepository.findById(new EntityId(id));
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    service.activate();

    await this.prisma.$transaction(async (tx) => {
      await this.servicesRepository.save(service);
      await this.outboxService.saveEvents(service.pullEvents(), tx);
    });

    return service;
  }

  async delete(id: string): Promise<void> {
    await this.servicesRepository.delete(new EntityId(id));
  }

  async getServicesList(tenantId: string, type?: string): Promise<any[]> {
    // Mock data for now - TODO: implement Prisma service model
    const mockServices = [
      {
        id: '1',
        name: 'Servicio de Streaming Básico',
        description: 'Transmisión en vivo básica',
        type: 'STREAMING',
        basePrice: 500,
        hourlyRate: 50,
        configuration: {},
        isActive: true,
        createdAt: '2024-01-01',
      },
      {
        id: '2',
        name: 'Producción Audio/Video Completa',
        description: 'Producción completa de eventos',
        type: 'PRODUCCIÓN',
        basePrice: 2000,
        hourlyRate: 150,
        configuration: {},
        isActive: true,
        createdAt: '2024-01-02',
      },
    ];

    return mockServices.filter((s) => !type || s.type === type);
  }
}
