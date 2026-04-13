import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  clientId?: string;
  clientName?: string;
  createdAt: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private mockProjects: Project[] = [
    {
      id: '1',
      name: 'Proyecto Demo 1',
      description: 'Descripción del proyecto demo',
      status: 'ACTIVE',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      clientName: 'Cliente Demo',
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      name: 'Sistema de Gestión de Inventario',
      description:
        'Desarrollo de un sistema completo para la gestión de inventario y stock',
      status: 'ACTIVE',
      startDate: '2024-02-15',
      endDate: '2024-08-15',
      clientName: 'Empresa Logística S.A.',
      createdAt: '2024-02-15',
    },
    {
      id: '3',
      name: 'Aplicación Móvil de Pedidos',
      description: 'App móvil para gestionar pedidos y entregas en tiempo real',
      status: 'COMPLETED',
      startDate: '2023-09-01',
      endDate: '2024-03-31',
      clientName: 'Restaurante El Buen Sabor',
      createdAt: '2023-09-01',
    },
    {
      id: '4',
      name: 'Portal Web Corporativo',
      description:
        'Diseño y desarrollo de portal web responsive para empresa tecnológica',
      status: 'ACTIVE',
      startDate: '2024-03-01',
      endDate: '2024-09-30',
      clientName: 'Tech Solutions Inc.',
      createdAt: '2024-03-01',
    },
    {
      id: '5',
      name: 'Sistema de Facturación Electrónica',
      description:
        'Implementación de sistema de facturación electrónica con integración AEAT',
      status: 'COMPLETED',
      startDate: '2023-11-01',
      endDate: '2024-04-30',
      clientName: 'Consultoría Fiscal S.L.',
      createdAt: '2023-11-01',
    },
    {
      id: '6',
      name: 'App de Seguimiento GPS',
      description:
        'Desarrollo de aplicación móvil para seguimiento GPS de flota vehicular',
      status: 'CANCELLED',
      startDate: '2024-01-15',
      endDate: '2024-06-15',
      clientName: 'Transportes Rápidos',
      createdAt: '2024-01-15',
    },
  ];

  getProjects(): Observable<Project[]> {
    return of([...this.mockProjects]);
  }

  getProject(id: string): Observable<Project | undefined> {
    const project = this.mockProjects.find((p) => p.id === id);
    return of(project);
  }

  createProject(
    project: Omit<Project, 'id' | 'createdAt'>,
  ): Observable<Project> {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    this.mockProjects.push(newProject);
    return of(newProject);
  }

  updateProject(id: string, updates: Partial<Project>): Observable<Project> {
    const index = this.mockProjects.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.mockProjects[index] = { ...this.mockProjects[index], ...updates };
      return of(this.mockProjects[index]);
    }
    throw new Error('Project not found');
  }

  deleteProject(id: string): Observable<boolean> {
    const index = this.mockProjects.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.mockProjects.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  searchProjects(term: string): Observable<Project[]> {
    const filtered = this.mockProjects.filter(
      (project) =>
        project.name.toLowerCase().includes(term.toLowerCase()) ||
        project.description?.toLowerCase().includes(term.toLowerCase()) ||
        project.clientName?.toLowerCase().includes(term.toLowerCase()),
    );
    return of(filtered);
  }
}
