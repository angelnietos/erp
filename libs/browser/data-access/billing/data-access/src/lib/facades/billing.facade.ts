import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Invoice, InvoiceService } from '../services/invoice.service';
import { Budget } from '@josanz-erp/budget-api';
import { VerifactuService } from '@josanz-erp/verifactu-data-access';
import { getStoredTenantId } from '@josanz-erp/identity-data-access';

export interface BillingTabs {
  id: string;
  label: string;
  badge: number;
}

@Injectable({ providedIn: 'root' })
export class BillingFacade {
  private readonly service = inject(InvoiceService);
  private readonly verifactuService = inject(VerifactuService);

  /** Full list from API; tabs and mutations keep this in sync. */
  private readonly _allInvoices = signal<Invoice[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _activeTab = signal<string>('all');
  private readonly _searchTerm = signal<string>('');

  private readonly _budgets = signal<Budget[]>([]);

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
          (i.clientName || '').toLowerCase().includes(s),
      );
    }
    return list;
  });

  readonly allInvoices = this._allInvoices.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly activeTab = this._activeTab.asReadonly();
  readonly budgets = this._budgets.asReadonly();

  readonly tabs = computed<BillingTabs[]>(() => {
    const invoices = this._allInvoices();
    return [
      { id: 'all', label: 'Todas', badge: invoices.length },
      {
        id: 'pending',
        label: 'Pendientes',
        badge: invoices.filter((i) => i.status === 'pending').length,
      },
      {
        id: 'paid',
        label: 'Pagadas',
        badge: invoices.filter((i) => i.status === 'paid').length,
      },
      {
        id: 'cancelled',
        label: 'Canceladas',
        badge: invoices.filter((i) => i.status === 'cancelled').length,
      },
    ];
  });

  /** Inserta o sustituye una factura en memoria (p. ej. tras crear/editar en formulario). */
  upsertInvoice(invoice: Invoice): void {
    this._allInvoices.update((items) => {
      const idx = items.findIndex((i) => i.id === invoice.id);
      if (idx >= 0) {
        const next = [...items];
        next[idx] = invoice;
        return next;
      }
      return [...items, invoice];
    });
  }

  loadInvoices(force = false): void {
    if (!force && this._allInvoices().length > 0) return;
    this._error.set(null);
    this._isLoading.set(true);
    this.service.getInvoices().subscribe({
      next: (data) => {
        this._allInvoices.set(data);
        this._isLoading.set(false);
        this._error.set(null);
      },
      error: () => {
        this._isLoading.set(false);
        this._error.set(
          'No se pudieron cargar las facturas. Comprueba la conexión e inténtalo de nuevo.',
        );
      },
    });
  }

  setTab(tabId: string): void {
    this._activeTab.set(tabId);
  }

  searchInvoices(term: string): void {
    this._searchTerm.set(term);
  }

  /**
   * Crea en API y sincroniza `_allInvoices`. Para encadenar navegación o toasts, usar esto.
   */
  createInvoice$(invoice: Omit<Invoice, 'id'>): Observable<Invoice> {
    return this.service.createInvoice(invoice).pipe(
      tap((newItem) =>
        this._allInvoices.update((items) => [...items, newItem]),
      ),
    );
  }

  createInvoice(invoice: Omit<Invoice, 'id'>): void {
    this.createInvoice$(invoice).subscribe();
  }

  /**
   * Actualiza en API y sincroniza `_allInvoices`. Reutilizable desde formulario,
   * listado o detalle cuando hace falta encadenar (p. ej. navegar tras guardar).
   */
  updateInvoice$(id: string, updates: Partial<Invoice>): Observable<Invoice> {
    return this.service.updateInvoice(id, updates).pipe(
      tap((updatedItem) =>
        this._allInvoices.update((items) =>
          items.map((i) => (i.id === id ? updatedItem : i)),
        ),
      ),
    );
  }

  updateInvoice(id: string, updates: Partial<Invoice>): void {
    this.updateInvoice$(id, updates).subscribe();
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
        this._allInvoices.update((items) =>
          items.map((i) => (i.id === id ? updatedItem : i)),
        ),
    });
  }

  markAsPaid(id: string): void {
    this.service.markAsPaid(id).subscribe({
      next: (updatedItem) =>
        this._allInvoices.update((items) =>
          items.map((i) => (i.id === id ? updatedItem : i)),
        ),
    });
  }

  loadBudgets(): void {
    this.service.getBudgets().subscribe({
      next: (budgets) => {
        this._budgets.set(budgets);
      },
      error: (error) => {
        console.error('Error loading budgets:', error);
      },
    });
  }

  submitToVerifactu(invoiceId: string): void {
    const tenantId = getStoredTenantId();
    if (!tenantId) return;
    this.verifactuService.submitInvoiceDirect(invoiceId, tenantId).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadInvoices(true);
        } else {
          this.updateInvoice(invoiceId, { verifactuStatus: 'error' });
        }
      },
      error: () => {
        this.updateInvoice(invoiceId, { verifactuStatus: 'error' });
      },
    });
  }

  cancelInvoice(invoiceId: string): void {
    const tenantId = getStoredTenantId();
    if (!tenantId) return;
    this.verifactuService.cancelInvoice(invoiceId, tenantId).subscribe({
      next: (ok) => {
        if (ok) {
          this.updateInvoice(invoiceId, {
            status: 'cancelled',
            verifactuStatus: 'error',
          });
        }
      },
    });
  }
}
