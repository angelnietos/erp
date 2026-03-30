import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  getDeliveryNotes(): Observable<DeliveryNote[]> {
    return this.http.get<DeliveryNote[]>(this.apiUrl);
  }

  getDeliveryNote(id: string): Observable<DeliveryNote | undefined> {
    return this.http.get<DeliveryNote>(`${this.apiUrl}/${id}`);
  }

  createDeliveryNote(deliveryNote: Omit<DeliveryNote, 'id'>): Observable<DeliveryNote> {
    return this.http.post<DeliveryNote>(this.apiUrl, deliveryNote);
  }

  updateDeliveryNote(id: string, deliveryNote: Partial<DeliveryNote>): Observable<DeliveryNote> {
    return this.http.put<DeliveryNote>(`${this.apiUrl}/${id}`, deliveryNote);
  }

  deleteDeliveryNote(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

  searchDeliveryNotes(term: string): Observable<DeliveryNote[]> {
    // Basic frontend-level search simulation until backend adds a real search endpoint,
    // or typically we'd do GET /api/delivery?search=...
    return this.http.get<DeliveryNote[]>(`${this.apiUrl}?search=${encodeURIComponent(term)}`);
  }

  getDeliveryNotesByStatus(status: string): Observable<DeliveryNote[]> {
    if (status === 'all') {
      return this.getDeliveryNotes();
    }
    return this.http.get<DeliveryNote[]>(`${this.apiUrl}?status=${status}`);
  }

  signDeliveryNote(id: string, signature: string): Observable<DeliveryNote> {
    return this.http.put<DeliveryNote>(`${this.apiUrl}/${id}/sign`, { signature });
  }

  completeDeliveryNote(id: string): Observable<DeliveryNote> {
    return this.http.put<DeliveryNote>(`${this.apiUrl}/${id}/complete`, {});
  }
}
