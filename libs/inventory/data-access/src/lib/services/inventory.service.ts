import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/inventory';

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('http://localhost:3000/api/products');
  }
}
