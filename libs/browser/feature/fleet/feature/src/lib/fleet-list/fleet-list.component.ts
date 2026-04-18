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
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiFeatureFilterBarComponent,
  UiLoaderComponent,
  UiModalComponent,
  UiTabsComponent,
  UiInputComponent,
  UiStatCardComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
  UiFeatureAccessDeniedComponent,
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
import { Vehicle, VehicleService } from '@josanz-erp/fleet-data-access';

// Extended form type for additional fields
interface VehicleFormData extends Partial<Vehicle> {
  description?: string;
  notes?: string;
}

@Component({
  selector: 'lib-fleet-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiButtonComponent,
    UiFeatureFilterBarComponent,
    UiLoaderComponent,
    UiModalComponent,
    UiTabsComponent,
    UiInputComponent,
    UiStatCardComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    LucideAngularModule,
    UiFeatureAccessDeniedComponent,
  ],
  template: `
    @if (!canAccess()) {
      <ui-feature-access-denied
        message="No tienes permiso para ver la flota."
        permissionHint="fleet.view"
      />
    } @else {
    <div class="fleet-container">
      <ui-feature-header
        title="Flota Logística"
        subtitle="Monitoreo de movilidad y mantenimiento preventivo"
        icon="truck"
        actionLabel="NUEVA UNIDAD"
        (actionClicked)="openCreateModal()"
      ></ui-feature-header>

      <ui-feature-stats>
        <ui-stat-card
          label="Unidades Activas"
          [value]="vehicles().length.toString()"
          icon="truck"
          [accent]="true"
        >
        </ui-stat-card>
        <ui-stat-card
          label="En Mantenimiento"
          [value]="maintenanceCount().toString()"
          icon="wrench"
          [trend]="-2"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Alertas Técnicas"
          [value]="alertCount().toString()"
          icon="alert-triangle"
          [class.text-danger]="alertCount() > 0"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Sincronización GPS"
          value="Online"
          icon="navigation"
          [accent]="false"
        ></ui-stat-card>
      </ui-feature-stats>

      <ui-feature-filter-bar
        [appearance]="'feature'"
        [searchVariant]="'glass'"
        placeholder="Buscar matrícula o conductor…"
        (searchChange)="onSearch($event)"
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
          (clicked)="refreshVehicles()"
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
            sortField() === 'plate'
              ? 'matrícula'
              : sortField() === 'year'
                ? 'año'
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
                [(ngModel)]="statusFilter"
                (ngModelChange)="statusFilter.set($event); currentPage.set(1)"
              >
                <option value="all">Todos los estados</option>
                <option value="available">Disponible</option>
                <option value="in_use">En uso</option>
                <option value="maintenance">Mantenimiento</option>
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
                <option value="van">Furgoneta</option>
                <option value="truck">Camión</option>
                <option value="car">Coche</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label" for="year-min-filter"
                >Año mínimo</label
              >
              <input
                id="year-min-filter"
                type="number"
                class="filter-input"
                placeholder="2000"
                min="1900"
                max="2030"
                [(ngModel)]="yearMinFilter"
                (ngModelChange)="
                  yearMinFilter.set($event ? +$event : null); currentPage.set(1)
                "
              />
            </div>
            <div class="filter-group">
              <label class="filter-label" for="year-max-filter"
                >Año máximo</label
              >
              <input
                id="year-max-filter"
                type="number"
                class="filter-input"
                placeholder="2025"
                min="1900"
                max="2030"
                [(ngModel)]="yearMaxFilter"
                (ngModelChange)="
                  yearMaxFilter.set($event ? +$event : null); currentPage.set(1)
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
              >{{ selectedCount() }} vehículo{{
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

      @if (loadError() && vehicles().length > 0) {
        <div
          class="feature-load-error-banner"
          role="status"
          aria-live="polite"
        >
          <lucide-icon
            name="alert-circle"
            size="20"
            class="feature-load-error-banner__icon"
          ></lucide-icon>
          <span class="feature-load-error-banner__text">{{ loadError() }}</span>
          <ui-button
            variant="ghost"
            size="sm"
            icon="rotate-cw"
            (clicked)="refreshVehicles()"
          >
            Reintentar
          </ui-button>
        </div>
      }

      @if (isLoading() && vehicles().length === 0) {
        <div class="feature-loader-wrap">
          <ui-loader message="Sincronizando flota…"></ui-loader>
        </div>
      } @else if (loadError() && vehicles().length === 0) {
        <div class="feature-error-screen" role="alert">
          <lucide-icon
            name="wifi-off"
            size="48"
            class="feature-error-screen__icon"
          ></lucide-icon>
          <h3>No se pudo cargar la flota</h3>
          <p>{{ loadError() }}</p>
          <ui-button variant="solid" icon="rotate-cw" (clicked)="refreshVehicles()">
            Reintentar
          </ui-button>
        </div>
      } @else {
        <ui-feature-grid>
          <!-- Selection Header -->
          @if (paginatedVehicles().length > 0) {
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

          @for (vehicle of paginatedVehicles(); track vehicle.id) {
            <ui-feature-card
              [name]="vehicle.plate | uppercase"
              [subtitle]="vehicle.brand + ' ' + vehicle.model | uppercase"
              [avatarInitials]="getInitials(vehicle.plate)"
              [avatarBackground]="getVehicleGradient(vehicle.type)"
              [status]="vehicle.status === 'available' ? 'active' : 'offline'"
              [badgeLabel]="getStatusLabel(vehicle.status) | uppercase"
              [badgeVariant]="getStatusVariant(vehicle.status)"
              [showEdit]="true"
              [showDuplicate]="true"
              [showDelete]="true"
              (cardClicked)="onRowClick(vehicle)"
              (editClicked)="editVehicle(vehicle)"
              (duplicateClicked)="onDuplicate(vehicle)"
              (deleteClicked)="confirmDelete(vehicle)"
              [footerItems]="[
                { icon: 'calendar', label: 'Año: ' + vehicle.year },
                {
                  icon: 'shield',
                  label: 'Seguro: ' + formatDate(vehicle.insuranceExpiry),
                },
                {
                  icon: 'check-square',
                  label: 'ITV: ' + formatDate(vehicle.itvExpiry),
                },
              ]"
            >
              <div card-extra class="card-selection">
                <input
                  type="checkbox"
                  [checked]="selectedVehicles().has(vehicle.id)"
                  (change)="toggleVehicleSelection(vehicle.id)"
                  (click)="$event.stopPropagation()"
                  class="selection-checkbox"
                />
              </div>
              <div footer-extra class="vehicle-status">
                @if (vehicle.status === 'maintenance') {
                  <span class="maintenance-badge">
                    <lucide-icon name="wrench" size="12"></lucide-icon>
                    EN MANTENIMIENTO
                  </span>
                } @else if (vehicle.status === 'in_use') {
                  <span class="in-use-badge">
                    <lucide-icon name="truck" size="12"></lucide-icon>
                    EN USO
                  </span>
                } @else {
                  <span class="available-badge">
                    <lucide-icon name="check-circle" size="12"></lucide-icon>
                    DISPONIBLE
                  </span>
                }
              </div>
            </ui-feature-card>
          } @empty {
            @if (filterProducesNoResults()) {
              <div class="feature-empty feature-empty--wide">
                <lucide-icon
                  name="search-x"
                  size="56"
                  class="feature-empty__icon"
                ></lucide-icon>
                <h3>Sin resultados</h3>
                <p>
                  Ningún vehículo coincide con la búsqueda, la pestaña o los
                  filtros actuales.
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
                  name="truck"
                  size="56"
                  class="feature-empty__icon"
                ></lucide-icon>
                <h3>No hay unidades</h3>
                <p>Comienza registrando tu primer vehículo en la flota.</p>
                <ui-button
                  variant="solid"
                  (clicked)="openCreateModal()"
                  icon="CirclePlus"
                  >Registrar unidad</ui-button
                >
              </div>
            }
          }
        </ui-feature-grid>
      }
    </div>

    <!-- Modal solo para alta; la edición completa está en /fleet/:id/edit -->
    <ui-modal
      [isOpen]="isModalOpen()"
      title="REGISTRO DE NUEVA UNIDAD"
      (closed)="closeModal()"
      variant="glass"
    >
      <div class="form-grid">
        <ui-input
          label="Matrícula"
          [(ngModel)]="formData.plate"
          icon="hash"
        ></ui-input>
        <div class="row">
          <ui-input
            label="Marca"
            [(ngModel)]="formData.brand"
            icon="car"
          ></ui-input>
          <ui-input
            label="Modelo"
            [(ngModel)]="formData.model"
            icon="box"
          ></ui-input>
        </div>
        <div class="row">
          <ui-input
            label="Año"
            type="number"
            [(ngModel)]="formData.year"
            icon="calendar"
          ></ui-input>
          <ui-input
            label="Tipo"
            [(ngModel)]="formData.type"
            icon="truck"
          ></ui-input>
        </div>
        <div class="row">
          <ui-input
            label="Seguro hasta"
            type="date"
            [(ngModel)]="formData.insuranceExpiry"
            icon="shield"
          ></ui-input>
          <ui-input
            label="ITV hasta"
            type="date"
            [(ngModel)]="formData.itvExpiry"
            icon="check-square"
          ></ui-input>
        </div>

        <div class="form-section">
          <h4 class="section-title">Información Adicional</h4>
          <div class="form-grid">
            <ui-input
              label="Descripción"
              [(ngModel)]="formData.description"
              icon="file-text"
              placeholder="Descripción del vehículo"
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
        <ui-button variant="ghost" (clicked)="closeModal()">CANCELAR</ui-button>
        <ui-button
          variant="solid"
          (clicked)="saveVehicle()"
          [disabled]="!formData.plate"
          icon="save"
          >GUARDAR</ui-button
        >
      </div>
    </ui-modal>
    }
  `,
  styles: [
    `
      .fleet-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
      }

      .flex-1 {
        flex: 1;
      }

      .vehicle-alerts {
        margin-top: 1rem;
      }
      .alert-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.65rem;
        font-weight: 800;
        padding: 0.2rem 0.6rem;
        border-radius: 4px;
        letter-spacing: 0.05em;
      }
      .alert-badge.overdue {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }

      .pagination-footer {
        margin-top: 3rem;
        display: flex;
        justify-content: center;
      }

      /* Modal Form Styles */
      .form-grid {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        padding: 1rem 0;
      }
      .row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 2rem;
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

      :host ::ng-deep .feature-filter-bar ui-button.active {
        background: var(--primary-light);
        color: var(--primary);
      }

      @media (max-width: 900px) {
        .row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FleetListComponent
  implements OnInit, OnDestroy, FilterableService<Vehicle>
{
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly vehicleService = inject(VehicleService);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly authStore = inject(GlobalAuthStore);
  readonly canAccess = rbacAllows(this.authStore, 'fleet.view', 'fleet.manage');

  currentTheme = this.themeService.currentThemeData;

  tabs = computed(() => [
    { id: 'all', label: 'Todos', badge: this.vehicles().length },
    {
      id: 'available',
      label: 'Disponibles',
      badge: this.vehicles().filter((v) => v.status === 'available').length,
    },
    {
      id: 'in_use',
      label: 'En Uso',
      badge: this.vehicles().filter((v) => v.status === 'in_use').length,
    },
    {
      id: 'maintenance',
      label: 'Mantenimiento',
      badge: this.vehicles().filter((v) => v.status === 'maintenance').length,
    },
  ]);

  columns = [
    { key: 'plate', header: 'MATRÍCULA' },
    { key: 'brand', header: 'MARCA' },
    { key: 'model', header: 'MODELO' },
    { key: 'year', header: 'AÑO', width: '80px' },
    { key: 'type', header: 'TIPO', width: '100px' },
    { key: 'status', header: 'ESTADO', width: '120px' },
    { key: 'insuranceExpiry', header: 'SEGURO' },
    { key: 'itvExpiry', header: 'ITV' },
    { key: 'actions', header: '', width: '100px' },
  ];

  vehicles = signal<Vehicle[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);
  currentPage = signal(1);
  activeTab = signal('all');
  searchFilter = signal('');

  // Advanced filtering
  showAdvancedFilters = signal(false);
  statusFilter = signal<string>('all');
  typeFilter = signal<string>('all');
  yearMinFilter = signal<number | null>(null);
  yearMaxFilter = signal<number | null>(null);

  sortField = signal<'plate' | 'year' | 'status'>('plate');
  sortDirection = signal<1 | -1>(1);

  // Bulk actions
  selectedVehicles = signal<Set<string>>(new Set());

  isModalOpen = signal(false);

  formData: VehicleFormData = {
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'van',
    status: 'available',
    insuranceExpiry: '',
    itvExpiry: '',
  };

  ngOnInit() {
    this.masterFilter.registerProvider(this);
    this.loadVehicles();
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
  }

  /** Lógica de filtrado para el MasterFilterService */
  filter(query: string): Observable<Vehicle[]> {
    const term = query.toLowerCase().trim();
    if (!term) return of(this.vehicles());

    const matches = this.vehicles().filter((v: Vehicle) => {
      const searchableText = [
        v.plate,
        v.brand ?? '',
        v.model ?? '',
        v.type,
        v.status,
        v.year?.toString() || '',
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
      camion: ['camion', 'truck', 'camión'],
      furgon: ['furgon', 'van', 'furgón'],
      coche: ['coche', 'car', 'vehiculo', 'vehículo'],
      mantenimiento: ['mantenimiento', 'repair', 'service'],
      disponible: ['disponible', 'available', 'libre'],
      uso: ['uso', 'in_use', 'ocupado'],
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

  loadVehicles(_force = false) {
    this.loadError.set(null);
    this.isLoading.set(true);
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles: Vehicle[]) => {
        this.vehicles.set(vehicles);
        this.isLoading.set(false);
        this.loadError.set(null);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set(
          'No se pudieron cargar los vehículos. Comprueba la conexión e inténtalo de nuevo.',
        );
      },
    });
  }

  clearFiltersAndSearch(): void {
    this.searchFilter.set('');
    this.masterFilter.search('');
    this.activeTab.set('all');
    this.statusFilter.set('all');
    this.typeFilter.set('all');
    this.yearMinFilter.set(null);
    this.yearMaxFilter.set(null);
    this.currentPage.set(1);
  }

  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
  }

  // Advanced filtering methods
  toggleAdvancedFilters() {
    this.showAdvancedFilters.set(!this.showAdvancedFilters());
  }

  refreshVehicles() {
    this.loadVehicles(true);
    this.toast.show('Vehículos actualizados', 'info');
  }

  toggleSort() {
    if (this.sortField() === 'plate') {
      this.sortField.set('year');
      this.sortDirection.set(-1);
    } else if (this.sortField() === 'year') {
      this.sortField.set('status');
      this.sortDirection.set(1);
    } else {
      this.sortField.set('plate');
      this.sortDirection.set(1);
    }
  }

  // Bulk actions methods
  toggleSelectAll() {
    const paginated = this.paginatedVehicles();
    const currentSelected = this.selectedVehicles();

    if (this.isAllSelected()) {
      const newSelected = new Set(currentSelected);
      paginated.forEach((v) => newSelected.delete(v.id));
      this.selectedVehicles.set(newSelected);
    } else {
      const newSelected = new Set(currentSelected);
      paginated.forEach((v) => newSelected.add(v.id));
      this.selectedVehicles.set(newSelected);
    }
  }

  toggleVehicleSelection(vehicleId: string) {
    const currentSelected = this.selectedVehicles();
    const newSelected = new Set(currentSelected);

    if (newSelected.has(vehicleId)) {
      newSelected.delete(vehicleId);
    } else {
      newSelected.add(vehicleId);
    }

    this.selectedVehicles.set(newSelected);
  }

  bulkDelete() {
    const selectedIds = Array.from(this.selectedVehicles());

    if (confirm(`¿Estás seguro de eliminar ${selectedIds.length} vehículos?`)) {
      selectedIds.forEach((id) => this.vehicleService.deleteVehicle(id));
      this.selectedVehicles.set(new Set());
      this.toast.show(`${selectedIds.length} vehículos eliminados`, 'success');
    }
  }

  clearSelection() {
    this.selectedVehicles.set(new Set());
  }

  onSearch(term: string) {
    this.searchFilter.set(term);
    this.masterFilter.search(term);
  }
  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  openCreateModal() {
    this.formData = {
      plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      type: 'van',
      status: 'available',
      insuranceExpiry: '',
      itvExpiry: '',
      mileage: 0,
      capacity: 0,
    };
    this.isModalOpen.set(true);
  }

  onRowClick(vehicle: Vehicle) {
    this.router.navigate(['/fleet', vehicle.id]);
  }

  getInitials(plate: string): string {
    return (plate || 'V').slice(0, 2).toUpperCase();
  }

  getVehicleGradient(type: string): string {
    switch (type) {
      case 'van':
        return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'truck':
        return 'linear-gradient(135deg, #10b981, #059669)';
      default:
        return 'linear-gradient(135deg, #6b7280, #374151)';
    }
  }

  editVehicle(vehicle: Vehicle) {
    this.router.navigate(['/fleet', vehicle.id, 'edit']);
  }

  onDuplicate(vehicle: Vehicle) {
    const { id: _omitId, ...rest } = vehicle;
    void _omitId;
    this.vehicleService
      .createVehicle({
        ...rest,
        plate: `${vehicle.plate}-C`,
      } as Omit<Vehicle, 'id'>)
      .subscribe({
        next: () => {
          this.vehicles.update((list) =>
            list.filter((v: Vehicle) => v.id !== vehicle.id),
          );
          this.toast.show(`Unidad ${vehicle.plate} eliminada`, 'success');
        },
        error: () => this.toast.show('No se pudo duplicar la unidad.', 'error'),
      });
  }

  confirmDelete(vehicle: Vehicle) {
    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar el vehículo ${vehicle.plate}?`,
      )
    ) {
      return;
    }
    this.vehicleService.deleteVehicle(vehicle.id).subscribe({
      next: () => {
        this.vehicles.update((list) => list.filter((v) => v.id !== vehicle.id));
        this.toast.show(`Unidad ${vehicle.plate} eliminada`, 'success');
      },
      error: () => {
        this.toast.show(
          'No se pudo eliminar la unidad. Inténtalo de nuevo.',
          'error',
        );
      },
    });
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveVehicle() {
    if (!this.formData.plate?.trim()) {
      this.toast.show('Indica una matrícula válida', 'error');
      return;
    }
    this.vehicleService
      .createVehicle(this.formData as Omit<Vehicle, 'id'>)
      .subscribe({
        next: (newV: Vehicle) => {
          this.vehicles.update((list) => [...list, newV]);
          this.toast.show(`Unidad ${newV.plate} registrada`, 'success');
          this.closeModal();
        },
        error: () =>
          this.toast.show('No se pudo registrar la unidad.', 'error'),
      });
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'van':
        return 'Furgón';
      case 'truck':
        return 'Camión';
      default:
        return 'Coche';
    }
  }

  getVehicleIcon(type: string): string {
    switch (type) {
      case 'van':
        return 'truck';
      case 'truck':
        return 'clapperboard'; // Custom icons
      default:
        return 'car';
    }
  }

  getStatusVariant(
    status: string,
  ): 'success' | 'warning' | 'info' | 'secondary' | 'primary' | 'danger' {
    switch (status) {
      case 'available':
        return 'success';
      case 'in_use':
        return 'warning';
      case 'maintenance':
        return 'info';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'in_use':
        return 'En Uso';
      case 'maintenance':
        return 'Mantenimiento';
      default:
        return status;
    }
  }

  isExpired(date: string | undefined): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }

  maintenanceCount = computed(
    () =>
      this.vehicles().filter((v: Vehicle) => v.status === 'maintenance').length,
  );
  alertCount = computed(
    () =>
      this.vehicles().filter(
        (v: Vehicle) =>
          this.isExpired(v.insuranceExpiry) || this.isExpired(v.itvExpiry),
      ).length,
  );

  displayedVehicles = computed(() => {
    let list = this.vehicles();
    const tab = this.activeTab();
    if (tab !== 'all') list = list.filter((v: Vehicle) => v.status === tab);
    const t = this.searchFilter().trim().toLowerCase();
    if (t)
      list = list.filter(
        (v: Vehicle) =>
          v.plate.toLowerCase().includes(t) ||
          (v.brand || '').toLowerCase().includes(t),
      );

    // Advanced filters
    if (this.statusFilter() !== 'all') {
      list = list.filter((v) => v.status === this.statusFilter());
    }
    if (this.typeFilter() !== 'all') {
      list = list.filter((v) => v.type === this.typeFilter());
    }
    if (this.yearMinFilter() !== null) {
      list = list.filter((v) => (v.year || 0) >= this.yearMinFilter()!);
    }
    if (this.yearMaxFilter() !== null) {
      list = list.filter((v) => (v.year || 0) <= this.yearMaxFilter()!);
    }

    const field = this.sortField();
    const dir = this.sortDirection();
    list.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';
      if (field === 'plate') {
        valA = (a.plate || '').toLowerCase();
        valB = (b.plate || '').toLowerCase();
      } else if (field === 'year') {
        valA = a.year ?? 0;
        valB = b.year ?? 0;
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

  paginatedVehicles = computed(() => {
    const displayed = this.displayedVehicles();
    const pageSize = 12;
    const start = (this.currentPage() - 1) * pageSize;
    const end = start + pageSize;
    return displayed.slice(start, end);
  });

  totalPages = computed(() => {
    const displayed = this.displayedVehicles();
    const pageSize = 12;
    return Math.ceil(displayed.length / pageSize);
  });

  // Bulk actions computed
  selectedCount = computed(() => this.selectedVehicles().size);
  hasSelections = computed(() => this.selectedVehicles().size > 0);
  isAllSelected = computed(() => {
    const paginated = this.paginatedVehicles();
    return (
      paginated.length > 0 &&
      paginated.every((v) => this.selectedVehicles().has(v.id))
    );
  });

  readonly hasAnyVehicles = computed(() => this.vehicles().length > 0);
  readonly filterProducesNoResults = computed(
    () => this.hasAnyVehicles() && this.displayedVehicles().length === 0,
  );
}
