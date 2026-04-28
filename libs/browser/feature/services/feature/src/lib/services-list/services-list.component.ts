import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiFeatureFilterBarComponent,
  UiStatCardComponent,
  UiLoaderComponent,
  UiPaginationComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
  UiFeatureAccessDeniedComponent,
  UiFeaturePageShellComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  ThemeService,
  PluginStore,
  MasterFilterService,
  FilterableService,
  AIFormBridgeService,
  ToastService,
  GlobalAuthStore,
  rbacAllows,
} from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';
import { ServicesStore, Service } from '../services.store';

@Component({
  selector: 'lib-services-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiButtonComponent,
    UiFeatureFilterBarComponent,
    UiStatCardComponent,
    UiLoaderComponent,
    UiPaginationComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    LucideAngularModule,
    UiFeatureAccessDeniedComponent,
    UiFeaturePageShellComponent,
  ],
  template: `
    <ui-feature-page-shell [extraClass]="'services-container'">
      @if (!canAccess()) {
        <ui-feature-access-denied
          message="No tienes permiso para ver el catálogo de servicios."
          permissionHint="services.view"
        />
      } @else {
      <ui-feature-header
        title="Servicios"
        breadcrumbLead="CATÁLOGO"
        breadcrumbTail="SERVICIOS Y TARIFAS"
        subtitle="Catálogo de operaciones y tarifas vigentes"
        icon="wrench"
        actionLabel="NUEVO SERVICIO"
        (actionClicked)="goToNewService()"
      ></ui-feature-header>

      <ui-feature-stats>
        <ui-stat-card
          label="Total Servicios"
          [value]="store.services().length.toString()"
          icon="layers"
          [accent]="true"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Servicios Activos"
          [value]="store.activeCount().toString()"
          icon="check-circle"
          [trend]="15"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Tipos de Oferta"
          [value]="store.typesCount().toString()"
          icon="layout"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Eficiencia"
          value="98.5%"
          icon="trending-up"
          [accent]="false"
        ></ui-stat-card>
      </ui-feature-stats>

      <ui-feature-filter-bar
        [appearance]="'feature'"
        [searchVariant]="'glass'"
        placeholder="Buscar por nombre, tipo o descripción..."
        (searchChange)="onSearchChange($event)"
      >
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
          (clicked)="refreshServices()"
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
              : sortField() === 'basePrice'
                ? 'precio'
                : 'tipo'
          }}
        </ui-button>
      </ui-feature-filter-bar>

      @if (error() && store.services().length > 0) {
        <div
          class="feature-load-error-banner"
          role="status"
          aria-live="polite"
        >
          <lucide-icon
            name="alert-circle"
            size="20"
            class="feature-load-error-banner__icon"
            aria-hidden="true"
          ></lucide-icon>
          <span class="feature-load-error-banner__text">{{ error() }}</span>
          <ui-button
            variant="ghost"
            size="sm"
            icon="rotate-cw"
            (clicked)="refreshServices()"
          >
            Reintentar
          </ui-button>
        </div>
      }

      <!-- Advanced Filters -->
      @if (showAdvancedFilters()) {
        <div class="advanced-filters">
          <div class="filters-grid">
            <div class="filter-group">
              <label class="filter-label" for="status-filter">Estado</label>
              <select
                id="status-filter"
                class="filter-select"
                [(ngModel)]="statusFilter"
                (ngModelChange)="statusFilter.set($event); currentPage.set(1)"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label" for="type-filter">Tipo</label>
              <select
                id="type-filter"
                class="filter-select"
                [(ngModel)]="typeFilter"
                (ngModelChange)="typeFilter.set($event); currentPage.set(1)"
              >
                <option value="all">Todos los tipos</option>
                <option value="STREAMING">Streaming</option>
                <option value="PRODUCCIÓN">Producción</option>
                <option value="LED">LED</option>
                <option value="TRANSPORTE">Transporte</option>
                <option value="PERSONAL_TÉCNICO">Personal Técnico</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label" for="amount-min-filter"
                >Precio mínimo (€)</label
              >
              <input
                id="amount-min-filter"
                type="number"
                class="filter-input"
                placeholder="0"
                min="0"
                step="0.01"
                [(ngModel)]="amountMinFilter"
                (ngModelChange)="
                  amountMinFilter.set($event ? +$event : null);
                  currentPage.set(1)
                "
              />
            </div>
            <div class="filter-group">
              <label class="filter-label" for="amount-max-filter"
                >Precio máximo (€)</label
              >
              <input
                id="amount-max-filter"
                type="number"
                class="filter-input"
                placeholder="Sin límite"
                min="0"
                step="0.01"
                [(ngModel)]="amountMaxFilter"
                (ngModelChange)="
                  amountMaxFilter.set($event ? +$event : null);
                  currentPage.set(1)
                "
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
            <lucide-icon name="check-square" size="16" aria-hidden="true"></lucide-icon>
            <span
              >{{ selectedCount() }} servicio{{
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
              <option value="active">Activar</option>
              <option value="inactive">Desactivar</option>
            </select>
            <ui-button variant="danger" size="sm" (clicked)="bulkDelete()">
              <lucide-icon name="trash2" size="14" aria-hidden="true"></lucide-icon>
              Eliminar seleccionados
            </ui-button>
            <ui-button variant="ghost" size="sm" (clicked)="clearSelection()">
              Cancelar
            </ui-button>
          </div>
        </div>
      }

      @if (store.isLoading() && store.services().length === 0) {
        <div class="feature-loader-wrap">
          <ui-loader message="Cargando catálogo de servicios…"></ui-loader>
        </div>
      } @else if (error() && store.services().length === 0) {
        <div class="feature-error-screen" role="alert">
          <lucide-icon
            name="wifi-off"
            size="48"
            class="feature-error-screen__icon"
            aria-hidden="true"
          ></lucide-icon>
          <h3>No se pudo cargar el catálogo</h3>
          <p>{{ error() }}</p>
          <ui-button variant="solid" icon="rotate-cw" (clicked)="refreshServices()">
            Reintentar
          </ui-button>
        </div>
      } @else {
        <ui-feature-grid>
          <!-- Selection Header -->
          @if (paginatedServices().length > 0) {
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

          @for (service of paginatedServices(); track service.id) {
            <ui-feature-card
              [name]="service.name"
              [subtitle]="service.description || 'Sin descripción'"
              [avatarInitials]="getInitials(service.name)"
              [avatarBackground]="getTypeGradient(service.type)"
              [status]="service.isActive ? 'active' : 'offline'"
              [badgeLabel]="service.type"
              [badgeVariant]="getTypeBadgeVariant(service.type)"
              [showEdit]="true"
              [showDuplicate]="true"
              [showDelete]="true"
              (cardClicked)="onRowClick(service)"
              (editClicked)="onEdit(service)"
              (duplicateClicked)="onDuplicate(service)"
              (deleteClicked)="confirmDelete(service)"
              [footerItems]="[
                {
                  icon: 'euro',
                  label: 'Base: ' + (service.basePrice | currency: 'EUR'),
                },
                {
                  icon: 'clock',
                  label:
                    'Hora: ' +
                    (service.hourlyRate
                      ? (service.hourlyRate | currency: 'EUR')
                      : '-'),
                },
              ]"
            >
              <div card-extra class="card-selection">
                <input
                  type="checkbox"
                  [checked]="selectedServices().has(service.id)"
                  (change)="toggleServiceSelection(service.id)"
                  (click)="$event.stopPropagation()"
                  class="selection-checkbox"
                />
              </div>
              <div footer-extra class="service-extra-actions">
                <ui-button
                  variant="ghost"
                  size="sm"
                  icon="eye"
                  [routerLink]="['/services', service.id]"
                  title="Ver detalles"
                ></ui-button>
              </div>
            </ui-feature-card>
          } @empty {
            @if (filterProducesNoResults()) {
              <div class="feature-empty feature-empty--wide">
                <lucide-icon
                  name="search-x"
                  size="56"
                  class="feature-empty__icon"
                  aria-hidden="true"
                ></lucide-icon>
                <h3>Sin resultados</h3>
                <p>
                  Ningún servicio coincide con la búsqueda o los filtros
                  actuales.
                </p>
                <ui-button
                  variant="ghost"
                  icon="circle-x"
                  (clicked)="clearFiltersAndSearch()"
                >
                  Limpiar búsqueda y filtros
                </ui-button>
              </div>
            } @else {
              <div class="feature-empty feature-empty--wide">
                <lucide-icon
                  name="wrench"
                  size="56"
                  class="feature-empty__icon"
                  aria-hidden="true"
                ></lucide-icon>
                <h3>No hay servicios</h3>
                <p>
                  Comienza añadiendo tu primer servicio para gestionar tu catálogo
                  comercial.
                </p>
                <ui-button
                  variant="solid"
                  (clicked)="goToNewService()"
                  icon="CirclePlus"
                >
                  Añadir primer servicio
                </ui-button>
              </div>
            }
          }
        </ui-feature-grid>
      }

      <!-- Pagination -->
      @if (filteredServices().length > 12) {
        <div class="pagination-footer">
          <ui-pagination
            [currentPage]="currentPage()"
            [totalPages]="totalPages()"
            (pageChange)="onPageChange($event)"
          ></ui-pagination>
        </div>
      }
      }
    </ui-feature-page-shell>
  `,
  styles: [
    `
      :host ::ng-deep .feature-filter-bar ui-button.active {
        background: var(--primary-light);
        color: var(--primary);
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

      .filter-select,
      .filter-input {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--border-soft);
        border-radius: 8px;
        background: var(--background);
        color: var(--text-primary);
        font-size: 0.875rem;
        transition: border-color 0.2s ease;
      }

      .filter-select:focus,
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
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 0 0.5rem 0.5rem 0;
      }
      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.72rem;
        font-weight: 850;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        cursor: pointer;
        color: var(--text-muted);
        opacity: 0.8;
        transition: color 0.2s, opacity 0.2s;
      }
      .checkbox-label:hover {
        color: var(--text-primary);
        opacity: 1;
      }
      .selection-checkbox {
        width: 15px;
        height: 15px;
        accent-color: var(--brand);
        cursor: pointer;
      }

      .card-selection {
        /* La posición la aplica ui-feature-card [card-extra]. */
        position: static;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesListComponent
  implements OnInit, OnDestroy, FilterableService<Service>
{
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly aiFormBridge = inject(AIFormBridgeService);
  private readonly toast = inject(ToastService);
  readonly store = inject(ServicesStore);
  private readonly authStore = inject(GlobalAuthStore);
  readonly canAccess = rbacAllows(this.authStore, 'services.view', 'services.manage');

  readonly error = this.store.error;
  readonly hasAnyServices = computed(() => this.store.services().length > 0);
  readonly filterProducesNoResults = computed(
    () => this.hasAnyServices() && this.filteredServices().length === 0,
  );

  private readonly listAiFormProxy: Record<string, unknown> = {};

  // Signals for UI state
  currentPage = signal(1);
  totalPages = computed(() => {
    const pageSize = 12;
    return Math.ceil(this.filteredServices().length / pageSize);
  });
  sortField = signal<'name' | 'basePrice' | 'type'>('name');
  sortDirection = signal<1 | -1>(1);

  // Filter signals
  statusFilter = signal<string>('all');
  typeFilter = signal<string>('all');
  dateFromFilter = signal<string>('');
  dateToFilter = signal<string>('');
  amountMinFilter = signal<number | null>(null);
  amountMaxFilter = signal<number | null>(null);
  showAdvancedFilters = signal(false);

  // Bulk actions signals
  selectedServices = signal<Set<string>>(new Set());
  showBulkActions = signal(false);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly _searchQuery = signal('');

  readonly filteredServices = computed(() => {
    let list = [...this.store.services()];
    const t = this.masterFilter.query().trim().toLowerCase();

    // 1. Search filter
    if (t) {
      list = list.filter(
        (s: Service) =>
          s.name.toLowerCase().includes(t) ||
          (s.description ?? '').toLowerCase().includes(t) ||
          s.type.toLowerCase().includes(t),
      );
    }

    // 2. Advanced filters
    const statusFilter = this.statusFilter();
    const typeFilter = this.typeFilter();
    const dateFrom = this.dateFromFilter();
    const dateTo = this.dateToFilter();
    const amountMin = this.amountMinFilter();
    const amountMax = this.amountMaxFilter();

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      list = list.filter((s) => s.isActive === isActive);
    }

    if (typeFilter !== 'all') {
      list = list.filter((s) => s.type === typeFilter);
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      list = list.filter((s) => new Date(s.createdAt) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((s) => new Date(s.createdAt) <= to);
    }

    if (amountMin !== null) {
      list = list.filter((s) => (s.basePrice || 0) >= amountMin);
    }

    if (amountMax !== null) {
      list = list.filter((s) => (s.basePrice || 0) <= amountMax);
    }

    // 3. Sort
    const field = this.sortField();
    const dir = this.sortDirection();

    return list.sort((a, b) => {
      let valA: string | number = 0;
      let valB: string | number = 0;

      if (field === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (field === 'basePrice') {
        valA = a.basePrice || 0;
        valB = b.basePrice || 0;
      } else if (field === 'type') {
        valA = a.type;
        valB = b.type;
      }

      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
  });

  paginatedServices = computed(() => {
    const all = this.filteredServices();
    const page = this.currentPage();
    const pageSize = 12;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return all.slice(start, end);
  });

  selectedCount = computed(() => this.selectedServices().size);

  isAllSelected = computed(() => {
    const paginated = this.paginatedServices();
    return (
      paginated.length > 0 &&
      paginated.every((s) => this.selectedServices().has(s.id))
    );
  });

  hasSelections = computed(() => this.selectedServices().size > 0);

  ngOnInit() {
    this.aiFormBridge.registerDataProxy(this.listAiFormProxy);
    this.masterFilter.registerProvider(this);
    this.store.load();
  }

  ngOnDestroy() {
    this.aiFormBridge.unregisterDataProxy(this.listAiFormProxy);
    this.masterFilter.unregisterProvider();
  }

  onSearchChange(term: string) {
    this._searchQuery.set(term);
    this.masterFilter.search(term);
  }

  filter(query: string): Observable<Service[]> {
    const term = query.toLowerCase().trim();
    if (!term) return of(this.store.services());

    const matches = this.store.services().filter((s: Service) => {
      const searchableText = [s.name, s.description ?? '', s.type]
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
      servicio: ['servicio', 'service', 'oferta'],
      mantenimiento: [
        'mantenimiento',
        'maintenance',
        'reparacion',
        'reparación',
      ],
      consultoria: [
        'consultoria',
        'consultoría',
        'consulting',
        'asesoria',
        'asesoría',
      ],
      activo: ['activo', 'active', 'habilitado'],
      inactivo: ['inactivo', 'inactive', 'deshabilitado'],
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

  onEdit(service: Service) {
    void this.router.navigate([service.id, 'edit'], { relativeTo: this.route });
  }

  goToNewService(): void {
    void this.router.navigate(['new'], { relativeTo: this.route });
  }

  onDuplicate(service: Service) {
    this.store.duplicate(service.id);
  }

  confirmDelete(service: Service) {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar el servicio ${service.name}?`,
      )
    ) {
      this.store.remove(service.id);
    }
  }

  getInitials(name: string | undefined): string {
    return (name || 'S').slice(0, 2).toUpperCase();
  }

  getTypeGradient(type: string): string {
    switch (type) {
      case 'STREAMING':
        return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'PRODUCCIÓN':
        return 'linear-gradient(135deg, #10b981, #059669)';
      case 'LED':
        return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'TRANSPORTE':
        return 'linear-gradient(135deg, #6366f1, #4338ca)';
      case 'PERSONAL_TÉCNICO':
        return 'linear-gradient(135deg, #ec4899, #be185d)';
      default:
        return 'linear-gradient(135deg, #6b7280, #374151)';
    }
  }

  getTypeBadgeVariant(
    type: string,
  ): 'info' | 'success' | 'warning' | 'danger' | 'primary' | 'secondary' {
    switch (type) {
      case 'STREAMING':
        return 'info';
      case 'PRODUCCIÓN':
        return 'success';
      case 'LED':
        return 'warning';
      case 'TRANSPORTE':
        return 'info';
      case 'PERSONAL_TÉCNICO':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  toggleSort() {
    if (this.sortField() === 'name') {
      this.sortField.set('basePrice');
      this.sortDirection.set(-1);
    } else if (this.sortField() === 'basePrice') {
      this.sortField.set('type');
    } else {
      this.sortField.set('name');
      this.sortDirection.set(1);
    }
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onRowClick(service: Service) {
    void this.router.navigate([service.id], { relativeTo: this.route });
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters.set(!this.showAdvancedFilters());
  }

  clearFilters() {
    this.statusFilter.set('all');
    this.typeFilter.set('all');
    this.dateFromFilter.set('');
    this.dateToFilter.set('');
    this.amountMinFilter.set(null);
    this.amountMaxFilter.set(null);
    this.currentPage.set(1);
  }

  clearFiltersAndSearch(): void {
    this._searchQuery.set('');
    this.masterFilter.search('');
    this.clearFilters();
  }

  refreshServices() {
    this.store.load(true);
    this.toast.show('Servicios actualizados', 'info');
  }

  toggleSelectAll() {
    const paginated = this.paginatedServices();
    const currentSelected = this.selectedServices();
    const newSelected = new Set(currentSelected);

    if (this.isAllSelected()) {
      paginated.forEach((s) => newSelected.delete(s.id));
    } else {
      paginated.forEach((s) => newSelected.add(s.id));
    }

    this.selectedServices.set(newSelected);
  }

  toggleServiceSelection(serviceId: string) {
    const currentSelected = this.selectedServices();
    const newSelected = new Set(currentSelected);

    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }

    this.selectedServices.set(newSelected);
  }

  clearSelection() {
    this.selectedServices.set(new Set());
  }

  bulkChangeStatus(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;

    if (!newStatus) return;

    const selectedIds = Array.from(this.selectedServices());
    if (selectedIds.length === 0) return;

    // Reset select
    target.value = '';

    // Simulate bulk update
    selectedIds.forEach((id) => {
      const service = this.store.services().find((s) => s.id === id);
      if (service) {
        console.log(`Changing status of ${id} to ${newStatus}`);
      }
    });

    this.toast.show(
      `${selectedIds.length} servicio${selectedIds.length === 1 ? '' : 's'} actualizado${selectedIds.length === 1 ? '' : 's'}`,
      'success',
    );
    this.clearSelection();
    this.refreshServices();
  }

  bulkDelete() {
    const selectedIds = Array.from(this.selectedServices());
    if (selectedIds.length === 0) return;

    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar ${selectedIds.length} servicio${selectedIds.length === 1 ? '' : 's'}?`,
      )
    ) {
      return;
    }

    // Simulate bulk delete
    selectedIds.forEach((id) => {
      console.log(`Deleting service ${id}`);
    });

    this.toast.show(
      `${selectedIds.length} servicio${selectedIds.length === 1 ? '' : 's'} eliminado${selectedIds.length === 1 ? '' : 's'}`,
      'success',
    );
    this.clearSelection();
    this.refreshServices();
  }
}
