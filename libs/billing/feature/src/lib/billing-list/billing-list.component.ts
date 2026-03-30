import { Component, OnInit, inject, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  UiTableComponent,
  UiButtonComponent,
  UiSearchComponent,
  UiPaginationComponent,
  UiBadgeComponent,
  UiLoaderComponent,
  UiModalComponent,
  UiTabsComponent,
} from '@josanz-erp/shared-ui-kit';
import { LucideAngularModule } from 'lucide-angular';
import { BILLING_FEATURE_CONFIG } from '../billing-feature.config';
import { BillingFacade, Invoice } from '@josanz-erp/billing-data-access';
import { VerifactuStore } from '@josanz-erp/verifactu-data-access';

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
    UiTabsComponent,
    LucideAngularModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Facturación</h1>
          <p class="subtitle">Gestiona facturas y envíos a VeriFactu</p>
        </div>
        @if (config.enableCreate) {
          <ui-josanz-button icon="plus" (clicked)="openCreateModal()">
            Nueva factura
          </ui-josanz-button>
        }
      </div>

      <ui-josanz-tabs
        [tabs]="tabs()"
        [activeTab]="activeTab()"
        (tabChange)="onTabChange($event)"
      ></ui-josanz-tabs>

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
          <ng-template #cellTemplate let-inv let-key="key">
            @switch (key) {
              @case ('invoiceNumber') {
                <a [routerLink]="['/billing', inv.id]" class="invoice-link">{{ inv.invoiceNumber }}</a>
              }
              @case ('type') {
                {{ inv.type === 'rectificative' ? 'Rectificativa' : 'Normal' }}
              }
              @case ('total') {
                {{ inv.total | currency: 'EUR' }}
              }
              @case ('issueDate') {
                {{ formatDate(inv.issueDate) }}
              }
              @case ('dueDate') {
                <span [class.overdue]="isOverdue(inv)">{{ formatDate(inv.dueDate) }}</span>
              }
              @case ('status') {
                <ui-josanz-badge [variant]="getStatusVariant(inv.status)">
                  {{ getStatusLabel(inv.status) }}
                </ui-josanz-badge>
              }
              @case ('verifactuStatus') {
                @if (inv.verifactuStatus) {
                  <ui-josanz-badge [variant]="getVerifactuVariant(inv.verifactuStatus)">
                    {{ getVerifactuLabel(inv.verifactuStatus) }}
                  </ui-josanz-badge>
                } @else {
                  —
                }
              }
              @case ('actions') {
                <div class="actions">
                  <button type="button" class="action-btn" [routerLink]="['/billing', inv.id]" title="Ver">
                    <lucide-icon name="eye"></lucide-icon>
                  </button>
                  @if (config.enableEdit) {
                    <button type="button" class="action-btn" title="Editar" (click)="editInvoice(inv)">
                      <lucide-icon name="pencil"></lucide-icon>
                    </button>
                  }
                  <button
                    type="button"
                    class="action-btn success"
                    title="Marcar enviada"
                    (click)="sendInvoice(inv)"
                  >
                    <lucide-icon name="send"></lucide-icon>
                  </button>
                  <button
                    type="button"
                    class="action-btn success"
                    title="Marcar pagada"
                    (click)="markAsPaid(inv)"
                  >
                    <lucide-icon name="check-circle"></lucide-icon>
                  </button>
                  @if (config.enableVerifactu) {
                    <button
                      type="button"
                      class="action-btn verifactu"
                      title="Enviar a VeriFactu"
                      (click)="sendToVerifactu(inv)"
                    >
                      <lucide-icon name="shield-check"></lucide-icon>
                    </button>
                    <button
                      type="button"
                      class="action-btn verifactu-qr"
                      title="Ver QR VeriFactu"
                      (click)="viewVerifactuQr(inv)"
                    >
                      <lucide-icon name="qr-code"></lucide-icon>
                    </button>
                  }
                  @if (config.enableDelete) {
                    <button type="button" class="action-btn danger" title="Eliminar" (click)="confirmDelete(inv)">
                      <lucide-icon name="trash-2"></lucide-icon>
                    </button>
                  }
                </div>
              }
              @default {
                {{ inv[key] }}
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

    <ui-josanz-modal
      [isOpen]="isModalOpen()"
      [title]="editingInvoice() ? 'Editar factura' : 'Nueva factura'"
      (closed)="closeModal()"
    >
      <form>
        <div class="form-grid">
          <div class="form-group">
            <label for="invoiceNumber">Nº factura</label>
            <input
              id="invoiceNumber"
              type="text"
              name="invoiceNumber"
              [(ngModel)]="formData.invoiceNumber"
              placeholder="F/2026/0001"
            />
          </div>
          <div class="form-group">
            <label for="clientName">Cliente *</label>
            <input
              id="clientName"
              type="text"
              name="clientName"
              [(ngModel)]="formData.clientName"
              required
              placeholder="Nombre del cliente"
            />
          </div>
          <div class="form-group">
            <label for="budgetId">Presupuesto</label>
            <input id="budgetId" type="text" name="budgetId" [(ngModel)]="formData.budgetId" />
          </div>
          <div class="form-group">
            <label for="type">Tipo</label>
            <select id="type" name="type" [(ngModel)]="formData.type">
              <option value="normal">Normal</option>
              <option value="rectificative">Rectificativa</option>
            </select>
          </div>
          <div class="form-group">
            <label for="status">Estado</label>
            <select id="status" name="status" [(ngModel)]="formData.status">
              <option value="draft">Borrador</option>
              <option value="pending">Pendiente</option>
              <option value="sent">Enviada</option>
              <option value="paid">Pagada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          <div class="form-group">
            <label for="total">Importe</label>
            <input id="total" type="number" name="total" [(ngModel)]="formData.total" step="0.01" />
          </div>
          <div class="form-group">
            <label for="issueDate">Fecha emisión</label>
            <input id="issueDate" type="date" name="issueDate" [(ngModel)]="formData.issueDate" />
          </div>
          <div class="form-group">
            <label for="dueDate">Vencimiento</label>
            <input id="dueDate" type="date" name="dueDate" [(ngModel)]="formData.dueDate" />
          </div>
        </div>
      </form>
      <div modal-footer>
        <ui-josanz-button variant="secondary" (clicked)="closeModal()">Cancelar</ui-josanz-button>
        <ui-josanz-button (clicked)="saveInvoice()" [disabled]="!formData.clientName">
          {{ editingInvoice() ? 'Actualizar' : 'Crear' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <ui-josanz-modal
      [isOpen]="isDeleteModalOpen()"
      title="Confirmar eliminación"
      (closed)="closeDeleteModal()"
    >
      <p>
        ¿Eliminar la factura
        <strong>{{ invoiceToDelete()?.invoiceNumber }}</strong>
        ?
      </p>
      <div modal-footer>
        <ui-josanz-button variant="secondary" (clicked)="closeDeleteModal()">Cancelar</ui-josanz-button>
        <ui-josanz-button variant="danger" (clicked)="deleteInvoice()">Eliminar</ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <ui-josanz-modal
      [isOpen]="isVerifactuQrModalOpen()"
      title="Verificación VeriFactu"
      variant="dark"
      [showFooter]="false"
      (closed)="closeVerifactuQrModal()"
    >
      @if (verifactuStore.loading()) {
        <ui-josanz-loader message="Cargando datos VeriFactu..."></ui-josanz-loader>
      } @else if (verifactuStore.error()) {
        <p class="vf-error">{{ verifactuStore.error() }}</p>
        <div class="vf-modal-actions">
          <ui-josanz-button variant="secondary" (clicked)="closeVerifactuQrModal()">Cerrar</ui-josanz-button>
        </div>
      } @else if (verifactuStore.selectedInvoice(); as inv) {
        <div class="vf-detail">
          <div class="vf-section">
            <h4>Factura</h4>
            <div class="vf-grid">
              <div class="vf-item">
                <span class="vf-label">Serie</span>
                <span>{{ inv.series }}</span>
              </div>
              <div class="vf-item">
                <span class="vf-label">Número</span>
                <span>{{ inv.number }}</span>
              </div>
              <div class="vf-item">
                <span class="vf-label">Fecha emisión</span>
                <span>{{ formatDate(inv.issueDate) }}</span>
              </div>
              <div class="vf-item">
                <span class="vf-label">Estado VeriFactu</span>
                <span class="vf-status">{{ inv.verifactuStatus }}</span>
              </div>
            </div>
          </div>
          <div class="vf-section">
            <h4>Cliente</h4>
            <div class="vf-grid">
              <div class="vf-item vf-span-2">
                <span class="vf-label">Nombre</span>
                <span>{{ inv.customerName }}</span>
              </div>
              <div class="vf-item">
                <span class="vf-label">NIF</span>
                <span>{{ inv.customerNif }}</span>
              </div>
            </div>
          </div>
          <div class="vf-section">
            <h4>Totales</h4>
            <div class="vf-grid">
              <div class="vf-item">
                <span class="vf-label">Subtotal</span>
                <span>{{ formatCurrencyEu(inv.subtotal) }}</span>
              </div>
              <div class="vf-item">
                <span class="vf-label">IVA</span>
                <span>{{ formatCurrencyEu(inv.taxAmount) }}</span>
              </div>
              <div class="vf-item vf-highlight">
                <span class="vf-label">Total</span>
                <span>{{ formatCurrencyEu(inv.total) }}</span>
              </div>
            </div>
          </div>
          <div class="vf-section">
            <h4>AEAT</h4>
            <div class="vf-grid">
              <div class="vf-item vf-span-2">
                <span class="vf-label">Referencia</span>
                <span>{{ inv.aeatReference || 'Pendiente' }}</span>
              </div>
              @if (inv.hashChain?.currentHash) {
                <div class="vf-item vf-span-2">
                  <span class="vf-label">Hash</span>
                  <span class="vf-hash">{{ inv.hashChain.currentHash }}</span>
                </div>
              }
            </div>
          </div>
          @if (inv.qrCode) {
            <div class="vf-section vf-qr">
              <h4>QR de verificación</h4>
              <div class="vf-qr-wrap">
                <img [src]="inv.qrCode" alt="Código QR VeriFactu" class="vf-qr-img" />
              </div>
            </div>
          } @else {
            <p class="vf-qr-missing">QR no disponible.</p>
          }
        </div>
      }
    </ui-josanz-modal>
  `,
  styles: [
    `
      .page-container {
        padding: 24px;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
      }
      .header-content h1 {
        margin: 0 0 4px 0;
        color: white;
        font-size: 28px;
        font-weight: 700;
      }
      .subtitle {
        margin: 0;
        color: #94a3b8;
        font-size: 14px;
      }
      .filters-bar {
        display: flex;
        gap: 16px;
        margin: 20px 0;
      }
      .invoice-link {
        color: #4f46e5;
        text-decoration: none;
        font-weight: 600;
        font-family: monospace;
      }
      .invoice-link:hover {
        text-decoration: underline;
      }
      .overdue {
        color: #ef4444;
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      .action-btn {
        background: none;
        border: none;
        padding: 6px;
        cursor: pointer;
        color: #94a3b8;
        border-radius: 6px;
        transition: all 0.2s;
      }
      .action-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }
      .action-btn.success:hover {
        background: rgba(34, 197, 94, 0.15);
        color: #22c55e;
      }
      .action-btn.danger:hover {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
      }
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
        color: #94a3b8;
        font-size: 13px;
        font-weight: 500;
      }
      .form-group input,
      .form-group select {
        background: #0f172a;
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
        border-color: #4f46e5;
      }
      .form-group input::placeholder {
        color: #64748b;
      }
      .verifactu {
        color: #0ea5e9;
      }
      .verifactu:hover {
        background: rgba(14, 165, 233, 0.15);
      }
      .verifactu-qr {
        color: #22c55e;
      }
      .verifactu-qr:hover {
        background: rgba(34, 197, 94, 0.15);
      }
      .vf-detail {
        display: flex;
        flex-direction: column;
        gap: 20px;
        min-width: min(520px, 85vw);
      }
      .vf-section h4 {
        margin: 0 0 12px 0;
        font-size: 13px;
        font-weight: 600;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .vf-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px 20px;
      }
      .vf-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .vf-item.vf-span-2 {
        grid-column: 1 / -1;
      }
      .vf-item.vf-highlight span:last-child {
        font-weight: 700;
        color: #4ade80;
      }
      .vf-label {
        font-size: 12px;
        color: #64748b;
      }
      .vf-status {
        font-weight: 600;
        color: #38bdf8;
      }
      .vf-hash {
        font-family: ui-monospace, monospace;
        font-size: 12px;
        word-break: break-all;
        color: #cbd5e1;
      }
      .vf-error {
        color: #f87171;
        margin: 0 0 16px 0;
      }
      .vf-modal-actions {
        display: flex;
        justify-content: flex-end;
      }
      .vf-qr-wrap {
        display: flex;
        justify-content: center;
        padding: 12px;
        background: #0f172a;
        border-radius: 12px;
        border: 1px solid #334155;
      }
      .vf-qr-img {
        max-width: 280px;
        width: 100%;
        height: auto;
        border-radius: 8px;
      }
      .vf-qr-missing {
        margin: 0;
        font-size: 14px;
        color: #94a3b8;
      }
    `,
  ],
})
export class BillingListComponent implements OnInit {
  public readonly config = inject(BILLING_FEATURE_CONFIG);
  private readonly facade = inject(BillingFacade);
  readonly verifactuStore = inject(VerifactuStore);

  tabs = this.facade.tabs;
  columns = this.config.defaultColumns;

  invoices = this.facade.invoices;
  isLoading = this.facade.isLoading;
  activeTab = this.facade.activeTab;
  currentPage = signal(1);
  totalPages = signal(1);
  searchTerm = '';

  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  isVerifactuQrModalOpen = signal(false);
  editingInvoice = signal<Invoice | null>(null);
  invoiceToDelete = signal<Invoice | null>(null);

  formData: Partial<Invoice> = {
    invoiceNumber: '',
    clientName: '',
    budgetId: '',
    type: 'normal',
    status: 'draft',
    total: 0,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    verifactuStatus: 'pending',
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
    const year = new Date().getFullYear();
    const count = this.invoices().length + 1;
    const nextNumber = 'F/' + year + '/' + count.toString().padStart(4, '0');
    this.formData = {
      invoiceNumber: nextNumber,
      clientName: '',
      budgetId: '',
      type: 'normal',
      status: 'draft',
      total: 0,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      verifactuStatus: 'pending',
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
    console.log('Download PDF for invoice:', invoice.invoiceNumber);
  }

  sendInvoice(invoice: Invoice) {
    this.facade.sendInvoice(invoice.id);
  }

  sendToVerifactu(invoice: Invoice): void {
    const tenantId = 'default-tenant';
    this.verifactuStore.submitInvoiceDirect(invoice.id, tenantId);
    this.facade.updateInvoice(invoice.id, { verifactuStatus: 'sent' });
  }

  viewVerifactuQr(invoice: Invoice): void {
    this.verifactuStore.clearError();
    this.isVerifactuQrModalOpen.set(true);
    this.verifactuStore.loadInvoiceDetailWithQr(invoice.id);
  }

  closeVerifactuQrModal(): void {
    this.isVerifactuQrModalOpen.set(false);
    this.verifactuStore.clearSelectedInvoice();
    this.verifactuStore.clearError();
  }

  markAsPaid(invoice: Invoice) {
    this.facade.markAsPaid(invoice.id);
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'error' | 'default' {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'sent':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'draft':
        return 'Borrador';
      case 'pending':
        return 'Pendiente';
      case 'sent':
        return 'Enviada';
      case 'paid':
        return 'Pagada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  }

  getVerifactuVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
    switch (status) {
      case 'sent':
        return 'success';
      case 'pending':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  }

  getVerifactuLabel(status: string): string {
    switch (status) {
      case 'sent':
        return 'Enviada';
      case 'pending':
        return 'Pendiente';
      case 'error':
        return 'Error';
      default:
        return status;
    }
  }

  isOverdue(invoice: Invoice): boolean {
    return (
      invoice.status !== 'paid' &&
      invoice.status !== 'cancelled' &&
      new Date(invoice.dueDate) < new Date()
    );
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }

  formatCurrencyEu(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  }
}
