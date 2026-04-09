import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  computed,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  UiButtonComponent,
  UiSearchComponent,
  UiSelectComponent,
  UiStatCardComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
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
    UiButtonComponent,
    UiSearchComponent,
    UiSelectComponent,
    UiStatCardComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    LucideAngularModule
  ],
  providers: [
    { provide: FILTER_PROVIDER, useExisting: ProjectsListComponent }
  ],
  template: `
    <div class="projects-container">
      <ui-feature-header
        title="Proyectos"
        subtitle="Gestión operativa y seguimiento de proyectos"
        icon="layout"
        actionLabel="Nuevo Proyecto"
        routerLink="/projects/new"
      ></ui-feature-header>

      <ui-feature-stats>
        <ui-stat-card
          label="Proyectos Activos"
          [value]="activeProjectsCount().toString()"
          icon="activity"
          [trend]="5"
          [accent]="true"
        ></ui-stat-card>
        <ui-stat-card
          label="Completados"
          [value]="completedProjectsCount().toString()"
          icon="check-circle"
        ></ui-stat-card>
        <ui-stat-card
          label="Total Clientes"
          [value]="uniqueClientsCount().toString()"
          icon="users"
        ></ui-stat-card>
        <ui-stat-card
          label="Carga de trabajo"
          value="84%"
          icon="bar-chart"
          [trend]="12"
        ></ui-stat-card>
      </ui-feature-stats>

      <div class="filters-bar">
        <ui-search
          variant="glass"
          placeholder="Buscar proyectos..."
          (searchChange)="onSearchChange($event)"
          class="flex-1"
        ></ui-search>
        <ui-select
          label="Estado"
          [options]="statusFilterOptions"
          [ngModel]="statusFilter()"
          (ngModelChange)="onStatusFilterChange($event)"
          name="projectStatus"
          class="status-select"
        />
      </div>

      <ui-feature-grid>
        @for (project of filteredProjects(); track project.id) {
          <ui-feature-card
            [name]="project.name"
            [subtitle]="project.clientName || 'Sin cliente'"
            [avatarInitials]="getInitials(project.name)"
            [avatarBackground]="getStatusColor(project.status)"
            [status]="project.status === 'ACTIVE' ? 'active' : 'offline'"
            [badgeLabel]="project.status"
            [badgeVariant]="project.status === 'ACTIVE' ? 'success' : project.status === 'COMPLETED' ? 'info' : 'danger'"
            (cardClicked)="onRowClick()"
            [routerLink]="['/projects', project.id]"
            [showEdit]="true"
            [showDuplicate]="true"
            [showDelete]="true"
            (editClicked)="onEdit(project)"
            (duplicateClicked)="onDuplicate(project)"
            (deleteClicked)="onDelete(project)"
            [footerItems]="[
              { icon: 'calendar', label: 'Inicio: ' + (project.startDate | date: 'dd/MM/yy') },
              { icon: 'clock', label: 'Fin: ' + (project.endDate | date: 'dd/MM/yy') }
            ]"
          >
            <p class="description">{{ project.description }}</p>
          </ui-feature-card>
        } @empty {
          <div class="empty-state">
             <lucide-icon name="layout" size="64" class="empty-icon"></lucide-icon>
             <h3>No hay proyectos</h3>
             <p>Comienza creando un nuevo proyecto para gestionar tus tareas y recursos.</p>
             <ui-button variant="solid" routerLink="/projects/new" icon="CirclePlus">Crear proyecto</ui-button>
          </div>
        }
      </ui-feature-grid>
    </div>
  `,
  styles: [`
    .projects-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .filters-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      align-items: center;
      background: var(--surface);
      padding: 1rem;
      border-radius: 12px;
      border: 1px solid var(--border-soft);
    }

    .flex-1 { flex: 1; }

    .status-select {
       min-width: 200px;
    }

    .description {
       font-size: 0.875rem;
       color: var(--text-muted);
       margin: 0.5rem 0;
       display: -webkit-box;
       -webkit-line-clamp: 2;
       -webkit-box-orient: vertical;
       overflow: hidden;
    }

    .card-actions {
       display: flex;
       gap: 0.25rem;
    }

    .text-danger { color: var(--danger) !important; }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem;
      text-align: center;
      background: var(--surface);
      border-radius: 16px;
      border: 2px dashed var(--border-soft);
    }

    .empty-icon { color: var(--text-muted); margin-bottom: 1rem; opacity: 0.5; }

    @media (max-width: 768px) {
      .filters-bar { flex-direction: column; align-items: stretch; }
      .status-select { min-width: 0; }
    }
  `],
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
  private readonly router = inject(Router);

  currentThemeData = this.themeService.currentThemeData;

  readonly allProjects = signal<Project[]>([]);
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
    const term = this.masterFilter.query().trim().toLowerCase();
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

  activeProjectsCount = computed(() => this.allProjects().filter(p => p.status === 'ACTIVE').length);
  completedProjectsCount = computed(() => this.allProjects().filter(p => p.status === 'COMPLETED').length);
  uniqueClientsCount = computed(() => new Set(this.allProjects().map(p => p.clientId).filter(Boolean)).size || 8);

  columns = [
    { key: 'name', header: 'Nombre', width: '220px' },
    { key: 'description', header: 'Descripción', width: '280px' },
    { key: 'clientName', header: 'Cliente', width: '180px' },
    { key: 'status', header: 'Estado', width: '120px' },
    { key: 'startDate', header: 'Fecha Inicio', width: '130px' },
    { key: 'endDate', header: 'Fecha Fin', width: '130px' },
    { key: 'createdAt', header: 'Creado', width: '100px' },
    { key: 'actions', header: 'Acciones', width: '120px' },
  ];

  ngOnInit() {
    this.loadProjects();
    this.masterFilter.registerProvider(this);
    
    this.route.queryParamMap.pipe(take(1)).subscribe((q) => {
      const text = q.get('q')?.trim();
      if (text) {
        this.masterFilter.search(text);
      }
    });
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
  }

  onSearchChange(term: string) {
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
    // Navigate to detail
  }

  onEdit(project: Project) {
    this.router.navigate(['/projects', project.id, 'edit']);
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

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'COMPLETED': return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'CANCELLED': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default: return 'linear-gradient(135deg, #6b7280, #374151)';
    }
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
