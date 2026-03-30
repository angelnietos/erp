import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BudgetStore } from '@josanz-erp/budget-data-access';
import { UiTableComponent, UiCardComponent, UiButtonComponent, UiBadgeComponent } from '@josanz-erp/shared-ui-kit';
import { LucideAngularModule, Plus, FileText, Download } from 'lucide-angular';
import { BUDGET_FEATURE_CONFIG } from '../budget-feature.config';

@Component({
  selector: 'lib-budget-list',
  standalone: true,
  imports: [CommonModule, RouterModule, UiTableComponent, UiCardComponent, UiButtonComponent, UiBadgeComponent, LucideAngularModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="glow-text">Terminal de Presupuestos</h1>
          <p class="subtitle">Ingeniería de cotizaciones, reservas técnicas y planificación fiscal</p>
        </div>
        @if (config.enableCreate) {
          <ui-josanz-button variant="primary" routerLink="/budgets/create">
            <lucide-icon name="plus" class="mr-2"></lucide-icon>
            Diseñar Nuevo Presupuesto
          </ui-josanz-button>
        }
      </div>

      <ui-josanz-card variant="glass" class="table-card">
        <ui-josanz-table [columns]="columns" [data]="store.budgets()" variant="hover">
          <ng-template #cellTemplate let-item let-key="key">
            @switch (key) {
              @case ('id') { <span class="mono-id">#{{ item.id.slice(0, 8) }}</span> }
              @case ('status') { 
                <ui-josanz-badge [variant]="getStatusVariant(item.status)">
                  {{ item.status | uppercase }}
                </ui-josanz-badge>
              }
              @case ('total') { <span class="amount-text">{{ item.total | currency:'EUR' }}</span> }
              @case ('createdAt') { <span class="date-text">{{ item.createdAt | date:'dd/MM/yyyy' }}</span> }
              @case ('startDate') { <span class="date-text">{{ item.startDate | date:'dd/MM/yyyy' }}</span> }
              @case ('endDate') { <span class="date-text">{{ item.endDate | date:'dd/MM/yyyy' }}</span> }
              @case ('actions') {
                <div class="actions">
                  <button class="action-trigger" title="Ver detalle">
                    <lucide-icon name="file-text" size="18"></lucide-icon>
                  </button>
                  @if (config.enableDownload) {
                    <button class="action-trigger" title="Descargar PDF">
                      <lucide-icon name="download" size="18"></lucide-icon>
                    </button>
                  }
                </div>
              }
              @default { {{ item[key] }} }
            }
          </ng-template>
        </ui-josanz-table>
      </ui-josanz-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; }
    
    .page-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 2.5rem; 
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-soft);
    }
    
    .glow-text { 
      font-size: 2.5rem; 
      font-weight: 900; 
      color: #fff; 
      margin: 0; 
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-family: var(--font-display);
      text-shadow: 0 0 20px var(--brand-glow);
    }
    
    .subtitle { margin: 0.5rem 0 0 0; color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; }

    .mono-id { 
      font-family: var(--font-mono, monospace); 
      color: var(--brand); 
      font-weight: 900;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .amount-text { color: #fff; font-weight: 800; font-family: var(--font-display); font-size: 1rem; }
    .date-text { color: var(--text-muted); font-size: 0.85rem; font-weight: 600; }

    .actions { display: flex; gap: 8px; }
    
    .action-trigger { 
      background: var(--bg-tertiary); 
      border: 1px solid var(--border-soft); 
      color: var(--text-muted); 
      cursor: pointer; 
      width: 32px;
      height: 32px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    
    .action-trigger:hover { 
      color: #fff; 
      border-color: var(--brand);
      background: var(--bg-secondary);
      box-shadow: 0 0 10px var(--brand-glow);
    }

    .mr-2 { margin-right: 8px; }

    @media (max-width: 900px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
      .glow-text { font-size: 1.8rem; }
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
}

