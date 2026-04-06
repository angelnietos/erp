import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  FileText,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UiSelectComponent,
  UiBadgeComponent,
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
    LucideAngularModule,
  ],
  template: `
    <div class="receipts-container">
      <header class="receipts-header">
        <div class="header-content">
          <h1 class="receipts-title">Recibos y Pagos</h1>
          <p class="receipts-subtitle text-friendly">
            Gestión de pagos pendientes y realizados
          </p>
        </div>
        <div class="header-actions">
          <ui-josanz-button variant="primary" (clicked)="newReceipt()">
            Nuevo Recibo
          </ui-josanz-button>
        </div>
      </header>

      <div class="receipts-content">
        <ui-josanz-card class="filters-card">
          <div class="filters-grid">
            <ui-josanz-select
              label="Estado"
              [(ngModel)]="statusFilter"
              name="status"
              [options]="statusOptions"
              (ngModelChange)="applyFilters()"
            />
          </div>
        </ui-josanz-card>

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
      </div>
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
        color: #6b7280;
        font-size: 1.125rem;
      }

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
export class ReceiptsListComponent implements OnInit {
  private readonly router = inject(Router);
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

  filteredReceipts = signal<Receipt[]>([]);

  ngOnInit() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.receipts()];

    if (this.statusFilter) {
      filtered = filtered.filter(
        (receipt) => receipt.status === this.statusFilter,
      );
    }

    this.filteredReceipts.set(filtered);
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
    this.receipts.update((list) =>
      list.map((r) =>
        r.id === receipt.id
          ? {
              ...r,
              status: 'PAID',
              paymentDate: new Date().toISOString(),
              paymentMethod: r.paymentMethod ?? 'BANK_TRANSFER',
            }
          : r,
      ),
    );
    this.applyFilters();
  }
}
