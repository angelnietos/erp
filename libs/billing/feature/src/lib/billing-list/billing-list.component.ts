import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiTableComponent, UiButtonComponent, UiSearchComponent, UiPaginationComponent, UiBadgeComponent, UiLoaderComponent, UiTabsComponent, TabItem } from '@josanz-erp/shared-ui-kit';

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
}

@Component({
  selector: 'lib-billing-list',
  standalone: true,
  imports: [CommonModule, RouterModule, UiTableComponent, UiButtonComponent, UiSearchComponent, UiPaginationComponent, UiBadgeComponent, UiLoaderComponent, UiTabsComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Facturación</h1>
          <p class="subtitle">Gestiona las facturas del sistema</p>
        </div>
        <ui-josanz-button icon="plus" (clicked)="openCreateModal()">
          Nueva Factura
        </ui-josanz-button>
      </div>

      <ui-josanz-tabs [tabs]="tabs" [activeTab]="activeTab()" (tabChange)="onTabChange($event)"></ui-josanz-tabs>

      <div class="filters-bar">
        <ui-josanz-search 
          placeholder="Buscar facturas..." 
          (searchChange)="onSearch($event)"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <ui-josanz-loader message="Cargando facturas..."></ui-josanz-loader>
      } @else {
        <ui-josanz-table [columns]="columns" [data]="invoices()">
          <ng-template #cellTemplate let-invoice let-key="key">
            @switch (key) {
              @case ('invoiceNumber') {
                <a [routerLink]="['/billing', invoice.id]" class="invoice-link">
                  {{ invoice.invoiceNumber }}
                </a>
              }
              @case ('status') {
                <ui-josanz-badge [variant]="getStatusVariant(invoice.status)">
                  {{ getStatusLabel(invoice.status) }}
                </ui-josanz-badge>
              }
              @case ('type') {
                <ui-josanz-badge variant="default">{{ invoice.type === 'normal' ? 'Normal' : 'Rectificativa' }}</ui-josanz-badge>
              }
              @case ('total') {
                <strong>{{ invoice.total | currency:'EUR' }}</strong>
              }
              @case ('issueDate') {
                {{ formatDate(invoice.issueDate) }}
              }
              @case ('dueDate') {
                <span [class.overdue]="isOverdue(invoice)">{{ formatDate(invoice.dueDate) }}</span>
              }
              @case ('verifactuStatus') {
                @if (invoice.verifactuStatus) {
                  <ui-josanz-badge [variant]="getVerifactuVariant(invoice.verifactuStatus)">
                    {{ getVerifactuLabel(invoice.verifactuStatus) }}
                  </ui-josanz-badge>
                }
              }
              @case ('actions') {
                <div class="actions">
                  <button class="action-btn" [routerLink]="['/billing', invoice.id]" title="Ver">
                    <i-lucide name="eye"></i-lucide>
                  </button>
                  <button class="action-btn" title="Descargar PDF">
                    <i-lucide name="download"></i-lucide>
                  </button>
                  @if (invoice.status === 'pending') {
                    <button class="action-btn" title="Enviar">
                      <i-lucide name="send"></i-lucide>
                    </button>
                  }
                </div>
              }
              @default {
                {{ invoice[key] }}
              }
            }
          </ng-template>
        </ui-josanz-table>

        <ui-josanz-pagination 
          [currentPage]="currentPage()" 
          [totalPages]="totalPages()"
          (pageChange)="onPageChange($event)"
        ></ui-josanz-pagination>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px;
    }
    .header-content h1 { margin: 0 0 4px 0; color: white; font-size: 28px; font-weight: 700; }
    .subtitle { margin: 0; color: #94A3B8; font-size: 14px; }
    .filters-bar { display: flex; gap: 16px; margin: 20px 0; }
    .invoice-link { color: #4F46E5; text-decoration: none; font-weight: 600; font-family: monospace; }
    .invoice-link:hover { text-decoration: underline; }
    .overdue { color: #EF4444; }
    .actions { display: flex; gap: 8px; }
    .action-btn {
      background: none; border: none; padding: 6px; cursor: pointer;
      color: #94A3B8; border-radius: 6px; transition: all 0.2s;
    }
    .action-btn:hover { background: rgba(255,255,255,0.1); color: white; }
  `],
})
export class BillingListComponent implements OnInit {
  tabs: TabItem[] = [
    { id: 'all', label: 'Todas', badge: 0 },
    { id: 'pending', label: 'Pendientes', badge: 0 },
    { id: 'paid', label: 'Pagadas', badge: 0 },
    { id: 'cancelled', label: 'Canceladas', badge: 0 },
  ];

  columns = [
    { key: 'invoiceNumber', header: 'Factura', width: '120px' },
    { key: 'clientName', header: 'Cliente' },
    { key: 'type', header: 'Tipo', width: '120px' },
    { key: 'total', header: 'Importe', width: '120px' },
    { key: 'issueDate', header: 'Fecha Emisión', width: '120px' },
    { key: 'dueDate', header: 'Vencimiento', width: '120px' },
    { key: 'status', header: 'Estado', width: '120px' },
    { key: 'verifactuStatus', header: 'Verifactu', width: '120px' },
    { key: 'actions', header: '', width: '120px' },
  ];

  invoices = signal<Invoice[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  activeTab = signal('all');
  searchTerm = '';

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.isLoading.set(true);
    setTimeout(() => {
      this.invoices.set([
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
      ]);
      this.isLoading.set(false);
      this.totalPages.set(1);
    }, 500);
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'error' | 'default' {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'sent': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'pending': return 'Pendiente';
      case 'sent': return 'Enviada';
      case 'paid': return 'Pagada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  }

  getVerifactuVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
    switch (status) {
      case 'sent': return 'success';
      case 'pending': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  }

  getVerifactuLabel(status: string): string {
    switch (status) {
      case 'sent': return 'Enviada';
      case 'pending': return 'Pendiente';
      case 'error': return 'Error';
      default: return status;
    }
  }

  isOverdue(invoice: Invoice): boolean {
    return invoice.status !== 'paid' && new Date(invoice.dueDate) < new Date();
  }

  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
  }

  onSearch(term: string) {
    this.searchTerm = term;
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadInvoices();
  }

  openCreateModal() {
    // TODO
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES');
  }
}