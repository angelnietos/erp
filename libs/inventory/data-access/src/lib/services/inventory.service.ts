import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  type: 'serialized' | 'generic'; // New field
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  status: 'available' | 'reserved' | 'maintenance' | 'retired';
  dailyRate: number;
  imageUrl?: string;
  description?: string;
  serialNumber?: string; // Optional unit tracking
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  private apiUrl = '/api/inventory';

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProduct(id: string): Observable<Product | undefined> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

  searchProducts(term: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}?search=${encodeURIComponent(term)}`);
  }

  getProductsByStatus(status: string): Observable<Product[]> {
    if (status === 'all') {
      return this.getProducts();
    }
    return this.http.get<Product[]>(`${this.apiUrl}?status=${status}`);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}?category=${category}`);
  }
}
