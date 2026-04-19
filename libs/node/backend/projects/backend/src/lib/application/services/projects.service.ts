import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  PROJECTS_REPOSITORY,
  ProjectsRepositoryPort,
  Project,
} from '@josanz-erp/projects-core';
import { EntityId } from '@josanz-erp/shared-model';
import { CreateProjectDto, UpdateProjectDto } from '../dtos/create-project.dto';
import {
  AuditLogWriterService,
  OutboxService,
  PrismaService,
} from '@josanz-erp/shared-infrastructure';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PROJECTS_REPOSITORY)
    private readonly projectsRepository: ProjectsRepositoryPort,
    private readonly outboxService: OutboxService,
    private readonly prisma: PrismaService,
    private readonly auditLogWriter: AuditLogWriterService,
  ) {}

  async create(dto: CreateProjectDto, actorUserId: string): Promise<Project> {
    const project = Project.create({
      tenantId: new EntityId(dto.tenantId),
      name: dto.name,
      description: dto.description,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      clientId: dto.clientId ? new EntityId(dto.clientId) : undefined,
    });

    await this.prisma.$transaction(async (tx) => {
      await this.projectsRepository.save(project);
      await this.outboxService.saveEvents(project.pullEvents(), tx);
    });

    await this.auditLogWriter.record(actorUserId, {
      action: 'CREATE',
      targetEntity: `Project:${project.id.value}`,
      changesJson: {
        entityType: 'PROJECT',
        entityName: project.name,
        details: 'Proyecto creado',
      },
    });

    return project;
  }

  async findById(id: string): Promise<Project | null> {
    return await this.projectsRepository.findById(new EntityId(id));
  }

  async findAll(tenantId: string, clientId?: string): Promise<Project[]> {
    return await this.projectsRepository.findAll(
      new EntityId(tenantId),
      clientId ? new EntityId(clientId) : undefined,
    );
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    actorUserId: string,
  ): Promise<Project> {
    const project = await this.projectsRepository.findById(new EntityId(id));
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (dto.name !== undefined || dto.description !== undefined) {
      project.updateBasicInfo(dto.name || project.name, dto.description);
    }

    if (dto.startDate !== undefined || dto.endDate !== undefined) {
      project.updateDates(
        dto.startDate ? new Date(dto.startDate) : undefined,
        dto.endDate ? new Date(dto.endDate) : undefined,
      );
    }

    if (dto.clientId !== undefined) {
      const clientId = dto.clientId ? new EntityId(dto.clientId) : undefined;
      if (clientId) {
        project.assignClient(clientId);
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await this.projectsRepository.save(project);
      await this.outboxService.saveEvents(project.pullEvents(), tx);
    });

    await this.auditLogWriter.record(actorUserId, {
      action: 'UPDATE',
      targetEntity: `Project:${project.id.value}`,
      changesJson: {
        entityType: 'PROJECT',
        entityName: project.name,
        details: 'Proyecto actualizado',
      },
    });

    return project;
  }

  async complete(id: string, actorUserId: string): Promise<Project> {
    const project = await this.projectsRepository.findById(new EntityId(id));
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    project.complete();

    await this.prisma.$transaction(async (tx) => {
      await this.projectsRepository.save(project);
      await this.outboxService.saveEvents(project.pullEvents(), tx);
    });

    await this.auditLogWriter.record(actorUserId, {
      action: 'UPDATE',
      targetEntity: `Project:${project.id.value}`,
      changesJson: {
        entityType: 'PROJECT',
        entityName: project.name,
        details: 'Proyecto marcado como completado',
      },
    });

    return project;
  }

  async cancel(id: string, actorUserId: string): Promise<Project> {
    const project = await this.projectsRepository.findById(new EntityId(id));
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    project.cancel();

    await this.prisma.$transaction(async (tx) => {
      await this.projectsRepository.save(project);
      await this.outboxService.saveEvents(project.pullEvents(), tx);
    });

    await this.auditLogWriter.record(actorUserId, {
      action: 'UPDATE',
      targetEntity: `Project:${project.id.value}`,
      changesJson: {
        entityType: 'PROJECT',
        entityName: project.name,
        details: 'Proyecto cancelado',
      },
    });

    return project;
  }

  async duplicate(id: string, actorUserId: string): Promise<Project> {
    const originalProject = await this.projectsRepository.findById(
      new EntityId(id),
    );
    if (!originalProject) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const duplicatedProject = originalProject.duplicate();

    await this.prisma.$transaction(async (tx) => {
      await this.projectsRepository.save(duplicatedProject);
      await this.outboxService.saveEvents(duplicatedProject.pullEvents(), tx);
    });

    await this.auditLogWriter.record(actorUserId, {
      action: 'COPY',
      targetEntity: `Project:${duplicatedProject.id.value}`,
      changesJson: {
        entityType: 'PROJECT',
        entityName: duplicatedProject.name,
        details: 'Proyecto duplicado',
      },
    });

    return duplicatedProject;
  }

  async delete(id: string, actorUserId: string): Promise<void> {
    const existing = await this.projectsRepository.findById(new EntityId(id));
    await this.projectsRepository.delete(new EntityId(id));
    if (existing) {
      await this.auditLogWriter.record(actorUserId, {
        action: 'DELETE',
        targetEntity: `Project:${id}`,
        changesJson: {
          entityType: 'PROJECT',
          entityName: existing.name,
          details: 'Proyecto eliminado',
        },
      });
    }
  }

  async getProjectsList(tenantId: string, clientId?: string): Promise<any[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        tenantId,
        ...(clientId ? { clientId } : {}),
      },
      include: {
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      startDate: p.startDate?.toISOString().split('T')[0],
      endDate: p.endDate?.toISOString().split('T')[0],
      clientId: p.clientId,
      clientName: p.client?.name || null,
      createdAt: p.createdAt.toISOString().split('T')[0],
    }));
  }
}
