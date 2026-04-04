import { Inject, Injectable } from '@nestjs/common';
import { Project } from '../domain/entities/project.entity';
import {
  PROJECTS_REPOSITORY,
  ProjectsRepositoryPort,
} from '../domain/ports/projects.repository.port';
import { EntityId } from '@josanz-erp/shared-model';

export interface CreateProjectDto {
  tenantId: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  clientId?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  clientId?: string;
}

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PROJECTS_REPOSITORY)
    private readonly repository: ProjectsRepositoryPort,
  ) {}

  async createProject(dto: CreateProjectDto): Promise<Project> {
    const tenantId = new EntityId(dto.tenantId);
    const clientId = dto.clientId ? new EntityId(dto.clientId) : undefined;

    const project = Project.create({
      tenantId,
      name: dto.name,
      description: dto.description,
      startDate: dto.startDate,
      endDate: dto.endDate,
      clientId,
    });

    await this.repository.save(project);
    return project;
  }

  async getProjectById(id: string): Promise<Project | null> {
    const projectId = new EntityId(id);
    return this.repository.findById(projectId);
  }

  async getProjects(tenantId: string, clientId?: string): Promise<Project[]> {
    const tenantEntityId = new EntityId(tenantId);
    const clientEntityId = clientId ? new EntityId(clientId) : undefined;
    return this.repository.findAll(tenantEntityId, clientEntityId);
  }

  async updateProject(id: string, dto: UpdateProjectDto): Promise<Project> {
    const projectId = new EntityId(id);
    const project = await this.repository.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    if (dto.name !== undefined || dto.description !== undefined) {
      project.updateBasicInfo(dto.name || project.name, dto.description);
    }

    if (dto.startDate !== undefined || dto.endDate !== undefined) {
      project.updateDates(dto.startDate, dto.endDate);
    }

    if (dto.clientId !== undefined) {
      const clientId = dto.clientId ? new EntityId(dto.clientId) : undefined;
      if (clientId) {
        project.assignClient(clientId);
      }
    }

    await this.repository.save(project);
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    const projectId = new EntityId(id);
    await this.repository.delete(projectId);
  }

  async completeProject(id: string): Promise<Project> {
    const projectId = new EntityId(id);
    const project = await this.repository.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    project.complete();
    await this.repository.save(project);
    return project;
  }

  async cancelProject(id: string): Promise<Project> {
    const projectId = new EntityId(id);
    const project = await this.repository.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    project.cancel();
    await this.repository.save(project);
    return project;
  }

  async duplicateProject(id: string): Promise<Project> {
    const projectId = new EntityId(id);
    const originalProject = await this.repository.findById(projectId);

    if (!originalProject) {
      throw new Error('Project not found');
    }

    const duplicatedProject = originalProject.duplicate();
    await this.repository.save(duplicatedProject);
    return duplicatedProject;
  }
}
