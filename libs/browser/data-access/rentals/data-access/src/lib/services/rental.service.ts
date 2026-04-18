import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchHttpDetailNotFound } from '@josanz-erp/shared-data-access';

export type RentalSignatureStatus = 'NONE' | 'PENDING' | 'SIGNED';

export interface RentalAnnex {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
}

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
  annexes?: RentalAnnex[];
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

  private readonly listCache = new Map<string, Rental>();

  /** Llamar al cargar el listado para hidratar detalle sin spinner continuo. */
  seedListCache(rentals: Rental[]): void {
    this.listCache.clear();
    for (const r of rentals) {
      this.listCache.set(r.id, r);
    }
  }

  /** Tras crear o actualizar desde formulario: el detalle puede hidratar al instante. */
  upsertListCache(rental: Rental): void {
    this.listCache.set(rental.id, rental);
  }

  getListCached(id: string): Rental | undefined {
    return this.listCache.get(id);
  }

  getRentals(): Observable<Rental[]> {
    return this.http.get<Rental[]>(this.apiUrl);
  }

  getRental(id: string): Observable<Rental | undefined> {
    return this.http
      .get<Rental>(`${this.apiUrl}/${id}`)
      .pipe(catchHttpDetailNotFound<Rental>());
  }

  addRentalAnnex(
    rentalId: string,
    body: { title: string; description?: string },
  ): Observable<Rental> {
    return this.http.post<Rental>(`${this.apiUrl}/${rentalId}/annexes`, body);
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
