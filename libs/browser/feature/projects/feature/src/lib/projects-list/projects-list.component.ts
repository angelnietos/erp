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
  UiCardComponent,
} from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';

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
    UiCardComponent,
    LucideAngularModule,
  ],
  template: `
    <div
      class="page-container animate-fade-in"
      [class.perf-optimized]="pluginStore.highPerformanceMode()"
    >
      <header
        class="page-header"
        [style.border-bottom-color]="currentThemeData().primary + '33'"
      >
        <div class="header-breadcrumb">
          <h1
            class="page-title text-uppercase glow-text"
            [style.text-shadow]="
              '0 0 20px ' + currentThemeData().primary + '44'
            "
          >
            Proyectos
          </h1>
          <div class="breadcrumb">
            <span class="active" [style.color]="currentThemeData().primary"
              >GESTIÓN OPERATIVA</span
            >
            <span class="separator">/</span>
            <span>PROYECTOS</span>
          </div>
        </div>
        <div class="header-actions">
          <ui-josanz-button
            variant="glass"
            icon="plus"
            routerLink="/projects/new"
          >
            Nuevo Proyecto
          </ui-josanz-button>
        </div>
      </header>

      <div class="filters-bar ui-glass-panel">
        <ui-josanz-search
          variant="filled"
          placeholder="Buscar proyectos..."
          (searchChange)="onSearchChange($event)"
          class="flex-1 max-w-md"
        ></ui-josanz-search>
      </div>

      <ui-josanz-card
        variant="glass"
        class="table-card"
        [class.neon-glow]="!pluginStore.highPerformanceMode()"
      >
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
      </ui-josanz-card>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 0;
        max-width: 100%;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .header-breadcrumb {
        flex: 1;
      }

      .page-title {
        margin: 0 0 0.5rem 0;
        font-size: 2.5rem;
        font-weight: 700;
        letter-spacing: 0.025em;
      }

      .breadcrumb {
        display: flex;
        gap: 0.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: var(--text-muted);
        margin-top: 0.5rem;
      }

      .separator {
        opacity: 0.5;
      }

      .header-actions {
        display: flex;
        gap: 1rem;
      }

      .filters-bar {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding: 0.75rem 1rem;
        border-radius: 12px;
      }

      .table-card {
        overflow: hidden;
      }

      .action-buttons {
        display: flex;
        gap: 0.5rem;
      }

      .text-uppercase {
        text-transform: uppercase;
      }

      .glow-text {
        font-size: 1.6rem;
        font-weight: 800;
        color: #fff;
        margin: 0;
        letter-spacing: 0.05em;
        font-family: var(--font-main);
      }

      .flex-1 {
        flex: 1;
      }

      .max-w-md {
        max-width: 28rem;
      }

      @media (max-width: 1024px) {
        .page-header {
          flex-direction: column;
          align-items: stretch;
          gap: 1rem;
        }
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

  readonly pluginStore = inject(PluginStore);
  readonly currentThemeData = inject(ThemeService).currentThemeData;

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
