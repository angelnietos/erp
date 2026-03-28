import { Injectable, inject, signal, computed } from '@angular/core';
import { Product, InventoryService } from '../services/inventory.service';

export interface BaseTabs {
  id: string;
  label: string;
  badge: number;
}

@Injectable({ providedIn: 'root' })
export class InventoryFacade {
  private readonly service = inject(InventoryService);

  private readonly _products = signal<Product[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _activeTab = signal<string>('all');

  readonly products = this._products.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly activeTab = this._activeTab.asReadonly();

  // Derived state
  readonly tabs = computed<BaseTabs[]>(() => {
    const products = this._products();
    const all = products.length;
    const available = products.filter(p => p.status === 'available').length;
    const reserved = products.filter(p => p.reservedStock > 0).length;
    const maintenance = products.filter(p => p.status === 'maintenance').length;

    return [
      { id: 'all', label: 'Todos', badge: all },
      { id: 'available', label: 'Disponibles', badge: available },
      { id: 'reserved', label: 'Reservados', badge: reserved },
      { id: 'maintenance', label: 'Mantenimiento', badge: maintenance },
    ];
  });

  loadProducts(): void {
    this._isLoading.set(true);
    this.service.getProducts().subscribe({
      next: (data) => {
        this._products.set(data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Error loading products');
        this._isLoading.set(false);
      }
    });
  }

  setTab(tabId: string): void {
    this._activeTab.set(tabId);
    this._isLoading.set(true);
    
    if (tabId === 'all') {
      this.service.getProducts().subscribe({
        next: (data) => {
          this._products.set(data);
          this._isLoading.set(false);
        },
        error: () => this._isLoading.set(false)
      });
    } else {
      this.service.getProductsByStatus(tabId).subscribe({
        next: (data) => {
          this._products.set(data);
          this._isLoading.set(false);
        },
        error: () => this._isLoading.set(false)
      });
    }
  }

  searchProducts(term: string): void {
    this._isLoading.set(true);
    this.service.searchProducts(term).subscribe({
      next: (data) => {
        this._products.set(data);
        this._isLoading.set(false);
      },
      error: () => this._isLoading.set(false)
    });
  }

  createProduct(product: Omit<Product, 'id'>): void {
    this.service.createProduct(product).subscribe({
      next: (newItem) => {
        this._products.update(items => [...items, newItem]);
        // Note: For real world apps and active tab filtering, we might need to reload 
        // depending on if the new item matches the active tab. For simplicity we append.
      }
    });
  }

  updateProduct(id: string, updates: Partial<Product>): void {
    this.service.updateProduct(id, updates).subscribe({
      next: (updatedItem) => this._products.update(items => 
        items.map(i => i.id === id ? updatedItem : i)
      )
    });
  }

  deleteProduct(id: string): void {
    this.service.deleteProduct(id).subscribe({
      next: (success) => {
        if (success) {
          this._products.update(items => items.filter(i => i.id !== id));
        }
      }
    });
  }
}
