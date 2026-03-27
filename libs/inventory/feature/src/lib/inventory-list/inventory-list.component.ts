import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiTableComponent, UiButtonComponent, UiSearchComponent, UiPaginationComponent, UiBadgeComponent, UiLoaderComponent, UiTabsComponent, TabItem } from '@josanz-erp/shared-ui-kit';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  status: 'available' | 'reserved' | 'maintenance' | 'retired';
  dailyRate: number;
  imageUrl?: string;
}

@Component({
  selector: 'lib-inventory-list',
  standalone: true,
  imports: [CommonModule, RouterModule, UiTableComponent, UiButtonComponent, UiSearchComponent, UiPaginationComponent, UiBadgeComponent, UiLoaderComponent, UiTabsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Inventario</h1>
          <p class="subtitle">Gestiona el stock de equipos y materiales</p>
        </div>
        <ui-josanz-button icon="plus" (clicked)="openCreateModal()">
          Nuevo Producto
        </ui-josanz-button>
      </div>

      <ui-josanz-tabs [tabs]="tabs" [activeTab]="activeTab()" (tabChange)="onTabChange($event)"></ui-josanz-tabs>

      <div class="filters-bar">
        <ui-josanz-search 
          placeholder="Buscar productos..." 
          (searchChange)="onSearch($event)"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <ui-josanz-loader message="Cargando inventario..."></ui-josanz-loader>
      } @else {
        <ui-josanz-table [columns]="columns" [data]="products()">
          <ng-template #cellTemplate let-product let-key="key">
            @switch (key) {
              @case ('name') {
                <a [routerLink]="['/inventory', product.id]" class="product-link">
                  {{ product.name }}
                </a>
              }
              @case ('status') {
                <ui-josanz-badge [variant]="getStatusVariant(product.status)">
                  {{ getStatusLabel(product.status) }}
                </ui-josanz-badge>
              }
              @case ('totalStock') {
                <div class="stock-info">
                  <span class="total">{{ product.totalStock }}</span>
                  @if (product.reservedStock > 0) {
                    <span class="reserved">({{ product.reservedStock }} reserv.)</span>
                  }
                </div>
              }
              @case ('dailyRate') {
                {{ product.dailyRate | currency:'EUR' }}/día
              }
              @case ('actions') {
                <div class="actions">
                  <button class="action-btn" [routerLink]="['/inventory', product.id]" title="Ver">
                    <i-lucide name="eye"></i-lucide>
                  </button>
                  <button class="action-btn" title="Editar">
                    <i-lucide name="pencil"></i-lucide>
                  </button>
                </div>
              }
              @default {
                {{ product[key] }}
              }
            }
          </ng-template>
        </ui-josanz-table>

        <ui-josanz-pagination 
          [currentPage]="currentPage()" 
          [totalPages]="totalPages()"
          (pageChange)="onPageChange($event)"
        ></ui-josanz-pagination>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px;
    }
    .header-content h1 { margin: 0 0 4px 0; color: white; font-size: 28px; font-weight: 700; }
    .subtitle { margin: 0; color: #94A3B8; font-size: 14px; }
    .filters-bar { display: flex; gap: 16px; margin: 20px 0; }
    .product-link { color: #4F46E5; text-decoration: none; font-weight: 500; }
    .product-link:hover { text-decoration: underline; }
    .stock-info { display: flex; align-items: center; gap: 8px; }
    .stock-info .total { color: white; font-weight: 600; }
    .stock-info .reserved { color: #EAB308; font-size: 12px; }
    .actions { display: flex; gap: 8px; }
    .action-btn {
      background: none; border: none; padding: 6px; cursor: pointer;
      color: #94A3B8; border-radius: 6px; transition: all 0.2s;
    }
    .action-btn:hover { background: rgba(255,255,255,0.1); color: white; }
  `],
})
export class InventoryListComponent implements OnInit {
  tabs: TabItem[] = [
    { id: 'all', label: 'Todos', badge: 0 },
    { id: 'available', label: 'Disponibles', badge: 0 },
    { id: 'reserved', label: 'Reservados', badge: 0 },
    { id: 'maintenance', label: 'Mantenimiento', badge: 0 },
  ];

  columns = [
    { key: 'name', header: 'Producto' },
    { key: 'sku', header: 'SKU', width: '120px' },
    { key: 'category', header: 'Categoría', width: '120px' },
    { key: 'totalStock', header: 'Stock', width: '100px' },
    { key: 'dailyRate', header: 'Tarifa/Día', width: '120px' },
    { key: 'status', header: 'Estado', width: '130px' },
    { key: 'actions', header: '', width: '100px' },
  ];

  products = signal<Product[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  activeTab = signal('all');
  searchTerm = '';

  ngOnInit() {
    this.loadProducts();
    this.updateTabs();
  }

  loadProducts() {
    this.isLoading.set(true);
    setTimeout(() => {
      this.products.set([
        {
          id: 'prod-001',
          name: 'Cámara Sony FX6',
          sku: 'CAM-FX6-001',
          category: 'Cámaras',
          totalStock: 5,
          availableStock: 3,
          reservedStock: 2,
          status: 'available',
          dailyRate: 500,
        },
        {
          id: 'prod-002',
          name: 'Iluminación LED Aputure 600d',
          sku: 'LED-APU-002',
          category: 'Iluminación',
          totalStock: 8,
          availableStock: 8,
          reservedStock: 0,
          status: 'available',
          dailyRate: 150,
        },
        {
          id: 'prod-003',
          name: 'Trípode Sachtler Video 18',
          sku: 'TRP-SAC-003',
          category: 'Soportes',
          totalStock: 12,
          availableStock: 10,
          reservedStock: 2,
          status: 'available',
          dailyRate: 50,
        },
        {
          id: 'prod-004',
          name: 'Micrófono Rode NTG5',
          sku: 'MIC-ROD-004',
          category: 'Audio',
          totalStock: 6,
          availableStock: 6,
          reservedStock: 0,
          status: 'maintenance',
          dailyRate: 75,
        },
      ]);
      this.isLoading.set(false);
      this.totalPages.set(1);
    }, 500);
  }

  updateTabs() {
    const all = this.products().length;
    const available = this.products().filter(p => p.status === 'available').length;
    const reserved = this.products().filter(p => p.reservedStock > 0).length;
    const maintenance = this.products().filter(p => p.status === 'maintenance').length;

    this.tabs = [
      { id: 'all', label: 'Todos', badge: all },
      { id: 'available', label: 'Disponibles', badge: available },
      { id: 'reserved', label: 'Reservados', badge: reserved },
      { id: 'maintenance', label: 'Mantenimiento', badge: maintenance },
    ];
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'default' {
    switch (status) {
      case 'available': return 'success';
      case 'reserved': return 'warning';
      case 'maintenance': return 'info';
      case 'retired': return 'default';
      default: return 'default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'available': return 'Disponible';
      case 'reserved': return 'Reservado';
      case 'maintenance': return 'Mantenimiento';
      case 'retired': return 'Retirado';
      default: return status;
    }
  }

  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
  }

  onSearch(term: string) {
    this.searchTerm = term;
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadProducts();
  }

  openCreateModal() {
    // TODO
  }
}