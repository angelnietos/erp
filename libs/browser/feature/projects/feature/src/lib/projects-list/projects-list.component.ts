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
          <ui-josanz-button
            variant="primary"
            icon="plus"
            routerLink="/projects/new"
          >
            Nuevo Proyecto
          </ui-josanz-button>
        </div>
      </header>

      <div class="content-section">
        <div class="filters-section">
          <ui-josanz-search
            placeholder="Buscar proyectos..."
            (searchChange)="onSearchChange($event)"
          >
          </ui-josanz-search>
        </div>

        <div class="table-section">
          <ui-josanz-table [data]="projects()" [columns]="columns">
            <ng-template #actionsTemplate let-project>
              <div class="action-buttons">
                <ui-josanz-button
                  variant="ghost"
                  size="sm"
                  icon="edit"
                  [routerLink]="['/projects', project.id]"
                >
                  Editar
                </ui-josanz-button>
                <ui-josanz-button
                  variant="ghost"
                  size="sm"
                  icon="copy"
                  (click)="onDuplicate(project)"
                >
                  Duplicar
                </ui-josanz-button>
                <ui-josanz-button
                  variant="ghost"
                  size="sm"
                  icon="trash-2"
                  (click)="onDelete(project)"
                >
                  Eliminar
                </ui-josanz-button>
              </div>
            </ng-template>
          </ui-josanz-table>
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
  readonly Plus = Plus;
  readonly Search = Search;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly Copy = Copy;

  projects = signal<Project[]>([]);
  loading = signal(false);
  searchTerm = signal('');

  columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'description', header: 'Descripción' },
    { key: 'clientName', header: 'Cliente' },
    { key: 'status', header: 'Estado' },
    { key: 'startDate', header: 'Fecha Inicio' },
    { key: 'endDate', header: 'Fecha Fin' },
    { key: 'createdAt', header: 'Creado' },
    { key: 'actions', header: 'Acciones' },
  ];

  ngOnInit() {
    this.loadProjects();
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.loadProjects();
  }

  onRowClick(project: Project) {
    // Navigate to detail - implement when table supports rowClick
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
