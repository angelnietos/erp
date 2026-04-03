import { Injectable, inject, signal, computed } from '@angular/core';
import { Invoice, InvoiceService } from '../services/invoice.service';

export interface BillingTabs {
  id: string;
  label: string;
  badge: number;
}

@Injectable({ providedIn: 'root' })
export class BillingFacade {
  private readonly service = inject(InvoiceService);

  /** Full list from API; tabs and mutations keep this in sync. */
  private readonly _allInvoices = signal<Invoice[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _activeTab = signal<string>('all');
  private readonly _searchTerm = signal<string>('');

  /** Rows shown in the table (tab + local search). */
  readonly invoices = computed<Invoice[]>(() => {
    let list = this._allInvoices();
    const tab = this._activeTab();
    if (tab !== 'all') {
      list = list.filter((i) => i.status === tab);
    }
    const s = this._searchTerm().trim().toLowerCase();
    if (s) {
      list = list.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(s) ||
          (i.clientName || '').toLowerCase().includes(s)
      );
    }
    return list;
  });

  readonly allInvoices = this._allInvoices.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly activeTab = this._activeTab.asReadonly();

  readonly tabs = computed<BillingTabs[]>(() => {
    const invoices = this._allInvoices();
    return [
      { id: 'all', label: 'Todas', badge: invoices.length },
      { id: 'pending', label: 'Pendientes', badge: invoices.filter((i) => i.status === 'pending').length },
      { id: 'paid', label: 'Pagadas', badge: invoices.filter((i) => i.status === 'paid').length },
      { id: 'cancelled', label: 'Canceladas', badge: invoices.filter((i) => i.status === 'cancelled').length },
    ];
  });

  loadInvoices(): void {
    this._isLoading.set(true);
    this.service.getInvoices().subscribe({
      next: (data) => {
        this._allInvoices.set(data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Error loading invoices');
        this._isLoading.set(false);
      },
    });
  }

  setTab(tabId: string): void {
    this._activeTab.set(tabId);
  }

  searchInvoices(term: string): void {
    this._searchTerm.set(term);
  }

  createInvoice(invoice: Omit<Invoice, 'id'>): void {
    this.service.createInvoice(invoice).subscribe({
      next: (newItem) => {
        this._allInvoices.update((items) => [...items, newItem]);
      },
    });
  }

  updateInvoice(id: string, updates: Partial<Invoice>): void {
    this.service.updateInvoice(id, updates).subscribe({
      next: (updatedItem) =>
        this._allInvoices.update((items) => items.map((i) => (i.id === id ? updatedItem : i))),
    });
  }

  deleteInvoice(id: string): void {
    this.service.deleteInvoice(id).subscribe({
      next: (success) => {
        if (success) {
          this._allInvoices.update((items) => items.filter((i) => i.id !== id));
        }
      },
    });
  }

  sendInvoice(id: string): void {
    this.service.sendInvoice(id).subscribe({
      next: (updatedItem) =>
        this._allInvoices.update((items) => items.map((i) => (i.id === id ? updatedItem : i))),
    });
  }

  markAsPaid(id: string): void {
    this.service.markAsPaid(id).subscribe({
      next: (updatedItem) =>
        this._allInvoices.update((items) => items.map((i) => (i.id === id ? updatedItem : i))),
    });
  }
}
