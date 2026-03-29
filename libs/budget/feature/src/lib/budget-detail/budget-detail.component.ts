import { Component, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UiCardComponent, UiButtonComponent, UiBadgeComponent, UiLoaderComponent, UiTabsComponent, TabItem, UiTableComponent } from '@josanz-erp/shared-ui-kit';

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Budget {
  id: string;
  clientId: string;
  clientName: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  total: number;
  createdAt: string;
  startDate: string;
  endDate: string;
  validUntil: string;
  notes: string;
  items: BudgetItem[];
}

@Component({
  selector: 'lib-budget-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, UiCardComponent, UiButtonComponent, UiBadgeComponent, UiLoaderComponent, UiTabsComponent, UiTableComponent],
  template: `
    <div class="page-container">
      @if (isLoading()) {
        <ui-josanz-loader message="Cargando presupuesto..."></ui-josanz-loader>
      } @else {
        <div class="page-header">
          <button class="back-btn" routerLink="/budgets">
            <lucide-icon name="arrow-left"></lucide-icon>
            Volver
          </button>
        </div>

        <div class="budget-header">
          <div class="budget-info">
            <h1>Presupuesto #{{ budget()?.id?.slice(0, 8) }}</h1>
            <div class="badges">
              <ui-josanz-badge [variant]="getStatusVariant(budget()?.status)">
                {{ budget()?.status | uppercase }}
              </ui-josanz-badge>
              <span class="client-name">{{ budget()?.clientName }}</span>
            </div>
          </div>
          <div class="header-actions">
            <ui-josanz-button icon="file-text" (clicked)="downloadPDF()">Descargar PDF</ui-josanz-button>
            <ui-josanz-button icon="send" (clicked)="sendToClient()">Enviar al Cliente</ui-josanz-button>
          </div>
        </div>

        <div class="budget-meta">
          <div class="meta-item">
            <span class="label">Fecha de creación</span>
            <span class="value">{{ formatDate(budget()?.createdAt) }}</span>
          </div>
          <div class="meta-item">
            <span class="label">Período</span>
            <span class="value">{{ formatDate(budget()?.startDate) }} - {{ formatDate(budget()?.endDate) }}</span>
          </div>
          <div class="meta-item">
            <span class="label">Válido hasta</span>
            <span class="value">{{ formatDate(budget()?.validUntil) }}</span>
          </div>
          <div class="meta-item total">
            <span class="label">Total</span>
            <span class="value">{{ budget()?.total | currency:'EUR' }}</span>
          </div>
        </div>

        <ui-josanz-card title="Líneas de Presupuesto">
          <ui-josanz-table [columns]="itemColumns" [data]="budget()?.items || []">
            <ng-template #cellTemplate let-item let-key="key">
              @switch (key) {
                @case ('unitPrice') { {{ item.unitPrice | currency:'EUR' }} }
                @case ('total') { <strong>{{ item.total | currency:'EUR' }}</strong> }
                @default { {{ item[key] }} }
              }
            </ng-template>
          </ui-josanz-table>
        </ui-josanz-card>

        @if (budget()?.notes) {
          <ui-josanz-card title="Notas">
            <p class="notes">{{ budget()?.notes }}</p>
          </ui-josanz-card>
        }

        <div class="action-buttons">
          @if (budget()?.status === 'sent') {
            <ui-josanz-button (clicked)="approveBudget()">Aceptar Presupuesto</ui-josanz-button>
          }
          @if (budget()?.status === 'accepted') {
            <ui-josanz-button (clicked)="createDelivery()">Generar Albarán</ui-josanz-button>
            <ui-josanz-button (clicked)="createInvoice()">Generar Factura</ui-josanz-button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { margin-bottom: 16px; }
    .back-btn {
      display: flex; align-items: center; gap: 8px; background: none; border: none;
      color: #94A3B8; cursor: pointer; font-size: 14px; padding: 8px 0;
    }
    .back-btn:hover { color: white; }
    .budget-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px;
    }
    .budget-info h1 { margin: 0 0 12px 0; color: white; font-size: 28px; font-weight: 700; }
    .badges { display: flex; align-items: center; gap: 12px; }
    .client-name { color: #94A3B8; font-size: 14px; }
    .header-actions { display: flex; gap: 12px; }
    .budget-meta {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
      background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; margin-bottom: 24px;
    }
    .meta-item { display: flex; flex-direction: column; gap: 4px; }
    .meta-item.total { text-align: right; }
    .meta-item .label { color: #64748B; font-size: 12px; }
    .meta-item .value { color: white; font-size: 14px; font-weight: 600; }
    .meta-item.total .value { font-size: 24px; color: #4F46E5; }
    .notes { color: #E2E8F0; font-size: 14px; line-height: 1.6; margin: 0; }
    .action-buttons { display: flex; gap: 12px; margin-top: 24px; }
    @media (max-width: 768px) {
      .budget-meta { grid-template-columns: repeat(2, 1fr); }
      .budget-header { flex-direction: column; gap: 16px; }
      .header-actions { flex-wrap: wrap; }
    }
  `],
})
export class BudgetDetailComponent implements OnInit {
  @Input() id?: string;

  budget = signal<Budget | null>(null);
  isLoading = signal(true);

  itemColumns = [
    { key: 'description', header: 'Descripción' },
    { key: 'quantity', header: 'Cantidad', width: '100px' },
    { key: 'unitPrice', header: 'Precio Unit.', width: '120px' },
    { key: 'total', header: 'Total', width: '120px' },
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = this.id || this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBudget(id);
    }
  }

  loadBudget(id: string) {
    this.isLoading.set(true);
    // Mock data
    setTimeout(() => {
      this.budget.set({
        id,
        clientId: '1',
        clientName: 'Producciones Audiovisuales Madrid',
        status: 'accepted',
        total: 4500,
        createdAt: '2026-03-15',
        startDate: '2026-04-01',
        endDate: '2026-04-05',
        validUntil: '2026-03-30',
        notes: 'Precio incluye IVA. Equipment de última generación.',
        items: [
          { id: '1', description: 'Cámara Sony FX6', quantity: 2, unitPrice: 500, total: 1000 },
          { id: '2', description: 'Iluminación LED Kit', quantity: 1, unitPrice: 800, total: 800 },
          { id: '3', description: 'Trípode profesional', quantity: 2, unitPrice: 150, total: 300 },
          { id: '4', description: 'Alquiler 4 días', quantity: 4, unitPrice: 850, total: 3400 },
        ],
      });
      this.isLoading.set(false);
    }, 300);
  }

  getStatusVariant(status: string | undefined): 'success' | 'warning' | 'error' | 'info' | 'default' {
    switch (status) {
      case 'accepted': return 'success';
      case 'sent': return 'info';
      case 'rejected': return 'error';
      default: return 'default';
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }

  downloadPDF() { /* TODO */ }
  sendToClient() { /* TODO */ }
  approveBudget() { /* TODO */ }
  createDelivery() { this.router.navigate(['/delivery/create'], { queryParams: { budgetId: this.id } }); }
  createInvoice() { this.router.navigate(['/billing/create'], { queryParams: { budgetId: this.id } }); }
}
