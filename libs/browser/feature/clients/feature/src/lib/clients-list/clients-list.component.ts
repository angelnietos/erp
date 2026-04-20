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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiFeatureFilterBarComponent,
  UiLoaderComponent,
  UiInputComponent,
  UiStatCardComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
  UiTabsComponent,
  UiSelectComponent,
  UiFeatureAccessDeniedComponent,
  UiFeaturePageShellComponent,
} from '@josanz-erp/shared-ui-kit';
import { take } from 'rxjs/operators';
import { Client, ClientsFacade } from '@josanz-erp/clients-data-access';
import {
  ThemeService,
  PluginStore,
  MasterFilterService,
  FilterableService,
  AIFormBridgeService,
  ToastService,
  GlobalAuthStore as AuthStore,
  rbacAllows,
} from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';
import { CLIENTS_FEATURE_CONFIG } from '../clients-feature.config';

@Component({
  selector: 'lib-clients-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    UiLoaderComponent,
    UiButtonComponent,
    UiFeatureFilterBarComponent,
    UiTabsComponent,
    UiStatCardComponent,
    UiInputComponent,
    UiSelectComponent,
    LucideAngularModule,
    UiFeatureAccessDeniedComponent,
    UiFeaturePageShellComponent,
  ],
  template: `
    <ui-feature-page-shell [extraClass]="'clients-container'">
      <!-- Standard Header -->
      <ui-feature-header
        title="Clientes"
        breadcrumbLead="CRM Y VENTAS"
        breadcrumbTail="CARTERA DE CLIENTES"
        subtitle="Gestión completa de tu cartera de clientes"
        icon="building-2"
        [actionLabel]="canManage() ? 'NUEVO CLIENTE' : ''"
        (actionClicked)="goToNewClient()"
      ></ui-feature-header>

      @if (canView()) {

      @if (clientsLoadError() && hasAnyClients()) {
        <div class="feature-load-error-banner" role="status" aria-live="polite">
          <lucide-icon
            name="alert-circle"
            size="18"
            class="feature-load-error-banner__icon"
            aria-hidden="true"
          ></lucide-icon>
          <span class="feature-load-error-banner__text">{{
            clientsLoadError() || 'No se pudo completar la operación con clientes.'
          }}</span>
          <ui-button variant="ghost" size="sm" (clicked)="refreshClients(true)">Reintentar</ui-button>
        </div>
      }

      <!-- Standard Stats -->
      <ui-feature-stats>
        <ui-stat-card
          label="Total Clientes"
          [value]="clients().length.toString()"
          icon="users"
          [trend]="12"
          [accent]="true"
        ></ui-stat-card>
        <ui-stat-card
          label="Nuevos este mes"
          [value]="newClientsCount().toString()"
          icon="user-plus"
          [trend]="8"
        ></ui-stat-card>
        <ui-stat-card
          label="Sectores activos"
          [value]="activeSectorsCount().toString()"
          icon="briefcase"
        ></ui-stat-card>
        <ui-stat-card
          label="Ingresos totales"
          [value]="(totalRevenue() | number: '1.0-0') + '€'"
          icon="dollar-sign"
          [trend]="15"
        ></ui-stat-card>
      </ui-feature-stats>

      <ui-feature-filter-bar
        [appearance]="'feature'"
        [searchVariant]="'glass'"
        placeholder="Buscar por nombre, sector o contacto..."
        (searchChange)="onSearch($event)"
      >
        <div uiFeatureFilterStates>
          <ui-tabs
            [tabs]="tabs"
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
          (clicked)="refreshClients()"
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
              : sortField() === 'revenue'
                ? 'ingresos'
                : 'proyectos'
          }}
        </ui-button>
      </ui-feature-filter-bar>

      <!-- Advanced Filters -->
      @if (showAdvancedFilters()) {
        <div class="advanced-filters">
          <div class="filters-grid">
            <div class="filter-group">
              <ui-select
                id="sector-filter"
                label="Sector"
                [options]="[
                  { value: 'all', label: 'Todos los sectores' },
                  { value: 'Tecnología', label: 'Tecnología' },
                  { value: 'Construcción', label: 'Construcción' },
                  { value: 'Servicios', label: 'Servicios' },
                  { value: 'Comercio', label: 'Comercio' },
                  { value: 'Industria', label: 'Industria' },
                ]"
                [ngModel]="sectorFilter()"
                (ngModelChange)="sectorFilter.set($event); currentPage.set(1)"
                variant="soft"
                size="sm"
              ></ui-select>
            </div>
            <div class="filter-group">
              <ui-select
                id="type-filter"
                label="Tipo"
                [options]="[
                  { value: 'all', label: 'Todos los tipos' },
                  { value: 'company', label: 'Empresa' },
                  { value: 'individual', label: 'Particular' },
                ]"
                [ngModel]="typeFilter()"
                (ngModelChange)="typeFilter.set($event); currentPage.set(1)"
                variant="soft"
                size="sm"
              ></ui-select>
            </div>
            <div class="filter-group">
              <ui-input
                id="revenue-min-filter"
                label="Ingresos mínimos (€)"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                [ngModel]="revenueMinFilter()"
                (ngModelChange)="
                  revenueMinFilter.set($event ? +$event : null);
                  currentPage.set(1)
                "
                variant="soft"
                size="sm"
              ></ui-input>
            </div>
            <div class="filter-group">
              <ui-input
                id="revenue-max-filter"
                label="Ingresos máximos (€)"
                type="number"
                placeholder="Sin límite"
                min="0"
                step="0.01"
                [ngModel]="revenueMaxFilter()"
                (ngModelChange)="
                  revenueMaxFilter.set($event ? +$event : null);
                  currentPage.set(1)
                "
                variant="soft"
                size="sm"
              ></ui-input>
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
              >{{ selectedCount() }} cliente{{
                selectedCount() === 1 ? '' : 's'
              }}
              seleccionado{{ selectedCount() === 1 ? '' : 's' }}</span
            >
          </div>
          <div class="bulk-buttons">
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

      <!-- Clients Grid -->
      @if (isLoading()) {
        <div class="feature-loader-wrap">
          <ui-loader message="Cargando clientes..."></ui-loader>
        </div>
      } @else if (clientsLoadError() && !hasAnyClients()) {
        <div class="feature-error-screen" role="alert">
          <lucide-icon name="wifi-off" size="56" class="feature-error-screen__icon" aria-hidden="true"></lucide-icon>
          <h3>No se pudo cargar la cartera</h3>
          <p>
            {{
              clientsLoadError() ||
                'Comprueba la conexión o inténtalo de nuevo en unos segundos.'
            }}
          </p>
          <ui-button variant="solid" (clicked)="refreshClients(true)">Reintentar</ui-button>
        </div>
      } @else if (!hasAnyClients()) {
        <div class="feature-empty feature-empty--wide">
          <lucide-icon name="building-2" size="64" class="feature-empty__icon" aria-hidden="true"></lucide-icon>
          <h3>Sin clientes todavía</h3>
          <p>Añade tu primer cliente para empezar a trabajar la cartera comercial.</p>
          @if (canManage()) {
            <ui-button variant="solid" (clicked)="goToNewClient()" icon="CirclePlus">
              Añadir primer cliente
            </ui-button>
          }
        </div>
      } @else if (filterProducesNoResults()) {
        <div class="feature-empty feature-empty--wide">
          <lucide-icon name="search-x" size="64" class="feature-empty__icon" aria-hidden="true"></lucide-icon>
          <h3>Sin resultados</h3>
          <p>Ningún cliente coincide con la búsqueda o los filtros actuales.</p>
          <ui-button variant="ghost" size="sm" (clicked)="clearFiltersAndSearch()">
            Limpiar filtros
          </ui-button>
        </div>
      } @else {
        <ui-feature-grid>
          <!-- Selection Header -->
          @if (paginatedClients().length > 0) {
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

          @for (client of paginatedClients(); track client.id) {
            <ui-feature-card
              [name]="client.name"
              [subtitle]="client.contact || 'Sin contacto'"
              [avatarInitials]="getInitials(client.name)"
              [avatarBackground]="getClientColor(client)"
              [status]="
                getClientStatus(client) === 'active' ? 'active' : 'offline'
              "
              [badgeLabel]="client.sector || 'General'"
              [showEdit]="canManage()"
              [showDuplicate]="canManage()"
              [showDelete]="canManage()"
              (cardClicked)="goToDetail(client)"
              (editClicked)="goToEditClient(client)"
              (duplicateClicked)="onDuplicate(client)"
              (deleteClicked)="confirmDelete(client)"
              [footerItems]="[
                {
                  icon: 'briefcase',
                  label: getClientProjects(client) + ' proyectos',
                },
                {
                  icon: 'dollar-sign',
                  label: (getClientRevenue(client) | number: '1.0-0') + '€',
                },
              ]"
            >
              <div card-extra class="card-selection">
                <input
                  type="checkbox"
                  [checked]="selectedClients().has(client.id)"
                  (change)="toggleClientSelection(client.id)"
                  (click)="$event.stopPropagation()"
                  class="selection-checkbox"
                />
              </div>
              <div footer-extra class="client-rating">
                <lucide-icon name="star" size="12" class="filled" aria-hidden="true"></lucide-icon>
                <span>{{ getClientRating(client) }}/5</span>
              </div>
            </ui-feature-card>
          }
        </ui-feature-grid>
      }
      } @else {
        <ui-feature-access-denied
          message="No tienes permiso para ver el directorio de clientes."
          permissionHint="clients.view"
        />
      }
    </ui-feature-page-shell>
  `,
  styles: [
    `
      .flex-1 {
        flex: 1;
      }

      .client-rating {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-muted);
        font-weight: 600;
      }

      .client-rating .filled {
        color: #fbbf24;
        fill: currentColor;
      }

      .flex-1 {
        flex: 1;
      }

      .pagination-footer {
        margin-top: 3rem;
        display: flex;
        justify-content: center;
      }

      /* Advanced Filters */
      .advanced-filters {
        margin: 1rem 0;
        padding: 1.5rem;
        background: var(--surface);
        border-radius: 16px;
        border: 1px solid var(--border-soft);
        box-shadow: 0 8px 32px -14px rgba(8, 8, 8, 0.09);
      }
      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.25rem;
        align-items: end;
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

      /* Active state for filters button */
      :host ::ng-deep .feature-filter-bar ui-button.active {
        background: var(--primary-light);
        color: var(--primary);
      }

      @media (max-width: 768px) {
        .controls-section {
          flex-direction: column;
          align-items: stretch;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsListComponent
  implements OnInit, OnDestroy, FilterableService<Client>
{
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly facade = inject(ClientsFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly aiFormBridge = inject(AIFormBridgeService);
  private readonly toast = inject(ToastService);
  public readonly config = inject(CLIENTS_FEATURE_CONFIG);
  public readonly authStore = inject(AuthStore);

  readonly canView = rbacAllows(this.authStore, 'clients.view');
  readonly canManage = rbacAllows(this.authStore, 'clients.manage');

  currentTheme = this.themeService.currentThemeData;
  columns = this.config.defaultColumns;

  clients = this.facade.clients;
  isLoading = this.facade.isLoading;
  /** Error de carga/búsqueda desde el facade (mensaje técnico o vacío). */
  clientsLoadError = this.facade.error;
  currentPage = signal(1);

  tabs = [{ id: 'all', label: 'Todos', badge: 0 }];
  activeTab = signal('all');

  /** Proxy vacío: el formulario de alta/edición vive en la ruta dedicada. */
  private readonly listAiFormProxy: Record<string, unknown> = {};
  memoizedStats = new Map<
    string,
    { projects: number; revenue: number; rating: number }
  >();

  sortField = signal<'name' | 'revenue' | 'projects'>('name');
  sortDirection = signal<1 | -1>(1);

  // Advanced filtering
  showAdvancedFilters = signal(false);
  sectorFilter = signal<string>('all');
  typeFilter = signal<string>('all');
  revenueMinFilter = signal<number | null>(null);
  revenueMaxFilter = signal<number | null>(null);

  // Bulk actions
  selectedClients = signal<Set<string>>(new Set());

  filteredClients = computed(() => {
    let list = [...this.clients()];
    const t = this.masterFilter.query().trim().toLowerCase();

    // 1. Search filter
    if (t) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(t) ||
          (c.sector ?? '').toLowerCase().includes(t) ||
          (c.contact ?? '').toLowerCase().includes(t) ||
          (c.email ?? '').toLowerCase().includes(t),
      );
    }

    // 2. Advanced filters
    if (this.sectorFilter() !== 'all') {
      list = list.filter((c) => c.sector === this.sectorFilter());
    }
    if (this.typeFilter() !== 'all') {
      list = list.filter((c) => c.type === this.typeFilter());
    }
    const revMin = this.revenueMinFilter();
    if (revMin !== null) {
      list = list.filter((c) => this.getClientRevenue(c) >= revMin);
    }
    const revMax = this.revenueMaxFilter();
    if (revMax !== null) {
      list = list.filter((c) => this.getClientRevenue(c) <= revMax);
    }

    // 3. Sort
    const field = this.sortField();
    const dir = this.sortDirection();

    return list.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (field === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (field === 'revenue') {
        valA = this.getClientRevenue(a);
        valB = this.getClientRevenue(b);
      } else if (field === 'projects') {
        valA = this.getClientProjects(a);
        valB = this.getClientProjects(b);
      }

      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
  });

  readonly hasAnyClients = computed(() => this.clients().length > 0);
  /** Hay clientes pero filtros/búsqueda dejan la lista vacía. */
  readonly filterProducesNoResults = computed(
    () => this.hasAnyClients() && this.filteredClients().length === 0,
  );

  paginatedClients = computed(() => {
    const filtered = this.filteredClients();
    const pageSize = 12;
    const start = (this.currentPage() - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  });

  totalPages = computed(() => {
    const filtered = this.filteredClients();
    const pageSize = 12;
    return Math.ceil(filtered.length / pageSize);
  });

  // Bulk actions computed
  selectedCount = computed(() => this.selectedClients().size);
  hasSelections = computed(() => this.selectedClients().size > 0);
  isAllSelected = computed(() => {
    const paginated = this.paginatedClients();
    return (
      paginated.length > 0 &&
      paginated.every((c) => this.selectedClients().has(c.id))
    );
  });

  newClientsCount = computed(() => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return this.clients().filter(
      (c) => c.createdAt != null && new Date(c.createdAt) >= startOfMonth,
    ).length;
  });

  activeSectorsCount = computed(
    () =>
      new Set(
        this.clients()
          .map((c) => c.sector)
          .filter(Boolean),
      ).size,
  );

  totalRevenue = computed(() => {
    // Calculate total revenue from all clients
    // Since Client interface doesn't have revenue field, using a placeholder calculation
    return this.clients().length * 25000; // Placeholder: 25k per client
  });

  ngOnInit() {
    this.aiFormBridge.registerDataProxy(this.listAiFormProxy);
    this.masterFilter.registerProvider(this);
    this.route.queryParamMap.pipe(take(1)).subscribe((q) => {
      const text = q.get('q')?.trim();
      if (text) {
        this.masterFilter.search(text);
      }
      this.loadClients();
    });
  }

  ngOnDestroy() {
    this.aiFormBridge.unregisterDataProxy(this.listAiFormProxy);
    this.masterFilter.unregisterProvider();
  }

  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
    this.currentPage.set(1);
  }

  /** Lógica de filtrado para el MasterFilterService */
  filter(query: string): Observable<Client[]> {
    const term = query.toLowerCase().trim();
    if (!term) return of(this.clients());

    const matches = this.clients().filter((c: Client) => {
      const searchableText = [
        c.name,
        c.sector ?? '',
        c.contact ?? '',
        c.email ?? '',
        c.phone ?? '',
        c.city ?? '',
        c.type,
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
      empresa: ['empresa', 'company', 'compañia', 'compañía'],
      particular: ['particular', 'individual', 'persona'],
      activo: ['activo', 'active'],
      inactivo: ['inactivo', 'inactive'],
      cliente: ['cliente', 'customer', 'client'],
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
  loadClients() {
    this.facade.loadClients();
  }

  onSearch(term: string) {
    this.masterFilter.search(term);
    // Siguiendo el patrón de alta reactividad, filtramos localmente vía filteredClients() a través del masterFilter
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  goToNewClient(): void {
    void this.router.navigate(['new'], { relativeTo: this.route });
  }

  goToEditClient(client: Client): void {
    void this.router.navigate([client.id, 'edit'], { relativeTo: this.route });
  }

  onDuplicate(client: Client) {
    const { ...rest } = client;
    this.facade.createClient({
      ...rest,
      name: `${client.name} (Copia)`,
    });
    this.toast.show(
      `Cliente ${client.name} duplicado correctamente`,
      'success',
    );
  }

  confirmDelete(client: Client) {
    if (
      confirm(`¿Estás seguro de que deseas eliminar el cliente ${client.name}?`)
    ) {
      this.facade.deleteClient(client.id);
      this.toast.show(
        `Cliente ${client.name} eliminado correctamente`,
        'success',
      );
    }
  }

  getClientInitials(client: Client): string {
    return client.name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  getClientStatus(client: Client): 'active' | 'inactive' {
    // Lógica simple: si tiene email y teléfono, está activo
    return client.email && client.phone ? 'active' : 'inactive';
  }

  getClientColor(client: Client): string {
    const colors = [
      'linear-gradient(135deg, #6366f1, #8b5cf6)',
      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #ef4444, #dc2626)',
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    ];
    const index = client.name.length % colors.length;
    return colors[index];
  }

  getClientStats(client: Client) {
    // Estadísticas básicas del cliente
    return {
      projects: Math.floor(Math.random() * 10) + 1, // Placeholder
      revenue: Math.floor(Math.random() * 50000) + 10000, // Placeholder
      lastActivity: new Date(client.createdAt || Date.now()).toLocaleDateString(
        'es-ES',
      ),
    };
  }

  goToDetail(client: Client) {
    // Navigate to client detail page
    this.router.navigate([client.id], { relativeTo: this.route });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  // Advanced filtering methods
  toggleAdvancedFilters() {
    this.showAdvancedFilters.set(!this.showAdvancedFilters());
  }

  /** @param force Si true, vuelve a pedir datos aunque ya haya clientes en memoria. */
  refreshClients(force = false) {
    this.facade.loadClients(force);
  }

  clearFiltersAndSearch() {
    this.masterFilter.search('');
    this.sectorFilter.set('all');
    this.typeFilter.set('all');
    this.revenueMinFilter.set(null);
    this.revenueMaxFilter.set(null);
    this.showAdvancedFilters.set(false);
    this.currentPage.set(1);
  }

  // Bulk actions methods
  toggleSelectAll() {
    const paginated = this.paginatedClients();
    const currentSelected = this.selectedClients();

    if (this.isAllSelected()) {
      const newSelected = new Set(currentSelected);
      paginated.forEach((c) => newSelected.delete(c.id));
      this.selectedClients.set(newSelected);
    } else {
      const newSelected = new Set(currentSelected);
      paginated.forEach((c) => newSelected.add(c.id));
      this.selectedClients.set(newSelected);
    }
  }

  toggleClientSelection(clientId: string) {
    const currentSelected = this.selectedClients();
    const newSelected = new Set(currentSelected);

    if (newSelected.has(clientId)) {
      newSelected.delete(clientId);
    } else {
      newSelected.add(clientId);
    }

    this.selectedClients.set(newSelected);
  }

  bulkDelete() {
    const selectedIds = Array.from(this.selectedClients());

    if (confirm(`¿Estás seguro de eliminar ${selectedIds.length} clientes?`)) {
      selectedIds.forEach((id) => this.facade.deleteClient(id));
      this.selectedClients.set(new Set());
      this.toast.show(`${selectedIds.length} clientes eliminados`, 'success');
    }
  }

  clearSelection() {
    this.selectedClients.set(new Set());
  }

  toggleSort() {
    if (this.sortField() === 'name') {
      this.sortField.set('revenue');
      this.sortDirection.set(-1); // Default to highest revenue
    } else if (this.sortField() === 'revenue') {
      this.sortField.set('projects');
    } else {
      this.sortField.set('name');
      this.sortDirection.set(1);
    }
  }

  getClientProjects(client: Client): number {
    return this.getOrCreateStats(client.id).projects;
  }

  getClientRevenue(client: Client): number {
    return this.getOrCreateStats(client.id).revenue;
  }

  getClientRating(client: Client): number {
    return this.getOrCreateStats(client.id).rating;
  }

  private getOrCreateStats(clientId: string): {
    projects: number;
    revenue: number;
    rating: number;
  } {
    let stats = this.memoizedStats.get(clientId);
    if (!stats) {
      stats = {
        projects: Math.floor(Math.random() * 5) + 1,
        revenue: Math.floor(Math.random() * 100000) + 50000,
        rating: Math.floor(Math.random() * 3) + 3,
      };
      this.memoizedStats.set(clientId, stats);
    }
    return stats;
  }
}
