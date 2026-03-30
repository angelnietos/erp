import { Component, OnInit, signal, inject } from '@angular/core';
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
    LucideAngularModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="glow-text">Inventario</h1>
          <p class="subtitle">Monitoreo y gestión de activos tecnológicos y recursos</p>
        </div>
        @if (config.enableCreate) {
          <ui-josanz-button variant="primary" (clicked)="openCreateModal()">
            <lucide-icon name="plus" class="mr-2"></lucide-icon>
            Nuevo Producto
          </ui-josanz-button>
        }
      </div>

      <div class="navigation-row">
        <ui-josanz-tabs [tabs]="tabs()" [activeTab]="activeTab()" variant="underline" (tabChange)="onTabChange($any($event))"></ui-josanz-tabs>
      </div>

      <div class="filters-bar">
        <ui-josanz-search 
          variant="filled"
          placeholder="BUSCAR EQUIPAMIENTO..." 
          (searchChange)="onSearch($any($event))"
          class="flex-1"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <ui-josanz-loader message="Sincronizando inventario global..."></ui-josanz-loader>
      } @else {
        <ui-josanz-card variant="glass" class="table-card">
          <ui-josanz-table [columns]="columns" [data]="products()" variant="hover">
            <ng-template #cellTemplate let-product let-key="key">
              @switch (key) {
                @case ('name') {
                  <a [routerLink]="['/inventory', product.id]" class="product-link">
                    {{ product.name }}
                  </a>
                }
                @case ('status') {
                   <div class="status-cell">
                    <ui-josanz-badge [variant]="getStatusVariant(product.status)">
                      {{ getStatusLabel(product.status) }}
                    </ui-josanz-badge>
                  </div>
                }
                @case ('totalStock') {
                  <div class="stock-info">
                    <span class="total">{{ product.totalStock }}</span>
                    @if (product.reservedStock > 0) {
                      <span class="reserved">({{ product.reservedStock }} RES.)</span>
                    }
                  </div>
                }
                @case ('dailyRate') {
                  <span class="price-text">{{ product.dailyRate | currency:'EUR' }}</span><small class="unit">/DÍA</small>
                }
                @case ('actions') {
                  <div class="actions">
                    <button class="action-trigger" [routerLink]="['/inventory', product.id]" title="Ver">
                      <lucide-icon name="eye" size="18"></lucide-icon>
                    </button>
                    @if (config.enableEdit) {
                      <button class="action-trigger" (click)="editProduct(product)" title="Editar">
                        <lucide-icon name="pencil" size="18"></lucide-icon>
                      </button>
                    }
                    @if (config.enableDelete) {
                      <button class="action-trigger danger" (click)="confirmDelete(product)" title="Eliminar">
                        <lucide-icon name="trash-2" size="18"></lucide-icon>
                      </button>
                    }
                  </div>
                }
                @default {
                  {{ product[key] }}
                }
              }
            </ng-template>
          </ui-josanz-table>

          <div class="pagination-wrapper">
            <ui-josanz-pagination 
              [currentPage]="currentPage()" 
              [totalPages]="totalPages()"
              variant="minimal"
              (pageChange)="onPageChange($event)"
            ></ui-josanz-pagination>
          </div>
        </ui-josanz-card>
      }
    </div>

    <!-- Create/Edit Modal -->
    <ui-josanz-modal 
      [isOpen]="isModalOpen()" 
      [title]="editingProduct() ? 'IDENTIFICACIÓN ACTIVO: EDITAR' : 'IDENTIFICACIÓN ACTIVO: NUEVO'"
      (closed)="closeModal()"
      variant="dark"
    >
      <div class="form-container">
        <div class="form-grid">
          <div class="form-col full-width">
            <label class="field-label" for="prod-name">Nombre del Producto *</label>
            <input 
              type="text" 
              id="prod-name"
              class="technical-input"
              [(ngModel)]="formData.name" 
              name="name" 
              required
              placeholder="DENOMINACIÓN TÉCNICA"
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="prod-sku">Identificador SKU</label>
            <input 
              type="text" 
              id="prod-sku"
              class="technical-input"
              [(ngModel)]="formData.sku" 
              name="sku" 
              placeholder="CAM-FX6-001"
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="prod-category">Categoría</label>
            <input 
              type="text" 
              id="prod-category"
              class="technical-input"
              [(ngModel)]="formData.category" 
              name="category" 
              placeholder="CÁMARAS / ILUMINACIÓN"
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="prod-status">Estado del Activo</label>
            <select id="prod-status" class="technical-select" [(ngModel)]="formData.status" name="status">
              <option value="available">DISPONIBLE</option>
              <option value="reserved">RESERVADO</option>
              <option value="maintenance">MANTENIMIENTO</option>
              <option value="retired">RETIRADO</option>
            </select>
          </div>
          
          <div class="form-col">
            <label class="field-label" for="prod-total-stock">Stock Total</label>
            <input 
              type="number" 
              id="prod-total-stock"
              class="technical-input"
              [(ngModel)]="formData.totalStock" 
              name="totalStock" 
              placeholder="0"
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="prod-avail-stock">Stock Disponible</label>
            <input 
              type="number" 
              id="prod-avail-stock"
              class="technical-input"
              [(ngModel)]="formData.availableStock" 
              name="availableStock" 
              placeholder="0"
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="prod-rate">Tarifa Diaria (€)</label>
            <input 
              type="number" 
              id="prod-rate"
              class="technical-input"
              [(ngModel)]="formData.dailyRate" 
              name="dailyRate" 
              placeholder="0.00"
              step="0.01"
            >
          </div>
        </div>
      </div>
      
      <div modal-footer class="modal-footer">
        <ui-josanz-button variant="ghost" (clicked)="closeModal()">
          ABORTAR
        </ui-josanz-button>
        <ui-josanz-button 
          variant="primary"
          (clicked)="saveProduct()"
          [disabled]="!formData.name"
        >
          {{ editingProduct() ? 'ACTUALIZAR REGISTRO' : 'CONFIRMAR ALTA' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- Delete Confirmation Modal -->
    <ui-josanz-modal
      [isOpen]="isDeleteModalOpen()"
      title="ADVERTENCIA: ELIMINACIÓN DE ACTIVO"
      (closed)="closeDeleteModal()"
      variant="dark"
    >
      <div class="delete-warning">
        <lucide-icon name="alert-triangle" class="warning-icon"></lucide-icon>
        <div class="warning-content">
          <p>¿Estás seguro de que deseas eliminar el producto <strong>{{ productToDelete()?.name }}</strong>?</p>
          <p class="critical-text">ESTA ACCIÓN ES IRREVERSIBLE Y ELIMINARÁ EL REGISTRO DEL INVENTARIO.</p>
        </div>
      </div>
      
      <div modal-footer>
        <ui-josanz-button variant="ghost" (clicked)="closeDeleteModal()">
          CANCELAR
        </ui-josanz-button>
        <ui-josanz-button variant="danger" (clicked)="deleteProduct()">
          ELIMINAR DEFINITIVAMENTE
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>
  `,
  styles: [`
    .page-container { padding: 2rem; }
    
    .page-header {
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border-soft);
      padding-bottom: 1.5rem;
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
    
    .navigation-row { margin-bottom: 2rem; }
    
    .filters-bar { margin-bottom: 2rem; display: flex; }
    .flex-1 { flex: 1; }
    
    .product-link { 
      color: var(--brand); 
      text-decoration: none; 
      font-weight: 800; 
      text-transform: uppercase;
      letter-spacing: 0.05em;
      transition: all 0.2s;
    }
    .product-link:hover { color: #fff; text-shadow: 0 0 10px var(--brand-glow); }
    
    .status-cell { display: flex; align-items: center; }
    
    .stock-info { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); }
    .stock-info .total { color: #fff; font-weight: 800; font-size: 1rem; }
    .stock-info .reserved { color: #eab308; font-size: 0.7rem; font-weight: 900; letter-spacing: 0.05em; }
    
    .price-text { color: #fff; font-weight: 800; font-family: var(--font-display); }
    .unit { color: var(--text-muted); font-size: 0.65rem; margin-left: 4px; font-weight: 700; }

    .actions { display: flex; gap: 10px; }
    
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
    }
    
    .action-trigger.danger:hover {
      border-color: var(--danger);
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
    }

    .pagination-wrapper {
      padding-top: 1rem;
      border-top: 1px solid var(--border-soft);
      margin-top: 1rem;
    }

    /* Form Styles */
    .form-container { padding: 1rem 0; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .form-col { display: flex; flex-direction: column; gap: 8px; }
    .form-col.full-width { grid-column: 1 / -1; }
    
    .field-label {
      font-size: 0.7rem;
      font-weight: 800;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    .technical-input, .technical-select, .technical-textarea {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      border-radius: 4px;
      padding: 12px 14px;
      color: #fff;
      font-size: 0.9rem;
      font-family: var(--font-main);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
    }
    
    .technical-input:focus, .technical-select:focus, .technical-textarea:focus {
      border-color: var(--brand);
      background: var(--bg-secondary);
      box-shadow: 0 0 15px var(--brand-glow);
    }

    .technical-select option { background: var(--bg-secondary); color: #fff; }

    .delete-warning {
      display: flex;
      gap: 20px;
      align-items: center;
      padding: 1rem;
      background: rgba(239, 68, 68, 0.05);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 6px;
    }
    
    .warning-icon { color: var(--danger); width: 40px; height: 40px; }
    
    .critical-text {
      color: var(--danger);
      font-weight: 800;
      font-size: 0.75rem;
      margin-top: 8px;
    }

    .mr-2 { margin-right: 8px; }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .glow-text { font-size: 1.8rem; }
    }
  `],
})
export class InventoryListComponent implements OnInit {
  public readonly config = inject(INVENTORY_FEATURE_CONFIG);
  private readonly facade = inject(InventoryFacade);

  tabs = this.facade.tabs;
  columns = this.config.defaultColumns;

  products = this.facade.products;
  isLoading = this.facade.isLoading;
  activeTab = this.facade.activeTab;
  currentPage = signal(1);
  totalPages = signal(1);
  searchTerm = '';
  
  // Modal state
  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  editingProduct = signal<Product | null>(null);
  productToDelete = signal<Product | null>(null);
  
  // Form data
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
    if (term.trim()) {
      this.facade.searchProducts(term);
    } else {
      this.facade.loadProducts();
    }
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
}

