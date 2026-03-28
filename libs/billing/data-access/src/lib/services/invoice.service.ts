import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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

  // Mock data
  private mockInvoices: Invoice[] = [
    {
      id: 'inv-001',
      invoiceNumber: 'F/2026/0001',
      budgetId: 'bgt-001',
      clientName: 'Producciones Audiovisuales Madrid',
      status: 'paid',
      type: 'normal',
      total: 4500,
      issueDate: '2026-03-20',
      dueDate: '2026-04-20',
      verifactuStatus: 'sent',
    },
    {
      id: 'inv-002',
      invoiceNumber: 'F/2026/0002',
      budgetId: 'bgt-002',
      clientName: 'Cadena TV España',
      status: 'pending',
      type: 'normal',
      total: 8750,
      issueDate: '2026-03-22',
      dueDate: '2026-04-22',
      verifactuStatus: 'sent',
    },
    {
      id: 'inv-003',
      invoiceNumber: 'F/2026/0003',
      budgetId: 'bgt-003',
      clientName: 'Film Studios Barcelona',
      status: 'sent',
      type: 'normal',
      total: 3200,
      issueDate: '2026-03-18',
      dueDate: '2026-04-18',
      verifactuStatus: 'pending',
    },
  ];

  getInvoices(): Observable<Invoice[]> {
    return of(this.mockInvoices).pipe(delay(300));
  }

  getInvoice(id: string): Observable<Invoice | undefined> {
    return of(this.mockInvoices.find(i => i.id === id)).pipe(delay(200));
  }

  createInvoice(invoice: Omit<Invoice, 'id'>): Observable<Invoice> {
    const newInvoice: Invoice = {
      ...invoice,
      id: 'inv-' + Date.now().toString(36),
    };
    this.mockInvoices = [...this.mockInvoices, newInvoice];
    return of(newInvoice).pipe(delay(300));
  }

  updateInvoice(id: string, invoice: Partial<Invoice>): Observable<Invoice> {
    const index = this.mockInvoices.findIndex(i => i.id === id);
    if (index >= 0) {
      this.mockInvoices[index] = { ...this.mockInvoices[index], ...invoice };
      return of(this.mockInvoices[index]).pipe(delay(300));
    }
    throw new Error('Invoice not found');
  }

  deleteInvoice(id: string): Observable<boolean> {
    const index = this.mockInvoices.findIndex(i => i.id === id);
    if (index >= 0) {
      this.mockInvoices = this.mockInvoices.filter(i => i.id !== id);
      return of(true).pipe(delay(300));
    }
    return of(false);
  }

  searchInvoices(term: string): Observable<Invoice[]> {
    const searchTerm = term.toLowerCase();
    const results = this.mockInvoices.filter(i =>
      i.invoiceNumber.toLowerCase().includes(searchTerm) ||
      i.clientName.toLowerCase().includes(searchTerm)
    );
    return of(results).pipe(delay(200));
  }

  getInvoicesByStatus(status: string): Observable<Invoice[]> {
    if (status === 'all') {
      return this.getInvoices();
    }
    return of(this.mockInvoices.filter(i => i.status === status)).pipe(delay(200));
  }

  sendInvoice(id: string): Observable<Invoice> {
    return this.updateInvoice(id, { status: 'sent' });
  }

  markAsPaid(id: string): Observable<Invoice> {
    return this.updateInvoice(id, { status: 'paid' });
  }
}
