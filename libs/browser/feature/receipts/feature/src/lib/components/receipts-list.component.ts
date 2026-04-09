import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ReceiptsApiService, ThemeService, MasterFilterService, FilterableService } from '@josanz-erp/shared-data-access';
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
  UiSearchComponent, 
  UiStatCardComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
  UiSelectComponent,
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
    UiSearchComponent,
    UiStatCardComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    UiSelectComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="receipts-container">
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

      <div class="navigation-bar">
        <ui-search 
          variant="glass"
          placeholder="BUSCAR POR FACTURA O IMPORTE..." 
          (searchChange)="onSearch($event)"
          class="flex-1"
        ></ui-search>
        
        <ui-select
          label="ESTADO"
          [(ngModel)]="statusFilter"
          name="status"
          [options]="statusOptions"
          class="status-select"
        />
      </div>

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
            (cardClicked)="goToBilling(receipt)"
            [footerItems]="[
              { icon: 'calendar', label: (receipt.dueDate | date:'dd/MM/yyyy') || '-' },
              { icon: 'euro', label: ((receipt.amount || 0) | currency:'EUR') || '-' }
            ]"
          >
             <div footer-extra class="card-actions">
                <ui-button variant="ghost" size="sm" icon="eye" (click)="$event.stopPropagation(); goToBilling(receipt)"></ui-button>
                @if (receipt.status === 'PENDING') {
                   <ui-button variant="ghost" size="sm" icon="check" (click)="$event.stopPropagation(); markAsPaid(receipt)" class="text-success"></ui-button>
                }
             </div>
          </ui-feature-card>
        } @empty {
          <div class="empty-state">
            <lucide-icon name="wallet" size="64" class="empty-icon"></lucide-icon>
            <h3>No hay recibos</h3>
            <p>Todo está al día o no hay documentos de cobro registrados.</p>
            <ui-button variant="solid" (clicked)="newReceipt()" icon="CirclePlus">Crear recibo</ui-button>
          </div>
        }
      </ui-feature-grid>
    </div>
  `,
  styles: [`
    .receipts-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .navigation-bar {
      margin-bottom: 2rem;
      background: var(--surface);
      padding: 0.5rem 1.5rem;
      border-radius: 16px;
      border: 1px solid var(--border-soft);
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .flex-1 { flex: 1; }
    .status-select { width: 250px; }

    .card-actions { display: flex; gap: 0.25rem; }
    .text-success { color: var(--success) !important; }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 5rem;
      text-align: center;
      background: var(--surface);
      border-radius: 20px;
      border: 2px dashed var(--border-soft);
    }
    .empty-icon { color: var(--text-muted); opacity: 0.3; margin-bottom: 1.5rem; }

    @media (max-width: 900px) {
       .navigation-bar { flex-direction: column; align-items: stretch; gap: 1rem; }
       .status-select { width: 100%; }
    }
  `],
})
export class ReceiptsListComponent implements OnInit, OnDestroy, FilterableService<Receipt> {
  private readonly router = inject(Router);
  private readonly receiptsApi = inject(ReceiptsApiService);
  private readonly themeService = inject(ThemeService);
  private readonly masterFilter = inject(MasterFilterService);

  currentTheme = this.themeService.currentThemeData;
  private readonly FileText = FileText;
  private readonly AlertTriangle = AlertTriangle;
  private readonly CheckCircle = CheckCircle;
  private readonly XCircle = XCircle;

  statusFilter = '';
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
    let list = this.receipts();
    if (this.statusFilter) {
      list = list.filter((r: Receipt) => r.status === this.statusFilter);
    }
    const t = this.masterFilter.query().trim().toLowerCase();
    if (!t) return list;
    return list.filter((r: Receipt) => 
      r.invoiceId.toLowerCase().includes(t) || 
      r.amount.toString().includes(t) ||
      (r.paymentMethod ?? '').toLowerCase().includes(t)
    );
  });

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

  filter(query: string): Observable<Receipt[]> {
    const term = query.toLowerCase();
    const result = this.receipts().filter((r: Receipt) => 
      r.invoiceId.toLowerCase().includes(term) || 
      r.amount.toString().includes(term)
    );
    return of(result);
  }

  private loadReceipts() {
    this.receiptsApi.list().subscribe((rows: any[]) => {
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
    });
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
