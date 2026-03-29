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
  UiInputComponent, 
  UiSelectComponent 
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
    UiInputComponent,
    UiSelectComponent,
    LucideAngularModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Inventario</h1>
          <p class="subtitle">Gestiona el stock de equipos y materiales</p>
        </div>
        @if (config.enableCreate) {
          <ui-josanz-button icon="plus" (clicked)="openCreateModal()">
            Nuevo Producto
          </ui-josanz-button>
        }
      </div>

      <ui-josanz-tabs [tabs]="tabs()" [activeTab]="activeTab()" (tabChange)="onTabChange($any($event))"></ui-josanz-tabs>

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
                    <lucide-icon name="eye"></lucide-icon>
                  </button>
                  @if (config.enableEdit) {
                    <button class="action-btn" (click)="editProduct(product)" title="Editar">
                      <lucide-icon name="pencil"></lucide-icon>
                    </button>
                  }
                  @if (config.enableDelete) {
                    <button class="action-btn danger" (click)="confirmDelete(product)" title="Eliminar">
                      <lucide-icon name="trash-2"></lucide-icon>
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

        <ui-josanz-pagination 
          [currentPage]="currentPage()" 
          [totalPages]="totalPages()"
          (pageChange)="onPageChange($event)"
        ></ui-josanz-pagination>
      }
    </div>

    <!-- Create/Edit Modal -->
    <ui-josanz-modal 
      [isOpen]="isModalOpen()" 
      [title]="editingProduct() ? 'Editar Producto' : 'Nuevo Producto'"
      (closed)="closeModal()"
    >
      <form>
        <div class="form-grid">
          <div class="form-group">
            <label for="name">Nombre *</label>
            <input 
              type="text" 
              id="name"
              [(ngModel)]="formData.name" 
              name="name" 
              required
              placeholder="Nombre del producto"
            >
          </div>
          
          <div class="form-group">
            <label for="sku">SKU</label>
            <input 
              type="text" 
              id="sku"
              [(ngModel)]="formData.sku" 
              name="sku" 
              placeholder="CAM-FX6-001"
            >
          </div>
          
          <div class="form-group">
            <label for="category">Categoría</label>
            <input 
              type="text" 
              id="category"
              [(ngModel)]="formData.category" 
              name="category" 
              placeholder="Cámaras"
            >
          </div>
          
          <div class="form-group">
            <label for="status">Estado</label>
            <select id="status" [(ngModel)]="formData.status" name="status">
              <option value="available">Disponible</option>
              <option value="reserved">Reservado</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="retired">Retirado</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="totalStock">Stock Total</label>
            <input 
              type="number" 
              id="totalStock"
              [(ngModel)]="formData.totalStock" 
              name="totalStock" 
              placeholder="0"
            >
          </div>
          
          <div class="form-group">
            <label for="availableStock">Stock Disponible</label>
            <input 
              type="number" 
              id="availableStock"
              [(ngModel)]="formData.availableStock" 
              name="availableStock" 
              placeholder="0"
            >
          </div>
          
          <div class="form-group">
            <label for="dailyRate">Tarifa por Día (€)</label>
            <input 
              type="number" 
              id="dailyRate"
              [(ngModel)]="formData.dailyRate" 
              name="dailyRate" 
              placeholder="0.00"
              step="0.01"
            >
          </div>
        </div>
      </form>
      
      <div modal-footer>
        <ui-josanz-button variant="secondary" (clicked)="closeModal()">
          Cancelar
        </ui-josanz-button>
        <ui-josanz-button 
          (clicked)="saveProduct()"
          [disabled]="!formData.name"
        >
          {{ editingProduct() ? 'Actualizar' : 'Crear' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- Delete Confirmation Modal -->
    <ui-josanz-modal
      [isOpen]="isDeleteModalOpen()"
      title="Confirmar Eliminación"
      (closed)="closeDeleteModal()"
    >
      <p>¿Estás seguro de que deseas eliminar el producto <strong>{{ productToDelete()?.name }}</strong>?</p>
      <p class="warning-text">Esta acción no se puede deshacer.</p>
      
      <div modal-footer>
        <ui-josanz-button variant="secondary" (clicked)="closeDeleteModal()">
          Cancelar
        </ui-josanz-button>
        <ui-josanz-button variant="danger" (clicked)="deleteProduct()">
          Eliminar
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>
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
    .action-btn.danger:hover { background: rgba(239,68,68,0.15); color: #EF4444; }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      color: #94A3B8;
      font-size: 13px;
      font-weight: 500;
    }
    .form-group input,
    .form-group select {
      background: #0F172A;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px 12px;
      color: white;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #4F46E5;
    }
    .form-group input::placeholder {
      color: #64748B;
    }
    .warning-text {
      color: #EF4444;
      font-size: 14px;
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

