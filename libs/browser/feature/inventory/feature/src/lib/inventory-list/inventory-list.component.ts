import { Component, OnInit, OnDestroy, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiTableComponent,
  UiButtonComponent,
  UiSearchComponent,
  UiPaginationComponent,
  UiBadgeComponent,
  UiLoaderComponent,
  UiModalComponent,
  UiTabsComponent,
  UiCardComponent,
  UiInputComponent,
  UiStatCardComponent,
  UIAIChatComponent
} from '@josanz-erp/shared-ui-kit';
import { Product, InventoryFacade } from '@josanz-erp/inventory-data-access';
import { ThemeService, PluginStore, MasterFilterService, FilterableService } from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';
import { INVENTORY_FEATURE_CONFIG } from '../inventory-feature.config';

@Component({
  selector: 'lib-inventory-list',
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
    UiModalComponent,
    UiTabsComponent,
    UiCardComponent,
    UiInputComponent,
    UiStatCardComponent,
    LucideAngularModule,
    UIAIChatComponent
  ],
  template: `
    <div class="page-container animate-fade-in" [class.high-perf]="pluginStore.highPerformanceMode()">
      <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
        <div class="header-breadcrumb">
          <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '66'">
            Inventario de Activos
          </h1>
          <div class="breadcrumb">
            <span class="active" [style.color]="currentTheme().primary">CENTRO DE RECURSOS</span>
            <span class="separator">/</span>
            <span>MONITOREO GLOBAL</span>
          </div>
        </div>
        <div class="header-actions">
          @if (config.enableCreate) {
            <ui-josanz-button variant="app" size="md" (clicked)="openCreateModal()" icon="plus">
              NUEVO PRODUCTO
            </ui-josanz-button>
          }
        </div>
      </header>

      <div class="stats-row">
        <ui-josanz-stat-card 
          label="Total Equipos" 
          [value]="allProducts().length.toString()" 
          icon="package" 
          [accent]="true">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Stock Crítico" 
          [value]="criticalCount().toString()" 
          icon="alert-octagon" 
          [trend]="-1">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Valoración Flota" 
          [value]="formatCurrencyEu(totalValue())" 
          icon="bar-chart-3">
        </ui-josanz-stat-card>
      </div>

      <div class="navigation-bar ui-glass-panel">
        <ui-josanz-tabs 
          [tabs]="tabs()" 
          [activeTab]="activeTab()" 
          variant="underline" 
          (tabChange)="onTabChange($any($event))"
        ></ui-josanz-tabs>
        
        <ui-josanz-search 
          variant="filled"
          placeholder="BUSCAR EQUIPAMIENTO O SKU..." 
          (searchChange)="onSearch($any($event))"
          class="search-bar"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <div class="loader-container">
          <ui-josanz-loader message="SINCRONIZANDO INVENTARIO GLOBAL..."></ui-josanz-loader>
        </div>
      } @else {
        <ui-josanz-card variant="glass" class="table-card" [class.neon-glow]="!pluginStore.highPerformanceMode()">
          <ui-josanz-table [columns]="columns" [data]="products()" variant="default">
            <ng-template #cellTemplate let-product let-key="key">
              @switch (key) {
                @case ('name') {
                  <div class="product-cell">
                    <div class="product-icon" [style.background]="currentTheme().primary + '15'">
                      <lucide-icon [name]="product.type === 'serialized' ? 'cpu' : 'box'" [size]="14" [style.color]="currentTheme().primary"></lucide-icon>
                    </div>
                    <a [routerLink]="['/inventory', product.id]" class="product-link">
                      {{ product.name | uppercase }}
                    </a>
                  </div>
                }
                @case ('status') {
                  <ui-josanz-badge [variant]="getStatusVariant(product.status)">
                    {{ getStatusLabel(product.status) | uppercase }}
                  </ui-josanz-badge>
                }
                @case ('totalStock') {
                  <div class="stock-info">
                    <span class="val font-mono">{{ product.totalStock }}</span>
                    @if (product.reservedStock > 0) {
                      <span class="res text-warning font-mono" [style.color]="currentTheme().secondary">({{ product.reservedStock }} RES.)</span>
                    }
                  </div>
                }
                @case ('dailyRate') {
                  <span class="price-val font-mono">{{ product.dailyRate | currency:'EUR' }}</span>
                  <small class="unit">/ DÍA</small>
                }
                @case ('actions') {
                  <div class="row-actions">
                    <ui-josanz-button variant="ghost" size="sm" icon="eye" [routerLink]="['/inventory', product.id]"></ui-josanz-button>
                    @if (config.enableEdit) {
                      <ui-josanz-button variant="ghost" size="sm" icon="pencil" (clicked)="editProduct(product)"></ui-josanz-button>
                    }
                  </div>
                }
                @default {
                  {{ product[key] }}
                }
              }
            </ng-template>
          </ui-josanz-table>

          <footer class="table-footer" [style.background]="currentTheme().primary + '05'">
            <div class="table-info text-uppercase">
              {{ products().length }} ACTIVOS EN VISTA ACTUAL
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

    <!-- Modals remain for logic but styled with glass variant -->
    <ui-josanz-modal 
      [isOpen]="isModalOpen()" 
      [title]="editingProduct() ? 'MODIFICACIÓN DE ACTIVO' : 'REGISTRO DE NUEVO RECURSO'"
      (closed)="closeModal()"
      variant="dark"
    >
      <div class="form-grid">
        <div class="form-section">
          <h3 class="section-title text-uppercase" [style.color]="currentTheme().primary">Identificación Técnica</h3>
          <ui-josanz-input 
            label="Nombre del Producto" 
            [(ngModel)]="formData.name" 
            placeholder="DENOMINACIÓN COMERCIAL O TÉCNICA..."
            icon="box"
          ></ui-josanz-input>
          
          <div class="input-row">
            <ui-josanz-input label="Referencia SKU" [(ngModel)]="formData.sku" icon="hash"></ui-josanz-input>
            <ui-josanz-input label="Categoría" [(ngModel)]="formData.category" icon="tag"></ui-josanz-input>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title text-uppercase" [style.color]="currentTheme().primary">Stock y tarifación</h3>
          <div class="input-row">
            <ui-josanz-input
              label="Unidades en stock"
              type="number"
              [placeholder]="'0'"
              hint="Cantidad inicial de unidades disponibles del producto."
              [(ngModel)]="formData.totalStock"
              icon="layers"
            ></ui-josanz-input>
            <ui-josanz-input
              label="Tarifa diaria (€)"
              type="number"
              [placeholder]="'0'"
              hint="Precio de alquiler por día y unidad."
              [(ngModel)]="formData.dailyRate"
              icon="euro"
            ></ui-josanz-input>
          </div>
        </div>
      </div>
      
      <div modal-footer class="modal-actions">
        <ui-josanz-button variant="ghost" (clicked)="closeModal()">CANCELAR</ui-josanz-button>
        <ui-josanz-button variant="glass" (clicked)="saveProduct()" [disabled]="!formData.name">
          {{ editingProduct() ? 'ACTUALIZAR REGISTRO' : 'CONFIRMAR ALTA' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- AI Assistant -->
    <ui-josanz-ai-assistant feature="inventory"></ui-josanz-ai-assistant>
  `,
  styles: [`
    .page-container { padding: 0 120px 0 0; max-width: 100%; margin: 0 auto; }
    
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

    .product-cell { display: flex; align-items: center; gap: 12px; }
    .product-icon {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .product-link { 
      color: #fff; text-decoration: none; font-weight: 700; font-size: 0.8rem;
      letter-spacing: 0.02em; transition: 0.2s;
    }
    .product-link:hover { color: var(--brand); text-shadow: 0 0 10px var(--brand-glow); }

    .table-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.75rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.05);
    }

    .form-grid { display: flex; flex-direction: column; gap: 2rem; }
    .section-title { font-size: 0.7rem; font-weight: 900; letter-spacing: 0.15em; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

    @media (max-width: 1024px) {
      .stats-row { grid-template-columns: 1fr; }
      .navigation-bar { flex-direction: column; align-items: stretch; gap: 1rem; padding: 1rem; }
      .search-bar { width: 100%; }
      .input-row { grid-template-columns: 1fr; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryListComponent implements OnInit, OnDestroy, FilterableService<Product> {
  public readonly config = inject(INVENTORY_FEATURE_CONFIG);
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly facade = inject(InventoryFacade);
  private readonly masterFilter = inject(MasterFilterService);

  currentTheme = this.themeService.currentThemeData;
  tabs = this.facade.tabs;
  columns = this.config.defaultColumns;

  products = this.facade.products;
  allProducts = this.facade.allProducts;
  isLoading = this.facade.isLoading;
  activeTab = this.facade.activeTab;
  currentPage = signal(1);
  totalPages = signal(1);
  searchTerm = '';
  
  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  editingProduct = signal<Product | null>(null);
  productToDelete = signal<Product | null>(null);
  
  formData: Partial<Product> = {
    name: '', sku: '', category: '', status: 'available', totalStock: 0, 
    availableStock: 0, reservedStock: 0, dailyRate: 0, type: 'generic'
  };

  ngOnInit() {
    this.masterFilter.registerProvider(this);
    this.loadProducts();
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
  }

  /** Lógica de filtrado para el MasterFilterService */
  filter(query: string): Observable<Product[]> {
    const term = query.toLowerCase();
    const matches = this.allProducts().filter(p => 
      p.name.toLowerCase().includes(term) || 
      (p.sku ?? '').toLowerCase().includes(term) || 
      (p.category ?? '').toLowerCase().includes(term)
    );
    return of(matches);
  }

  loadProducts() { this.facade.loadProducts(); }
  onTabChange(tabId: string) { this.facade.setTab(tabId); }
  onSearch(term: string) { 
    this.searchTerm = term; 
    this.masterFilter.search(term);
    this.facade.searchProducts(term); 
  }
  onPageChange(page: number) { this.currentPage.set(page); this.loadProducts(); }

  openCreateModal() {
    this.editingProduct.set(null);
    this.formData = {
      name: '',
      sku: '',
      category: '',
      status: 'available',
      totalStock: 1,
      dailyRate: 0,
      type: 'generic',
      availableStock: 0,
      reservedStock: 0,
    };
    this.isModalOpen.set(true);
  }

  editProduct(product: Product) {
    this.editingProduct.set(product);
    this.formData = { ...product };
    this.isModalOpen.set(true);
  }

  closeModal() { this.isModalOpen.set(false); this.editingProduct.set(null); }

  saveProduct() {
    const name = this.formData.name?.trim();
    if (!name) return;

    const totalStock = Math.max(0, Math.floor(Number(this.formData.totalStock ?? 0)));
    const dailyRate = Math.max(0, Number(this.formData.dailyRate ?? 0));

    const productToEdit = this.editingProduct();
    if (productToEdit) {
      this.facade.updateProduct(productToEdit.id, {
        ...this.formData,
        name,
        totalStock,
        dailyRate,
      });
    } else {
      this.facade.createProduct({
        name,
        sku: (this.formData.sku ?? '').trim(),
        category: (this.formData.category ?? '').trim() || 'Varios',
        type: this.formData.type ?? 'generic',
        status: this.formData.status ?? 'available',
        totalStock,
        availableStock: totalStock,
        reservedStock: 0,
        dailyRate,
      });
    }
    this.closeModal();
  }

  confirmDelete(product: Product) { this.productToDelete.set(product); this.isDeleteModalOpen.set(true); }
  closeDeleteModal() { this.isDeleteModalOpen.set(false); this.productToDelete.set(null); }
  deleteProduct() { 
    const p = this.productToDelete();
    if (p) { this.facade.deleteProduct(p.id); this.closeDeleteModal(); }
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'default' {
    switch (status) {
      case 'available': return 'success';
      case 'reserved': return 'warning';
      case 'maintenance': return 'info';
      default: return 'default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'available': return 'Disponible';
      case 'reserved': return 'Reservado';
      case 'maintenance': return 'Mantenimiento';
      default: return status;
    }
  }

  formatCurrencyEu(amount: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  }

  totalValue = computed(() => this.allProducts().reduce((acc: number, p: Product) => acc + (p.dailyRate * p.totalStock), 0));
  criticalCount = computed(() => this.allProducts().filter((p: Product) => p.availableStock < (p.totalStock * 0.2)).length);
}
