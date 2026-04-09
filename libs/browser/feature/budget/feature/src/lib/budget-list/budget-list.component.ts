import { Component, inject, OnInit, OnDestroy, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiTableComponent, UiCardComponent, UiButtonComponent, UiBadgeComponent, UiStatCardComponent, UiSearchComponent } from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore, MasterFilterService, FilterableService } from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { BudgetStore } from '@josanz-erp/budget-data-access';
import { Budget } from '@josanz-erp/budget-api';
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
    UiSearchComponent,
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
          <ui-button variant="app" size="md" routerLink="/budgets/create" icon="plus">
            NUEVO PRESUPUESTO
          </ui-button>
        }
      </header>

      <div class="stats-row">
        <ui-stat-card 
          label="Pipeline Total" 
          [value]="formatCurrencyEu(totalPipeline())" 
          icon="pie-chart" 
          [accent]="true">
        </ui-stat-card>
        <ui-stat-card 
          label="Cerrados (Mes)" 
          [value]="formatCurrencyEu(totalAccepted())" 
          icon="check-square" 
          [trend]="8">
        </ui-stat-card>
        <ui-stat-card 
          label="Cotizaciones en Curso" 
          [value]="pendingCount().toString()" 
          icon="clock">
        </ui-stat-card>
      </div>

      <div class="navigation-bar ui-glass-panel">
        <div class="nav-spacer"></div>
        <ui-search 
          variant="filled"
          placeholder="BUSCAR ID O CLIENTE..." 
          (searchChange)="onSearch($event)"
          class="search-bar"
        ></ui-search>
      </div>

      <ui-card variant="glass" class="table-card" [class.neon-glow]="!pluginStore.highPerformanceMode()">
        <ui-table [columns]="columns" [data]="filteredBudgets()" variant="default">
          <ng-template #cellTemplate let-item let-key="key">
            @switch (key) {
              @case ('id') { 
                <span class="mono-id text-uppercase" [style.color]="currentTheme().primary">
                  #{{ item.id.slice(0, 8) }}
                </span> 
              }
              @case ('status') { 
                <ui-badge [variant]="getStatusVariant(item.status)">
                  {{ item.status | uppercase }}
                </ui-badge>
              }
              @case ('total') { <span class="currency-value">{{ item.total | currency:'EUR' }}</span> }
              @case ('createdAt') { <span class="text-secondary font-mono">{{ item.createdAt | date:'dd/MM/yyyy' }}</span> }
              @case ('actions') {
                <div class="row-actions">
                  <ui-button variant="ghost" size="sm" icon="eye" [routerLink]="['/budgets', item.id]"></ui-button>
                  @if (item.status === 'DRAFT') {
                    <ui-button variant="ghost" size="sm" icon="pencil" [routerLink]="['/budgets', item.id, 'edit']"></ui-button>
                  }
                  @if (config.enableDownload) {
                    <ui-button variant="ghost" size="sm" icon="download" class="btn-success-overlay"></ui-button>
                  }
                </div>
              }
              @default { {{ item[key] }} }
            }
          </ng-template>
        </ui-table>
        
        <footer class="table-footer" [style.background]="currentTheme().primary + '05'">
          <div class="table-info">
            {{ store.budgets().length }} DOCUMENTOS EN VISTA ACTUAL
          </div>
        </footer>
      </ui-card>
    </div>

  `,
  styles: [`
    .page-container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; box-sizing: border-box; }
    
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

    .navigation-bar { 
      display: flex; justify-content: space-between; align-items: center; 
      margin-bottom: 1.5rem; padding: 0.5rem 1rem; border-radius: 12px;
      background: rgba(15, 15, 15, 0.4); border: 1px solid rgba(255,255,255,0.05);
    }
    .search-bar { width: 320px; }
    .nav-spacer { flex: 1; }

    @media (max-width: 1024px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
      .stats-row { grid-template-columns: 1fr; }
      .search-bar { width: 100%; }
      .navigation-bar { flex-direction: column; align-items: stretch; gap: 1rem; padding: 1rem; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetListComponent implements OnInit, OnDestroy, FilterableService<Budget> {
  public readonly store = inject(BudgetStore);
  public readonly config = inject(BUDGET_FEATURE_CONFIG);
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly masterFilter = inject(MasterFilterService);
  
  currentTheme = this.themeService.currentThemeData;
  columns = this.config.defaultColumns;
  totalPipeline = computed(() => this.store.budgets().reduce((acc, b) => acc + (b.total || 0), 0));
  totalAccepted = computed(() => this.store.budgets().filter(b => b.status === 'ACCEPTED').reduce((acc, b) => acc + (b.total || 0), 0));
  pendingCount = computed(() => this.store.budgets().filter(b => b.status === 'DRAFT' || b.status === 'SENT').length);

  filteredBudgets = computed(() => {
    const list = this.store.budgets();
    const t = this.masterFilter.query().toLowerCase().trim();
    if (!t) return list;
    return list.filter(b => 
      b.id.toLowerCase().includes(t) || 
      (b.clientId ?? '').toLowerCase().includes(t)
    );
  });

  ngOnInit() {
    this.masterFilter.registerProvider(this);
    this.store.loadBudgets();
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
  }

  onSearch(term: string) {
    this.masterFilter.search(term);
  }

  /** Lógica de filtrado para el MasterFilterService */
  filter(query: string): Observable<Budget[]> {
    const term = query.toLowerCase();
    const matches = this.store.budgets().filter(b => 
      b.id.toLowerCase().includes(term) || 
      (b.clientId ?? '').toLowerCase().includes(term)
    );
    return of(matches);
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

