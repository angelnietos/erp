import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
} from 'lucide-angular';
import {
  UiTableComponent,
  UiButtonComponent,
  UiSearchComponent,
  UiBadgeComponent,
  UiLoaderComponent,
} from '@josanz-erp/shared-ui-kit';

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
}

@Component({
  selector: 'lib-projects-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiTableComponent,
    UiButtonComponent,
    UiSearchComponent,
    UiBadgeComponent,
    UiLoaderComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">Proyectos</h1>
          <p class="page-subtitle">Gestión de proyectos y eventos</p>
        </div>
        <div class="header-actions">
          <lib-ui-button
            variant="primary"
            [icon]="Plus"
            routerLink="/projects/new"
          >
            Nuevo Proyecto
          </lib-ui-button>
        </div>
      </header>

      <div class="content-section">
        <div class="filters-section">
          <lib-ui-search
            placeholder="Buscar proyectos..."
            (searchChange)="onSearchChange($event)"
          >
          </lib-ui-search>
        </div>

        <div class="table-section">
          <lib-ui-table
            [data]="projects()"
            [columns]="columns"
            [loading]="loading()"
            (rowClick)="onRowClick($event)"
          >
            <ng-template #actionsTemplate let-project>
              <div class="action-buttons">
                <lib-ui-button
                  variant="ghost"
                  size="sm"
                  [icon]="Edit"
                  [routerLink]="['/projects', project.id]"
                >
                  Editar
                </lib-ui-button>
                <lib-ui-button
                  variant="ghost"
                  size="sm"
                  [icon]="Copy"
                  (click)="onDuplicate(project)"
                >
                  Duplicar
                </lib-ui-button>
                <lib-ui-button
                  variant="ghost"
                  size="sm"
                  [icon]="Trash2"
                  (click)="onDelete(project)"
                >
                  Eliminar
                </lib-ui-button>
              </div>
            </ng-template>
          </lib-ui-table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .header-content h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 600;
        color: #111827;
      }

      .header-content p {
        margin: 0.5rem 0 0 0;
        color: #6b7280;
      }

      .content-section {
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      }

      .filters-section {
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .table-section {
        padding: 1.5rem;
      }

      .action-buttons {
        display: flex;
        gap: 0.5rem;
      }
    `,
  ],
})
export class ProjectsListComponent implements OnInit {
  private readonly Plus = Plus;
  private readonly Search = Search;
  private readonly Edit = Edit;
  private readonly Trash2 = Trash2;
  private readonly Copy = Copy;

  projects = signal<Project[]>([]);
  loading = signal(false);
  searchTerm = signal('');

  columns = [
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'description', label: 'Descripción', sortable: false },
    { key: 'clientName', label: 'Cliente', sortable: true },
    { key: 'status', label: 'Estado', sortable: true },
    { key: 'startDate', label: 'Fecha Inicio', sortable: true },
    { key: 'endDate', label: 'Fecha Fin', sortable: true },
    { key: 'createdAt', label: 'Creado', sortable: true },
    { key: 'actions', label: 'Acciones', template: 'actionsTemplate' },
  ];

  ngOnInit() {
    this.loadProjects();
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.loadProjects();
  }

  onRowClick(project: Project) {
    // Navigate to detail
  }

  onDuplicate(project: Project) {
    // Implement duplicate logic
    console.log('Duplicate project:', project);
  }

  onDelete(project: Project) {
    // Implement delete logic
    console.log('Delete project:', project);
  }

  private loadProjects() {
    // Mock data for now
    this.projects.set([
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
    ]);
  }
}
