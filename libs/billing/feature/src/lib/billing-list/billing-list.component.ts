import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UiTableComponent, UiButtonComponent, UiSearchComponent, UiPaginationComponent, UiBadgeComponent, UiLoaderComponent, UiModalComponent, UiInputComponent, UiSelectComponent } from '@josanz-erp/shared-ui-kit';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Invoice, BillingFacade } from '@josanz-erp/billing-data-access';
import { BILLING_FEATURE_CONFIG } from '../billing-feature.config';

@Component({
  selector: 'lib-billing-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    UiTableComponent, 
    UiButtonComponent, 
    UiSearchComponent, 
    UiPaginationComponent, 
    UiBadgeComponent,
    UiLoaderComponent,
    UiModalComponent,
    UiInputComponent,
    UiSelectComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Facturación</h1>
          <p class="subtitle">Gestiona las facturas del sistema</p>
        </div>
        @if (config.enableCreate) {
          <ui-josanz-button icon="plus" (clicked)="openCreateModal()">
            Nueva Factura
          </ui-josanz-button>
        }
      </div>

      <ui-josanz-tabs [tabs]="tabs()" [activeTab]="activeTab()" (tabChange)="onTabChange($any($event))"></ui-josanz-tabs>

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
                @if (config.enableVerifactu && invoice.verifactuStatus) {
                  <ui-josanz-badge [variant]="getVerifactuVariant(invoice.verifactuStatus)">
                    {{ getVerifactuLabel(invoice.verifactuStatus) }}
                  </ui-josanz-badge>
                }
              }
              @case ('actions') {
                <div class="actions">
                  <button class="action-btn" [routerLink]="['/billing', invoice.id]" title="Ver">
                    <lucide-icon name="eye"></lucide-icon>
                  </button>
                  <button class="action-btn" title="Descargar PDF" (click)="downloadPDF(invoice)">
                    <lucide-icon name="download"></lucide-icon>
                  </button>
                  @if (invoice.status === 'pending') {
                    <button class="action-btn" title="Enviar" (click)="sendInvoice(invoice)">
                      <lucide-icon name="send"></lucide-icon>
                    </button>
                  }
                  @if (invoice.status !== 'paid' && invoice.status !== 'cancelled') {
                    <button class="action-btn success" title="Marcar como Pagada" (click)="markAsPaid(invoice)">
                      <lucide-icon name="check-circle"></lucide-icon>
                    </button>
                  }
                  @if (config.enableEdit) {
                    <button class="action-btn" (click)="editInvoice(invoice)" title="Editar">
                      <lucide-icon name="pencil"></lucide-icon>
                    </button>
                  }
                  @if (config.enableDelete) {
                    <button class="action-btn danger" (click)="confirmDelete(invoice)" title="Eliminar">
                      <lucide-icon name="trash-2"></lucide-icon>
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

    <!-- Create/Edit Modal -->
    <ui-josanz-modal 
      [isOpen]="isModalOpen()" 
      [title]="editingInvoice() ? 'Editar Factura' : 'Nueva Factura'"
      (closed)="closeModal()"
    >
      <form>
        <div class="form-grid">
          <div class="form-group">
            <label for="invoiceNumber">Número de Factura</label>
            <input 
              type="text" 
              id="invoiceNumber"
              [(ngModel)]="formData.invoiceNumber" 
              name="invoiceNumber" 
              placeholder="F/2026/0001"
            >
          </div>
          
          <div class="form-group">
            <label for="clientName">Cliente *</label>
            <input 
              type="text" 
              id="clientName"
              [(ngModel)]="formData.clientName" 
              name="clientName" 
              required
              placeholder="Nombre del cliente"
            >
          </div>
          
          <div class="form-group">
            <label for="budgetId">Presupuesto</label>
            <input 
              type="text" 
              id="budgetId"
              [(ngModel)]="formData.budgetId" 
              name="budgetId" 
              placeholder="ID del presupuesto"
            >
          </div>
          
          <div class="form-group">
            <label for="type">Tipo</label>
            <select id="type" [(ngModel)]="formData.type" name="type">
              <option value="normal">Normal</option>
              <option value="rectificative">Rectificativa</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="total">Importe Total (€)</label>
            <input 
              type="number" 
              id="total"
              [(ngModel)]="formData.total" 
              name="total" 
              placeholder="0.00"
              step="0.01"
            >
          </div>
          
          <div class="form-group">
            <label for="status">Estado</label>
            <select id="status" [(ngModel)]="formData.status" name="status">
              <option value="draft">Borrador</option>
              <option value="pending">Pendiente</option>
              <option value="sent">Enviada</option>
              <option value="paid">Pagada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="issueDate">Fecha de Emisión</label>
            <input 
              type="date" 
              id="issueDate"
              [(ngModel)]="formData.issueDate" 
              name="issueDate" 
            >
          </div>
          
          <div class="form-group">
            <label for="dueDate">Fecha de Vencimiento</label>
            <input 
              type="date" 
              id="dueDate"
              [(ngModel)]="formData.dueDate" 
              name="dueDate" 
            >
          </div>
        </div>
      </form>
      
      <div modal-footer>
        <ui-josanz-button variant="secondary" (clicked)="closeModal()">
          Cancelar
        </ui-josanz-button>
        <ui-josanz-button 
          (clicked)="saveInvoice()"
          [disabled]="!formData.clientName"
        >
          {{ editingInvoice() ? 'Actualizar' : 'Crear' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- Delete Confirmation Modal -->
    <ui-josanz-modal
      [isOpen]="isDeleteModalOpen()"
      title="Confirmar Eliminación"
      (closed)="closeDeleteModal()"
    >
      <p>¿Estás seguro de que deseas eliminar la factura <strong>{{ invoiceToDelete()?.invoiceNumber }}</strong>?</p>
      <p class="warning-text">Esta acción no se puede deshacer.</p>
      
      <div modal-footer>
        <ui-josanz-button variant="secondary" (clicked)="closeDeleteModal()">
          Cancelar
        </ui-josanz-button>
        <ui-josanz-button variant="danger" (clicked)="deleteInvoice()">
          Eliminar
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>
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
    .action-btn.success:hover { background: rgba(34,197,94,0.15); color: #22C55E; }
    .action-btn.danger:hover { background: rgba(239,68,68,0.15); color: #EF4444; }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      color: #94A3B8;
      font-size: 13px;
      font-weight: 500;
    }
    .form-group input,
    .form-group select {
      background: #0F172A;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px 12px;
      color: white;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #4F46E5;
    }
    .form-group input::placeholder {
      color: #64748B;
    }
    .warning-text {
      color: #EF4444;
      font-size: 14px;
    }
  `],
})
export class BillingListComponent implements OnInit {
  public readonly config = inject(BILLING_FEATURE_CONFIG);
  private readonly facade = inject(BillingFacade);

  tabs = this.facade.tabs;
  columns = this.config.defaultColumns;

  invoices = this.facade.invoices;
  isLoading = this.facade.isLoading;
  activeTab = this.facade.activeTab;
  currentPage = signal(1);
  totalPages = signal(1);
  searchTerm = '';
  
  // Modal state
  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  editingInvoice = signal<Invoice | null>(null);
  invoiceToDelete = signal<Invoice | null>(null);
  
  // Form data
  formData: Partial<Invoice> = {
    invoiceNumber: '',
    clientName: '',
    budgetId: '',
    type: 'normal',
    status: 'draft',
    total: 0,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    verifactuStatus: 'pending'
  };

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.facade.loadInvoices();
  }

  onTabChange(tabId: string) {
    this.facade.setTab(tabId);
  }

  onSearch(term: string) {
    this.searchTerm = term;
    if (term.trim()) {
      this.facade.searchInvoices(term);
    } else {
      this.facade.loadInvoices();
    }
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadInvoices();
  }

  openCreateModal() {
    this.editingInvoice.set(null);
    const nextNumber = `F/${new Date().getFullYear()}/${String(this.invoices().length + 1).padStart(4, '0')}`;
    this.formData = {
      invoiceNumber: nextNumber,
      clientName: '',
      budgetId: '',
      type: 'normal',
      status: 'draft',
      total: 0,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      verifactuStatus: 'pending'
    };
    this.isModalOpen.set(true);
  }

  editInvoice(invoice: Invoice) {
    this.editingInvoice.set(invoice);
    this.formData = { ...invoice };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingInvoice.set(null);
  }

  saveInvoice() {
    if (!this.formData.clientName) return;

    const invoiceToEdit = this.editingInvoice();
    if (invoiceToEdit) {
      this.facade.updateInvoice(invoiceToEdit.id, this.formData);
      this.closeModal();
    } else {
      this.facade.createInvoice(this.formData as Omit<Invoice, 'id'>);
      this.closeModal();
    }
  }

  confirmDelete(invoice: Invoice) {
    this.invoiceToDelete.set(invoice);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.invoiceToDelete.set(null);
  }

  deleteInvoice() {
    const invoice = this.invoiceToDelete();
    if (!invoice) return;

    this.facade.deleteInvoice(invoice.id);
    this.closeDeleteModal();
  }

  downloadPDF(invoice: Invoice) {
    // TODO: Implement PDF generation
    console.log('Download PDF for invoice:', invoice.invoiceNumber);
  }

  sendInvoice(invoice: Invoice) {
    this.facade.sendInvoice(invoice.id);
  }

  markAsPaid(invoice: Invoice) {
    this.facade.markAsPaid(invoice.id);
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
    return invoice.status !== 'paid' && invoice.status !== 'cancelled' && new Date(invoice.dueDate) < new Date();
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }
}

