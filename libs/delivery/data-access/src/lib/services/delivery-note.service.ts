import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface DeliveryNote {
  id: string;
  budgetId: string;
  clientName: string;
  status: 'draft' | 'pending' | 'signed' | 'completed';
  deliveryDate: string;
  returnDate: string;
  itemsCount: number;
  signature?: string;
  items?: DeliveryItem[];
  notes?: string;
}

export interface DeliveryItem {
  id: string;
  name: string;
  quantity: number;
  condition: 'good' | 'damaged' | 'missing';
  observations?: string;
}

@Injectable({ providedIn: 'root' })
export class DeliveryNoteService {
  private http = inject(HttpClient);
  private apiUrl = '/api/delivery';

  // Mock data
  private mockDeliveryNotes: DeliveryNote[] = [
    {
      id: 'dlv-001',
      budgetId: 'bgt-001',
      clientName: 'Producciones Audiovisuales Madrid',
      status: 'signed',
      deliveryDate: '2026-03-20',
      returnDate: '2026-03-25',
      itemsCount: 8,
    },
    {
      id: 'dlv-002',
      budgetId: 'bgt-002',
      clientName: 'Cadena TV España',
      status: 'pending',
      deliveryDate: '2026-03-22',
      returnDate: '2026-03-28',
      itemsCount: 12,
    },
    {
      id: 'dlv-003',
      budgetId: 'bgt-003',
      clientName: 'Film Studios Barcelona',
      status: 'completed',
      deliveryDate: '2026-03-15',
      returnDate: '2026-03-18',
      itemsCount: 5,
    },
  ];

  getDeliveryNotes(): Observable<DeliveryNote[]> {
    return of(this.mockDeliveryNotes).pipe(delay(300));
  }

  getDeliveryNote(id: string): Observable<DeliveryNote | undefined> {
    return of(this.mockDeliveryNotes.find(d => d.id === id)).pipe(delay(200));
  }

  createDeliveryNote(deliveryNote: Omit<DeliveryNote, 'id'>): Observable<DeliveryNote> {
    const newDeliveryNote: DeliveryNote = {
      ...deliveryNote,
      id: 'dlv-' + Date.now().toString(36),
    };
    this.mockDeliveryNotes = [...this.mockDeliveryNotes, newDeliveryNote];
    return of(newDeliveryNote).pipe(delay(300));
  }

  updateDeliveryNote(id: string, deliveryNote: Partial<DeliveryNote>): Observable<DeliveryNote> {
    const index = this.mockDeliveryNotes.findIndex(d => d.id === id);
    if (index >= 0) {
      this.mockDeliveryNotes[index] = { ...this.mockDeliveryNotes[index], ...deliveryNote };
      return of(this.mockDeliveryNotes[index]).pipe(delay(300));
    }
    throw new Error('Delivery note not found');
  }

  deleteDeliveryNote(id: string): Observable<boolean> {
    const index = this.mockDeliveryNotes.findIndex(d => d.id === id);
    if (index >= 0) {
      this.mockDeliveryNotes = this.mockDeliveryNotes.filter(d => d.id !== id);
      return of(true).pipe(delay(300));
    }
    return of(false);
  }

  searchDeliveryNotes(term: string): Observable<DeliveryNote[]> {
    const searchTerm = term.toLowerCase();
    const results = this.mockDeliveryNotes.filter(d =>
      d.clientName.toLowerCase().includes(searchTerm) ||
      d.budgetId.toLowerCase().includes(searchTerm)
    );
    return of(results).pipe(delay(200));
  }

  getDeliveryNotesByStatus(status: string): Observable<DeliveryNote[]> {
    if (status === 'all') {
      return this.getDeliveryNotes();
    }
    return of(this.mockDeliveryNotes.filter(d => d.status === status)).pipe(delay(200));
  }

  signDeliveryNote(id: string, signature: string): Observable<DeliveryNote> {
    return this.updateDeliveryNote(id, { status: 'signed', signature });
  }

  completeDeliveryNote(id: string): Observable<DeliveryNote> {
    return this.updateDeliveryNote(id, { status: 'completed' });
  }
}
