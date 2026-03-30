import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  budgetId: string;
  clientName: string;
  status: 'draft' | 'pending' | 'sent' | 'paid' | 'cancelled';
  type: 'normal' | 'rectificative';
  total: number;
  issueDate: string;
  dueDate: string;
  verifactuStatus?: 'pending' | 'sent' | 'error';
  items?: InvoiceItem[];
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private http = inject(HttpClient);
  private apiUrl = '/api/invoices';

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl);
  }

  getInvoice(id: string): Observable<Invoice | undefined> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  createInvoice(invoice: Omit<Invoice, 'id'>): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoice);
  }

  updateInvoice(id: string, invoice: Partial<Invoice>): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, invoice);
  }

  deleteInvoice(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

  searchInvoices(term: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}?search=${encodeURIComponent(term)}`);
  }

  getInvoicesByStatus(status: string): Observable<Invoice[]> {
    if (status === 'all') {
      return this.getInvoices();
    }
    return this.http.get<Invoice[]>(`${this.apiUrl}?status=${status}`);
  }

  sendInvoice(id: string): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}/verifactu-submit`, {});
  }

  markAsPaid(id: string): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, { status: 'paid' });
  }
}
