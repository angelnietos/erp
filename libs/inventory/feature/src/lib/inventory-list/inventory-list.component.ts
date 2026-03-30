import { Component, OnInit, signal, inject, computed } from '@angular/core';
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
} from '@josanz-erp/shared-ui-kit';
import { Product, InventoryFacade } from '@josanz-erp/inventory-data-access';
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
    LucideAngularModule
  ],
  template: `
    <div class="page-container animate-slide-up">
      <header class="page-header">
        <div class="header-breadcrumb">
          <h1 class="page-title text-uppercase">Inventario de Activos</h1>
          <div class="breadcrumb">
            <span class="active">CENTRO DE RECURSOS</span>
            <span class="separator">/</span>
            <span>MONITOREO GLOBAL</span>
          </div>
        </div>
        <div class="header-actions">
          @if (config.enableCreate) {
            <ui-josanz-button variant="primary" size="md" (clicked)="openCreateModal()" icon="plus">
              NUEVO PRODUCTO
            </ui-josanz-button>
          }
        </div>
      </header>

      <div class="stats-row animate-slide-up">
        <ui-josanz-stat-card label="Total Equipos" [value]="allProducts().length.toString()" icon="package" [accent]="true"></ui-josanz-stat-card>
        <ui-josanz-stat-card label="Stock Crítico" [value]="criticalCount().toString()" icon="alert-octagon" [trend]="-1"></ui-josanz-stat-card>
        <ui-josanz-stat-card label="Valoración Flota" [value]="formatCurrencyEu(totalValue())" icon="bar-chart-3"></ui-josanz-stat-card>
      </div>

      <div class="navigation-bar">
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
        <ui-josanz-card variant="glass" class="table-card ui-neon">
          <ui-josanz-table [columns]="columns" [data]="products()" variant="default">
            <ng-template #cellTemplate let-product let-key="key">
              @switch (key) {
                @case ('name') {
                  <a [routerLink]="['/inventory', product.id]" class="product-link">
                    {{ product.name | uppercase }}
                  </a>
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
                      <span class="res text-warning font-mono">({{ product.reservedStock }} RES.)</span>
                    }
                  </div>
                }
                @case ('dailyRate') {
                  <span class="price-val font-mono">{{ product.dailyRate | currency:'EUR' }}</span>
                  <small class="unit">/ DÍA</small>
                }
                @case ('actions') {
                  <div class="row-actions">
                    <ui-josanz-button variant="ghost" size="sm" icon="eye" [routerLink]="['/inventory', product.id]" title="Detalles"></ui-josanz-button>
                    @if (config.enableEdit) {
                      <ui-josanz-button variant="ghost" size="sm" icon="pencil" (clicked)="editProduct(product)" title="Editar"></ui-josanz-button>
                    }
                    @if (config.enableDelete) {
                      <ui-josanz-button variant="ghost" size="sm" icon="trash-2" (clicked)="confirmDelete(product)" title="Eliminar" class="btn-danger-ghost"></ui-josanz-button>
                    }
                  </div>
                }
                @default {
                  {{ product[key] }}
                }
              }
            </ng-template>
          </ui-josanz-table>

          <footer class="table-footer">
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

    <!-- Create/Edit Modal -->
    <ui-josanz-modal 
      [isOpen]="isModalOpen()" 
      [title]="editingProduct() ? 'MODIFICACIÓN DE ACTIVO' : 'REGISTRO DE NUEVO RECURSO'"
      (closed)="closeModal()"
      variant="dark"
    >
      <div class="form-grid">
        <div class="form-section">
          <h3 class="section-title text-uppercase">Identificación Técnica</h3>
          <ui-josanz-input 
            label="Nombre del Producto" 
            [(ngModel)]="formData.name" 
            placeholder="DENOMINACIÓN COMERCIAL O TÉCNICA..."
            icon="box"
            id="prod-name"
          ></ui-josanz-input>
          
          <div class="input-row">
            <ui-josanz-input 
              label="Referencia SKU" 
              [(ngModel)]="formData.sku" 
              placeholder="CAM-FX6-001"
              icon="hash"
              id="prod-sku"
            ></ui-josanz-input>
            
            <ui-josanz-input 
              label="Categoría" 
              [(ngModel)]="formData.category" 
              placeholder="CÁMARAS / LUZ..."
              icon="tag"
              id="prod-category"
            ></ui-josanz-input>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title text-uppercase">Control de Existencias</h3>
          <div class="input-row">
            <ui-josanz-input 
              label="Stock Total" 
              type="number" 
              [(ngModel)]="formData.totalStock" 
              icon="layers"
              id="prod-total-stock"
            ></ui-josanz-input>
            
            <ui-josanz-input 
              label="Disponible" 
              type="number" 
              [(ngModel)]="formData.availableStock" 
              icon="check-square"
              id="prod-avail-stock"
            ></ui-josanz-input>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title text-uppercase">Valoración Económica</h3>
          <ui-josanz-input 
            label="Tarifa Diaria de Arrendamiento (€)" 
            type="number" 
            [(ngModel)]="formData.dailyRate" 
            placeholder="0.00"
            icon="euro"
            id="prod-rate"
          ></ui-josanz-input>
        </div>
      </div>
      
      <div modal-footer class="modal-actions">
        <ui-josanz-button variant="ghost" (clicked)="closeModal()">CANCELAR</ui-josanz-button>
        <ui-josanz-button 
          variant="glass"
          (clicked)="saveProduct()"
          [disabled]="!formData.name"
        >
          <lucide-icon name="save" size="18" class="mr-2"></lucide-icon>
          {{ editingProduct() ? 'ACTUALIZAR REGISTRO' : 'CONFIRMAR ALTA' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- Delete Confirmation Modal -->
    <ui-josanz-modal
      [isOpen]="isDeleteModalOpen()"
      title="SISTEMA: ADVERTENCIA DE ELIMINACIÓN"
      (closed)="closeDeleteModal()"
      variant="dark"
    >
      <div class="delete-warning">
        <lucide-icon name="alert-triangle" size="40" class="warning-icon"></lucide-icon>
        <div class="warning-content">
          <p class="text-uppercase">¿ESTÁ SEGURO DE QUE DESEA ELIMINAR EL PRODUCTO <strong>{{ productToDelete()?.name | uppercase }}</strong>?</p>
          <p class="critical-text text-uppercase">ESTA ACCIÓN ES IRREVERSIBLE. SE ELIMINARÁ EL ACTIVO Y SU HISTORIAL DE OPERACIONES.</p>
        </div>
      </div>
      
      <div modal-footer class="modal-actions">
        <ui-josanz-button variant="ghost" (clicked)="closeDeleteModal()">ABORTAR</ui-josanz-button>
        <ui-josanz-button variant="danger" (clicked)="deleteProduct()">CONFIRMAR BAJA</ui-josanz-button>
      </div>
    </ui-josanz-modal>
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

      .navigation-bar { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        margin-bottom: 1rem; 
        gap: 1rem;
        flex-wrap: wrap;
      }
      .navigation-bar ui-josanz-tabs { flex: 1 1 auto; min-width: 0; }
      .search-bar { flex: 1 1 220px; min-width: min(100%, 200px); max-width: 480px; }
      
      .product-link { 
        color: var(--brand); 
        text-decoration: none; 
        font-weight: 800; 
        font-size: 0.85rem;
        letter-spacing: 0.05em;
        transition: var(--transition-fast);
      }
      .product-link:hover { color: #fff; text-decoration: underline; }
      
      .stock-info { display: flex; align-items: center; gap: 8px; }
      .stock-info .val { color: #fff; font-weight: 800; }
      .stock-info .res { font-size: 0.65rem; font-weight: 900; }
      
      .price-val { color: #fff; font-weight: 700; }
      .unit { color: var(--text-muted); font-size: 0.65rem; margin-left: 2px; font-weight: 800; }

      .row-actions { display: flex; gap: 4px; }
      
      .btn-danger-ghost :host ::ng-deep .btn { color: var(--danger) !important; }
      .btn-danger-ghost :host ::ng-deep .btn:hover { background: var(--danger) !important; color: white !important; }

    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.65rem 1rem;
      background: rgba(0, 0, 0, 0.1);
      border-top: 1px solid var(--border-soft);
    }

    .table-info { font-size: 0.55rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.06em; }

    /* Form Styles */
    .form-grid { display: flex; flex-direction: column; gap: 2.5rem; padding: 1rem 0; }
    .form-section { display: flex; flex-direction: column; gap: 1.5rem; }
    .section-title { 
      font-size: 0.75rem; 
      color: var(--brand); 
      letter-spacing: 0.2em; 
      font-weight: 900; 
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-soft);
    }
    .input-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    
    .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; }

    .delete-warning {
      display: flex;
      gap: 20px;
      align-items: center;
      padding: 1.5rem;
      background: rgba(239, 68, 68, 0.05);
      border-radius: var(--radius-md);
    }
    .warning-icon { color: var(--danger); }
    .critical-text { color: var(--danger); font-weight: 800; font-size: 0.7rem; margin-top: 8px; opacity: 0.8; }

    .mr-2 { margin-right: 8px; }

    @media (max-width: 1024px) {
      .navigation-bar { flex-direction: column; align-items: stretch; }
      .search-bar { max-width: none; }
      .input-row { grid-template-columns: 1fr; }
    }
  `],
})
export class InventoryListComponent implements OnInit {
  public readonly config = inject(INVENTORY_FEATURE_CONFIG);
  private readonly facade = inject(InventoryFacade);

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
    name: '',
    sku: '',
    category: '',
    status: 'available',
    totalStock: 0,
    availableStock: 0,
    reservedStock: 0,
    dailyRate: 0
  };

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.facade.loadProducts();
  }

  onTabChange(tabId: string) {
    this.facade.setTab(tabId);
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.facade.searchProducts(term);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadProducts();
  }

  openCreateModal() {
    this.editingProduct.set(null);
    this.formData = {
      name: '',
      sku: '',
      category: '',
      status: 'available',
      totalStock: 0,
      availableStock: 0,
      reservedStock: 0,
      dailyRate: 0
    };
    this.isModalOpen.set(true);
  }

  editProduct(product: Product) {
    this.editingProduct.set(product);
    this.formData = { ...product };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingProduct.set(null);
  }

  saveProduct() {
    if (!this.formData.name) return;

    const productToEdit = this.editingProduct();
    if (productToEdit) {
      this.facade.updateProduct(productToEdit.id, this.formData);
      this.closeModal();
    } else {
      this.facade.createProduct(this.formData as Omit<Product, 'id'>);
      this.closeModal();
    }
  }

  confirmDelete(product: Product) {
    this.productToDelete.set(product);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.productToDelete.set(null);
  }

  deleteProduct() {
    const product = this.productToDelete();
    if (!product) return;

    this.facade.deleteProduct(product.id);
    this.closeDeleteModal();
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

  formatCurrencyEu(amount: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  }

  totalValue = computed(() => {
    return this.allProducts().reduce((acc, p) => acc + (p.dailyRate * p.totalStock), 0);
  });

  criticalCount = computed(() => {
    return this.allProducts().filter(p => p.availableStock < (p.totalStock * 0.2)).length;
  });
}
