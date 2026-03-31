import { Component, OnInit, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiTableComponent,
  UiButtonComponent,
  UiSearchComponent,
  UiPaginationComponent,
  UiBadgeComponent,
  UiLoaderComponent,
  UiTabsComponent,
  UiCardComponent,
  UiStatCardComponent,
} from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';
import { Rental, RentalService } from '@josanz-erp/rentals-data-access';

@Component({
  selector: 'lib-rentals-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    UiTableComponent, 
    UiButtonComponent, 
    UiSearchComponent, 
    UiPaginationComponent, 
    UiBadgeComponent,
    UiLoaderComponent,
    UiTabsComponent,
    UiCardComponent,
    UiStatCardComponent,
    LucideAngularModule
  ],
  template: `
    <div class="page-container animate-fade-in" [class.high-perf]="pluginStore.highPerformanceMode()">
      <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
        <div class="header-breadcrumb">
          <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '66'">
            Arrendamientos & Alquileres
          </h1>
          <div class="breadcrumb">
            <span class="active" [style.color]="currentTheme().primary">GESTIÓN OPERATIVA</span>
            <span class="separator">/</span>
            <span>MONITOREO DE ALQUILERES</span>
          </div>
        </div>
        <div class="header-actions">
          <ui-josanz-button variant="app" size="md" (clicked)="openCreateModal()" icon="plus">
            NUEVO EXPEDIENTE
          </ui-josanz-button>
        </div>
      </header>

      <div class="stats-row">
        <ui-josanz-stat-card 
          label="Expedientes Activos" 
          [value]="activeCount().toString()" 
          icon="play-circle" 
          [accent]="true">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Pendientes Inicio" 
          [value]="draftCount().toString()" 
          icon="clock" 
          [trend]="1">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Facturación Ciclo" 
          [value]="formatCurrencyEu(totalRevenue())" 
          icon="trending-up">
        </ui-josanz-stat-card>
      </div>

      <div class="navigation-bar ui-glass-panel">
        <ui-josanz-tabs 
          [tabs]="tabs" 
          [activeTab]="activeTab()" 
          variant="underline" 
          (tabChange)="onTabChange($event)"
        ></ui-josanz-tabs>
        
        <ui-josanz-search 
          variant="filled"
          placeholder="BUSCAR EXPEDIENTE O CLIENTE..." 
          (searchChange)="onSearch($event)"
          class="search-bar"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <div class="loader-container">
          <ui-josanz-loader message="SINCRONIZANDO REGISTROS DE OPERACIÓN..."></ui-josanz-loader>
        </div>
      } @else {
        <ui-josanz-card variant="glass" class="table-card" [class.neon-glow]="!pluginStore.highPerformanceMode()">
          <ui-josanz-table [columns]="columns" [data]="displayedRentals()" variant="default">
            <ng-template #cellTemplate let-rental let-key="key">
              @switch (key) {
                @case ('id') {
                  <a [routerLink]="['/rentals', rental.id]" class="rental-link" [style.color]="currentTheme().primary">
                    #{{ rental.id.slice(0, 8) | uppercase }}
                  </a>
                }
                @case ('status') {
                  <ui-josanz-badge [variant]="getStatusVariant(rental.status)">
                    {{ getStatusLabel(rental.status) | uppercase }}
                  </ui-josanz-badge>
                }
                @case ('totalAmount') {
                  <span class="currency-value">{{ rental.totalAmount | currency:'EUR' }}</span>
                }
                @case ('actions') {
                  <div class="row-actions">
                    <ui-josanz-button variant="ghost" size="sm" icon="eye" [routerLink]="['/rentals', rental.id]"></ui-josanz-button>
                    @if (rental.status === 'DRAFT') {
                      <ui-josanz-button variant="ghost" size="sm" icon="play" (clicked)="activateRental(rental)" [style.color]="currentTheme().success"></ui-josanz-button>
                    }
                    <ui-josanz-button variant="ghost" size="sm" icon="pencil" (clicked)="editRental(rental)"></ui-josanz-button>
                  </div>
                }
                @default {
                  {{ rental[key] }}
                }
              }
            </ng-template>
          </ui-josanz-table>

          <footer class="table-footer" [style.background]="currentTheme().primary + '05'">
            <div class="table-info uppercase">
              {{ displayedRentals().length }} EXPEDIENTES EN LISTADO ACTUAL
            </div>
            <ui-josanz-pagination 
              [currentPage]="currentPage()" 
              [totalPages]="totalPages()"
              variant="default"
              (pageChange)="onPageChange($event)"
            ></ui-josanz-pagination>
          </footer>
        </ui-josanz-card>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 0; max-width: 100%; margin: 0 auto; }
    
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

    .navigation-bar { 
      display: flex; justify-content: space-between; align-items: center; 
      margin-bottom: 1.5rem; padding: 0.25rem 1rem; border-radius: 12px;
      background: rgba(15, 15, 15, 0.4); border: 1px solid rgba(255,255,255,0.05);
    }

    .search-bar { width: 320px; }
    
    /* Table Luxe Refinement */
    .table-card { border-radius: 16px; overflow: hidden; }
    .neon-glow { box-shadow: 0 0 40px rgba(0, 0, 0, 0.4), inset 0 0 1px rgba(255, 255, 255, 0.1); }

    .rental-link { 
      text-decoration: none; font-weight: 800; font-family: var(--font-mono); font-size: 0.75rem;
      letter-spacing: 0.05em; transition: 0.2s;
    }
    .rental-link:hover { color: #fff !important; text-shadow: 0 0 10px var(--brand-glow); }
    
    .currency-value { color: #fff; font-weight: 700; font-size: 0.8rem; }
    .row-actions { display: flex; gap: 4px; }
    
    .table-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.75rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.05);
    }

    @media (max-width: 1024px) {
      .stats-row { grid-template-columns: 1fr; }
      .navigation-bar { flex-direction: column; align-items: stretch; gap: 1rem; padding: 1rem; }
      .search-bar { width: 100%; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalsListComponent implements OnInit {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly rentalService = inject(RentalService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  currentTheme = this.themeService.currentThemeData;

  tabs = [
    { id: 'all', label: 'Todos', badge: 0 },
    { id: 'DRAFT', label: 'Borrador', badge: 0 },
    { id: 'ACTIVE', label: 'Activos', badge: 0 },
    { id: 'COMPLETED', label: 'Completados', badge: 0 },
  ];

  columns = [
    { key: 'id', header: 'REFERENCIA', width: '120px' },
    { key: 'clientName', header: 'CLIENTE' },
    { key: 'startDate', header: 'INICIO', width: '120px' },
    { key: 'endDate', header: 'FIN', width: '120px' },
    { key: 'itemsCount', header: 'UNIDADES', width: '80px' },
    { key: 'totalAmount', header: 'IMPORTE', width: '120px' },
    { key: 'status', header: 'ESTADO', width: '120px' },
    { key: 'actions', header: '', width: '100px' },
  ];

  rentals = signal<Rental[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  activeTab = signal('all');
  searchFilter = signal('');
  
  isModalOpen = signal(false);
  editingRental = signal<Rental | null>(null);
  
  formData: Partial<Rental> = {
    clientName: '', status: 'DRAFT', startDate: '', endDate: '', itemsCount: 0, totalAmount: 0
  };

  ngOnInit() {
    this.loadRentals();
    if (this.route.snapshot.queryParamMap.get('openCreate')) {
      queueMicrotask(() => this.openCreateModal());
    }
  }

  loadRentals() {
    this.isLoading.set(true);
    this.rentalService.getRentals().subscribe({
      next: (list) => {
        this.rentals.set(list);
        this.updateTabs(list);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  updateTabs(list: Rental[]) {
    const counts = {
      all: list.length,
      DRAFT: list.filter(r => r.status === 'DRAFT').length,
      ACTIVE: list.filter(r => r.status === 'ACTIVE').length,
      COMPLETED: list.filter(r => r.status === 'COMPLETED').length,
    };
    this.tabs = this.tabs.map(t => ({ ...t, badge: (counts as Record<string, number>)[t.id] || 0 }));
  }

  onTabChange(id: string) { this.activeTab.set(id); }
  onSearch(term: string) { this.searchFilter.set(term); }
  onPageChange(p: number) { this.currentPage.set(p); this.loadRentals(); }

  openCreateModal() {
    this.editingRental.set(null);
    this.formData = { clientName: '', status: 'DRAFT', startDate: new Date().toISOString().split('T')[0], itemsCount: 0, totalAmount: 0 };
    this.isModalOpen.set(true);
  }

  editRental(rental: Rental) {
    this.editingRental.set(rental);
    this.formData = { ...rental };
    this.isModalOpen.set(true);
  }

  closeModal() { this.isModalOpen.set(false); this.editingRental.set(null); }

  saveRental() {
    if (!this.formData.clientName) return;
    const toEdit = this.editingRental();
    if (toEdit) {
      this.rentalService.updateRental(toEdit.id, this.formData).subscribe({
        next: (upd) => {
          this.rentals.update(list => list.map(r => r.id === upd.id ? upd : r));
          this.closeModal();
        }
      });
    } else {
      this.rentalService.createRental(this.formData as Omit<Rental, 'id' | 'createdAt'>).subscribe({
        next: (newR) => {
          this.rentals.update(list => [...list, newR]);
          this.closeModal();
        }
      });
    }
  }

  activateRental(rental: Rental) {
    this.rentalService.activateRental(rental.id).subscribe({
      next: (upd) => this.rentals.update(list => list.map(r => r.id === upd.id ? upd : r))
    });
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'error' | 'default' {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'info';
      case 'DRAFT': return 'warning';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'DRAFT': return 'Borrador';
      case 'ACTIVE': return 'Activo';
      case 'COMPLETED': return 'Completado';
      default: return status;
    }
  }

  formatCurrencyEu(amount: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  }

  activeCount = computed(() => this.rentals().filter(r => r.status === 'ACTIVE').length);
  draftCount = computed(() => this.rentals().filter(r => r.status === 'DRAFT').length);
  totalRevenue = computed(() => this.rentals().filter(r => r.status === 'ACTIVE' || r.status === 'COMPLETED').reduce((acc, r) => acc + r.totalAmount, 0));

  displayedRentals = computed(() => {
    let list = this.rentals();
    const tab = this.activeTab();
    if (tab !== 'all') list = list.filter((r) => r.status === tab);
    const s = this.searchFilter().trim().toLowerCase();
    if (s) list = list.filter((r) => (r.clientName || '').toLowerCase().includes(s) || r.id.toLowerCase().includes(s));
    return list;
  });
}
