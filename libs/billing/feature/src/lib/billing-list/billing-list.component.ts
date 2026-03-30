import { Component, OnInit, inject, signal } from '@angular/core';
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
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="glow-text">Terminal de Facturación</h1>
          <p class="subtitle">Control de ciclos fiscales, emisión de facturas y cumplimiento VeriFactu</p>
        </div>
        @if (config.enableCreate) {
          <ui-josanz-button variant="primary" (clicked)="openCreateModal()">
            <lucide-icon name="plus" class="mr-2"></lucide-icon>
            Emitir Nueva Factura
          </ui-josanz-button>
        }
      </div>

      <div class="navigation-row">
        <ui-josanz-tabs
          [tabs]="tabs()"
          [activeTab]="activeTab()"
          variant="underline"
          (tabChange)="onTabChange($event)"
        ></ui-josanz-tabs>
      </div>

      <div class="filters-bar">
        <ui-josanz-search
          variant="filled"
          placeholder="BUSCAR NIF, CLIENTE O Nº FACTURA..."
          (searchChange)="onSearch($event)"
          class="flex-1"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <ui-josanz-loader message="Sincronizando registros fiscales..."></ui-josanz-loader>
      } @else {
        <ui-josanz-card variant="glass" class="table-card">
          <ui-josanz-table [columns]="columns" [data]="invoices()" variant="hover">
            <ng-template #cellTemplate let-inv let-key="key">
              @switch (key) {
                @case ('invoiceNumber') {
                  <a [routerLink]="['/billing', inv.id]" class="invoice-link">{{ inv.invoiceNumber }}</a>
                }
                @case ('type') {
                  <ui-josanz-badge variant="info">
                    {{ inv.type === 'rectificative' ? 'RECTIFICATIVA' : 'ORDINARIA' }}
                  </ui-josanz-badge>
                }
                @case ('total') {
                  <span class="amount-text">{{ inv.total | currency: 'EUR' }}</span>
                }
                @case ('issueDate') {
                  <span class="date-text">{{ formatDate(inv.issueDate) }}</span>
                }
                @case ('dueDate') {
                  <span class="date-text" [class.overdue]="isOverdue(inv)">{{ formatDate(inv.dueDate) }}</span>
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
                    <span class="text-muted">—</span>
                  }
                }
                @case ('actions') {
                  <div class="actions">
                    <button type="button" class="action-trigger" [routerLink]="['/billing', inv.id]" title="Ver">
                      <lucide-icon name="eye" size="18"></lucide-icon>
                    </button>
                    @if (config.enableEdit) {
                      <button type="button" class="action-trigger" title="Editar" (click)="editInvoice(inv)">
                        <lucide-icon name="pencil" size="18"></lucide-icon>
                      </button>
                    }
                    <button
                      type="button"
                      class="action-trigger success"
                      title="Marcar enviada"
                      (click)="sendInvoice(inv)"
                    >
                      <lucide-icon name="send" size="18"></lucide-icon>
                    </button>
                    <button
                      type="button"
                      class="action-trigger success"
                      title="Marcar pagada"
                      (click)="markAsPaid(inv)"
                    >
                      <lucide-icon name="check-circle" size="18"></lucide-icon>
                    </button>
                    @if (config.enableVerifactu) {
                      <button
                        type="button"
                        class="action-trigger verifactu"
                        title="Enviar a VeriFactu"
                        (click)="sendToVerifactu(inv)"
                      >
                        <lucide-icon name="shield-check" size="18"></lucide-icon>
                      </button>
                      <button
                        type="button"
                        class="action-trigger verifactu-qr"
                        title="Ver QR VeriFactu"
                        (click)="viewVerifactuQr(inv)"
                      >
                        <lucide-icon name="qr-code" size="18"></lucide-icon>
                      </button>
                    }
                    @if (config.enableDelete) {
                      <button type="button" class="action-trigger danger" title="Eliminar" (click)="confirmDelete(inv)">
                        <lucide-icon name="trash-2" size="18"></lucide-icon>
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

          <div class="pagination-wrapper">
            <ui-josanz-pagination
              [currentPage]="currentPage()"
              [totalPages]="totalPages()"
              variant="minimal"
              (pageChange)="onPageChange($event)"
            ></ui-josanz-pagination>
          </div>
        </ui-josanz-card>
      }
    </div>

    <!-- Create/Edit Modal -->
    <ui-josanz-modal
      [isOpen]="isModalOpen()"
      [title]="editingInvoice() ? 'DATOS FISCALES: EDITAR' : 'DATOS FISCALES: NUEVO'"
      (closed)="closeModal()"
      variant="dark"
    >
      <div class="form-container">
        <div class="form-grid">
          <div class="form-col">
            <label class="field-label" for="invoice-num">Nº Factura</label>
            <input
              id="invoice-num"
              type="text"
              class="technical-input"
              name="invoiceNumber"
              [(ngModel)]="formData.invoiceNumber"
              placeholder="F/2026/0001"
            />
          </div>
          <div class="form-col">
            <label class="field-label" for="billing-client">Cliente Receptor *</label>
            <input
              id="billing-client"
              type="text"
              class="technical-input"
              name="clientName"
              [(ngModel)]="formData.clientName"
              required
              placeholder="RAZÓN SOCIAL"
            />
          </div>
          <div class="form-col">
            <label class="field-label" for="billing-budget">Referencia Presupuesto</label>
            <input id="billing-budget" type="text" class="technical-input" name="budgetId" [(ngModel)]="formData.budgetId" placeholder="#PR-0000" />
          </div>
          <div class="form-col">
            <label class="field-label" for="billing-type">Tipo Contable</label>
            <select id="billing-type" name="type" class="technical-select" [(ngModel)]="formData.type">
              <option value="normal">ORDINARIA</option>
              <option value="rectificative">RECTIFICATIVA</option>
            </select>
          </div>
          <div class="form-col">
            <label class="field-label" for="billing-status">Estado de Cobro</label>
            <select id="billing-status" name="status" class="technical-select" [(ngModel)]="formData.status" (change)="onStatusChange()">
              <option value="draft">BORRADOR</option>
              <option value="pending">PENDIENTE</option>
              <option value="sent">ENVIADA</option>
              <option value="paid">PAGADA</option>
              <option value="cancelled">CANCELADA</option>
            </select>
          </div>
          <div class="form-col">
            <label class="field-label" for="billing-total">Importe Bruto (€)</label>
            <input id="billing-total" type="number" class="technical-input" name="total" [(ngModel)]="formData.total" step="0.01" />
          </div>
          <div class="form-col">
            <label class="field-label" for="billing-issue">Fecha Emisión</label>
            <input id="billing-issue" type="date" class="technical-input" name="issueDate" [(ngModel)]="formData.issueDate" />
          </div>
          <div class="form-col">
            <label class="field-label" for="billing-due">Fecha Vencimiento</label>
            <input id="billing-due" type="date" class="technical-input" name="dueDate" [(ngModel)]="formData.dueDate" />
          </div>
        </div>
      </div>
      <div modal-footer class="modal-footer">
        <ui-josanz-button variant="ghost" (clicked)="closeModal()">ABORTAR</ui-josanz-button>
        <ui-josanz-button variant="primary" (clicked)="saveInvoice()" [disabled]="!formData.clientName">
          {{ editingInvoice() ? 'ACTUALIZAR REGISTROS' : 'CONFIRMAR EMISIÓN' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- Delete Modal -->
    <ui-josanz-modal
      [isOpen]="isDeleteModalOpen()"
      title="SISTEMA: CONFIRMAR ELIMINACIÓN"
      (closed)="closeDeleteModal()"
      variant="dark"
    >
      <div class="delete-warning">
        <lucide-icon name="alert-triangle" class="warning-icon"></lucide-icon>
        <div class="warning-content">
          <p>
            ¿Estás seguro de que deseas eliminar la factura
            <strong>{{ invoiceToDelete()?.invoiceNumber }}</strong>?
          </p>
          <p class="critical-text">ESTA ACCIÓN ES IRREVERSIBLE Y PUEDE AFECTAR A LA TRAZABILIDAD FISCAL.</p>
        </div>
      </div>
      
      <div modal-footer>
        <ui-josanz-button variant="ghost" (clicked)="closeDeleteModal()">CANCELAR</ui-josanz-button>
        <ui-josanz-button variant="danger" (clicked)="deleteInvoice()">ELIMINAR DEFINITIVAMENTE</ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- Verifactu QR Modal -->
    <ui-josanz-modal
      [isOpen]="isVerifactuQrModalOpen()"
      title="SISTEMA CENTRAL: VERIFICACIÓN VERIFACTU"
      variant="dark"
      [showFooter]="false"
      (closed)="closeVerifactuQrModal()"
    >
      <div class="verifactu-container">
        @if (verifactuStore.loading()) {
          <ui-josanz-loader message="Consultando AEAT..."></ui-josanz-loader>
        } @else if (verifactuStore.error()) {
          <div class="vf-error-box">
             <lucide-icon name="alert-circle" size="32"></lucide-icon>
             <p>{{ verifactuStore.error() }}</p>
             <ui-josanz-button variant="ghost" (clicked)="closeVerifactuQrModal()">CERRAR VENTANA</ui-josanz-button>
          </div>
        } @else if (verifactuStore.selectedInvoice(); as inv) {
          <div class="vf-detail-cyber">
            <div class="vf-main-info">
              <div class="vf-id-badge">
                <span class="label">Nº FACTURA</span>
                <span class="val">{{ inv.series }}{{ inv.number }}</span>
              </div>
              <div class="vf-status-display" [class.valid]="inv.verifactuStatus === 'sent'">
                <lucide-icon [name]="inv.verifactuStatus === 'sent' ? 'check-circle' : 'clock'"></lucide-icon>
                <span>ESTADO: {{ inv.verifactuStatus | uppercase }}</span>
              </div>
            </div>

            <div class="vf-data-grid">
              <div class="vf-data-card">
                <h5 class="section-title">TRAZABILIDAD</h5>
                <div class="row"><span class="lbl">FECHA</span><span class="val">{{ formatDate(inv.issueDate) }}</span></div>
                <div class="row"><span class="lbl">AEAT REF</span><span class="val">{{ inv.aeatReference || 'PENDIENTE' }}</span></div>
                <div class="row full"><span class="lbl">HASH CADENA</span><span class="val hash">{{ inv.hashChain?.currentHash || 'N/A' }}</span></div>
              </div>
              
              <div class="vf-data-card">
                <h5 class="section-title">ENTIDAD RECEPTORA</h5>
                <div class="row"><span class="lbl">NIF</span><span class="val">{{ inv.customerNif }}</span></div>
                <div class="row full"><span class="lbl">NOMBRE</span><span class="val">{{ inv.customerName }}</span></div>
              </div>

              <div class="vf-data-card total-card">
                <h5 class="section-title">LIQUIDACIÓN</h5>
                <div class="row"><span class="lbl">BASE</span><span class="val">{{ formatCurrencyEu(inv.subtotal) }}</span></div>
                <div class="row"><span class="lbl">IVA</span><span class="val">{{ formatCurrencyEu(inv.taxAmount) }}</span></div>
                <div class="row total"><span class="lbl">TOTAL</span><span class="val">{{ formatCurrencyEu(inv.total) }}</span></div>
              </div>
            </div>

            @if (inv.qrCode) {
              <div class="vf-qr-technical">
                <h5 class="section-title">CÓDIGO DE VERIFICACIÓN AEAT</h5>
                <div class="qr-frame">
                  <img [src]="inv.qrCode" alt="QR VeriFactu" />
                </div>
                <p class="qr-intel">Escanee este código para verificar la validez legal del documento en la sede electrónica de la AEAT.</p>
              </div>
            }
            
            <div class="vf-actions-footer">
               <ui-josanz-button variant="ghost" (clicked)="closeVerifactuQrModal()">CERRAR TERMINAL</ui-josanz-button>
            </div>
          </div>
        }
      </div>
    </ui-josanz-modal>
  `,
  styles: [
    `
      .page-container { padding: 2rem; }
      
      .page-header {
        display: flex; 
        justify-content: space-between; 
        align-items: center;
        margin-bottom: 2rem;
        border-bottom: 1px solid var(--border-soft);
        padding-bottom: 1.5rem;
      }
      
      .glow-text { 
        font-size: 2.5rem; 
        font-weight: 900; 
        color: #fff; 
        margin: 0; 
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-family: var(--font-display);
        text-shadow: 0 0 20px var(--brand-glow);
      }
      
      .subtitle { margin: 0.5rem 0 0 0; color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; }
      
      .navigation-row { margin-bottom: 2rem; }
      
      .filters-bar { margin-bottom: 2rem; display: flex; }
      .flex-1 { flex: 1; }
      
      .invoice-link { 
        color: var(--brand); 
        text-decoration: none; 
        font-weight: 900; 
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-family: var(--font-display);
        transition: all 0.2s;
      }
      .invoice-link:hover { color: #fff; text-shadow: 0 0 10px var(--brand-glow); }
      
      .amount-text { color: #fff; font-weight: 800; font-family: var(--font-display); }
      .date-text { color: var(--text-muted); font-size: 0.85rem; font-weight: 600; }
      .overdue { color: var(--danger); text-shadow: 0 0 5px rgba(239, 68, 68, 0.4); }
      
      .actions { display: flex; gap: 8px; }
      
      .action-trigger { 
        background: var(--bg-tertiary); 
        border: 1px solid var(--border-soft); 
        color: var(--text-muted); 
        cursor: pointer; 
        width: 32px;
        height: 32px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }
      
      .action-trigger:hover { 
        color: #fff; 
        border-color: var(--brand);
        background: var(--bg-secondary);
        box-shadow: 0 0 10px var(--brand-glow);
      }
      
      .action-trigger.success:hover { border-color: var(--success); color: var(--success); box-shadow: 0 0 10px rgba(52, 211, 153, 0.4); }
      .action-trigger.verifactu:hover { border-color: var(--info); color: var(--info); box-shadow: 0 0 10px rgba(96, 165, 250, 0.4); }
      .action-trigger.verifactu-qr:hover { border-color: var(--success); color: var(--success); box-shadow: 0 0 10px rgba(52, 211, 153, 0.4); }
      .action-trigger.danger:hover {
        border-color: var(--danger);
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
      }

      .pagination-wrapper {
        padding-top: 1rem;
        border-top: 1px solid var(--border-soft);
        margin-top: 1rem;
      }

      /* Form Styles */
      .form-container { padding: 1rem 0; }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }
      .form-col { display: flex; flex-direction: column; gap: 8px; }
      
      .field-label {
        font-size: 0.7rem;
        font-weight: 800;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }
      
      .technical-input, .technical-select {
        background: var(--bg-tertiary);
        border: 1px solid var(--border-soft);
        border-radius: 4px;
        padding: 12px 14px;
        color: #fff;
        font-size: 0.9rem;
        font-family: var(--font-main);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        outline: none;
      }
      
      .technical-input:focus, .technical-select:focus {
        border-color: var(--brand);
        background: var(--bg-secondary);
        box-shadow: 0 0 15px var(--brand-glow);
      }

      .technical-select option { background: var(--bg-secondary); color: #fff; }

      .delete-warning {
        display: flex;
        gap: 20px;
        align-items: center;
        padding: 1rem;
        background: rgba(239, 68, 68, 0.05);
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 6px;
      }
      
      .warning-icon { color: var(--danger); width: 40px; height: 40px; }
      
      .critical-text {
        color: var(--danger);
        font-weight: 800;
        font-size: 0.75rem;
        margin-top: 8px;
        text-transform: uppercase;
      }

      /* Verifactu Detail Premium Styling */
      .vf-detail-cyber {
        min-width: 500px;
        padding: 10px;
      }

      .vf-main-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid var(--border-soft);
      }

      .vf-id-badge { display: flex; flex-direction: column; }
      .vf-id-badge .label { font-size: 0.65rem; color: var(--text-muted); font-weight: 800; }
      .vf-id-badge .val { font-size: 1.5rem; color: #fff; font-weight: 900; font-family: var(--font-display); }

      .vf-status-display {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 16px;
        background: var(--bg-tertiary);
        border: 1px solid var(--border-soft);
        border-radius: 4px;
        color: var(--warning);
        font-weight: 800;
        font-size: 0.85rem;
      }
      .vf-status-display.valid { color: var(--success); border-color: var(--success); box-shadow: 0 0 10px rgba(52, 211, 153, 0.2); }

      .vf-data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }

      .vf-data-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border-soft);
        border-radius: 6px;
        padding: 1rem;
      }
      .vf-data-card.total-card { grid-column: 1 / -1; background: var(--bg-tertiary); }

      .section-title {
        font-size: 0.65rem;
        color: var(--brand);
        font-weight: 900;
        margin: 0 0 12px 0;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.85rem; }
      .row.full { flex-direction: column; gap: 4px; margin-top: 8px; }
      .row.total { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-soft); }
      .row .lbl { color: var(--text-muted); font-weight: 500; }
      .row .val { color: #fff; font-weight: 700; }
      .row.total .val { color: var(--success); font-size: 1.1rem; }
      
      .row .hash { 
        font-family: monospace; 
        font-size: 0.7rem; 
        word-break: break-all; 
        background: #000; 
        padding: 6px; 
        border-radius: 4px;
        color: var(--text-secondary);
      }

      .vf-qr-technical {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #000;
        padding: 2rem;
        border-radius: 12px;
        border: 1px solid var(--border-soft);
      }

      .qr-frame {
        padding: 1rem;
        background: #fff;
        border-radius: 8px;
        margin-bottom: 1rem;
      }
      .qr-frame img { width: 180px; height: 180px; }

      .qr-intel { font-size: 0.75rem; color: var(--text-muted); text-align: center; max-width: 300px; line-height: 1.4; }

      .vf-actions-footer { margin-top: 2rem; display: flex; justify-content: flex-end; }

      .vf-error-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        padding: 3rem;
        text-align: center;
        color: var(--danger);
      }

      .mr-2 { margin-right: 8px; }

      @media (max-width: 768px) {
        .form-grid { grid-template-columns: 1fr; }
        .vf-data-grid { grid-template-columns: 1fr; }
        .vf-detail-cyber { min-width: auto; }
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

  onStatusChange() {
    // Optional logic when status switches
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
