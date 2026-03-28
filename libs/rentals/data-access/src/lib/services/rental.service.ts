import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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

  // Mock data
  private mockRentals: Rental[] = [
    {
      id: 'rnt-001',
      clientId: '1',
      clientName: 'Producciones Audiovisuales Madrid',
      status: 'ACTIVE',
      startDate: '2026-03-20',
      endDate: '2026-03-25',
      itemsCount: 8,
      totalAmount: 2500,
      createdAt: '2026-03-19',
    },
    {
      id: 'rnt-002',
      clientId: '2',
      clientName: 'Cadena TV España',
      status: 'DRAFT',
      startDate: '2026-03-28',
      endDate: '2026-04-02',
      itemsCount: 12,
      totalAmount: 4200,
      createdAt: '2026-03-20',
    },
    {
      id: 'rnt-003',
      clientId: '3',
      clientName: 'Film Studios Barcelona',
      status: 'COMPLETED',
      startDate: '2026-03-10',
      endDate: '2026-03-15',
      itemsCount: 5,
      totalAmount: 1800,
      createdAt: '2026-03-08',
    },
    {
      id: 'rnt-004',
      clientId: '1',
      clientName: 'Producciones Audiovisuales Madrid',
      status: 'CANCELLED',
      startDate: '2026-03-05',
      endDate: '2026-03-08',
      itemsCount: 3,
      totalAmount: 950,
      createdAt: '2026-03-01',
    },
  ];

  getRentals(): Observable<Rental[]> {
    return of(this.mockRentals).pipe(delay(300));
  }

  getRental(id: string): Observable<Rental | undefined> {
    return of(this.mockRentals.find(r => r.id === id)).pipe(delay(200));
  }

  createRental(rental: Omit<Rental, 'id' | 'createdAt'>): Observable<Rental> {
    const newRental: Rental = {
      ...rental,
      id: 'rnt-' + Date.now().toString(36),
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.mockRentals = [...this.mockRentals, newRental];
    return of(newRental).pipe(delay(300));
  }

  updateRental(id: string, rental: Partial<Rental>): Observable<Rental> {
    const index = this.mockRentals.findIndex(r => r.id === id);
    if (index >= 0) {
      this.mockRentals[index] = { ...this.mockRentals[index], ...rental };
      return of(this.mockRentals[index]).pipe(delay(300));
    }
    throw new Error('Rental not found');
  }

  deleteRental(id: string): Observable<boolean> {
    const index = this.mockRentals.findIndex(r => r.id === id);
    if (index >= 0) {
      this.mockRentals = this.mockRentals.filter(r => r.id !== id);
      return of(true).pipe(delay(300));
    }
    return of(false);
  }

  searchRentals(term: string): Observable<Rental[]> {
    const searchTerm = term.toLowerCase();
    const results = this.mockRentals.filter(r =>
      r.clientName.toLowerCase().includes(searchTerm) ||
      r.id.toLowerCase().includes(searchTerm)
    );
    return of(results).pipe(delay(200));
  }

  getRentalsByStatus(status: string): Observable<Rental[]> {
    if (status === 'all') {
      return this.getRentals();
    }
    return of(this.mockRentals.filter(r => r.status === status)).pipe(delay(200));
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
