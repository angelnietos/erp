import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  ReceiptsApiService,
  ThemeService,
  MasterFilterService,
  FilterableService,
  GlobalAuthStore,
  rbacAllows,
} from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';
import {
  LucideAngularModule,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-angular';
import { 
  UiButtonComponent, 
  UiFeatureFilterBarComponent, 
  UiStatCardComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
  UiSelectComponent,
  UiFeatureAccessDeniedComponent,
  UiLoaderComponent,
} from '@josanz-erp/shared-ui-kit';

interface Receipt {
  id: string;
  invoiceId: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paymentMethod?: string;
  dueDate: string;
  paymentDate?: string;
}

@Component({
  selector: 'lib-receipts-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    UiButtonComponent,
    UiFeatureFilterBarComponent,
    UiStatCardComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    UiSelectComponent,
    LucideAngularModule,
    UiFeatureAccessDeniedComponent,
    UiLoaderComponent,
  ],
  template: `
    @if (!canAccess()) {
      <ui-feature-access-denied
        message="No tienes permiso para ver recibos."
        permissionHint="receipts.view"
      />
    } @else {
    <div class="receipts-container feature-page-shell">
      <ui-feature-header
        title="Recibos"
        subtitle="Gestión de cobros y conciliación de pagos"
        icon="wallet"
        actionLabel="NUECO RECIBO"
        (actionClicked)="newReceipt()"
      ></ui-feature-header>

      <ui-feature-stats>
        <ui-stat-card 
          label="Total Cobrado" 
          [value]="formatCurrencyEu(totalPaidAmount())" 
          icon="check-circle" 
          [accent]="true">
        </ui-stat-card>
        <ui-stat-card 
          label="Pendiente" 
          [value]="formatCurrencyEu(totalPendingAmount())" 
          icon="clock" 
          [trend]="-5">
        </ui-stat-card>
        <ui-stat-card 
          label="Vencidos" 
          [value]="overdueCount().toString()" 
          icon="alert-triangle">
        </ui-stat-card>
        <ui-stat-card
          label="Morosidad"
          value="2.4%"
          icon="trending-down"
          [accent]="false"
        ></ui-stat-card>
      </ui-feature-stats>

      <ui-feature-filter-bar
        [appearance]="'feature'"
        [searchVariant]="'glass'"
        placeholder="Buscar por factura o importe…"
        (searchChange)="onSearch($event)"
      >
        <div uiFeatureFilterStates class="receipts-filter-state">
          <ui-select
            label="ESTADO"
            [(ngModel)]="statusFilter"
            name="status"
            [options]="statusOptions"
            class="status-select"
          />
        </div>
        <ui-button
          variant="ghost"
          size="sm"
          [icon]="sortDirection() === 1 ? 'ChevronUp' : 'ChevronDown'"
          (clicked)="toggleSort()"
        >
          Ordenar:
          {{
            sortField() === 'dueDate'
              ? 'vencimiento'
              : sortField() === 'invoiceId'
                ? 'factura'
                : 'importe'
          }}
        </ui-button>
      </ui-feature-filter-bar>

      @if (loadError() && receipts().length > 0) {
        <div class="feature-load-error-banner" role="status" aria-live="polite">
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
            (clicked)="loadReceipts()"
          >
            Reintentar
          </ui-button>
        </div>
      }

      @if (isLoading() && receipts().length === 0) {
        <div class="feature-loader-wrap">
          <ui-loader message="Cargando recibos…"></ui-loader>
        </div>
      } @else if (loadError() && receipts().length === 0) {
        <div class="feature-error-screen" role="alert">
          <lucide-icon
            name="wifi-off"
            size="48"
            class="feature-error-screen__icon"
          ></lucide-icon>
          <h3>No se pudieron cargar los recibos</h3>
          <p>{{ loadError() }}</p>
          <ui-button variant="solid" icon="rotate-cw" (clicked)="loadReceipts()">
            Reintentar
          </ui-button>
        </div>
      } @else {
      <ui-feature-grid>
        @for (receipt of filteredReceipts(); track receipt.id) {
          <ui-feature-card
            [name]="'FACTURA #' + receipt.invoiceId"
            [subtitle]="(receipt.paymentMethod || 'SIN MÉTODO') | uppercase"
            [avatarInitials]="getInitials(receipt.invoiceId)"
            [avatarBackground]="getStatusGradient(receipt.status)"
            [status]="receipt.status === 'PAID' ? 'active' : 'offline'"
            [badgeLabel]="getStatusText(receipt.status) | uppercase"
            [badgeVariant]="getStatusBadgeVariant(receipt.status)"
            [showEdit]="false"
            [showDuplicate]="false"
            [showDelete]="false"
            (cardClicked)="goToBilling(receipt)"
            [footerItems]="[
              { icon: 'calendar', label: (receipt.dueDate | date:'dd/MM/yyyy') || '-' },
              { icon: 'euro', label: ((receipt.amount || 0) | currency:'EUR') || '-' }
            ]"
          >
             <div footer-extra class="receipt-extra-actions">
                <ui-button variant="ghost" size="sm" icon="eye" (click)="$event.stopPropagation(); goToBilling(receipt)" title="Ver Factura"></ui-button>
                @if (receipt.status === 'PENDING') {
                   <ui-button variant="ghost" size="sm" icon="check" (click)="$event.stopPropagation(); markAsPaid(receipt)" class="text-success" title="Marcar como pagado"></ui-button>
                }
             </div>
          </ui-feature-card>
        } @empty {
          @if (filterProducesNoResults()) {
            <div class="feature-empty feature-empty--wide">
              <lucide-icon name="search-x" size="56" class="feature-empty__icon"></lucide-icon>
              <h3>Sin resultados</h3>
              <p>Ningún recibo coincide con la búsqueda o el filtro de estado.</p>
              <ui-button variant="ghost" icon="circle-x" (clicked)="clearFiltersAndSearch()">
                Limpiar búsqueda y filtro
              </ui-button>
            </div>
          } @else {
            <div class="feature-empty feature-empty--wide">
              <lucide-icon name="wallet" size="56" class="feature-empty__icon"></lucide-icon>
              <h3>No hay recibos</h3>
              <p>Todo está al día o no hay documentos de cobro registrados.</p>
              <ui-button variant="solid" (clicked)="newReceipt()" icon="CirclePlus">Crear recibo</ui-button>
            </div>
          }
        }
      </ui-feature-grid>
      }
    </div>
    }
  `,
  styles: [`
    .receipts-filter-state {
      display: flex;
      align-items: flex-end;
    }

    .status-select { width: 250px; min-width: 200px; }

    .card-actions { display: flex; gap: 0.25rem; }
    .text-success { color: var(--success) !important; }

    @media (max-width: 900px) {
       .receipts-filter-state { width: 100%; }
       .status-select { width: 100%; min-width: 0; }
    }
  `],
})
export class ReceiptsListComponent implements OnInit, OnDestroy, FilterableService<Receipt> {
  private readonly router = inject(Router);
  private readonly receiptsApi = inject(ReceiptsApiService);
  private readonly themeService = inject(ThemeService);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly authStore = inject(GlobalAuthStore);
  readonly canAccess = rbacAllows(this.authStore, 'receipts.view');

  currentTheme = this.themeService.currentThemeData;
  private readonly FileText = FileText;
  private readonly AlertTriangle = AlertTriangle;
  private readonly CheckCircle = CheckCircle;
  private readonly XCircle = XCircle;

  statusFilter = '';

  sortField = signal<'dueDate' | 'invoiceId' | 'amount'>('dueDate');
  sortDirection = signal<1 | -1>(-1);

  isLoading = signal(false);
  loadError = signal<string | null>(null);
  statusOptions = [
    { label: 'Todos los estados', value: '' },
    { label: 'Pendiente', value: 'PENDING' },
    { label: 'Pagado', value: 'PAID' },
    { label: 'Vencido', value: 'OVERDUE' },
    { label: 'Cancelado', value: 'CANCELLED' },
  ];

  totalPaidAmount = computed(() => 
    this.receipts().filter((r: Receipt) => r.status === 'PAID').reduce((acc: number, r: Receipt) => acc + r.amount, 0)
  );
  totalPendingAmount = computed(() => 
    this.receipts().filter((r: Receipt) => r.status === 'PENDING' || r.status === 'OVERDUE').reduce((acc: number, r: Receipt) => acc + r.amount, 0)
  );
  overdueCount = computed(() => 
    this.receipts().filter((r: Receipt) => r.status === 'OVERDUE').length
  );

  formatCurrencyEu(amount: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  getInitials(id: string): string {
    return id.slice(0, 2).toUpperCase();
  }

  getStatusGradient(status: string): string {
    switch (status) {
      case 'PAID': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'PENDING': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'OVERDUE': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'CANCELLED': return 'linear-gradient(135deg, #6b7280, #374151)';
      default: return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    }
  }

  getStatusBadgeVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'primary' {
    switch (status) {
      case 'PAID': return 'success';
      case 'PENDING': return 'warning';
      case 'OVERDUE': return 'danger';
      default: return 'secondary';
    }
  }

  receipts = signal<Receipt[]>([
    {
      id: '1',
      invoiceId: '001',
      amount: 500.0,
      status: 'PENDING',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    },
    {
      id: '2',
      invoiceId: '002',
      amount: 1200.5,
      status: 'PAID',
      paymentMethod: 'BANK_TRANSFER',
      dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      paymentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
      id: '3',
      invoiceId: '003',
      amount: 750.25,
      status: 'OVERDUE',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
    {
      id: '4',
      invoiceId: '004',
      amount: 300.0,
      status: 'CANCELLED',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    },
  ]);

  filteredReceipts = computed(() => {
    let list = [...this.receipts()];
    if (this.statusFilter) {
      list = list.filter((r: Receipt) => r.status === this.statusFilter);
    }
    const t = this.masterFilter.query().trim().toLowerCase();
    if (t) {
      list = list.filter(
        (r: Receipt) =>
          r.invoiceId.toLowerCase().includes(t) ||
          r.amount.toString().includes(t) ||
          (r.paymentMethod ?? '').toLowerCase().includes(t),
      );
    }
    const field = this.sortField();
    const dir = this.sortDirection();
    list.sort((a, b) => {
      let valA: string | number = 0;
      let valB: string | number = 0;
      if (field === 'dueDate') {
        valA = new Date(a.dueDate).getTime();
        valB = new Date(b.dueDate).getTime();
      } else if (field === 'invoiceId') {
        valA = (a.invoiceId || '').toLowerCase();
        valB = (b.invoiceId || '').toLowerCase();
      } else {
        valA = a.amount;
        valB = b.amount;
      }
      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
    return list;
  });

  readonly hasAnyReceipts = computed(() => this.receipts().length > 0);
  readonly filterProducesNoResults = computed(
    () => this.hasAnyReceipts() && this.filteredReceipts().length === 0,
  );

  ngOnInit() {
    this.masterFilter.registerProvider(this);
    this.loadReceipts();
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
  }

  onSearch(term: string) {
    this.masterFilter.search(term);
  }

  toggleSort() {
    if (this.sortField() === 'dueDate') {
      this.sortField.set('invoiceId');
      this.sortDirection.set(1);
    } else if (this.sortField() === 'invoiceId') {
      this.sortField.set('amount');
      this.sortDirection.set(-1);
    } else {
      this.sortField.set('dueDate');
      this.sortDirection.set(-1);
    }
  }

  filter(query: string): Observable<Receipt[]> {
    const term = query.toLowerCase();
    const result = this.receipts().filter((r: Receipt) => 
      r.invoiceId.toLowerCase().includes(term) || 
      r.amount.toString().includes(term)
    );
    return of(result);
  }

  loadReceipts() {
    this.loadError.set(null);
    this.isLoading.set(true);
    this.receiptsApi.list().subscribe({
      next: (rows: any[]) => {
        if (rows.length > 0) {
          this.receipts.set(
            rows.map((r: any) => ({
              id: r.id,
              invoiceId: r.invoiceId,
              amount: r.amount,
              status: r.status,
              dueDate: r.dueDate.includes('T')
                ? r.dueDate
                : `${r.dueDate}T12:00:00.000Z`,
              paymentDate: r.paymentDate
                ? r.paymentDate.includes('T')
                  ? r.paymentDate
                  : `${r.paymentDate}T12:00:00.000Z`
                : undefined,
              paymentMethod: r.paymentMethod,
            })),
          );
        }
        this.isLoading.set(false);
        this.loadError.set(null);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set(
          'No se pudieron cargar los recibos. Comprueba la conexión e inténtalo de nuevo.',
        );
      },
    });
  }

  clearFiltersAndSearch(): void {
    this.masterFilter.search('');
    this.statusFilter = '';
  }

  applyFilters() {
    // No longer needed as we use computed, but keeping for compatibility if called
  }

  getStatusIcon(status: string) {
    switch (status) {
      case 'PENDING':
        return this.FileText;
      case 'PAID':
        return this.CheckCircle;
      case 'OVERDUE':
        return this.AlertTriangle;
      case 'CANCELLED':
        return this.XCircle;
      default:
        return this.FileText;
    }
  }

  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      PENDING: 'Pendiente',
      PAID: 'Pagado',
      OVERDUE: 'Vencido',
      CANCELLED: 'Cancelado',
    };
    return texts[status] || status;
  }

  getStatusVariant(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'PAID':
        return 'success';
      case 'OVERDUE':
        return 'danger';
      case 'CANCELLED':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  newReceipt(): void {
    void this.router.navigateByUrl('/billing');
  }

  goToBilling(receipt: Receipt): void {
    void this.router.navigate(['/billing'], {
      queryParams: { invoice: receipt.invoiceId },
    });
  }

  markAsPaid(receipt: Receipt): void {
    this.receiptsApi
      .markPaid(receipt.id, {
        paymentMethod: 'BANK_TRANSFER',
        paymentDate: new Date().toISOString(),
      })
      .subscribe(() => {
        this.receipts.set(
          this.receipts().map((r: Receipt) =>
            r.id === receipt.id
              ? {
                  ...r,
                  status: 'PAID' as const,
                  paymentDate: new Date().toISOString(),
                  paymentMethod: r.paymentMethod ?? 'BANK_TRANSFER',
                }
              : r,
          ),
        );
        this.applyFilters();
      });
  }
}
