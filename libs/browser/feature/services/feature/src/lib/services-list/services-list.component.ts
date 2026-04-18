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
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiFeatureFilterBarComponent,
  UiStatCardComponent,
  UiLoaderComponent,
  UiModalComponent,
  UiInputComponent,
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

// Extended form type for additional fields
interface ServiceFormData extends Partial<Service> {
  description?: string;
  validUntil?: string;
  notes?: string;
}

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
    UiModalComponent,
    UiInputComponent,
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
        (actionClicked)="openCreateModal()"
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
            <lucide-icon name="check-square" size="16"></lucide-icon>
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
              <lucide-icon name="trash2" size="14"></lucide-icon>
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
              (editClicked)="editService(service)"
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
                ></lucide-icon>
                <h3>No hay servicios</h3>
                <p>
                  Comienza añadiendo tu primer servicio para gestionar tu catálogo
                  comercial.
                </p>
                <ui-button
                  variant="solid"
                  (clicked)="openCreateModal()"
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

      <!-- Create/Edit Modal -->
      <ui-modal
        [isOpen]="isModalOpen()"
        [title]="editingService() ? 'EDITAR SERVICIO' : 'NUEVO SERVICIO'"
        (closed)="closeModal()"
        variant="glass"
      >
        <div class="modal-form">
          <!-- Form Errors -->
          @if (formErrors().length > 0) {
            <div class="form-errors">
              @for (error of formErrors(); track $index) {
                <div class="error-message">
                  <lucide-icon name="alert-circle" size="16"></lucide-icon>
                  <span>{{ error }}</span>
                </div>
              }
            </div>
          }

          <div class="form-section">
            <h4 class="section-title">Información General</h4>
            <div class="form-grid">
              <ui-input
                label="Nombre del servicio *"
                [(ngModel)]="formData.name"
                icon="wrench"
                placeholder="Nombre del servicio"
                required
              ></ui-input>
              <ui-input
                label="Tipo"
                [(ngModel)]="formData.type"
                icon="tag"
                placeholder="Ej: Servicio, Mantenimiento..."
              ></ui-input>
              <ui-input
                label="Precio base (€)"
                [(ngModel)]="formData.basePrice"
                icon="euro"
                type="number"
                placeholder="0.00"
              ></ui-input>
              <ui-input
                label="Tarifa hora (€)"
                [(ngModel)]="formData.hourlyRate"
                icon="clock"
                type="number"
                placeholder="0.00"
              ></ui-input>
              <ui-input
                label="Descripción"
                [(ngModel)]="formData.description"
                icon="file-text"
                placeholder="Descripción del servicio"
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
            (clicked)="saveService()"
            [loading]="isSaving()"
            icon="save"
          >
            {{ editingService() ? 'Guardar cambios' : 'Crear servicio' }}
          </ui-button>
        </div>
      </ui-modal>
      }
    </ui-feature-page-shell>
  `,
  styles: [
    `
      :host ::ng-deep .feature-filter-bar ui-button.active {
        background: var(--primary-light);
        color: var(--primary);
      }

      /* Modal Form Styles */
      .modal-form {
        padding: 1rem 0;
      }

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
        .form-grid {
          grid-template-columns: 1fr;
        }
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

  // Signals for UI state
  isModalOpen = signal(false);
  editingService = signal<Service | null>(null);
  isSaving = signal(false);
  formErrors = signal<string[]>([]);
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

  formData: ServiceFormData = {
    name: '',
    description: '',
    type: 'STREAMING',
    basePrice: 0,
    hourlyRate: 0,
    isActive: true,
    validUntil: '',
    notes: '',
  };

  private readonly router = inject(Router);
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
      const fromDate = new Date(dateFrom);
      list = list.filter((s) => {
        // Assuming services have createdAt or similar, using a placeholder
        return true; // TODO: Add date filtering when date fields are available
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      list = list.filter((s) => {
        return true; // TODO: Add date filtering when date fields are available
      });
    }

    if (amountMin !== null) {
      list = list.filter((s) => (s.basePrice || 0) >= amountMin!);
    }

    if (amountMax !== null) {
      list = list.filter((s) => (s.basePrice || 0) <= amountMax!);
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
    this.aiFormBridge.registerDataProxy(
      this.formData as Record<string, unknown>,
    );
    this.masterFilter.registerProvider(this);
    this.store.load();
  }

  ngOnDestroy() {
    this.aiFormBridge.unregisterDataProxy(
      this.formData as Record<string, unknown>,
    );
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
    this.router.navigate(['/services', service.id, 'edit']);
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

  openCreateModal() {
    this.editingService.set(null);
    this.formData = {
      name: '',
      description: '',
      type: 'STREAMING',
      basePrice: 0,
      hourlyRate: 0,
      isActive: true,
      validUntil: '',
      notes: '',
    };
    this.formErrors.set([]);
    this.isModalOpen.set(true);
  }

  editService(service: Service) {
    this.editingService.set(service);
    this.formData = {
      ...service,
      validUntil: '',
      notes: '',
    };
    this.formErrors.set([]);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingService.set(null);
    this.formErrors.set([]);
  }

  saveService() {
    const errors: string[] = [];

    if (!this.formData.name?.trim()) {
      errors.push('El nombre del servicio es obligatorio');
    }

    if (this.formData.basePrice && this.formData.basePrice < 0) {
      errors.push('El precio base no puede ser negativo');
    }

    if (this.formData.hourlyRate && this.formData.hourlyRate < 0) {
      errors.push('La tarifa por hora no puede ser negativa');
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
      this.isSaving.set(false);
      this.toast.show(
        this.editingService()
          ? 'Servicio actualizado correctamente'
          : 'Servicio creado correctamente',
        'success',
      );
      this.closeModal();
    }, 1000);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onRowClick(service: Service) {
    // Navigate to service detail or edit
    this.editService(service);
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

  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
