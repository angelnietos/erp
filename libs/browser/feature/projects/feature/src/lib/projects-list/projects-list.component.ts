import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  computed,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Briefcase,
  User,
  Calendar,
  Layout,
  ExternalLink,
  ChevronRight,
} from 'lucide-angular';
import { take } from 'rxjs/operators';
import {
  UiTableComponent,
  UiButtonComponent,
  UiSearchComponent,
  UiCardComponent,
  UiSelectComponent,
  UIAIChatComponent
} from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore, MasterFilterService, FILTER_PROVIDER, FilterableService, DomainEventsApiService } from '@josanz-erp/shared-data-access';
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
}

@Component({
  selector: 'lib-projects-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterModule,
    FormsModule,
    UiTableComponent,
    UiButtonComponent,
    UiSearchComponent,
    UiCardComponent,
    UiSelectComponent,
    LucideAngularModule,
    UIAIChatComponent
  ],
  providers: [
    { provide: FILTER_PROVIDER, useExisting: ProjectsListComponent }
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
        <ui-josanz-select
          label="Estado"
          [options]="statusFilterOptions"
          [ngModel]="statusFilter()"
          (ngModelChange)="onStatusFilterChange($event)"
          name="projectStatus"
          class="status-filter"
        />
      </div>

      <ui-josanz-card
        variant="glass"
        class="table-card"
        [class.neon-glow]="!pluginStore.highPerformanceMode()"
      >
        <ui-josanz-table
          [data]="filteredProjects()"
          [columns]="columns"
          [virtualScroll]="filteredProjects().length > 24"
        >
          <ng-template #cellTemplate let-project let-key="key">
            @switch (key) {
              @case ('name') {
                <div class="project-name-cell">
                  <div class="project-icon" [style.background-color]="currentThemeData().primary + '1a'">
                    <i-lucide [img]="Briefcase" size="14" [style.color]="currentThemeData().primary" />
                  </div>
                  <div class="project-info">
                    <a
                      [routerLink]="['/projects', project.id]"
                      class="project-link"
                    >
                      {{ project.name }}
                    </a>
                  </div>
                </div>
              }
              @case ('clientName') {
                <div class="client-cell">
                  <i-lucide [img]="User" size="12" class="text-muted" />
                  <span>{{ project.clientName || 'Sin cliente' }}</span>
                </div>
              }
              @case ('status') {
                <div class="status-container">
                  <span
                    class="status-pill"
                    [class]="'status-' + project.status.toLowerCase()"
                  >
                    <span class="status-indicator"></span>
                    {{ project.status }}
                  </span>
                </div>
              }
              @case ('startDate') {
                <div class="date-cell">
                  @if (project.startDate) {
                    <i-lucide [img]="Calendar" size="12" class="text-muted" />
                    <span>{{ project.startDate | date: 'dd MMM, yyyy' }}</span>
                  } @else {
                    <span class="text-muted">—</span>
                  }
                </div>
              }
              @case ('endDate') {
                <div class="date-cell">
                  @if (project.endDate) {
                    <i-lucide [img]="Calendar" size="12" class="text-muted" />
                    <span>{{ project.endDate | date: 'dd MMM, yyyy' }}</span>
                  } @else {
                    <span class="text-muted">—</span>
                  }
                </div>
              }
              @case ('createdAt') {
                <span class="text-muted small">{{ project.createdAt | date: 'dd/MM/yy' }}</span>
              }
              @case ('actions') {
                <div class="actions-wrapper">
                  <ui-josanz-button
                    variant="ghost"
                    size="sm"
                    class="action-btn"
                    [routerLink]="['/projects', project.id]"
                    title="Editar"
                  >
                    <i-lucide [img]="Edit" size="14" />
                  </ui-josanz-button>
                  <ui-josanz-button
                    variant="ghost"
                    size="sm"
                    class="action-btn"
                    (click)="onDuplicate(project)"
                    title="Duplicar"
                  >
                    <i-lucide [img]="Copy" size="14" />
                  </ui-josanz-button>
                  <ui-josanz-button
                    variant="ghost"
                    size="sm"
                    class="action-btn text-danger"
                    (click)="onDelete(project)"
                    title="Eliminar"
                  >
                    <i-lucide [img]="Trash2" size="14" />
                  </ui-josanz-button>
                </div>
              }
              @default {
                <span class="text-truncate">{{ project[key] }}</span>
              }
            }
          </ng-template>
        </ui-josanz-table>
      </ui-josanz-card>
    </div>

    <ui-josanz-ai-assistant feature="projects"></ui-josanz-ai-assistant>
  `,
  styles: [
    `
      .page-container {
        padding: 0 100px 0 0;
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
        border-radius: var(--radius-xl);
        box-shadow: 0 0 40px -20px var(--brand-glow);
      }

      .actions-wrapper {
        display: flex;
        gap: 0.25rem;
        justify-content: flex-end;
      }

      .action-btn {
        opacity: 0.4;
        transition: all 0.2s var(--ease-out-expo);
      }

      tr:hover .action-btn, 
      .virt-row:hover .action-btn {
        opacity: 1;
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
        font-family: var(--font-display);
      }

      .flex-1 {
        flex: 1;
      }

      .max-w-md {
        max-width: 28rem;
      }

      .status-filter {
        min-width: 200px;
      }

      /* Cell Components */
      .project-name-cell {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .project-icon {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }

      .project-link {
        color: var(--text-primary);
        text-decoration: none;
        font-weight: 700;
        font-size: 0.9rem;
        transition: all 0.2s ease;
        position: relative;
        display: inline-block;
      }

      .project-link::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 2px;
        background: var(--brand);
        transition: width 0.3s ease;
        border-radius: 2px;
      }

      .project-link:hover {
        color: var(--brand);
      }

      .project-link:hover::after {
        width: 100%;
      }

      .client-cell, .date-cell {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
      }

      .text-muted {
        color: var(--text-muted);
      }

      .text-danger {
        color: var(--danger) !important;
      }

      .small {
        font-size: 0.75rem;
      }

      .text-truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
        max-width: 200px;
      }

      /* Status Pill */
      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.35rem 0.75rem;
        border-radius: 100px;
        font-size: 0.65rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border: 1px solid transparent;
      }

      .status-indicator {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        display: block;
      }

      .status-active {
        background: rgba(0, 242, 173, 0.08); /* --success */
        color: #00f2ad;
        border-color: rgba(0, 242, 173, 0.15);
      }
      .status-active .status-indicator {
        background: #00f2ad;
        box-shadow: 0 0 8px #00f2ad;
        animation: pulse-dot 2s infinite;
      }

      .status-completed {
        background: rgba(63, 193, 255, 0.08); /* --info */
        color: #3fc1ff;
        border-color: rgba(63, 193, 255, 0.15);
      }
      .status-completed .status-indicator {
        background: #3fc1ff;
      }

      .status-cancelled {
        background: rgba(255, 94, 108, 0.08); /* --danger */
        color: #ff5e6c;
        border-color: rgba(255, 94, 108, 0.15);
      }
      .status-cancelled .status-indicator {
        background: #ff5e6c;
      }

      @keyframes pulse-dot {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 242, 173, 0.7); }
        70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(0, 242, 173, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 242, 173, 0); }
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
export class ProjectsListComponent implements OnInit, OnDestroy, FilterableService<Project> {
  readonly Plus = Plus;
  readonly Search = Search;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly Copy = Copy;
  readonly Briefcase = Briefcase;
  readonly User = User;
  readonly Calendar = Calendar;
  readonly Layout = Layout;
  readonly ExternalLink = ExternalLink;
  readonly ChevronRight = ChevronRight;

  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly route = inject(ActivatedRoute);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly domainEventsApi = inject(DomainEventsApiService);

  currentThemeData = this.themeService.currentThemeData;

  readonly allProjects = signal<Project[]>([]);
  searchTerm = signal('');
  statusFilter = signal('');

  statusFilterOptions = [
    { label: 'Todos', value: '' },
    { label: 'Activo', value: 'ACTIVE' },
    { label: 'Completado', value: 'COMPLETED' },
    { label: 'Cancelado', value: 'CANCELLED' },
  ];

  filteredProjects = computed(() => {
    let list = [...this.allProjects()];
    const st = this.statusFilter();
    if (st) {
      list = list.filter((p) => p.status === st);
    }
    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.description ?? '').toLowerCase().includes(term) ||
          (p.clientName ?? '').toLowerCase().includes(term),
      );
    }
    return list;
  });

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
    this.masterFilter.registerProvider(this);
    
    this.route.queryParamMap.pipe(take(1)).subscribe((q) => {
      const text = q.get('q')?.trim();
      if (text) {
        this.searchTerm.set(text);
        this.masterFilter.search(text);
      }
    });
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.masterFilter.search(term);
  }

  /**
   * Implementación del contrato FilterableService.
   * El MasterFilterService llamará a este método cuando se busque globalmente.
   */
  filter(query: string): Observable<Project[]> {
    const term = query.toLowerCase();
    const result = this.allProjects().filter(p => 
       p.name.toLowerCase().includes(term) || 
       (p.description ?? '').toLowerCase().includes(term)
    );
    return of(result);
  }

  onStatusFilterChange(value: string) {
    this.statusFilter.set(value ?? '');
  }

  onRowClick() {
    // Navigate to detail - implement when table supports rowClick
  }

  onDuplicate(project: Project) {
    this.domainEventsApi.append({
      eventType: 'COPY',
      aggregateType: 'PROJECT',
      aggregateId: project.id,
      payload: { name: project.name }
    }).subscribe(() => {
      console.log('Project duplicated:', project.name);
    });
  }

  onDelete(project: Project) {
    this.domainEventsApi.append({
      eventType: 'DELETE',
      aggregateType: 'PROJECT',
      aggregateId: project.id,
      payload: { name: project.name }
    }).subscribe(() => {
      console.log('Project deleted:', project.name);
      // Remove from local list for immediate feedback
      this.allProjects.update((list: Project[]) => list.filter((p: Project) => p.id !== project.id));
    });
  }

  private loadProjects() {
    const base: Project[] = [
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
        description:
          'App móvil para gestionar pedidos y entregas en tiempo real',
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
          'Rediseño y desarrollo del portal web corporativo con CMS integrado',
        status: 'ACTIVE',
        startDate: '2024-03-01',
        endDate: '2024-09-30',
        clientName: 'Constructora Moderna Ltd.',
        createdAt: '2024-03-01',
      },
      {
        id: '5',
        name: 'Sistema de Facturación Electrónica',
        description:
          'Implementación de sistema de facturación electrónica conforme a la normativa vigente',
        status: 'CANCELLED',
        startDate: '2024-01-10',
        endDate: '2024-06-10',
        clientName: 'Consultoría Fiscal ABC',
        createdAt: '2024-01-10',
      },
      {
        id: '6',
        name: 'Dashboard de Analytics',
        description:
          'Desarrollo de dashboard interactivo para análisis de datos de ventas',
        status: 'ACTIVE',
        startDate: '2024-04-01',
        endDate: '2024-07-31',
        clientName: 'Tienda Online Fashion',
        createdAt: '2024-04-01',
      },
      {
        id: '7',
        name: 'API de Integración ERP',
        description:
          'Desarrollo de APIs REST para integración con sistemas ERP externos',
        status: 'ACTIVE',
        startDate: '2024-05-01',
        endDate: '2024-11-30',
        clientName: 'Industria Manufacturera XYZ',
        createdAt: '2024-05-01',
      },
      {
        id: '8',
        name: 'Plataforma E-Learning',
        description:
          'Plataforma completa de aprendizaje en línea con cursos interactivos',
        status: 'COMPLETED',
        startDate: '2023-11-01',
        endDate: '2024-04-30',
        clientName: 'Instituto Educativo Nacional',
        createdAt: '2023-11-01',
      },
    ];
    const extra: Project[] = Array.from({ length: 40 }, (_, i) => {
      const n = i + 1;
      const statuses: Project['status'][] = [
        'ACTIVE',
        'COMPLETED',
        'CANCELLED',
      ];
      return {
        id: `gen-${n}`,
        name: `Proyecto operativo ${n}`,
        description: `Línea de implantación y seguimiento ${n}`,
        status: statuses[i % 3],
        startDate: '2024-01-01',
        endDate: '2025-12-31',
        clientName: `Cliente ${(i % 12) + 1}`,
        createdAt: '2024-06-01',
      };
    });
    this.allProjects.set([...base, ...extra]);
  }
}
