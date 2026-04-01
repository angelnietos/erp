import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type RentalSignatureStatus = 'NONE' | 'PENDING' | 'SIGNED';

export interface Rental {
  id: string;
  clientId: string;
  clientName: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  itemsCount: number;
  
  totalAmount: number;
  createdAt: string;
  /** Firma digital del contrato (Verifactu / proveedor externo). */
  signatureStatus?: RentalSignatureStatus;
  signedAt?: string;
}

export interface RentalItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

@Injectable({ providedIn: 'root' })
export class RentalService {
  private http = inject(HttpClient);
  private apiUrl = '/api/rentals';

  getRentals(): Observable<Rental[]> {
    return this.http.get<Rental[]>(this.apiUrl);
  }

  getRental(id: string): Observable<Rental | undefined> {
    return this.http.get<Rental>(`${this.apiUrl}/${id}`);
  }

  createRental(rental: Omit<Rental, 'id' | 'createdAt'>): Observable<Rental> {
    return this.http.post<Rental>(this.apiUrl, rental);
  }

  updateRental(id: string, rental: Partial<Rental>): Observable<Rental> {
    return this.http.put<Rental>(`${this.apiUrl}/${id}`, rental);
  }

  deleteRental(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

  searchRentals(term: string): Observable<Rental[]> {
    return this.http.get<Rental[]>(`${this.apiUrl}?search=${encodeURIComponent(term)}`);
  }

  getRentalsByStatus(status: string): Observable<Rental[]> {
    if (status === 'all') {
      return this.getRentals();
    }
    return this.http.get<Rental[]>(`${this.apiUrl}?status=${status}`);
  }

  activateRental(id: string): Observable<Rental> {
    return this.updateRental(id, { status: 'ACTIVE' });
  }

  completeRental(id: string): Observable<Rental> {
    return this.updateRental(id, { status: 'COMPLETED' });
  }

  cancelRental(id: string): Observable<Rental> {
    return this.updateRental(id, { status: 'CANCELLED' });
  }
}
