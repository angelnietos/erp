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

  private readonly _allProducts = signal<Product[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _activeTab = signal<string>('all');
  private readonly _searchTerm = signal<string>('');

  readonly products = computed<Product[]>(() => {
    let list = this._allProducts();
    const tab = this._activeTab();
    if (tab === 'reserved') {
      list = list.filter((p) => p.reservedStock > 0);
    } else if (tab !== 'all') {
      list = list.filter((p) => p.status === tab);
    }
    const s = this._searchTerm().trim().toLowerCase();
    if (s) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          (p.sku || '').toLowerCase().includes(s) ||
          (p.category || '').toLowerCase().includes(s)
      );
    }
    return list;
  });

  readonly allProducts = this._allProducts.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly activeTab = this._activeTab.asReadonly();

  readonly tabs = computed<BaseTabs[]>(() => {
    const products = this._allProducts();
    const all = products.length;
    const available = products.filter((p) => p.status === 'available').length;
    const reserved = products.filter((p) => p.reservedStock > 0).length;
    const maintenance = products.filter((p) => p.status === 'maintenance').length;

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
        this._allProducts.set(data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Error loading products');
        this._isLoading.set(false);
      },
    });
  }

  setTab(tabId: string): void {
    this._activeTab.set(tabId);
  }

  searchProducts(term: string): void {
    this._searchTerm.set(term);
  }

  createProduct(product: Omit<Product, 'id'>): void {
    this.service.createProduct(product).subscribe({
      next: (newItem) => {
        this._allProducts.update((items) => [...items, newItem]);
      },
    });
  }

  updateProduct(id: string, updates: Partial<Product>): void {
    this.service.updateProduct(id, updates).subscribe({
      next: (updatedItem) =>
        this._allProducts.update((items) => items.map((i) => (i.id === id ? updatedItem : i))),
    });
  }

  deleteProduct(id: string): void {
    this.service.deleteProduct(id).subscribe({
      next: (success) => {
        if (success) {
          this._allProducts.update((items) => items.filter((i) => i.id !== id));
        }
      },
    });
  }
}
