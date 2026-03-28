import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  private apiUrl = '/api/inventory';

  // Mock data
  private mockProducts: Product[] = [
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
  ];

  getProducts(): Observable<Product[]> {
    return of(this.mockProducts).pipe(delay(300));
  }

  getProduct(id: string): Observable<Product | undefined> {
    return of(this.mockProducts.find(p => p.id === id)).pipe(delay(200));
  }

  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    const newProduct: Product = {
      ...product,
      id: 'prod-' + Date.now().toString(36),
    };
    this.mockProducts = [...this.mockProducts, newProduct];
    return of(newProduct).pipe(delay(300));
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    const index = this.mockProducts.findIndex(p => p.id === id);
    if (index >= 0) {
      this.mockProducts[index] = { ...this.mockProducts[index], ...product };
      return of(this.mockProducts[index]).pipe(delay(300));
    }
    throw new Error('Product not found');
  }

  deleteProduct(id: string): Observable<boolean> {
    const index = this.mockProducts.findIndex(p => p.id === id);
    if (index >= 0) {
      this.mockProducts = this.mockProducts.filter(p => p.id !== id);
      return of(true).pipe(delay(300));
    }
    return of(false);
  }

  searchProducts(term: string): Observable<Product[]> {
    const searchTerm = term.toLowerCase();
    const results = this.mockProducts.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.sku.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );
    return of(results).pipe(delay(200));
  }

  getProductsByStatus(status: string): Observable<Product[]> {
    if (status === 'all') {
      return this.getProducts();
    }
    if (status === 'reserved') {
      return of(this.mockProducts.filter(p => p.reservedStock > 0)).pipe(delay(200));
    }
    return of(this.mockProducts.filter(p => p.status === status)).pipe(delay(200));
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return of(this.mockProducts.filter(p => p.category === category)).pipe(delay(200));
  }
}
