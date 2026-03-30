import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BudgetStore } from '@josanz-erp/budget-data-access';
import { UiTableComponent, UiCardComponent, UiButtonComponent } from '@josanz-erp/shared-ui-kit';
import { LucideAngularModule, Plus, FileText, Download } from 'lucide-angular';
import { BUDGET_FEATURE_CONFIG } from '../budget-feature.config';

@Component({
  selector: 'lib-budget-list',
  standalone: true,
  imports: [CommonModule, RouterModule, UiTableComponent, UiCardComponent, UiButtonComponent, LucideAngularModule],
  template: `
    <div class="page-header">
      <div class="titles">
        <h1 class="glow-text">Presupyectos</h1>
        <p class="subtitle">Gestiona cotizaciones y rango de reserva para eventos</p>
      </div>
      @if (config.enableCreate) {
        <ui-josanz-button variant="primary" routerLink="/budgets/create">
          <lucide-icon [name]="Plus" class="mr-2"></lucide-icon>
          Nuevo Presupuesto
        </ui-josanz-button>
      }
    </div>

    <ui-josanz-card title="Historial de Presupuestos" variant="glass" icon="receipt">
      <ui-josanz-table [columns]="columns" [data]="store.budgets()" variant="hover">
        <ng-template #cellTemplate let-item let-key="key">
          @switch (key) {
            @case ('id') { <span class="mono-id">#{{ item.id.slice(0, 8) }}</span> }
            @case ('status') { 
              <span class="status-badge" [class]="item.status.toLowerCase()">
                <span class="dot"></span>
                {{ item.status }}
              </span> 
            }
            @case ('total') { <strong class="price-tag">{{ item.total | currency:'EUR' }}</strong> }
            @case ('createdAt') { <span class="date-text">{{ item.createdAt | date:'dd/MM/yyyy' }}</span> }
            @case ('startDate') { {{ item.startDate | date:'dd/MM/yyyy' }} }
            @case ('endDate') { {{ item.endDate | date:'dd/MM/yyyy' }} }
            @case ('actions') {
              <div class="actions">
                <button class="action-trigger" title="Ver detalle">
                  <lucide-icon [name]="FileText" size="18"></lucide-icon>
                </button>
                @if (config.enableDownload) {
                  <button class="action-trigger" title="Descargar PDF">
                    <lucide-icon [name]="Download" size="18"></lucide-icon>
                  </button>
                }
              </div>
            }
            @default { {{ item[key] }} }
          }
        </ng-template>
      </ui-josanz-table>
    </ui-josanz-card>
  `,
  styles: [`
    .page-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 2.5rem; 
      padding: 1rem 0;
      border-bottom: 1px solid var(--border-soft);
    }
    .titles { display: flex; flex-direction: column; gap: 4px; }
    
    .glow-text { 
      font-size: 2rem; 
      font-weight: 900; 
      color: #fff; 
      margin: 0; 
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-family: var(--font-display);
      text-shadow: 0 0 20px var(--brand-glow);
    }
    
    .subtitle { 
      color: var(--text-secondary); 
      margin: 0; 
      font-size: 0.9rem;
      font-weight: 500;
      letter-spacing: 0.02em;
    }

    .mono-id { 
      font-family: var(--font-mono, monospace); 
      color: var(--brand); 
      font-weight: 700;
      font-size: 0.8rem;
    }

    .price-tag {
      color: #fff;
      font-family: var(--font-display);
      font-variant-numeric: tabular-nums;
    }

    .date-text {
      color: var(--text-secondary);
      font-size: 0.85rem;
    }

    .status-badge { 
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px; 
      border-radius: 4px; 
      font-size: 0.7rem; 
      font-weight: 800; 
      text-transform: uppercase; 
      letter-spacing: 0.05em;
      border: 1px solid transparent;
      background: rgba(255, 255, 255, 0.05);
    }

    .dot { width: 6px; height: 6px; border-radius: 50%; }

    .status-badge.draft { border-color: var(--border-soft); color: var(--text-muted); }
    .status-badge.draft .dot { background: var(--text-muted); }

    .status-badge.accepted { 
      border-color: var(--success); 
      color: var(--success); 
      background: rgba(16, 185, 129, 0.1);
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
    }
    .status-badge.accepted .dot { background: var(--success); box-shadow: 0 0 5px var(--success); }

    .status-badge.sent { 
      border-color: var(--info); 
      color: var(--info); 
      background: rgba(14, 165, 233, 0.1);
    }
    .status-badge.sent .dot { background: var(--info); }

    .status-badge.rejected { 
      border-color: var(--danger); 
      color: var(--danger); 
      background: rgba(239, 68, 68, 0.1);
    }
    .status-badge.rejected .dot { background: var(--danger); }

    .actions { display: flex; gap: 12px; justify-content: flex-end; }
    
    .action-trigger { 
      background: var(--bg-tertiary); 
      border: 1px solid var(--border-soft); 
      color: var(--text-muted); 
      cursor: pointer; 
      width: 34px;
      height: 34px;
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
      transform: translateY(-2px);
    }

    .mr-2 { margin-right: 8px; }

    @media (max-width: 900px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
      .glow-text { font-size: 1.5rem; }
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
}

