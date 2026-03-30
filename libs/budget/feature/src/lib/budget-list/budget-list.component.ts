import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BudgetStore } from '@josanz-erp/budget-data-access';
import { UiTableComponent, UiCardComponent, UiButtonComponent, UiBadgeComponent, UiStatCardComponent } from '@josanz-erp/shared-ui-kit';
import { LucideAngularModule, Plus, FileText, Download } from 'lucide-angular';
import { BUDGET_FEATURE_CONFIG } from '../budget-feature.config';
import { Budget } from '@josanz-erp/budget-api';

@Component({
  selector: 'lib-budget-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    UiTableComponent, 
    UiCardComponent, 
    UiButtonComponent, 
    UiBadgeComponent, 
    UiStatCardComponent,
    LucideAngularModule
  ],
  template: `
    <div class="page-container animate-slide-up">
      <header class="page-header">
        <div class="header-main">
          <h1 class="page-title text-uppercase">Cotizaciones y Presupuestos</h1>
          <div class="breadcrumb">
            <span class="active">GESTIÓN COMERCIAL</span>
            <span class="separator">/</span>
            <span>PIPELINE DE VENTAS</span>
          </div>
        </div>
        @if (config.enableCreate) {
          <ui-josanz-button variant="primary" size="md" routerLink="/budgets/create" icon="plus">
            NUEVO PRESUPUESTO
          </ui-josanz-button>
        }
      </header>

      <div class="stats-row animate-slide-up">
        <ui-josanz-stat-card label="Pipeline Total" [value]="formatCurrencyEu(totalPipeline())" icon="pie-chart" [accent]="true"></ui-josanz-stat-card>
        <ui-josanz-stat-card label="Cerrados (Mes)" [value]="formatCurrencyEu(totalAccepted())" icon="check-square" [trend]="8"></ui-josanz-stat-card>
        <ui-josanz-stat-card label="Cotizaciones Pendientes" [value]="pendingCount().toString()" icon="clock"></ui-josanz-stat-card>
      </div>

      <ui-josanz-card variant="glass" class="table-card ui-neon">
        <ui-josanz-table [columns]="columns" [data]="store.budgets()" variant="default">
          <ng-template #cellTemplate let-item let-key="key">
            @switch (key) {
              @case ('id') { <span class="mono-id text-uppercase">#{{ item.id.slice(0, 8) }}</span> }
              @case ('status') { 
                <ui-josanz-badge [variant]="getStatusVariant(item.status)">
                  {{ item.status | uppercase }}
                </ui-josanz-badge>
              }
              @case ('total') { <span class="currency-value">{{ item.total | currency:'EUR' }}</span> }
              @case ('createdAt') { <span class="text-secondary font-mono">{{ item.createdAt | date:'dd/MM/yyyy' }}</span> }
              @case ('startDate') { <span class="text-secondary font-mono">{{ item.startDate | date:'dd/MM/yyyy' }}</span> }
              @case ('endDate') { <span class="text-secondary font-mono" [class.overdue]="isExpired(item)">{{ item.endDate | date:'dd/MM/yyyy' }}</span> }
              @case ('actions') {
                <div class="row-actions">
                  <ui-josanz-button variant="ghost" size="sm" icon="eye" [routerLink]="['/budgets', item.id]" title="Consultar"></ui-josanz-button>
                  <ui-josanz-button variant="ghost" size="sm" icon="pencil" [routerLink]="['/budgets', item.id, 'edit']" title="Editar"></ui-josanz-button>
                  @if (config.enableDownload) {
                    <ui-josanz-button variant="ghost" size="sm" icon="download" title="Generar PDF" class="btn-success-ghost"></ui-josanz-button>
                  }
                </div>
              }
              @default { {{ item[key] }} }
            }
          </ng-template>
        </ui-josanz-table>
        
        <footer class="table-footer">
          <div class="table-info">
            MOSTRANDO {{ store.budgets().length }} PRESUPUESTOS ACTIVOS
          </div>
        </footer>
      </ui-josanz-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 0; max-width: 1600px; margin: 0 auto; }
    
    .page-header {
      display: flex; 
      justify-content: space-between; 
      align-items: flex-end;
      margin-bottom: 1.25rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid var(--border-soft);
    }
    
    .page-title { 
      font-size: 1.35rem; 
      font-weight: 800; 
      color: #fff; 
      margin: 0 0 0.25rem 0; 
      letter-spacing: -0.02em;
      font-family: var(--font-main);
      line-height: 1.15;
    }
    
    .breadcrumb {
      display: flex;
      gap: 6px;
      font-size: 0.55rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }
    .breadcrumb .active { color: var(--brand); }
    .breadcrumb .separator { opacity: 0.3; }

    .stats-row { 
      display: grid; 
      grid-template-columns: repeat(3, 1fr); 
      gap: 0.85rem; 
      margin-bottom: 1.15rem; 
    }

    .mono-id { 
      font-family: var(--font-mono, monospace); 
      color: var(--brand); 
      font-weight: 900;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .currency-value { color: #fff; font-weight: 700; font-family: var(--font-main); font-size: 0.76rem; }
    .overdue { color: var(--danger); font-weight: 800; }

    .row-actions { display: flex; gap: 4px; }
    
    .btn-success-ghost :host ::ng-deep .btn:hover { background: var(--success) !important; color: white !important; border-color: var(--success) !important; }

    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.65rem 1rem;
      background: rgba(0, 0, 0, 0.1);
      border-top: 1px solid var(--border-soft);
    }

    .table-info { font-size: 0.55rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.06em; }

    .mr-2 { margin-right: 8px; }

    @media (max-width: 900px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
      .page-title { font-size: 1.2rem; }
      .stats-row { grid-template-columns: 1fr; }
    }
  `],
})
export class BudgetListComponent implements OnInit {
  store = inject(BudgetStore);
  config = inject(BUDGET_FEATURE_CONFIG);
  
  Plus = Plus;
  FileText = FileText;
  Download = Download;

  columns = this.config.defaultColumns;

  // Computed Metrics
  totalPipeline = computed(() => this.store.budgets().reduce((acc, b) => acc + (b.total || 0), 0));
  totalAccepted = computed(() => this.store.budgets().filter(b => b.status === 'ACCEPTED').reduce((acc, b) => acc + (b.total || 0), 0));
  pendingCount = computed(() => this.store.budgets().filter(b => b.status === 'DRAFT' || b.status === 'SENT').length);

  ngOnInit() {
    this.store.loadBudgets();
  }

  formatCurrencyEu(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'error' | 'default' {
    const s = status.toLowerCase();
    if (s === 'accepted') return 'success';
    if (s === 'sent') return 'info';
    if (s === 'rejected') return 'error';
    if (s === 'draft') return 'default';
    return 'warning';
  }

  isExpired(budget: Budget): boolean {
    if (!budget.endDate) return false;
    return new Date(budget.endDate) < new Date() && budget.status !== 'ACCEPTED';
  }
}

