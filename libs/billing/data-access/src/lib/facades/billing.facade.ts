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

  private readonly _invoices = signal<Invoice[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _activeTab = signal<string>('all');

  readonly invoices = this._invoices.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly activeTab = this._activeTab.asReadonly();

  // Derived state
  readonly tabs = computed<BillingTabs[]>(() => {
    const invoices = this._invoices();
    return [
      { id: 'all', label: 'Todas', badge: invoices.length },
      { id: 'pending', label: 'Pendientes', badge: invoices.filter(i => i.status === 'pending').length },
      { id: 'paid', label: 'Pagadas', badge: invoices.filter(i => i.status === 'paid').length },
      { id: 'cancelled', label: 'Canceladas', badge: invoices.filter(i => i.status === 'cancelled').length },
    ];
  });

  loadInvoices(): void {
    this._isLoading.set(true);
    this.service.getInvoices().subscribe({
      next: (data) => {
        this._invoices.set(data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Error loading invoices');
        this._isLoading.set(false);
      }
    });
  }

  setTab(tabId: string): void {
    this._activeTab.set(tabId);
    this._isLoading.set(true);
    
    if (tabId === 'all') {
      this.service.getInvoices().subscribe({
        next: (data) => {
          this._invoices.set(data);
          this._isLoading.set(false);
        },
        error: () => this._isLoading.set(false)
      });
    } else {
      this.service.getInvoicesByStatus(tabId).subscribe({
        next: (data) => {
          this._invoices.set(data);
          this._isLoading.set(false);
        },
        error: () => this._isLoading.set(false)
      });
    }
  }

  searchInvoices(term: string): void {
    this._isLoading.set(true);
    this.service.searchInvoices(term).subscribe({
      next: (data) => {
        this._invoices.set(data);
        this._isLoading.set(false);
      },
      error: () => this._isLoading.set(false)
    });
  }

  createInvoice(invoice: Omit<Invoice, 'id'>): void {
    this.service.createInvoice(invoice).subscribe({
      next: (newItem) => {
        this._invoices.update(items => [...items, newItem]);
      }
    });
  }

  updateInvoice(id: string, updates: Partial<Invoice>): void {
    this.service.updateInvoice(id, updates).subscribe({
      next: (updatedItem) => this._invoices.update(items => 
        items.map(i => i.id === id ? updatedItem : i)
      )
    });
  }

  deleteInvoice(id: string): void {
    this.service.deleteInvoice(id).subscribe({
      next: (success) => {
        if (success) {
          this._invoices.update(items => items.filter(i => i.id !== id));
        }
      }
    });
  }

  sendInvoice(id: string): void {
    this.service.sendInvoice(id).subscribe({
      next: (updatedItem) => this._invoices.update(items => 
        items.map(i => i.id === id ? updatedItem : i)
      )
    });
  }

  markAsPaid(id: string): void {
    this.service.markAsPaid(id).subscribe({
      next: (updatedItem) => this._invoices.update(items => 
        items.map(i => i.id === id ? updatedItem : i)
      )
    });
  }
}
