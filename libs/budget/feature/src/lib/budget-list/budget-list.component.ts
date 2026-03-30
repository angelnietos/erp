import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BudgetStore } from '@josanz-erp/budget-data-access';
import { UiTableComponent, UiCardComponent, UiButtonComponent, UiBadgeComponent } from '@josanz-erp/shared-ui-kit';
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
    LucideAngularModule
  ],
  template: `
    <div class="page-container animate-fade-in">
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

      <ui-josanz-card variant="glass" class="table-card">
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
                  <button class="action-btn" [routerLink]="['/budgets', item.id]" title="Consultar">
                    <lucide-icon name="eye" size="16"></lucide-icon>
                  </button>
                  <button class="action-btn" title="Editar" [routerLink]="['/budgets', item.id, 'edit']">
                    <lucide-icon name="pencil" size="16"></lucide-icon>
                  </button>
                  @if (config.enableDownload) {
                    <button class="action-btn success" title="Generar PDF">
                      <lucide-icon name="download" size="16"></lucide-icon>
                    </button>
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
    .page-container { padding: 2.5rem; max-width: 1600px; margin: 0 auto; }
    
    .page-header {
      display: flex; 
      justify-content: space-between; 
      align-items: flex-end;
      margin-bottom: 3rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-soft);
    }
    
    .page-title { 
      font-size: 2.25rem; 
      font-weight: 900; 
      color: #fff; 
      margin: 0 0 0.5rem 0; 
      letter-spacing: -0.02em;
      font-family: var(--font-display);
    }
    
    .breadcrumb {
      display: flex;
      gap: 8px;
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: var(--text-muted);
    }
    .breadcrumb .active { color: var(--brand); }
    .breadcrumb .separator { opacity: 0.3; }

    .mono-id { 
      font-family: var(--font-mono, monospace); 
      color: var(--brand); 
      font-weight: 900;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .currency-value { color: #fff; font-weight: 700; font-family: var(--font-display); }
    .overdue { color: var(--danger); font-weight: 800; }

    .row-actions { display: flex; gap: 6px; }
    
    .action-btn { 
      background: var(--bg-tertiary); 
      border: 1px solid var(--border-soft); 
      color: var(--text-secondary); 
      cursor: pointer; 
      width: 34px;
      height: 34px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition-base);
    }
    
    .action-btn:hover { 
      color: #fff; 
      border-color: var(--brand);
      background: var(--brand-muted);
      transform: translateY(-2px);
    }

    .action-btn.success:hover { background: var(--success); border-color: var(--success); }

    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: rgba(0, 0, 0, 0.1);
      border-top: 1px solid var(--border-soft);
    }

    .table-info { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); letter-spacing: 0.1em; }

    .mr-2 { margin-right: 8px; }

    @media (max-width: 900px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
      .page-title { font-size: 1.8rem; }
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

  ngOnInit() {
    this.store.loadBudgets();
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

