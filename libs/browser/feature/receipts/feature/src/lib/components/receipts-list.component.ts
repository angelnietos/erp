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
  UiCardComponent,
  UiButtonComponent,
  UiSelectComponent,
  UiBadgeComponent,
  UiSearchComponent,
  UIAIChatComponent,
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
    UiCardComponent,
    UiButtonComponent,
    UiSelectComponent,
    UiBadgeComponent,
    UiSearchComponent,
    LucideAngularModule,
    UIAIChatComponent,
  ],
  template: `
    <div class="receipts-container animate-fade-in">
      <header class="receipts-header" [style.border-bottom-color]="currentTheme().primary + '33'">
        <div class="header-content">
          <h1 class="receipts-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'">
            Recibos y Pagos
          </h1>
          <p class="receipts-subtitle text-friendly">
            Gestión de pagos pendientes y realizados
          </p>
        </div>
        <div class="header-actions">
          <ui-josanz-button variant="glass" size="md" (clicked)="newReceipt()" icon="plus">
            Nuevo Recibo
          </ui-josanz-button>
        </div>
      </header>

      <div class="navigation-bar ui-glass-panel">
        <ui-josanz-search 
          variant="filled"
          placeholder="BUSCAR RECIBO POR FACTURA O IMPORTE..." 
          (searchChange)="onSearch($event)"
          class="flex-1 max-w-md"
        ></ui-josanz-search>
        
        <ui-josanz-select
          label="Estado"
          [(ngModel)]="statusFilter"
          name="status"
          [options]="statusOptions"
          class="status-select"
        />
      </div>

      <ui-josanz-card>
        <div class="receipts-list">
          <div
            *ngFor="let receipt of filteredReceipts()"
            class="receipt-item"
            [class]="receipt.status.toLowerCase()"
          >
            <div class="receipt-icon">
              <lucide-icon
                [img]="getStatusIcon(receipt.status)"
                size="20"
              ></lucide-icon>
            </div>

            <div class="receipt-info">
              <div class="receipt-header">
                <span class="receipt-id"
                  >Factura #{{ receipt.invoiceId }}</span
                >
                <ui-josanz-badge [variant]="getStatusVariant(receipt.status)">
                  {{ getStatusText(receipt.status) }}
                </ui-josanz-badge>
              </div>
              <div class="receipt-details">
                <span class="receipt-amount"
                  >€{{ receipt.amount.toFixed(2) }}</span
                >
                <span class="receipt-due"
                  >Vence: {{ formatDate(receipt.dueDate) }}</span
                >
              </div>
              <div class="receipt-meta" *ngIf="receipt.paymentDate">
                <span class="receipt-paid"
                  >Pagado: {{ formatDate(receipt.paymentDate) }}</span
                >
                <span class="receipt-method" *ngIf="receipt.paymentMethod">
                  Método: {{ receipt.paymentMethod }}
                </span>
              </div>
            </div>

            <div class="receipt-actions">
              <ui-josanz-button
                variant="ghost"
                size="sm"
                (clicked)="goToBilling(receipt)"
              >
                Ver Detalles
              </ui-josanz-button>
              <ui-josanz-button
                *ngIf="receipt.status === 'PENDING'"
                variant="success"
                size="sm"
                (clicked)="markAsPaid(receipt)"
              >
                Marcar Pagado
              </ui-josanz-button>
            </div>
          </div>
        </div>
      </ui-josanz-card>

      <ui-josanz-ai-assistant feature="receipts"></ui-josanz-ai-assistant>
    </div>
  `,
  styles: [
    `
      .receipts-container {
        padding: 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .receipts-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .receipts-title {
        margin: 0;
        font-size: 2.5rem;
        font-weight: 700;
        color: #111827;
      }

      .receipts-subtitle {
        margin: 0.5rem 0 0 0;
        color: var(--text-secondary);
        font-size: 1.125rem;
      }

      .navigation-bar { 
        display: flex; justify-content: space-between; align-items: center; 
        margin-bottom: 1.5rem; padding: 0.25rem 1rem; border-radius: 12px;
        background: rgba(15, 15, 15, 0.4); border: 1px solid rgba(255,255,255,0.05); gap: 1rem;
      }

      .flex-1 { flex: 1; }
      .max-w-md { max-width: 28rem; }
      .status-select { width: 200px; }

      .glow-text { 
        font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0; 
        letter-spacing: 0.05em; font-family: var(--font-main);
      }
      
      .text-uppercase { text-transform: uppercase; }

      .receipts-content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .filters-card {
        padding: 1.5rem;
      }

      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .receipts-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .receipt-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        background: white;
        transition: all 0.2s;
      }

      .receipt-item.pending {
        border-left: 4px solid #f59e0b;
      }

      .receipt-item.paid {
        border-left: 4px solid #10b981;
        background: #f0fdf4;
      }

      .receipt-item.overdue {
        border-left: 4px solid #ef4444;
        background: #fef2f2;
      }

      .receipt-item.cancelled {
        border-left: 4px solid #6b7280;
        background: #f9fafb;
        opacity: 0.7;
      }

      .receipt-icon {
        padding: 0.75rem;
        background: #f3f4f6;
        border-radius: 0.5rem;
        color: #374151;
        flex-shrink: 0;
      }

      .receipt-info {
        flex: 1;
      }

      .receipt-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .receipt-id {
        font-weight: 600;
        color: #111827;
      }

      .receipt-details {
        display: flex;
        gap: 1rem;
        margin-bottom: 0.5rem;
      }

      .receipt-amount {
        font-size: 1.25rem;
        font-weight: 700;
        color: #111827;
      }

      .receipt-due {
        color: #6b7280;
      }

      .receipt-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.875rem;
      }

      .receipt-paid {
        color: #059669;
      }

      .receipt-method {
        color: #6b7280;
      }

      .receipt-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex-shrink: 0;
      }

      @media (max-width: 768px) {
        .receipt-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .receipt-header {
          width: 100%;
        }

        .receipt-actions {
          flex-direction: row;
          width: 100%;
        }
      }
    `,
  ],
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
      list = list.filter(r => r.status === this.statusFilter);
    }
    const t = this.masterFilter.query().trim().toLowerCase();
    if (!t) return list;
    return list.filter(r => 
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
    const result = this.receipts().filter(r => 
      r.invoiceId.toLowerCase().includes(term) || 
      r.amount.toString().includes(term)
    );
    return of(result);
  }

  private loadReceipts() {
    this.receiptsApi.list().subscribe((rows) => {
      if (rows.length > 0) {
        this.receipts.set(
          rows.map((r) => ({
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
        this.receipts.update((list) =>
          list.map((r) =>
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
