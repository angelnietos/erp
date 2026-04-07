import { Project } from '../entities/project.entity';
import { EntityId } from '@josanz-erp/shared-model';

export interface ProjectsRepositoryPort {
  findById(id: EntityId): Promise<Project | null>;
  findAll(tenantId: EntityId, clientId?: EntityId): Promise<Project[]>;
  save(project: Project): Promise<void>;
  delete(id: EntityId): Promise<void>;
}

export const PROJECTS_REPOSITORY = Symbol('PROJECTS_REPOSITORY');
