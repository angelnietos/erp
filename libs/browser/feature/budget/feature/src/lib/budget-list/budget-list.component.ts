import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  computed,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  UiButtonComponent,
  UiFeatureFilterBarComponent,
  UiStatCardComponent,
  UiModalComponent,
  UiInputComponent,
  UiPaginationComponent,
  UiLoaderComponent,
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
import { LucideAngularModule } from 'lucide-angular';
import { BudgetStore } from '@josanz-erp/budget-data-access';
import { Budget } from '@josanz-erp/budget-api';

// Extended form type for additional fields
interface BudgetFormData extends Partial<Budget> {
  description?: string;
  validUntil?: string;
  notes?: string;
}
import { BUDGET_FEATURE_CONFIG } from '../budget-feature.config';

@Component({
  selector: 'lib-budget-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiButtonComponent,
    UiStatCardComponent,
    UiFeatureFilterBarComponent,
    UiModalComponent,
    UiInputComponent,
    UiPaginationComponent,
    UiLoaderComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    LucideAngularModule,
    UiFeatureAccessDeniedComponent,
  ],
  template: `
    <div class="budgets-container">
      @if (!canAccess()) {
        <ui-feature-access-denied
          message="No tienes permiso para ver presupuestos."
          permissionHint="budgets.view"
        />
      } @else {
      <ui-feature-header
        title="Presupuestos"
        subtitle="Gestión comercial y pipeline de ventas"
        icon="file-text"
        actionLabel="Nuevo Presupuesto"
        (actionClicked)="openCreateModal()"
      ></ui-feature-header>

      <ui-feature-stats>
        <ui-stat-card
          label="Pipeline Total"
          [value]="formatCurrencyEu(totalPipeline())"
          icon="bar-chart"
          [accent]="true"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Cerrados (Mes)"
          [value]="formatCurrencyEu(totalAccepted())"
          icon="check-circle"
          [trend]="8"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Cotizaciones en Curso"
          [value]="pendingCount().toString()"
          icon="clock"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Tasa de Cierre"
          value="64%"
          icon="trending-up"
          [accent]="false"
        ></ui-stat-card>
      </ui-feature-stats>

      <ui-feature-filter-bar
        [appearance]="'feature'"
        [searchVariant]="'glass'"
        placeholder="Buscar por nombre, cliente, estado o descripción..."
        (searchChange)="onSearch($event)"
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
          (clicked)="refreshBudgets()"
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
              : sortField() === 'total'
                ? 'total'
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
                <option value="DRAFT">Borrador</option>
                <option value="SENT">Enviado</option>
                <option value="ACCEPTED">Aceptado</option>
                <option value="REJECTED">Rechazado</option>
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
            <div class="filter-group">
              <label class="filter-label" for="amount-min-filter"
                >Importe mínimo (€)</label
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
                >Importe máximo (€)</label
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
            <div class="filter-group">
              <label class="filter-label" for="amount-max-filter"
                >Importe máximo (€)</label
              >
              <input
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
              >{{ selectedCount() }} presupuesto{{
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
              <option value="DRAFT">Marcar como borrador</option>
              <option value="SENT">Marcar como enviado</option>
              <option value="ACCEPTED">Marcar como aceptado</option>
              <option value="REJECTED">Marcar como rechazado</option>
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

      @if (store.error() && store.budgets().length > 0) {
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
          <span class="feature-load-error-banner__text">{{ store.error() }}</span>
          <ui-button
            variant="ghost"
            size="sm"
            icon="rotate-cw"
            (clicked)="refreshBudgets()"
          >
            Reintentar
          </ui-button>
        </div>
      }

      @if (store.loading() && store.budgets().length === 0) {
        <div class="feature-loader-wrap">
          <ui-loader message="Cargando presupuestos…"></ui-loader>
        </div>
      } @else if (store.error() && store.budgets().length === 0) {
        <div class="feature-error-screen" role="alert">
          <lucide-icon
            name="wifi-off"
            size="48"
            class="feature-error-screen__icon"
          ></lucide-icon>
          <h3>No se pudo cargar el listado</h3>
          <p>{{ store.error() }}</p>
          <ui-button variant="solid" icon="rotate-cw" (clicked)="refreshBudgets()">
            Reintentar
          </ui-button>
        </div>
      } @else {
      <ui-feature-grid>
        <!-- Selection Header -->
        @if (paginatedBudgets().length > 0) {
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

        @for (item of paginatedBudgets(); track item.id) {
          <ui-feature-card
            [name]="'# ' + (item.id.slice(0, 8) | uppercase)"
            [subtitle]="item.clientId || 'Sin cliente' | uppercase"
            [avatarInitials]="getInitials(item.id)"
            [avatarBackground]="getStatusGradient(item.status)"
            [status]="item.status === 'ACCEPTED' ? 'active' : 'offline'"
            [badgeLabel]="item.status | uppercase"
            [badgeVariant]="getStatusVariant(item.status)"
            [showEdit]="item.status === 'DRAFT'"
            [showDuplicate]="true"
            [showDelete]="true"
            (cardClicked)="onRowClick(item)"
            (editClicked)="onEdit(item)"
            (duplicateClicked)="onDuplicate(item)"
            (deleteClicked)="onDelete(item)"
            [footerItems]="[
              {
                icon: 'calendar',
                label: (item.createdAt || '' | date: 'dd/MM/yyyy') || '-',
              },
              {
                icon: 'euro',
                label: (item.total || 0 | currency: 'EUR') || '-',
              },
            ]"
          >
            <div card-extra class="card-selection">
              <input
                type="checkbox"
                [checked]="selectedBudgets().has(item.id)"
                (change)="toggleBudgetSelection(item.id)"
                (click)="$event.stopPropagation()"
                class="selection-checkbox"
              />
            </div>
            <div footer-extra class="budget-extra-actions">
              <ui-button
                variant="ghost"
                size="sm"
                icon="eye"
                [routerLink]="['/budgets', item.id]"
                title="Ver detalles"
              ></ui-button>
              @if (config.enableDownload) {
                <ui-button
                  variant="ghost"
                  size="sm"
                  icon="download"
                  class="text-success"
                  title="Descargar PDF"
                ></ui-button>
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
                Ningún presupuesto coincide con la búsqueda o los filtros
                actuales.
              </p>
              <ui-button
                variant="ghost"
                icon="x-circle"
                (clicked)="clearFiltersAndSearch()"
              >
                Limpiar búsqueda y filtros
              </ui-button>
            </div>
          } @else {
            <div class="feature-empty feature-empty--wide">
              <lucide-icon
                name="file-text"
                size="56"
                class="feature-empty__icon"
              ></lucide-icon>
              <h3>No hay presupuestos</h3>
              <p>
                Comienza añadiendo tu primer presupuesto para gestionar tu
                pipeline comercial.
              </p>
              <ui-button
                variant="solid"
                (clicked)="openCreateModal()"
                icon="CirclePlus"
              >
                Añadir primer presupuesto
              </ui-button>
            </div>
          }
        }
      </ui-feature-grid>

      <!-- Pagination -->
      @if (filteredBudgets().length > 12) {
        <div class="pagination-footer">
          <ui-pagination
            [currentPage]="currentPage()"
            [totalPages]="totalPages()"
            (pageChange)="onPageChange($event)"
          ></ui-pagination>
        </div>
      }
      }

      <!-- Create/Edit Modal -->
      <ui-modal
        [isOpen]="isModalOpen()"
        [title]="editingBudget() ? 'Editar presupuesto' : 'Nuevo presupuesto'"
        (closed)="closeModal()"
        variant="glass"
      >
        <div class="modal-form">
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

          <div class="form-section">
            <h4 class="section-title">Información General</h4>
            <div class="form-grid">
              <ui-input
                label="Cliente"
                [(ngModel)]="formData.clientId"
                icon="user"
                placeholder="ID del cliente"
                required
              ></ui-input>
              <ui-input
                label="Total (€)"
                [(ngModel)]="formData.total"
                icon="euro"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
              ></ui-input>
              <ui-input
                label="Descripción"
                [(ngModel)]="formData.description"
                icon="file-text"
                placeholder="Descripción del presupuesto"
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
            (clicked)="saveBudget()"
            [loading]="isSaving()"
            icon="save"
          >
            {{ editingBudget() ? 'Guardar cambios' : 'Crear presupuesto' }}
          </ui-button>
        </div>
      </ui-modal>
      }
    </div>
  `,
  styles: [
    `
      .budgets-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
        min-height: 100vh;
      }

      :host ::ng-deep .feature-filter-bar ui-button.active {
        background: var(--primary-light);
        color: var(--primary);
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

      .card-actions {
        display: flex;
        gap: 0.25rem;
      }

      .text-success {
        color: var(--success) !important;
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

      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetListComponent
  implements OnInit, OnDestroy, FilterableService<Budget>
{
  public readonly store = inject(BudgetStore);
  public readonly config = inject(BUDGET_FEATURE_CONFIG);
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly aiFormBridge = inject(AIFormBridgeService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly authStore = inject(GlobalAuthStore);
  readonly canAccess = rbacAllows(
    this.authStore,
    'budgets.view',
    'budgets.create',
    'budgets.approve',
  );

  // Signals for UI state
  isModalOpen = signal(false);
  editingBudget = signal<Budget | null>(null);
  isSaving = signal(false);
  formErrors = signal<string[]>([]);
  currentPage = signal(1);
  totalPages = computed(() => {
    const pageSize = 12;
    return Math.ceil(this.filteredBudgets().length / pageSize);
  });
  sortField = signal<'name' | 'total' | 'status'>('name');
  sortDirection = signal<1 | -1>(1);

  // Filter signals
  statusFilter = signal<string>('all');
  dateFromFilter = signal<string>('');
  dateToFilter = signal<string>('');
  amountMinFilter = signal<number | null>(null);
  amountMaxFilter = signal<number | null>(null);
  showAdvancedFilters = signal(false);

  // Bulk actions signals
  selectedBudgets = signal<Set<string>>(new Set());
  showBulkActions = signal(false);

  formData: BudgetFormData = {
    clientId: '',
    startDate: '',
    endDate: '',
    total: 0,
    status: 'DRAFT',
    items: [],
    description: '',
    validUntil: '',
    notes: '',
  };

  currentTheme = this.themeService.currentThemeData;
  columns = this.config.defaultColumns;
  totalPipeline = computed(() =>
    this.store
      .budgets()
      .reduce((acc: number, b: Budget) => acc + (b.total || 0), 0),
  );
  totalAccepted = computed(() =>
    this.store
      .budgets()
      .filter((b: Budget) => b.status === 'ACCEPTED')
      .reduce((acc: number, b: Budget) => acc + (b.total || 0), 0),
  );
  pendingCount = computed(
    () =>
      this.store
        .budgets()
        .filter((b: Budget) => b.status === 'DRAFT' || b.status === 'SENT')
        .length,
  );

  filteredBudgets = computed(() => {
    let list = [...this.store.budgets()];
    const t = this.masterFilter.query().toLowerCase().trim();

    // 1. Search filter
    if (t) {
      list = list.filter(
        (b: Budget) =>
          b.id.toLowerCase().includes(t) ||
          (b.clientId || '').toLowerCase().includes(t) ||
          b.status.toLowerCase().includes(t),
      );
    }

    // 2. Advanced filters
    const statusFilter = this.statusFilter();
    const dateFrom = this.dateFromFilter();
    const dateTo = this.dateToFilter();
    const amountMin = this.amountMinFilter();
    const amountMax = this.amountMaxFilter();

    if (statusFilter !== 'all') {
      list = list.filter((b) => b.status === statusFilter);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      list = list.filter((b) => {
        const createdDate = new Date(b.createdAt || '');
        return createdDate >= fromDate;
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      list = list.filter((b) => {
        const createdDate = new Date(b.createdAt || '');
        return createdDate <= toDate;
      });
    }

    if (amountMin !== null) {
      list = list.filter((b) => (b.total || 0) >= amountMin!);
    }

    if (amountMax !== null) {
      list = list.filter((b) => (b.total || 0) <= amountMax!);
    }

    // 3. Sort
    const field = this.sortField();
    const dir = this.sortDirection();

    return list.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (field === 'name') {
        valA = a.id.toLowerCase();
        valB = b.id.toLowerCase();
      } else if (field === 'total') {
        valA = a.total || 0;
        valB = b.total || 0;
      } else if (field === 'status') {
        valA = a.status;
        valB = b.status;
      }

      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
  });

  paginatedBudgets = computed(() => {
    const all = this.filteredBudgets();
    const page = this.currentPage();
    const pageSize = 12;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return all.slice(start, end);
  });

  selectedCount = computed(() => this.selectedBudgets().size);

  isAllSelected = computed(() => {
    const paginated = this.paginatedBudgets();
    return (
      paginated.length > 0 &&
      paginated.every((b) => this.selectedBudgets().has(b.id))
    );
  });

  hasSelections = computed(() => this.selectedBudgets().size > 0);

  readonly hasAnyBudgets = computed(() => this.store.budgets().length > 0);
  readonly filterProducesNoResults = computed(
    () => this.hasAnyBudgets() && this.filteredBudgets().length === 0,
  );

  ngOnInit() {
    this.aiFormBridge.registerDataProxy(
      this.formData as Record<string, unknown>,
    );
    this.masterFilter.registerProvider(this);
    this.store.loadBudgets();
  }

  ngOnDestroy() {
    this.aiFormBridge.unregisterDataProxy(
      this.formData as Record<string, unknown>,
    );
    this.masterFilter.unregisterProvider();
  }

  onSearch(term: string) {
    this.masterFilter.search(term);
  }

  onRowClick(item: Budget) {
    this.router.navigate(['/budgets', item.id]);
  }

  onEdit(item: Budget) {
    this.router.navigate(['/budgets', item.id, 'edit']);
  }

  onDuplicate(item: Budget) {
    const { id, ...rest } = item;
    try {
      if ((this.store as any).createBudget) {
        (this.store as any).createBudget({
          ...rest,
          status: 'DRAFT',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('createBudget no implementado en BudgetStore', e);
    }
  }

  onDelete(item: Budget) {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar el presupuesto #${item.id.slice(0, 8).toUpperCase()}?`,
      )
    ) {
      try {
        if ((this.store as any).deleteBudget) {
          (this.store as any).deleteBudget(item.id);
        }
      } catch (e) {
        console.warn('deleteBudget no implementado en BudgetStore', e);
      }
    }
  }

  getInitials(id: string | undefined): string {
    return (id || 'B').slice(0, 2).toUpperCase();
  }

  getStatusGradient(status: string): string {
    switch ((status || 'draft').toLowerCase()) {
      case 'accepted':
        return 'linear-gradient(135deg, #10b981, #059669)';
      case 'sent':
        return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'rejected':
        return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'draft':
        return 'linear-gradient(135deg, #6b7280, #374151)';
      default:
        return 'linear-gradient(135deg, #f59e0b, #d97706)';
    }
  }

  /** Lógica de filtrado para el MasterFilterService */
  filter(query: string): Observable<Budget[]> {
    const term = query.toLowerCase().trim();
    if (!term) return of(this.store.budgets());

    const matches = this.store.budgets().filter((b: Budget) => {
      const searchableText = [b.id, b.clientId || '', b.status]
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
      aceptado: ['aceptado', 'accepted', 'aprobado', 'confirmado'],
      enviado: ['enviado', 'sent', 'remitido'],
      rechazado: ['rechazado', 'rejected', 'denegado', 'cancelado'],
      borrador: ['borrador', 'draft', 'borradores'],
      presupuesto: ['presupuesto', 'budget', 'cotizacion', 'cotización'],
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

  formatCurrencyEu(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  getStatusVariant(
    status: string,
  ): 'success' | 'warning' | 'info' | 'danger' | 'secondary' {
    const s = (status || 'draft').toLowerCase();
    if (s === 'accepted') return 'success';
    if (s === 'sent') return 'info';
    if (s === 'rejected') return 'danger';
    if (s === 'draft') return 'secondary';
    return 'warning';
  }

  toggleSort() {
    if (this.sortField() === 'name') {
      this.sortField.set('total');
      this.sortDirection.set(-1);
    } else if (this.sortField() === 'total') {
      this.sortField.set('status');
    } else {
      this.sortField.set('name');
      this.sortDirection.set(1);
    }
  }

  openCreateModal() {
    this.editingBudget.set(null);
    this.formData = {
      clientId: '',
      startDate: '',
      endDate: '',
      total: 0,
      status: 'DRAFT',
      items: [],
      description: '',
      validUntil: '',
      notes: '',
    };
    this.formErrors.set([]);
    this.isModalOpen.set(true);
  }

  editBudget(budget: Budget) {
    this.editingBudget.set(budget);
    this.formData = {
      ...budget,
      description: '',
      validUntil: '',
      notes: '',
    };
    this.formErrors.set([]);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingBudget.set(null);
    this.formErrors.set([]);
  }

  saveBudget() {
    const errors: string[] = [];

    if (!this.formData.clientId?.trim()) {
      errors.push('El cliente es obligatorio');
    }

    if (this.formData.total !== undefined && this.formData.total < 0) {
      errors.push('El total no puede ser negativo');
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
        this.editingBudget()
          ? 'Presupuesto actualizado correctamente'
          : 'Presupuesto creado correctamente',
        'success',
      );
      this.closeModal();
    }, 1000);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters.set(!this.showAdvancedFilters());
  }

  clearFilters() {
    this.statusFilter.set('all');
    this.dateFromFilter.set('');
    this.dateToFilter.set('');
    this.amountMinFilter.set(null);
    this.amountMaxFilter.set(null);
    this.currentPage.set(1);
  }

  clearFiltersAndSearch(): void {
    this.masterFilter.search('');
    this.clearFilters();
  }

  refreshBudgets() {
    this.store.loadBudgets();
    this.toast.show('Presupuestos actualizados', 'info');
  }

  toggleSelectAll() {
    const paginated = this.paginatedBudgets();
    const currentSelected = this.selectedBudgets();
    const newSelected = new Set(currentSelected);

    if (this.isAllSelected()) {
      // Deselect all on current page
      paginated.forEach((b) => newSelected.delete(b.id));
    } else {
      // Select all on current page
      paginated.forEach((b) => newSelected.add(b.id));
    }

    this.selectedBudgets.set(newSelected);
  }

  toggleBudgetSelection(budgetId: string) {
    const currentSelected = this.selectedBudgets();
    const newSelected = new Set(currentSelected);

    if (newSelected.has(budgetId)) {
      newSelected.delete(budgetId);
    } else {
      newSelected.add(budgetId);
    }

    this.selectedBudgets.set(newSelected);
  }

  clearSelection() {
    this.selectedBudgets.set(new Set());
  }

  bulkChangeStatus(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;

    if (!newStatus) return;

    const selectedIds = Array.from(this.selectedBudgets());
    if (selectedIds.length === 0) return;

    // Reset select
    target.value = '';

    // Simulate bulk update
    selectedIds.forEach((id) => {
      const budget = this.store.budgets().find((b) => b.id === id);
      if (budget) {
        // In a real app, you'd call an API
        console.log(`Changing status of ${id} to ${newStatus}`);
      }
    });

    this.toast.show(
      `${selectedIds.length} presupuesto${selectedIds.length === 1 ? '' : 's'} actualizado${selectedIds.length === 1 ? '' : 's'}`,
      'success',
    );
    this.clearSelection();
    this.refreshBudgets();
  }

  bulkDelete() {
    const selectedIds = Array.from(this.selectedBudgets());
    if (selectedIds.length === 0) return;

    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar ${selectedIds.length} presupuesto${selectedIds.length === 1 ? '' : 's'}?`,
      )
    ) {
      return;
    }

    // Simulate bulk delete
    selectedIds.forEach((id) => {
      console.log(`Deleting budget ${id}`);
    });

    this.toast.show(
      `${selectedIds.length} presupuesto${selectedIds.length === 1 ? '' : 's'} eliminado${selectedIds.length === 1 ? '' : 's'}`,
      'success',
    );
    this.clearSelection();
    this.refreshBudgets();
  }
}
