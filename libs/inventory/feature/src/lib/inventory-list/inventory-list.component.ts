import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UiTableComponent, UiButtonComponent, UiSearchComponent, UiPaginationComponent, UiBadgeComponent, UiLoaderComponent, UiModalComponent, UiInputComponent, UiSelectComponent } from '@josanz-erp/shared-ui-kit';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Product, InventoryService } from '@josanz-erp/inventory-data-access';

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
    UiSelectComponent
  ],
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

      <ui-josanz-tabs [tabs]="tabs" [activeTab]="activeTab()" (tabChange)="onTabChange($any($event))"></ui-josanz-tabs>

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
                  <button class="action-btn" (click)="editProduct(product)" title="Editar">
                    <i-lucide name="pencil"></i-lucide>
                  </button>
                  <button class="action-btn danger" (click)="confirmDelete(product)" title="Eliminar">
                    <i-lucide name="trash-2"></i-lucide>
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
  private inventoryService = inject(InventoryService);

  tabs = [
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
    this.isLoading.set(true);
    this.inventoryService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.updateTabs(products);
        this.isLoading.set(false);
        this.totalPages.set(1);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoading.set(false);
      }
    });
  }

  updateTabs(products: Product[]) {
    const all = products.length;
    const available = products.filter(p => p.status === 'available').length;
    const reserved = products.filter(p => p.reservedStock > 0).length;
    const maintenance = products.filter(p => p.status === 'maintenance').length;

    this.tabs = [
      { id: 'all', label: 'Todos', badge: all },
      { id: 'available', label: 'Disponibles', badge: available },
      { id: 'reserved', label: 'Reservados', badge: reserved },
      { id: 'maintenance', label: 'Mantenimiento', badge: maintenance },
    ];
  }

  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
    this.isLoading.set(true);
    
    if (tabId === 'all') {
      this.loadProducts();
    } else {
      this.inventoryService.getProductsByStatus(tabId).subscribe({
        next: (products) => {
          this.products.set(products);
          this.isLoading.set(false);
        }
      });
    }
  }

  onSearch(term: string) {
    this.searchTerm = term;
    if (term.trim()) {
      this.isLoading.set(true);
      this.inventoryService.searchProducts(term).subscribe({
        next: (products) => {
          this.products.set(products);
          this.isLoading.set(false);
        }
      });
    } else {
      this.loadProducts();
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

    if (this.editingProduct()) {
      this.inventoryService.updateProduct(this.editingProduct()!.id, this.formData).subscribe({
        next: (updated) => {
          this.products.update(products => 
            products.map(p => p.id === updated.id ? updated : p)
          );
          this.closeModal();
        },
        error: (err) => console.error('Error updating product:', err)
      });
    } else {
      this.inventoryService.createProduct(this.formData as Omit<Product, 'id'>).subscribe({
        next: (newProduct) => {
          this.products.update(products => [...products, newProduct]);
          this.closeModal();
        },
        error: (err) => console.error('Error creating product:', err)
      });
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

    this.inventoryService.deleteProduct(product.id).subscribe({
      next: (success) => {
        if (success) {
          this.products.update(products => products.filter(p => p.id !== product.id));
        }
        this.closeDeleteModal();
      },
      error: (err) => console.error('Error deleting product:', err)
    });
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
