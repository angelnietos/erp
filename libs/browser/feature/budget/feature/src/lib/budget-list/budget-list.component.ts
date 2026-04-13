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
  UiSearchComponent,
  UiStatCardComponent,
  UiModalComponent,
  UiInputComponent,
  UiPaginationComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  ThemeService,
  PluginStore,
  MasterFilterService,
  FilterableService,
  AIFormBridgeService,
  ToastService,
} from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { BudgetStore } from '@josanz-erp/budget-data-access';
import { Budget } from '@josanz-erp/budget-api';
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
    UiSearchComponent,
    UiModalComponent,
    UiInputComponent,
    UiPaginationComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="budgets-container">
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

      <!-- Search and Filters -->
      <div class="feature-controls">
        <div class="search-container">
          <ui-search
            variant="glass"
            placeholder="Buscar por nombre, cliente o estado..."
            (searchChange)="onSearch($event)"
          ></ui-search>
        </div>
        <div class="actions-group">
          <ui-button variant="ghost" size="sm" icon="filter">Filtros</ui-button>
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
                : sortField() === 'total'
                  ? 'TOTAL'
                  : 'ESTADO'
            }}
          </ui-button>
        </div>
      </div>

      <ui-feature-grid>
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
          <div class="empty-state">
            <lucide-icon
              name="file-text"
              size="64"
              class="empty-icon"
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
              ></ui-input>
              <ui-input
                label="Total (€)"
                [(ngModel)]="formData.total"
                icon="euro"
                type="number"
                placeholder="0.00"
              ></ui-input>
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

      .card-actions {
        display: flex;
        gap: 0.25rem;
      }

      .text-success {
        color: var(--success) !important;
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

      @media (max-width: 768px) {
        .feature-controls {
          flex-direction: column;
          align-items: stretch;
        }
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
          padding: 1rem;
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

  formData: Partial<Budget> = {
    clientId: '',
    startDate: '',
    endDate: '',
    total: 0,
    status: 'DRAFT',
    items: [],
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

    // 2. Sort
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
    };
    this.formErrors.set([]);
    this.isModalOpen.set(true);
  }

  editBudget(budget: Budget) {
    this.editingBudget.set(budget);
    this.formData = { ...budget };
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

    if (this.formData.total && this.formData.total < 0) {
      errors.push('El total no puede ser negativo');
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
}
