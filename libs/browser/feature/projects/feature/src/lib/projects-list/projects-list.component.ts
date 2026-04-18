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
import { LucideAngularModule } from 'lucide-angular';

import {
  UiButtonComponent,
  UiFeatureFilterBarComponent,
  UiTabsComponent,
  UiStatCardComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
  UiLoaderComponent,
  UiModalComponent,
  UiInputComponent,
  UiFeatureAccessDeniedComponent,
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
  GlobalAuthStore,
  rbacAllows,
} from '@josanz-erp/shared-data-access';
import { Project, ProjectsFacade } from '@josanz-erp/projects-data-access';
import { Observable, of } from 'rxjs';

// Extended form type for additional fields
interface ProjectFormData {
  name: string;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  clientName?: string;
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
    UiFeatureFilterBarComponent,
    UiTabsComponent,
    UiStatCardComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    UiLoaderComponent,
    UiModalComponent,
    UiInputComponent,
    LucideAngularModule,
    UiFeatureAccessDeniedComponent,
  ],
  providers: [{ provide: FILTER_PROVIDER, useExisting: ProjectsListComponent }],
  template: `
    <div class="projects-container">
      @if (!canAccess()) {
        <ui-feature-access-denied
          message="No tienes permiso para ver proyectos."
          permissionHint="projects.view"
        />
      } @else {
      <ui-feature-header
        title="Proyectos"
        subtitle="Gestión operativa y seguimiento de proyectos"
        icon="layout"
        actionLabel="Nuevo Proyecto"
        (actionClicked)="openCreateModal()"
      ></ui-feature-header>

      @if (projectsLoadError() && hasAnyProjects()) {
        <div class="feature-load-error-banner" role="status" aria-live="polite">
          <lucide-icon
            name="alert-circle"
            size="18"
            class="feature-load-error-banner__icon"
          ></lucide-icon>
          <span class="feature-load-error-banner__text">{{
            projectsLoadError() || 'No se pudo completar la operación con proyectos.'
          }}</span>
          <ui-button variant="ghost" size="sm" (clicked)="refreshProjects(true)">Reintentar</ui-button>
        </div>
      }

      <ui-feature-stats>
        <ui-stat-card
          label="Proyectos Activos"
          [value]="activeProjectsCount().toString()"
          icon="activity"
          [trend]="5"
          [accent]="true"
        ></ui-stat-card>
        <ui-stat-card
          label="Proyectos Completados"
          [value]="completedProjectsCount().toString()"
          icon="check-circle"
          [trend]="12"
        ></ui-stat-card>
        <ui-stat-card
          label="Clientes Únicos"
          [value]="uniqueClientsCount().toString()"
          icon="users"
        ></ui-stat-card>
        <ui-stat-card
          label="Total Proyectos"
          [value]="projects().length.toString()"
          icon="briefcase"
        ></ui-stat-card>
      </ui-feature-stats>

      <ui-feature-filter-bar
        [appearance]="'feature'"
        [searchVariant]="'glass'"
        placeholder="Buscar proyectos…"
        (searchChange)="onSearchChange($event)"
      >
        <div uiFeatureFilterStates>
          <ui-tabs
            [tabs]="tabs()"
            [activeTab]="activeTab()"
            variant="underline"
            (tabChange)="onTabChange($event)"
          ></ui-tabs>
        </div>
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
        <ui-button
          variant="ghost"
          size="sm"
          [icon]="sortDirection() === 1 ? 'ChevronUp' : 'ChevronDown'"
          (clicked)="toggleSort()"
        >
          Ordenar:
          {{
            sortField() === 'name'
              ? 'nombre'
              : sortField() === 'startDate'
                ? 'fecha de inicio'
                : 'estado'
          }}
        </ui-button>
      </ui-feature-filter-bar>

      <!-- Advanced Filters -->
      @if (showAdvancedFilters()) {
        <div class="advanced-filters">
          <div class="filters-grid">
            <div class="filter-group">
              <label class="filter-label" for="status-filter">Estado</label>
              <select
                id="status-filter"
                class="filter-select"
                [ngModel]="statusFilter()"
                (ngModelChange)="statusFilter.set($event); currentPage.set(1)"
              >
                <option value="all">Todos los estados</option>
                <option value="ACTIVE">Activo</option>
                <option value="COMPLETED">Completado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label" for="date-from-filter"
                >Fecha desde</label
              >
              <input
                id="date-from-filter"
                type="date"
                class="filter-input"
                [ngModel]="dateFromFilter()"
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
                [ngModel]="dateToFilter()"
                (ngModelChange)="dateToFilter.set($event); currentPage.set(1)"
              />
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

      @if (isLoading()) {
        <div class="feature-loader-wrap">
          <ui-loader message="Cargando proyectos..."></ui-loader>
        </div>
      } @else if (projectsLoadError() && !hasAnyProjects()) {
        <div class="feature-error-screen" role="alert">
          <lucide-icon name="wifi-off" size="56" class="feature-error-screen__icon"></lucide-icon>
          <h3>No se pudo cargar el listado</h3>
          <p>
            {{
              projectsLoadError() ||
                'Comprueba la conexión o inténtalo de nuevo en unos segundos.'
            }}
          </p>
          <ui-button variant="solid" (clicked)="refreshProjects(true)">Reintentar</ui-button>
        </div>
      } @else if (!hasAnyProjects()) {
        <div class="feature-empty feature-empty--wide">
          <lucide-icon name="layout" size="64" class="feature-empty__icon"></lucide-icon>
          <h3>Sin proyectos</h3>
          <p>Crea tu primer proyecto para organizar la operativa y el seguimiento.</p>
          <ui-button variant="solid" (clicked)="openCreateModal()" icon="CirclePlus">
            Crear primer proyecto
          </ui-button>
        </div>
      } @else if (filterProducesNoResults()) {
        <div class="feature-empty feature-empty--wide">
          <lucide-icon name="search-x" size="64" class="feature-empty__icon"></lucide-icon>
          <h3>Sin resultados</h3>
          <p>Ningún proyecto coincide con la búsqueda, pestaña o filtros actuales.</p>
          <ui-button variant="ghost" size="sm" (clicked)="clearFiltersAndSearch()">
            Limpiar búsqueda y filtros
          </ui-button>
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
              [subtitle]="project.description || 'Sin descripción'"
              [avatarInitials]="getInitials(project.name)"
              [avatarBackground]="getStatusColor(project.status)"
              [status]="project.status === 'ACTIVE' ? 'active' : 'offline'"
              [badgeLabel]="project.status | titlecase"
              [badgeVariant]="getStatusVariant(project.status)"
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
                    ? 'Inicio: ' + (project.startDate | date: 'dd/MM/yyyy')
                    : 'Sin fecha',
                },
                { icon: 'user', label: project.clientName || 'Sin cliente' },
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
            </ui-feature-card>
          }
        </ui-feature-grid>
      }

      <!-- Create/Edit Modal -->
      <ui-modal
        [isOpen]="isModalOpen()"
        [title]="editingProject() ? 'Editar proyecto' : 'Nuevo proyecto'"
        (closed)="closeModal()"
        variant="glass"
      >
        <div class="modal-form">
          <div class="form-section">
            <h4 class="section-title">Información General</h4>
            <div class="form-grid">
              <ui-input
                label="Nombre del proyecto *"
                [(ngModel)]="formData.name"
                icon="briefcase"
                placeholder="Nombre del proyecto"
                required
              ></ui-input>
              <ui-input
                label="Cliente"
                [(ngModel)]="formData.clientName"
                icon="user"
                placeholder="Nombre del cliente"
              ></ui-input>
              <div class="row">
                <ui-input
                  label="Fecha de inicio"
                  type="date"
                  [(ngModel)]="formData.startDate"
                  icon="calendar"
                ></ui-input>
                <ui-input
                  label="Fecha de fin"
                  type="date"
                  [(ngModel)]="formData.endDate"
                  icon="calendar"
                ></ui-input>
              </div>
            </div>
            <div class="form-field">
              <label class="field-label" for="description-textarea">
                <lucide-icon name="file-text" size="16"></lucide-icon>
                Descripción
              </label>
              <textarea
                id="description-textarea"
                class="notes-textarea"
                [(ngModel)]="formData.description"
                placeholder="Descripción detallada del proyecto..."
                rows="3"
              ></textarea>
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
            >CANCELAR</ui-button
          >
          <ui-button
            variant="solid"
            (clicked)="saveProject()"
            [loading]="isSaving()"
            icon="save"
          >
            {{ editingProject() ? 'GUARDAR CAMBIOS' : 'CREAR PROYECTO' }}
          </ui-button>
        </div>
      </ui-modal>
      }
    </div>
  `,
  styles: [
    `
      .projects-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
      }

      .flex-1 {
        flex: 1;
      }

      /* Advanced Filters */
      .advanced-filters {
        margin: 1rem 0;
        padding: 1.5rem;
        background: var(--surface);
        border-radius: 12px;
        border: 1px solid var(--border-soft);
      }
      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }
      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .filter-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .filter-select,
      .filter-input {
        padding: 0.75rem;
        border: 1px solid var(--border-soft);
        border-radius: 8px;
        background: var(--background);
        color: var(--text);
        font-size: 0.875rem;
      }
      .filter-select:focus,
      .filter-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
      }

      /* Bulk Actions */
      .bulk-actions-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        background: var(--warning-light);
        border: 1px solid var(--warning);
        border-radius: 12px;
        margin: 1rem 0;
      }
      .bulk-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        color: var(--warning-dark);
      }
      .bulk-buttons {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }
      .bulk-status-select {
        padding: 0.5rem;
        border: 1px solid var(--border-soft);
        border-radius: 6px;
        background: var(--background);
        font-size: 0.875rem;
      }

      /* Selection */
      .selection-header {
        grid-column: 1 / -1;
        display: flex;
        justify-content: flex-end;
        padding: 1rem;
        border-bottom: 1px solid var(--border-soft);
      }
      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
      }
      .selection-checkbox {
        width: 16px;
        height: 16px;
        accent-color: var(--primary);
      }
      .card-selection {
        position: absolute;
        top: 1rem;
        right: 1rem;
      }

      .pagination-footer {
        margin-top: 3rem;
        display: flex;
        justify-content: center;
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
      .row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1rem;
      }
      .field-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .notes-textarea {
        padding: 0.75rem;
        border: 1px solid var(--border-soft);
        border-radius: 8px;
        background: var(--background);
        color: var(--text);
        font-size: 0.875rem;
        font-family: inherit;
        resize: vertical;
        min-height: 80px;
      }
      .notes-textarea:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.5rem;
      }

      :host ::ng-deep .feature-filter-bar ui-button.active {
        background: var(--primary-light);
        color: var(--primary);
      }

      @media (max-width: 900px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
        .row {
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
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly route = inject(ActivatedRoute);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly domainEventsApi = inject(DomainEventsApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly aiFormBridge = inject(AIFormBridgeService);
  private readonly facade = inject(ProjectsFacade) as ProjectsFacade;
  private readonly authStore = inject(GlobalAuthStore);
  readonly canAccess = rbacAllows(this.authStore, 'projects.view', 'projects.manage');

  // Use facade signals
  projects = this.facade.projects;
  tabs = this.facade.tabs;
  isLoading = this.facade.isLoading;
  projectsLoadError = this.facade.error;
  activeTab = signal('all');
  statusFilter = signal('all');
  currentPage = signal(1);

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

  filteredProjects = computed(() => {
    let list = [...this.projects()];

    const q = this.masterFilter.query().trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const blob = [
          p.name,
          p.description ?? '',
          p.clientName ?? '',
          p.status,
          p.clientId ?? '',
        ]
          .join(' ')
          .toLowerCase();
        return blob.includes(q);
      });
    }

    const tab = this.activeTab();
    if (tab !== 'all') {
      list = list.filter((p) => p.status === tab);
    }
    const st = this.statusFilter();
    if (st && st !== 'all') {
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
      list = list.filter((p) => {
        const endDate = new Date(p.endDate || '');
        return endDate <= toDate;
      });
    }

    const field = this.sortField();
    const dir = this.sortDirection();
    list.sort((a, b) => {
      let valA: string | number;
      let valB: string | number;
      if (field === 'name') {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
      } else if (field === 'startDate') {
        valA = a.startDate ? new Date(a.startDate).getTime() : 0;
        valB = b.startDate ? new Date(b.startDate).getTime() : 0;
      } else {
        valA = (a.status || '').toLowerCase();
        valB = (b.status || '').toLowerCase();
      }
      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });

    return list;
  });

  readonly hasAnyProjects = computed(() => this.projects().length > 0);
  readonly filterProducesNoResults = computed(
    () => this.hasAnyProjects() && this.filteredProjects().length === 0,
  );

  paginatedProjects = computed(() => {
    const filtered = this.filteredProjects();
    const pageSize = 12;
    const start = (this.currentPage() - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  });

  totalPages = computed(() => {
    const filtered = this.filteredProjects();
    const pageSize = 12;
    return Math.ceil(filtered.length / pageSize);
  });

  // Bulk actions computed
  selectedCount = computed(() => this.selectedProjects().size);
  hasSelections = computed(() => this.selectedProjects().size > 0);
  isAllSelected = computed(() => {
    const paginated = this.paginatedProjects();
    return (
      paginated.length > 0 &&
      paginated.every((p) => this.selectedProjects().has(p.id))
    );
  });

  activeProjectsCount = computed(
    () => this.projects().filter((p: Project) => p.status === 'ACTIVE').length,
  );
  completedProjectsCount = computed(
    () =>
      this.projects().filter((p: Project) => p.status === 'COMPLETED').length,
  );
  uniqueClientsCount = computed(
    () =>
      new Set(
        this.projects()
          .map((p: Project) => p.clientId)
          .filter(Boolean),
      ).size || 8,
  );

  ngOnInit() {
    this.masterFilter.registerProvider(this);
    this.aiFormBridge.registerDataProxy(
      this.formData as unknown as Record<string, unknown>,
    );
    this.facade.loadProjects();
  }

  ngOnDestroy() {
    this.aiFormBridge.unregisterDataProxy(
      this.formData as unknown as Record<string, unknown>,
    );
    this.masterFilter.unregisterProvider();
  }

  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
    this.currentPage.set(1);
  }

  onSearchChange(term: string) {
    this.masterFilter.search(term);
  }

  // Advanced filtering methods
  toggleAdvancedFilters() {
    this.showAdvancedFilters.set(!this.showAdvancedFilters());
  }

  /** @param force Fuerza petición aunque ya haya proyectos en memoria. */
  refreshProjects(force = false) {
    this.facade.loadProjects(force);
  }

  clearFiltersAndSearch() {
    this.masterFilter.search('');
    this.activeTab.set('all');
    this.statusFilter.set('all');
    this.dateFromFilter.set('');
    this.dateToFilter.set('');
    this.showAdvancedFilters.set(false);
    this.currentPage.set(1);
  }

  // Bulk actions methods
  toggleSelectAll() {
    const paginated = this.paginatedProjects();
    const currentSelected = this.selectedProjects();

    if (this.isAllSelected()) {
      const newSelected = new Set(currentSelected);
      paginated.forEach((p) => newSelected.delete(p.id));
      this.selectedProjects.set(newSelected);
    } else {
      const newSelected = new Set(currentSelected);
      paginated.forEach((p) => newSelected.add(p.id));
      this.selectedProjects.set(newSelected);
    }
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

  bulkChangeStatus(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

    if (!newStatus) return;

    const selectedIds = Array.from(this.selectedProjects());
    selectedIds.forEach((id) => {
      this.facade.updateProject(id, { status: newStatus });
    });

    this.selectedProjects.set(new Set());
    this.toast.show(
      `${selectedIds.length} proyecto${selectedIds.length === 1 ? '' : 's'} actualizado${selectedIds.length === 1 ? '' : 's'}`,
      'success',
    );
    target.value = '';
  }

  bulkDelete() {
    const selectedIds = Array.from(this.selectedProjects());

    if (
      confirm(
        `¿Estás seguro de eliminar ${selectedIds.length} proyecto${selectedIds.length === 1 ? '' : 's'}?`,
      )
    ) {
      selectedIds.forEach((id) => {
        this.facade.deleteProject(id);
      });

      this.selectedProjects.set(new Set());
      this.toast.show(
        `${selectedIds.length} proyecto${selectedIds.length === 1 ? '' : 's'} eliminado${selectedIds.length === 1 ? '' : 's'}`,
        'success',
      );
    }
  }

  clearSelection() {
    this.selectedProjects.set(new Set());
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
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

  // FilterableService implementation
  filter(query: string): Observable<Project[]> {
    const term = query.toLowerCase().trim();
    if (!term) return of(this.projects());

    const matches = this.projects().filter((p: Project) => {
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
      activo: ['activo', 'active', 'activos'],
      completado: ['completado', 'completed', 'completados'],
      cancelado: ['cancelado', 'cancelled', 'cancelados'],
      proyecto: ['proyecto', 'project', 'proyectos'],
      cliente: ['cliente', 'client', 'clientes'],
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

  onRowClick() {
    // Navigate to detail
  }

  goToDetail(project: Project) {
    this.router.navigate(['/projects', project.id]);
  }

  editProject(project: Project) {
    this.router.navigate(['/projects', project.id, 'edit']);
  }

  onDuplicate(project: Project) {
    const projectData = { ...project };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (projectData as any).id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (projectData as any).createdAt;
    this.facade.createProject({
      ...projectData,
      name: `${project.name} (Copia)`,
      status: 'ACTIVE' as const,
    });
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
      this.facade.deleteProject(project.id);
      this.toast.show(
        `Proyecto ${project.name} eliminado correctamente`,
        'success',
      );
    }
  }

  openCreateModal() {
    this.editingProject.set(null);
    this.formData = {
      name: '',
      description: '',
      status: 'ACTIVE',
      clientName: '',
      notes: '',
    };
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

    const projectToEdit = this.editingProject();
    if (projectToEdit) {
      // Update existing project
      const { ...updates } = this.formData;
      this.facade.updateProject(projectToEdit.id, updates);
      this.toast.show(
        `Proyecto ${this.formData.name} actualizado correctamente`,
        'success',
      );
      this.isSaving.set(false);
      this.closeModal();
    } else {
      // Create new project
      const { ...newProjectData } = this.formData;
      this.facade.createProject(newProjectData);
      this.toast.show(
        `Proyecto ${this.formData.name} creado correctamente`,
        'success',
      );
      this.isSaving.set(false);
      this.closeModal();
    }
  }

  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
        return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  }

  getStatusVariant(
    status: string,
  ): 'success' | 'warning' | 'info' | 'danger' | 'secondary' | 'primary' {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'info';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
