import { Injectable } from '@nestjs/common';
import { Project as PrismaProjectModel } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import {
  ProjectsRepositoryPort,
  Project,
  ProjectStatus,
} from '@josanz-erp/projects-core';
import { EntityId } from '@josanz-erp/shared-model';
import { TenantContext } from '@josanz-erp/shared-infrastructure';

@Injectable()
export class PrismaProjectsRepository implements ProjectsRepositoryPort {
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

  async findById(id: EntityId): Promise<Project | null> {
    const tenantId = this.getTenantId();
    const data = await this.prisma.project.findFirst({
      where: { id: id.value, tenantId },
    });
    return data ? this.mapToDomain(data) : null;
  }

  async findAll(tenantId: EntityId, clientId?: EntityId): Promise<Project[]> {
    const data = await this.prisma.project.findMany({
      where: {
        tenantId: tenantId.value,
        ...(clientId ? { clientId: clientId.value } : {}),
      },
    });
    return data.map((d) => this.mapToDomain(d));
  }

  async save(project: Project): Promise<void> {
    const tenantId = this.getTenantId();

    await this.prisma.project.upsert({
      where: { id: project.id.value },
      update: {
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        clientId: project.clientId?.value,
      },
      create: {
        id: project.id.value,
        tenantId,
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        clientId: project.clientId?.value,
        createdAt: project.createdAt,
      },
    });
  }

  async delete(id: EntityId): Promise<void> {
    const tenantId = this.getTenantId();
    await this.prisma.project.delete({ where: { id: id.value, tenantId } });
  }

  private mapToDomain(data: PrismaProjectModel): Project {
    return Project.reconstitute(data.id, {
      tenantId: new EntityId(data.tenantId),
      name: data.name,
      description: data.description || undefined,
      status: data.status as ProjectStatus,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      clientId: data.clientId ? new EntityId(data.clientId) : undefined,
      createdAt: data.createdAt,
    });
  }
}
