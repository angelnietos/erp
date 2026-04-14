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
  UiSearchComponent,
  UiLoaderComponent,
  UiModalComponent,
  UiInputComponent,
  UiStatCardComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
  UiTabsComponent,
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
} from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';
import { CLIENTS_FEATURE_CONFIG } from '../clients-feature.config';

// Extended form type for additional fields
interface ClientFormData extends Partial<Client> {
  description?: string;
  notes?: string;
}

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
    UiSearchComponent,
    UiTabsComponent,
    UiStatCardComponent,
    UiModalComponent,
    UiInputComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="clients-container">
      <!-- Standard Header -->
      <ui-feature-header
        title="Clientes"
        subtitle="Gestión completa de tu cartera de clientes"
        icon="building-2"
        actionLabel="Nuevo Cliente"
        (actionClicked)="openCreateModal()"
      ></ui-feature-header>

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

      <div class="filters-bar">
        <ui-tabs
          [tabs]="tabs"
          [activeTab]="activeTab()"
          variant="underline"
          (tabChange)="onTabChange($event)"
        ></ui-tabs>

        <ui-search
          variant="glass"
          placeholder="Buscar por nombre, sector o contacto..."
          (searchChange)="onSearch($event)"
          class="search-bar"
        ></ui-search>

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
            ORDENAR:
            {{
              sortField() === 'name'
                ? 'NOMBRE'
                : sortField() === 'revenue'
                  ? 'INGRESOS'
                  : 'PROYECTOS'
            }}
          </ui-button>
        </div>
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
          ORDENAR:
          {{
            sortField() === 'name'
              ? 'NOMBRE'
              : sortField() === 'revenue'
                ? 'INGRESOS'
                : 'PROYECTOS'
          }}
        </ui-button>
      </div>

      <!-- Advanced Filters -->
      @if (showAdvancedFilters()) {
        <div class="advanced-filters">
          <div class="filters-grid">
            <div class="filter-group">
              <label class="filter-label" for="sector-filter">Sector</label>
              <select
                id="sector-filter"
                class="filter-select"
                [(ngModel)]="sectorFilter"
                (ngModelChange)="sectorFilter.set($event); currentPage.set(1)"
              >
                <option value="all">Todos los sectores</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Construcción">Construcción</option>
                <option value="Servicios">Servicios</option>
                <option value="Comercio">Comercio</option>
                <option value="Industria">Industria</option>
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
                <option value="company">Empresa</option>
                <option value="individual">Particular</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label" for="revenue-min-filter"
                >Ingresos mínimos (€)</label
              >
              <input
                id="revenue-min-filter"
                type="number"
                class="filter-input"
                placeholder="0"
                min="0"
                step="0.01"
                [(ngModel)]="revenueMinFilter"
                (ngModelChange)="
                  revenueMinFilter.set($event ? +$event : null);
                  currentPage.set(1)
                "
              />
            </div>
            <div class="filter-group">
              <label class="filter-label" for="revenue-max-filter"
                >Ingresos máximos (€)</label
              >
              <input
                id="revenue-max-filter"
                type="number"
                class="filter-input"
                placeholder="Sin límite"
                min="0"
                step="0.01"
                [(ngModel)]="revenueMaxFilter"
                (ngModelChange)="
                  revenueMaxFilter.set($event ? +$event : null);
                  currentPage.set(1)
                "
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
              >{{ selectedCount() }} cliente{{
                selectedCount() === 1 ? '' : 's'
              }}
              seleccionado{{ selectedCount() === 1 ? '' : 's' }}</span
            >
          </div>
          <div class="bulk-buttons">
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

      <!-- Clients Grid -->
      @if (isLoading()) {
        <div class="loading-container">
          <ui-loader message="Cargando clientes..."></ui-loader>
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
              [showEdit]="true"
              [showDuplicate]="true"
              [showDelete]="true"
              (cardClicked)="goToDetail(client)"
              (editClicked)="editClient(client)"
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
                <lucide-icon name="star" size="12" class="filled"></lucide-icon>
                <span>{{ getClientRating(client) }}/5</span>
              </div>
            </ui-feature-card>
          } @empty {
            <div class="empty-state">
              <lucide-icon
                name="users"
                size="64"
                class="empty-icon"
              ></lucide-icon>
              <h3>No hay clientes</h3>
              <p>
                Comienza añadiendo tu primer cliente para gestionar tu cartera
                comercial.
              </p>
              <ui-button
                variant="solid"
                (clicked)="openCreateModal()"
                icon="CirclePlus"
              >
                Añadir primer cliente
              </ui-button>
            </div>
          }
        </ui-feature-grid>
      }

      <!-- Create/Edit Modal -->
      <ui-modal
        [isOpen]="isModalOpen()"
        [title]="editingClient() ? 'Editar cliente' : 'Nuevo cliente'"
        (closed)="closeModal()"
        variant="glass"
      >
        <div class="modal-form">
          <!-- Form sections as before, but simplified if possible -->
          <div class="form-section">
            <h4 class="section-title">Información General</h4>
            <div class="form-grid">
              <ui-input
                label="Nombre completo *"
                [(ngModel)]="formData.name"
                icon="user"
                placeholder="Nombre del cliente"
                required
              ></ui-input>
              <ui-input
                label="CIF/NIF"
                [(ngModel)]="formData.taxId"
                icon="hash"
                placeholder="B12345678"
              ></ui-input>
              <ui-input
                label="Sector"
                [(ngModel)]="formData.sector"
                icon="briefcase"
                placeholder="Ej: Tecnología"
              ></ui-input>
              <ui-input
                label="Tipo"
                [(ngModel)]="formData.type"
                icon="building-2"
                placeholder="Empresa, Particular..."
              ></ui-input>
            </div>
          </div>

          <div class="form-section">
            <h4 class="section-title">Información de Contacto</h4>
            <div class="form-grid">
              <ui-input
                label="Persona contacto"
                [(ngModel)]="formData.contact"
                icon="user-check"
              ></ui-input>
              <ui-input
                label="Email"
                [(ngModel)]="formData.email"
                icon="mail"
                type="email"
              ></ui-input>
              <ui-input
                label="Teléfono"
                [(ngModel)]="formData.phone"
                icon="phone"
              ></ui-input>
            </div>
          </div>

          <div class="form-section">
            <h4 class="section-title">Información Adicional</h4>
            <div class="form-grid">
              <ui-input
                label="Descripción"
                [(ngModel)]="formData.description"
                icon="file-text"
                placeholder="Descripción del cliente"
              ></ui-input>
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
            (clicked)="saveClient()"
            [loading]="isSaving()"
            icon="save"
          >
            {{ editingClient() ? 'Guardar cambios' : 'Crear cliente' }}
          </ui-button>
        </div>
      </ui-modal>
    </div>
  `,
  styles: [
    `
      .clients-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
        min-height: 100vh;
      }

      .flex-1 {
        flex: 1;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        padding: 4rem;
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

      .filters-bar {
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

      .flex-1 {
        flex: 1;
      }
      .search-bar {
        width: 350px;
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
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.5rem;
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

      /* Form Enhancements */
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

      /* Active state for filters button */
      .actions-group .active {
        background: var(--primary-light);
        color: var(--primary);
      }

      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
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

  currentTheme = this.themeService.currentThemeData;
  columns = this.config.defaultColumns;

  clients = this.facade.clients;
  isLoading = this.facade.isLoading;
  currentPage = signal(1);

  tabs = [{ id: 'all', label: 'Todos', badge: 0 }];
  activeTab = signal('all');

  isModalOpen = signal(false);
  editingClient = signal<Client | null>(null);
  isSaving = signal(false);
  formErrors = signal<string[]>([]);

  formData: ClientFormData = {
    name: '',
    description: '',
    taxId: '',
    sector: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'España',
    type: 'company',
    notes: '',
  };
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
    if (this.revenueMinFilter() !== null) {
      list = list.filter(
        (c) => this.getClientRevenue(c) >= this.revenueMinFilter()!,
      );
    }
    if (this.revenueMaxFilter() !== null) {
      list = list.filter(
        (c) => this.getClientRevenue(c) <= this.revenueMaxFilter()!,
      );
    }

    // 3. Sort
    const field = this.sortField();
    const dir = this.sortDirection();

    return list.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

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
    this.aiFormBridge.registerDataProxy(
      this.formData as Record<string, unknown>,
    );
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
    this.aiFormBridge.unregisterDataProxy(
      this.formData as Record<string, unknown>,
    );
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

  openCreateModal() {
    this.editingClient.set(null);
    this.formData = {
      name: '',
      description: '',
      taxId: '',
      sector: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: '',
      country: 'España',
      type: 'company',
      notes: '',
    };
    this.formErrors.set([]);
    this.isModalOpen.set(true);
  }

  editClient(client: Client) {
    this.editingClient.set(client);
    this.formData = { ...client };
    this.formErrors.set([]);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingClient.set(null);
    this.formErrors.set([]);
  }

  saveClient() {
    // Validation
    const errors: string[] = [];
    if (!this.formData.name?.trim()) {
      errors.push('El nombre del cliente es obligatorio');
    }
    if (this.formData.email && !this.isValidEmail(this.formData.email)) {
      errors.push('El email no tiene un formato válido');
    }
    if (this.formData.phone && !this.isValidPhone(this.formData.phone)) {
      errors.push('El teléfono no tiene un formato válido');
    }

    if (errors.length > 0) {
      this.formErrors.set(errors);
      return;
    }

    this.formErrors.set([]);
    this.isSaving.set(true);

    // Simulate async operation
    setTimeout(() => {
      this.isSaving.set(false);
      this.closeModal();
      this.toast.show(
        this.editingClient()
          ? 'Cliente actualizado correctamente'
          : 'Cliente creado correctamente',
        'success',
      );
    }, 1000);

    const clientToEdit = this.editingClient();
    if (clientToEdit) {
      this.facade.updateClient(clientToEdit.id, this.formData);
      this.isSaving.set(false);
      this.toast.show(
        `Cliente ${this.formData.name} actualizado correctamente`,
        'success',
      );
      this.closeModal();
    } else {
      this.facade.createClient(
        this.formData as Omit<Client, 'id' | 'createdAt'>,
      );
      this.isSaving.set(false);
      this.toast.show(
        `Cliente ${this.formData.name} creado correctamente`,
        'success',
      );
      this.closeModal();
    }
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

  onClientClick(client: Client) {
    // Navegar al detalle del cliente
    // Por ahora solo abrimos el modal de edición
    this.editClient(client);
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

  openClientMenu(client: Client, event: Event) {
    // Open context menu for client actions
    event.stopPropagation();
    // For now, just show edit option
    this.editClient(client);
  }

  // Advanced filtering methods
  toggleAdvancedFilters() {
    this.showAdvancedFilters.set(!this.showAdvancedFilters());
  }

  refreshClients() {
    this.facade.loadClients();
    this.toast.show('Clientes actualizados', 'info');
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

  private getOrCreateStats(clientId: string) {
    if (!this.memoizedStats.has(clientId)) {
      this.memoizedStats.set(clientId, {
        projects: Math.floor(Math.random() * 5) + 1,
        revenue: Math.floor(Math.random() * 100000) + 50000,
        rating: Math.floor(Math.random() * 3) + 3,
      });
    }
    return this.memoizedStats.get(clientId)!;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[0-9\s\-()]{9,}$/;
    return phoneRegex.test(phone);
  }
}
