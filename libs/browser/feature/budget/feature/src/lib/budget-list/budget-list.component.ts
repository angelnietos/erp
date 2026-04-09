import { Component, inject, OnInit, OnDestroy, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  UiButtonComponent,
  UiSearchComponent,
  UiBadgeComponent,
  UiStatCardComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
} from '@josanz-erp/shared-ui-kit';
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
    UiButtonComponent, 
    UiBadgeComponent, 
    UiStatCardComponent,
    UiSearchComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    LucideAngularModule
  ],
  template: `
    <div class="budgets-container">
      <ui-feature-header
        title="Presupuestos"
        subtitle="Gestión comercial y pipeline de ventas"
        icon="file-text"
        actionLabel="NUEVO PRESUPUESTO"
        routerLink="/budgets/create"
      ></ui-feature-header>

      <ui-feature-stats>
        <ui-stat-card 
          label="Pipeline Total" 
          [value]="formatCurrencyEu(totalPipeline())" 
          icon="bar-chart" 
          [accent]="true">
        </ui-stat-card>
        <ui-stat-card 
          label="Cerrados (Mes)" 
          [value]="formatCurrencyEu(totalAccepted())" 
          icon="check-circle" 
          [trend]="8">
        </ui-stat-card>
        <ui-stat-card 
          label="Cotizaciones en Curso" 
          [value]="pendingCount().toString()" 
          icon="clock">
        </ui-stat-card>
        <ui-stat-card
          label="Tasa de Cierre"
          value="64%"
          icon="trending-up"
          [accent]="false"
        ></ui-stat-card>
      </ui-feature-stats>

      <div class="filters-bar">
        <ui-search 
          variant="glass"
          placeholder="BUSCAR ID O CLIENTE..." 
          (searchChange)="onSearch($event)"
          class="flex-1"
        ></ui-search>
      </div>

      <ui-feature-grid>
        @for (item of filteredBudgets(); track item.id) {
          <ui-feature-card
            [name]="'# ' + (item.id.slice(0, 8) | uppercase)"
            [subtitle]="(item.clientId || 'Sin cliente') | uppercase"
            [avatarInitials]="getInitials(item.id)"
            [avatarBackground]="getStatusGradient(item.status)"
            [status]="item.status === 'ACCEPTED' ? 'active' : 'offline'"
            [badgeLabel]="item.status | uppercase"
            [badgeVariant]="getStatusVariant(item.status)"
            (cardClicked)="onRowClick(item)"
            [routerLink]="['/budgets', item.id]"
            [footerItems]="[
              { icon: 'calendar', label: item.createdAt | date:'dd/MM/yyyy' },
              { icon: 'euro', label: item.total | currency:'EUR' }
            ]"
          >
            <div footer-extra class="card-actions">
               <ui-button variant="ghost" size="sm" icon="eye" [routerLink]="['/budgets', item.id]"></ui-button>
               @if (item.status === 'DRAFT') {
                 <ui-button variant="ghost" size="sm" icon="pencil" [routerLink]="['/budgets', item.id, 'edit']"></ui-button>
               }
               @if (config.enableDownload) {
                 <ui-button variant="ghost" size="sm" icon="download" class="text-success"></ui-button>
               }
            </div>
          </ui-feature-card>
        } @empty {
          <div class="empty-state">
            <lucide-icon name="file-text" size="64" class="empty-icon"></lucide-icon>
            <h3>No hay presupuestos</h3>
            <p>Comienza creando tu primera cotización para un cliente.</p>
            <ui-button variant="solid" routerLink="/budgets/create" icon="CirclePlus">Crear presupuesto</ui-button>
          </div>
        }
      </ui-feature-grid>
    </div>
  `,
  styles: [`
    .budgets-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .filters-bar {
      margin-bottom: 2rem;
      background: var(--surface);
      padding: 0.75rem 1.5rem;
      border-radius: 16px;
      border: 1px solid var(--border-soft);
      display: flex;
    }

    .flex-1 { flex: 1; }

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
       .filters-bar { padding: 1rem; }
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

  onRowClick(item: Budget) {
    // Navigate
  }

  getInitials(id: string): string {
    return id.slice(0, 2).toUpperCase();
  }

  getStatusGradient(status: string): string {
    switch (status.toLowerCase()) {
      case 'accepted': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'sent': return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'rejected': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'draft': return 'linear-gradient(135deg, #6b7280, #374151)';
      default: return 'linear-gradient(135deg, #f59e0b, #d97706)';
    }
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

