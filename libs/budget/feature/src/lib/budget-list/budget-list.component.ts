import { Component, inject, OnInit, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BudgetStore } from '@josanz-erp/budget-data-access';
import { UiTableComponent, UiCardComponent, UiButtonComponent, UiBadgeComponent, UiStatCardComponent } from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';
import { LucideAngularModule } from 'lucide-angular';
import { BUDGET_FEATURE_CONFIG } from '../budget-feature.config';

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
    <div class="page-container animate-fade-in" [class.high-perf]="pluginStore.highPerformanceMode()">
      <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
        <div class="header-main">
          <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '66'">
            Gestión Comercial & Presupuestos
          </h1>
          <div class="breadcrumb">
            <span class="active" [style.color]="currentTheme().primary">PIPELINE DE VENTAS</span>
            <span class="separator">/</span>
            <span>CENTRO DE OPERACIONES</span>
          </div>
        </div>
        @if (config.enableCreate) {
          <ui-josanz-button variant="glass" size="md" routerLink="/budgets/create" icon="plus">
            NUEVO PRESUPUESTO
          </ui-josanz-button>
        }
      </header>

      <div class="stats-row">
        <ui-josanz-stat-card 
          label="Pipeline Total" 
          [value]="formatCurrencyEu(totalPipeline())" 
          icon="pie-chart" 
          [accent]="true">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Cerrados (Mes)" 
          [value]="formatCurrencyEu(totalAccepted())" 
          icon="check-square" 
          [trend]="8">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Cotizaciones en Curso" 
          [value]="pendingCount().toString()" 
          icon="clock">
        </ui-josanz-stat-card>
      </div>

      <ui-josanz-card variant="glass" class="table-card" [class.neon-glow]="!pluginStore.highPerformanceMode()">
        <ui-josanz-table [columns]="columns" [data]="store.budgets()" variant="default">
          <ng-template #cellTemplate let-item let-key="key">
            @switch (key) {
              @case ('id') { 
                <span class="mono-id text-uppercase" [style.color]="currentTheme().primary">
                  #{{ item.id.slice(0, 8) }}
                </span> 
              }
              @case ('status') { 
                <ui-josanz-badge [variant]="getStatusVariant(item.status)">
                  {{ item.status | uppercase }}
                </ui-josanz-badge>
              }
              @case ('total') { <span class="currency-value">{{ item.total | currency:'EUR' }}</span> }
              @case ('createdAt') { <span class="text-secondary font-mono">{{ item.createdAt | date:'dd/MM/yyyy' }}</span> }
              @case ('actions') {
                <div class="row-actions">
                  <ui-josanz-button variant="ghost" size="sm" icon="eye" [routerLink]="['/budgets', item.id]"></ui-josanz-button>
                  <ui-josanz-button variant="ghost" size="sm" icon="pencil" [routerLink]="['/budgets', item.id, 'edit']"></ui-josanz-button>
                  @if (config.enableDownload) {
                    <ui-josanz-button variant="ghost" size="sm" icon="download" class="btn-success-overlay"></ui-josanz-button>
                  }
                </div>
              }
              @default { {{ item[key] }} }
            }
          </ng-template>
        </ui-josanz-table>
        
        <footer class="table-footer" [style.background]="currentTheme().primary + '05'">
          <div class="table-info">
            {{ store.budgets().length }} DOCUMENTOS EN VISTA ACTUAL
          </div>
        </footer>
      </ui-josanz-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 0; max-width: 1600px; margin: 0 auto; }
    
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-end;
      margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .glow-text { 
      font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0; 
      letter-spacing: 0.05em; font-family: var(--font-main);
    }
    
    .breadcrumb {
      display: flex; gap: 8px; font-size: 0.6rem; font-weight: 700;
      letter-spacing: 0.1em; color: var(--text-muted); margin-top: 0.5rem;
    }

    .stats-row { 
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; 
    }

    .mono-id { 
      font-family: var(--font-mono, monospace); font-weight: 900; font-size: 0.75rem; letter-spacing: 0.05em;
    }

    .currency-value { color: #fff; font-weight: 700; font-family: var(--font-main); font-size: 0.8rem; }
    .row-actions { display: flex; gap: 4px; }
    
    /* Table Luxe Refinement */
    .table-card { border-radius: 16px; overflow: hidden; }
    .neon-glow { box-shadow: 0 0 40px rgba(0, 0, 0, 0.4), inset 0 0 1px rgba(255, 255, 255, 0.1); }

    .table-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.75rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.05);
    }

    .table-info { font-size: 0.6rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.06em; }

    @media (max-width: 1024px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
      .stats-row { grid-template-columns: 1fr; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetListComponent implements OnInit {
  public readonly store = inject(BudgetStore);
  public readonly config = inject(BUDGET_FEATURE_CONFIG);
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  
  currentTheme = this.themeService.currentThemeData;
  columns = this.config.defaultColumns;

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
}

