import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  computed,
  ChangeDetectionStrategy,
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
  UiLoaderComponent,
  UiModalComponent,
  UiInputComponent,
  UiPaginationComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  ThemeService,
  PluginStore,
  MasterFilterService,
  FILTER_PROVIDER,
  FilterableService,
  DomainEventsApiService,
  ToastService,
  AIFormBridgeService,
} from '@josanz-erp/shared-data-access';
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

// Extended form type for additional fields
interface ProjectFormData extends Partial<Project> {
  description?: string;
  validUntil?: string;
  notes?: string;
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
    UiLoaderComponent,
    UiModalComponent,
    UiInputComponent,
    UiPaginationComponent,
    LucideAngularModule,
  ],
  providers: [{ provide: FILTER_PROVIDER, useExisting: ProjectsListComponent }],
  template: `
    <div class="projects-container">
      <ui-feature-header
        title="Proyectos"
        subtitle="Gestión operativa y seguimiento de proyectos"
        icon="layout"
        actionLabel="Nuevo Proyecto"
        (actionClicked)="openCreateModal()"
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

      <!-- Search and Filters -->
      <div class="feature-controls">
        <div class="search-container">
          <ui-search
            variant="glass"
            placeholder="Buscar por nombre, cliente o descripción..."
            (searchChange)="onSearchChange($event)"
          ></ui-search>
        </div>
        <div class="actions-group">
          <ui-button
            variant="ghost"
            size="sm"
            icon="filter"
            [class.active]="showAdvancedFilters()"
            (clicked)="toggleAdvancedFilters()"
          >
            Filtros Avanzados
          </ui-button>
          <ui-button
            variant="ghost"
            size="sm"
            icon="rotate-cw"
            (clicked)="refreshProjects()"
            title="Actualizar"
          >
            Actualizar
          </ui-button>
          <ui-select
            label="Estado"
            [options]="statusFilterOptions"
            [ngModel]="statusFilter()"
            (ngModelChange)="onStatusFilterChange($event)"
            name="projectStatus"
            class="status-select"
          />
          <ui-button
            variant="ghost"
            size="sm"
            [icon]="sortDirection() === 1 ? 'ChevronUp' : 'ChevronDown'"
            (clicked)="toggleSort()"
          >
            ORDENAR:
            {{
              sortField() === 'name'
                ? 'NOMBRE'
                : sortField() === 'startDate'
                  ? 'FECHA'
                  : 'ESTADO'
            }}
          </ui-button>
        </div>
      </div>

      <!-- Advanced Filters -->
      @if (showAdvancedFilters()) {
        <div class="advanced-filters">
          <div class="filters-grid">
            <div class="filter-group">
              <label class="filter-label" for="date-from-filter"
                >Fecha desde</label
              >
              <input
                id="date-from-filter"
                type="date"
                class="filter-input"
                [(ngModel)]="dateFromFilter"
                (ngModelChange)="dateFromFilter.set($event); currentPage.set(1)"
              />
            </div>
            <div class="filter-group">
              <label class="filter-label" for="date-to-filter"
                >Fecha hasta</label
              >
              <input
                id="date-to-filter"
                type="date"
                class="filter-input"
                [(ngModel)]="dateToFilter"
                (ngModelChange)="dateToFilter.set($event); currentPage.set(1)"
              />
            </div>
            <div class="filter-actions">
              <ui-button variant="ghost" size="sm" (clicked)="clearFilters()">
                Limpiar filtros
              </ui-button>
            </div>
          </div>
        </div>
      }

      <!-- Bulk Actions Bar -->
      @if (hasSelections()) {
        <div class="bulk-actions-bar">
          <div class="bulk-info">
            <lucide-icon name="check-square" size="16"></lucide-icon>
            <span
              >{{ selectedCount() }} proyecto{{
                selectedCount() === 1 ? '' : 's'
              }}
              seleccionado{{ selectedCount() === 1 ? '' : 's' }}</span
            >
          </div>
          <div class="bulk-buttons">
            <select
              class="bulk-status-select"
              (change)="bulkChangeStatus($event)"
            >
              <option value="">Cambiar estado</option>
              <option value="ACTIVE">Marcar como activo</option>
              <option value="COMPLETED">Marcar como completado</option>
              <option value="CANCELLED">Marcar como cancelado</option>
            </select>
            <ui-button variant="danger" size="sm" (clicked)="bulkDelete()">
              <lucide-icon name="trash2" size="14"></lucide-icon>
              Eliminar seleccionados
            </ui-button>
            <ui-button variant="ghost" size="sm" (clicked)="clearSelection()">
              Cancelar
            </ui-button>
          </div>
        </div>
      }

      <!-- Projects Grid -->
      @if (isLoading()) {
        <div class="loading-container">
          <ui-loader message="Cargando proyectos..."></ui-loader>
        </div>
      } @else {
        <ui-feature-grid>
          <!-- Selection Header -->
          @if (paginatedProjects().length > 0) {
            <div class="selection-header">
              <label class="checkbox-label" for="select-all-checkbox">
                <input
                  id="select-all-checkbox"
                  type="checkbox"
                  [checked]="isAllSelected()"
                  (change)="toggleSelectAll()"
                  class="selection-checkbox"
                />
                <span>Seleccionar todos</span>
              </label>
            </div>
          }

          @for (project of paginatedProjects(); track project.id) {
            <ui-feature-card
              [name]="project.name"
              [subtitle]="project.clientName || 'Sin cliente'"
              [avatarInitials]="getInitials(project.name)"
              [avatarBackground]="getStatusColor(project.status)"
              [status]="project.status === 'ACTIVE' ? 'active' : 'offline'"
              [badgeLabel]="project.status"
              [badgeVariant]="
                project.status === 'ACTIVE'
                  ? 'success'
                  : project.status === 'COMPLETED'
                    ? 'info'
                    : 'danger'
              "
              (cardClicked)="goToDetail(project)"
              [showEdit]="true"
              [showDuplicate]="true"
              [showDelete]="true"
              (cardClicked)="goToDetail(project)"
              (editClicked)="editProject(project)"
              (duplicateClicked)="onDuplicate(project)"
              (deleteClicked)="onDelete(project)"
              [footerItems]="[
                {
                  icon: 'calendar',
                  label: project.startDate
                    ? 'Inicio: ' + (project.startDate | date: 'dd/MM/yy')
                    : 'Sin fecha inicio',
                },
                {
                  icon: 'clock',
                  label: project.endDate
                    ? 'Fin: ' + (project.endDate | date: 'dd/MM/yy')
                    : 'Sin fecha fin',
                },
              ]"
            >
              <div card-extra class="card-selection">
                <input
                  type="checkbox"
                  [checked]="selectedProjects().has(project.id)"
                  (change)="toggleProjectSelection(project.id)"
                  (click)="$event.stopPropagation()"
                  class="selection-checkbox"
                />
              </div>
              <p class="description">{{ project.description }}</p>
            </ui-feature-card>
          } @empty {
            <div class="empty-state">
              <lucide-icon
                name="layout"
                size="64"
                class="empty-icon"
              ></lucide-icon>
              <h3>No hay proyectos</h3>
              <p>
                Comienza añadiendo tu primer proyecto para gestionar tus tareas
                y recursos.
              </p>
              <ui-button
                variant="solid"
                (clicked)="openCreateModal()"
                icon="CirclePlus"
              >
                Añadir primer proyecto
              </ui-button>
            </div>
          }
        </ui-feature-grid>
      }

      <!-- Pagination -->
      @if (filteredProjects().length > 12 && !isLoading()) {
        <div class="pagination-footer">
          <ui-pagination
            [currentPage]="currentPage()"
            [totalPages]="totalPages()"
            (pageChange)="onPageChange($event)"
          ></ui-pagination>
        </div>
      }

      <!-- Create/Edit Modal -->
      <ui-modal
        [isOpen]="isModalOpen()"
        [title]="editingProject() ? 'Editar proyecto' : 'Nuevo proyecto'"
        (closed)="closeModal()"
        variant="glass"
      >
        <!-- Form Errors -->
        @if (formErrors().length > 0) {
          <div class="form-errors">
            @for (error of formErrors(); track $index) {
              <div class="error-message">
                <lucide-icon name="AlertCircle" size="16"></lucide-icon>
                <span>{{ error }}</span>
              </div>
            }
          </div>
        }

        <div class="modal-form">
          <div class="form-section">
            <h4 class="section-title">Información General</h4>
            <div class="form-grid">
              <ui-input
                label="Nombre del proyecto *"
                [(ngModel)]="formData.name"
                icon="layout"
                placeholder="Nombre del proyecto"
                required
              ></ui-input>
              <ui-input
                label="Cliente"
                [(ngModel)]="formData.clientName"
                icon="user"
                placeholder="Nombre del cliente"
              ></ui-input>
              <ui-input
                label="Fecha inicio"
                [(ngModel)]="formData.startDate"
                icon="calendar"
                type="date"
              ></ui-input>
              <ui-input
                label="Fecha fin"
                [(ngModel)]="formData.endDate"
                icon="calendar"
                type="date"
              ></ui-input>
              <ui-input
                label="Descripción"
                [(ngModel)]="formData.description"
                icon="file-text"
                placeholder="Descripción del proyecto"
              ></ui-input>
              <div class="input-wrapper">
                <label class="input-label" for="valid-until-input">
                  <lucide-icon name="calendar" size="16"></lucide-icon>
                  Válido hasta
                </label>
                <input
                  id="valid-until-input"
                  type="date"
                  class="form-input"
                  [(ngModel)]="formData.validUntil"
                  [min]="getMinDate()"
                />
              </div>
            </div>
            <div class="form-field">
              <label class="field-label" for="notes-textarea">
                <lucide-icon name="sticky-note" size="16"></lucide-icon>
                Notas
              </label>
              <textarea
                id="notes-textarea"
                class="notes-textarea"
                [(ngModel)]="formData.notes"
                placeholder="Notas adicionales..."
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <ui-button variant="ghost" (clicked)="closeModal()"
            >Cancelar</ui-button
          >
          <ui-button
            variant="solid"
            (clicked)="saveProject()"
            [loading]="isSaving()"
            icon="save"
          >
            {{ editingProject() ? 'Guardar cambios' : 'Crear proyecto' }}
          </ui-button>
        </div>
      </ui-modal>
    </div>
  `,
  styles: [
    `
      .projects-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
        min-height: 100vh;
      }

      .feature-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        background: var(--surface);
        padding: 0.5rem 1.5rem;
        border-radius: 16px;
        border: 1px solid var(--border-soft);
        gap: 2rem;
      }

      .search-container {
        flex: 1;
      }

      .actions-group {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .status-select {
        min-width: 200px;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        padding: 4rem;
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

      .empty-icon {
        color: var(--text-muted);
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      /* Form Errors */
      .form-errors {
        background: var(--danger-light);
        border: 1px solid var(--danger);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1.5rem;
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--danger);
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
      }

      .error-message:last-child {
        margin-bottom: 0;
      }

      /* Modal Form Styles */
      .modal-form {
        padding: 1rem 0;
      }

      .form-section {
        margin-bottom: 1.5rem;
      }

      .section-title {
        font-size: 1rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--text-primary);
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.5rem;
      }

      .pagination-footer {
        margin-top: 3rem;
        display: flex;
        justify-content: center;
      }

      .advanced-filters {
        background: var(--surface);
        border: 1px solid var(--border-soft);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        animation: slideDown 0.3s ease-out;
      }

      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        align-items: end;
      }

      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .filter-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .filter-input {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--border-soft);
        border-radius: 8px;
        background: var(--background);
        color: var(--text-primary);
        font-size: 0.875rem;
        transition: border-color 0.2s ease;
      }

      .filter-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
      }

      .filter-actions {
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .bulk-actions-bar {
        background: var(--warning-light);
        border: 1px solid var(--warning);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        margin-bottom: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        animation: slideDown 0.3s ease-out;
      }

      .bulk-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--warning);
        font-weight: 600;
      }

      .bulk-buttons {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }

      .bulk-status-select {
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--border-soft);
        border-radius: 6px;
        background: var(--background);
        color: var(--text-primary);
        font-size: 0.875rem;
      }

      .selection-header {
        grid-column: 1 / -1;
        background: var(--surface);
        border: 1px solid var(--border-soft);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        font-weight: 600;
        color: var(--text-primary);
      }

      .selection-checkbox {
        width: 16px;
        height: 16px;
        accent-color: var(--primary);
        cursor: pointer;
      }

      .card-selection {
        position: absolute;
        top: 1rem;
        right: 1rem;
      }

      .input-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .input-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .form-input {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--border-soft);
        border-radius: 8px;
        background: var(--surface);
        color: var(--text-primary);
        font-family: inherit;
        font-size: 0.875rem;
        transition: border-color 0.2s ease;
      }

      .form-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
      }

      .form-field {
        margin-bottom: 1.5rem;
      }

      .field-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }

      .notes-textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-soft);
        border-radius: 8px;
        background: var(--surface);
        color: var(--text-primary);
        font-family: inherit;
        font-size: 0.875rem;
        resize: vertical;
        min-height: 80px;
        transition: border-color 0.2s ease;
      }

      .notes-textarea:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
      }

      @media (max-width: 768px) {
        .feature-controls {
          flex-direction: column;
          align-items: stretch;
        }
        .status-select {
          min-width: 0;
        }
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsListComponent
  implements OnInit, OnDestroy, FilterableService<Project>
{
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
  private readonly toast = inject(ToastService);
  private readonly aiFormBridge = inject(AIFormBridgeService);

  currentThemeData = this.themeService.currentThemeData;

  readonly allProjects = signal<Project[]>([]);
  isLoading = signal(true);
  statusFilter = signal('');
  currentPage = signal(1);
  totalPages = computed(() => {
    const pageSize = 12;
    return Math.ceil(this.filteredProjects().length / pageSize);
  });

  isModalOpen = signal(false);
  editingProject = signal<Project | null>(null);
  isSaving = signal(false);
  formErrors = signal<string[]>([]);

  formData: ProjectFormData = {
    name: '',
    description: '',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
    clientName: '',
    validUntil: '',
    notes: '',
  };

  sortField = signal<'name' | 'startDate' | 'status'>('name');
  sortDirection = signal<1 | -1>(1);

  // Filter signals
  dateFromFilter = signal<string>('');
  dateToFilter = signal<string>('');
  showAdvancedFilters = signal(false);

  // Bulk actions signals
  selectedProjects = signal<Set<string>>(new Set());

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

    // Advanced filters
    const dateFrom = this.dateFromFilter();
    const dateTo = this.dateToFilter();

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      list = list.filter((p) => {
        const startDate = new Date(p.startDate || '');
        return startDate >= fromDate;
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      list = list.filter((p) => {
        const startDate = new Date(p.startDate || '');
        return startDate <= toDate;
      });
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

    // Sort
    const field = this.sortField();
    const dir = this.sortDirection();

    return list.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (field === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (field === 'startDate') {
        valA = new Date(a.startDate || 0).getTime();
        valB = new Date(b.startDate || 0).getTime();
      } else if (field === 'status') {
        valA = a.status;
        valB = b.status;
      }

      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
  });

  paginatedProjects = computed(() => {
    const all = this.filteredProjects();
    const page = this.currentPage();
    const pageSize = 12;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return all.slice(start, end);
  });

  selectedCount = computed(() => this.selectedProjects().size);

  isAllSelected = computed(() => {
    const paginated = this.paginatedProjects();
    return (
      paginated.length > 0 &&
      paginated.every((p) => this.selectedProjects().has(p.id))
    );
  });

  hasSelections = computed(() => this.selectedProjects().size > 0);

  activeProjectsCount = computed(
    () => this.allProjects().filter((p) => p.status === 'ACTIVE').length,
  );
  completedProjectsCount = computed(
    () => this.allProjects().filter((p) => p.status === 'COMPLETED').length,
  );
  uniqueClientsCount = computed(
    () =>
      new Set(
        this.allProjects()
          .map((p) => p.clientId)
          .filter(Boolean),
      ).size || 8,
  );

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
    this.aiFormBridge.registerDataProxy(
      this.formData as Record<string, unknown>,
    );
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
    this.aiFormBridge.unregisterDataProxy(
      this.formData as Record<string, unknown>,
    );
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
    const term = query.toLowerCase().trim();
    if (!term) return of(this.allProjects());

    const matches = this.allProjects().filter((p: Project) => {
      const searchableText = [
        p.name,
        p.description ?? '',
        p.clientName ?? '',
        p.status,
      ]
        .join(' ')
        .toLowerCase();

      const normalizedTerm = this.normalizeSearchTerm(term);

      return (
        searchableText.includes(normalizedTerm) ||
        this.hasKeywordMatch(searchableText, normalizedTerm)
      );
    });
    return of(matches);
  }

  private normalizeSearchTerm(term: string): string {
    const synonyms: Record<string, string[]> = {
      activo: ['activo', 'active', 'activa'],
      completado: ['completado', 'completed', 'finalizado', 'terminado'],
      cancelado: ['cancelado', 'cancelled', 'anulado'],
      proyecto: ['proyecto', 'project', 'trabajo'],
    };

    for (const [key, variants] of Object.entries(synonyms)) {
      if (variants.some((v) => term.includes(v))) {
        return key;
      }
    }
    return term;
  }

  private hasKeywordMatch(text: string, term: string): boolean {
    return (
      text.includes(term) ||
      term.split(' ').every((word) => text.includes(word))
    );
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
    const duplicatedProject: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      name: `${project.name} (Copia)`,
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
    };

    this.allProjects.update((list) => [duplicatedProject, ...list]);
    this.toast.show(
      `Proyecto ${project.name} duplicado correctamente`,
      'success',
    );
  }

  onDelete(project: Project) {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar el proyecto ${project.name}?`,
      )
    ) {
      this.allProjects.update((list) =>
        list.filter((p) => p.id !== project.id),
      );
      this.toast.show(
        `Proyecto ${project.name} eliminado correctamente`,
        'success',
      );
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'linear-gradient(135deg, #10b981, #059669)';
      case 'COMPLETED':
        return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'CANCELLED':
        return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default:
        return 'linear-gradient(135deg, #6b7280, #374151)';
    }
  }

  toggleSort() {
    if (this.sortField() === 'name') {
      this.sortField.set('startDate');
      this.sortDirection.set(-1);
    } else if (this.sortField() === 'startDate') {
      this.sortField.set('status');
    } else {
      this.sortField.set('name');
      this.sortDirection.set(1);
    }
  }

  openCreateModal() {
    this.editingProject.set(null);
    this.formData = {
      name: '',
      description: '',
      status: 'ACTIVE',
      startDate: '',
      endDate: '',
      clientName: '',
      validUntil: '',
      notes: '',
    };
    this.formErrors.set([]);
    this.isModalOpen.set(true);
  }

  editProject(project: Project) {
    this.editingProject.set(project);
    this.formData = {
      ...project,
      validUntil: '',
      notes: '',
    };
    this.formErrors.set([]);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingProject.set(null);
    this.formErrors.set([]);
  }

  saveProject() {
    const errors: string[] = [];

    if (!this.formData.name?.trim()) {
      errors.push('El nombre del proyecto es obligatorio');
    }

    if (this.formData.startDate && this.formData.endDate) {
      const startDate = new Date(this.formData.startDate);
      const endDate = new Date(this.formData.endDate);
      if (endDate <= startDate) {
        errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    if (
      this.formData.validUntil &&
      new Date(this.formData.validUntil) < new Date()
    ) {
      errors.push('La fecha de validez no puede ser anterior a hoy');
    }

    if (this.formData.description && this.formData.description.length > 500) {
      errors.push('La descripción no puede exceder 500 caracteres');
    }

    if (this.formData.notes && this.formData.notes.length > 1000) {
      errors.push('Las notas no pueden exceder 1000 caracteres');
    }

    if (errors.length > 0) {
      this.formErrors.set(errors);
      return;
    }

    this.formErrors.set([]);
    this.isSaving.set(true);

    // Simulate async operation
    setTimeout(() => {
      const projectToEdit = this.editingProject();
      if (projectToEdit) {
        this.allProjects.update((list) =>
          list.map((p) =>
            p.id === projectToEdit.id
              ? ({ ...p, ...this.formData } as Project)
              : p,
          ),
        );
        this.toast.show(
          `Proyecto ${this.formData.name} actualizado correctamente`,
          'success',
        );
      } else {
        const newProject: Project = {
          id: `proj-${Date.now()}`,
          name: this.formData.name!,
          description: this.formData.description || '',
          status: (this.formData.status as any) || 'ACTIVE',
          startDate: this.formData.startDate,
          endDate: this.formData.endDate,
          clientName: this.formData.clientName,
          createdAt: new Date().toISOString(),
        };
        this.allProjects.update((list) => [newProject, ...list]);
        this.toast.show(
          `Proyecto ${this.formData.name} creado correctamente`,
          'success',
        );
      }

      this.isSaving.set(false);
      this.closeModal();
    }, 1000);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  goToDetail(project: Project) {
    // Navigate to project detail page
    this.router.navigate(['/projects', project.id]);
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters.set(!this.showAdvancedFilters());
  }

  clearFilters() {
    this.statusFilter.set('');
    this.dateFromFilter.set('');
    this.dateToFilter.set('');
    this.currentPage.set(1);
  }

  refreshProjects() {
    this.loadProjects();
    this.toast.show('Proyectos actualizados', 'info');
  }

  toggleSelectAll() {
    const paginated = this.paginatedProjects();
    const currentSelected = this.selectedProjects();
    const newSelected = new Set(currentSelected);

    if (this.isAllSelected()) {
      paginated.forEach((p) => newSelected.delete(p.id));
    } else {
      paginated.forEach((p) => newSelected.add(p.id));
    }

    this.selectedProjects.set(newSelected);
  }

  toggleProjectSelection(projectId: string) {
    const currentSelected = this.selectedProjects();
    const newSelected = new Set(currentSelected);

    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }

    this.selectedProjects.set(newSelected);
  }

  clearSelection() {
    this.selectedProjects.set(new Set());
  }

  bulkChangeStatus(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;

    if (!newStatus) return;

    const selectedIds = Array.from(this.selectedProjects());
    if (selectedIds.length === 0) return;

    // Reset select
    target.value = '';

    // Simulate bulk update
    selectedIds.forEach((id) => {
      const project = this.allProjects().find((p) => p.id === id);
      if (project) {
        console.log(`Changing status of ${id} to ${newStatus}`);
      }
    });

    this.toast.show(
      `${selectedIds.length} proyecto${selectedIds.length === 1 ? '' : 's'} actualizado${selectedIds.length === 1 ? '' : 's'}`,
      'success',
    );
    this.clearSelection();
    this.refreshProjects();
  }

  bulkDelete() {
    const selectedIds = Array.from(this.selectedProjects());
    if (selectedIds.length === 0) return;

    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar ${selectedIds.length} proyecto${selectedIds.length === 1 ? '' : 's'}?`,
      )
    ) {
      return;
    }

    // Simulate bulk delete
    selectedIds.forEach((id) => {
      console.log(`Deleting project ${id}`);
    });

    this.toast.show(
      `${selectedIds.length} proyecto${selectedIds.length === 1 ? '' : 's'} eliminado${selectedIds.length === 1 ? '' : 's'}`,
      'success',
    );
    this.clearSelection();
    this.refreshProjects();
  }

  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private loadProjects() {
    this.isLoading.set(true);
    setTimeout(() => {
      // Update AI Form Bridge with current data
      this.aiFormBridge.registerDataProxy(
        this.formData as Record<string, unknown>,
      );

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
      this.isLoading.set(false);
    }, 800);
  }
}
