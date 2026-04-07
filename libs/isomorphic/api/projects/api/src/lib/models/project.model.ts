export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  clientId?: string;
  createdAt: string;
}

export interface CreateProjectDTO {
  tenantId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  clientId?: string;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  clientId?: string;
}
