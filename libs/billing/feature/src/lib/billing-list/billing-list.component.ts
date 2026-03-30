import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
  UiCardComponent,
  UiInputComponent,
  UiStatCardComponent,
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
    UiCardComponent,
    UiInputComponent,
    UiStatCardComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="page-container animate-slide-up">
      <header class="page-header">
        <div class="header-breadcrumb">
          <h1 class="page-title text-uppercase">Facturación y Fiscalidad</h1>
          <div class="breadcrumb">
            <span class="active">GESTIÓN INTEGRAL</span>
            <span class="separator">/</span>
            <span>VERIFACTU REGULATION</span>
          </div>
        </div>
        <div class="header-actions">
           @if (config.enableCreate) {
             <ui-josanz-button variant="primary" size="md" (clicked)="openCreateModal()" icon="plus">
               EMITIR FACTURA
             </ui-josanz-button>
           }
        </div>
      </header>

      <div class="stats-row animate-slide-up">
        <ui-josanz-stat-card label="Total Emitido" [value]="formatCurrencyEu(totalInvoiced())" icon="trending-up" [accent]="true"></ui-josanz-stat-card>
        <ui-josanz-stat-card label="Pendiente Cobro" [value]="formatCurrencyEu(totalPending())" icon="clock" [trend]="5"></ui-josanz-stat-card>
        <ui-josanz-stat-card label="Documentos AEAT" [value]="allInvoices().length.toString()" icon="shield-check"></ui-josanz-stat-card>
      </div>

      <div class="navigation-bar">
        <ui-josanz-tabs
          [tabs]="tabs()"
          [activeTab]="activeTab()"
          variant="underline"
          (tabChange)="onTabChange($event)"
        ></ui-josanz-tabs>
        
        <ui-josanz-search
          variant="filled"
          placeholder="BUSCAR NIF, CLIENTE O Nº..."
          (searchChange)="onSearch($event)"
          class="search-bar"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <div class="loader-container">
          <ui-josanz-loader message="SINCRONIZANDO DATOS FISCALES..."></ui-josanz-loader>
        </div>
      } @else {
        <ui-josanz-card variant="glass" class="table-card ui-neon">
          <ui-josanz-table [columns]="columns" [data]="invoices()" variant="default">
            <ng-template #cellTemplate let-inv let-key="key">
              @switch (key) {
                @case ('invoiceNumber') {
                  <a [routerLink]="['/billing', inv.id]" class="invoice-link text-uppercase">{{ inv.invoiceNumber }}</a>
                }
                @case ('type') {
                  <ui-josanz-badge [variant]="inv.type === 'rectificative' ? 'warning' : 'primary'">
                    {{ inv.type === 'rectificative' ? 'RECTIFICATIVA' : 'ORDINARIA' }}
                  </ui-josanz-badge>
                }
                @case ('total') {
                  <span class="currency-value">{{ inv.total | currency: 'EUR' }}</span>
                }
                @case ('issueDate') {
                  <span class="text-secondary font-mono">{{ formatDate(inv.issueDate) }}</span>
                }
                @case ('dueDate') {
                  <span class="text-secondary font-mono" [class.overdue]="isOverdue(inv)">{{ formatDate(inv.dueDate) }}</span>
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
                  <div class="row-actions">
                    <ui-josanz-button variant="ghost" size="sm" icon="eye" [routerLink]="['/billing', inv.id]" title="Detalles"></ui-josanz-button>
                    @if (config.enableEdit) {
                       <ui-josanz-button variant="ghost" size="sm" icon="pencil" (clicked)="editInvoice(inv)" title="Editar"></ui-josanz-button>
                    }
                    <ui-josanz-button variant="ghost" size="sm" icon="mail" (clicked)="sendInvoice(inv)" title="Enviar e-mail"></ui-josanz-button>
                    @if (config.enableVerifactu) {
                      <ui-josanz-button variant="ghost" size="sm" icon="shield-check" (clicked)="sendToVerifactu(inv)" title="Sincronizar AEAT"></ui-josanz-button>
                      <ui-josanz-button variant="ghost" size="sm" icon="qr-code" (clicked)="viewVerifactuQr(inv)" title="Ver QR Legal"></ui-josanz-button>
                    }
                    @if (config.enableDelete) {
                       <ui-josanz-button variant="ghost" size="sm" icon="slash" (clicked)="confirmDelete(inv)" title="Anular" class="btn-danger-ghost"></ui-josanz-button>
                    }
                  </div>
                }
                @default {
                  {{ inv[key] }}
                }
              }
            </ng-template>
          </ui-josanz-table>

          <footer class="table-footer">
            <div class="table-info">
              MOSTRANDO {{ invoices().length }} REGISTROS DE FACTURACIÓN
            </div>
            <ui-josanz-pagination
              [currentPage]="currentPage()"
              [totalPages]="totalPages()"
              variant="default"
              (pageChange)="onPageChange($event)"
            ></ui-josanz-pagination>
          </footer>
        </ui-josanz-card>
      }
    </div>

    <!-- Create/Edit Modal -->
    <ui-josanz-modal
      [isOpen]="isModalOpen()"
      [title]="editingInvoice() ? 'MODIFICACIÓN DE REGISTRO FISCAL' : 'EMISIÓN DE DOCUMENTO LEGAL'"
      (closed)="closeModal()"
      variant="dark"
    >
      <div class="form-grid">
        <div class="form-section">
          <h3 class="section-title text-uppercase">Información del Documento</h3>
          <div class="input-grid">
            <ui-josanz-input 
              label="Nº Factura" 
              [(ngModel)]="formData.invoiceNumber" 
              placeholder="F/2026/0001"
              icon="hash"
            ></ui-josanz-input>
            
            <ui-josanz-input 
              label="Fecha Emisión" 
              type="date" 
              [(ngModel)]="formData.issueDate"
              icon="calendar"
            ></ui-josanz-input>

            <ui-josanz-input 
              label="Fecha Vencimiento" 
              type="date" 
              [(ngModel)]="formData.dueDate"
              icon="calendar-clock"
            ></ui-josanz-input>

            <div class="form-group">
              <label for="inv-type" class="field-label text-uppercase">Tipo de Factura</label>
              <select id="inv-type" name="type" class="tech-select" [(ngModel)]="formData.type">
                <option value="normal">ORDINARIA (AEAT-01)</option>
                <option value="rectificative">RECTIFICATIVA (AEAT-02)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title text-uppercase">Datos Comerciales y Liquidación</h3>
          <div class="input-grid">
            <ui-josanz-input 
              label="Cliente / Razón Social" 
              [(ngModel)]="formData.clientName"
              placeholder="NOMBRE O NIF..."
              icon="user"
              class="col-span-2"
            ></ui-josanz-input>

            <ui-josanz-input 
              label="Referencia Presupuesto" 
              [(ngModel)]="formData.budgetId"
              placeholder="#PR-0000"
              icon="file-text"
            ></ui-josanz-input>

            <ui-josanz-input 
              label="Total Factura (€)" 
              type="number" 
              [(ngModel)]="formData.total"
              icon="euro"
            ></ui-josanz-input>

            <div class="form-group">
              <label for="inv-status" class="field-label text-uppercase">Estado Administrativo</label>
              <select id="inv-status" name="status" class="tech-select" [(ngModel)]="formData.status">
                <option value="draft">BORRADOR</option>
                <option value="pending">PENDIENTE DE COBRO</option>
                <option value="paid">LIQUIDADA / PAGADA</option>
                <option value="cancelled">ANULADA / CANCELADA</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div modal-footer class="modal-actions">
        <ui-josanz-button variant="ghost" (clicked)="closeModal()">DESCARTAR CAMBIOS</ui-josanz-button>
        <ui-josanz-button variant="glass" (clicked)="saveInvoice()" [disabled]="!formData.clientName">
          <lucide-icon name="save" size="18" class="mr-2"></lucide-icon>
          {{ editingInvoice() ? 'ACTUALIZAR REGISTRO' : 'REGISTRAR DOCUMENTO' }}
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
      title="SISTEMA CENTRAL: VERIFICACIÓN FISCAL"
      variant="dark"
      [showFooter]="false"
      (closed)="closeVerifactuQrModal()"
    >
      <div class="verifactu-container">
        @if (verifactuStore.loading()) {
          <ui-josanz-loader message="Sincronizando con AEAT..."></ui-josanz-loader>
        } @else if (verifactuStore.error()) {
          <div class="vf-error-box">
             <lucide-icon name="alert-circle" size="48"></lucide-icon>
             <p class="text-uppercase">{{ verifactuStore.error() }}</p>
             <ui-josanz-button variant="ghost" (clicked)="closeVerifactuQrModal()">CERRAR VENTANA</ui-josanz-button>
          </div>
        } @else if (verifactuStore.selectedInvoice(); as inv) {
          <div class="vf-detail-premium">
            <header class="vf-header">
              <div class="vf-title-group">
                <span class="lbl text-uppercase">Referencia Legal del Documento</span>
                <span class="val text-uppercase">{{ inv.series }}{{ inv.number }}</span>
              </div>
              <div class="vf-status-tag" [class.sent]="inv.verifactuStatus.toLowerCase() === 'sent'">
                <lucide-icon [name]="inv.verifactuStatus.toLowerCase() === 'sent' ? 'check-circle' : 'clock'" size="16"></lucide-icon>
                <span class="text-uppercase">SISTEMA: {{ inv.verifactuStatus }}</span>
              </div>
            </header>

            <div class="vf-grid">
              <section class="vf-info-card">
                <h4 class="section-title text-uppercase">Trazabilidad Fiscal</h4>
                <div class="vf-line"><span class="lbl">EMISIÓN</span><span class="val">{{ formatDate(inv.issueDate) }}</span></div>
                <div class="vf-line"><span class="lbl">REF. AEAT</span><span class="val text-uppercase">{{ inv.aeatReference || 'Pendiente' }}</span></div>
                <div class="vf-line hash"><span class="lbl">CADENA HASH</span><span class="val">{{ inv.hashChain?.currentHash || 'NO DISPONIBLE' }}</span></div>
              </section>
              
              <section class="vf-info-card">
                <h4 class="section-title text-uppercase">Receptor del Documento</h4>
                <div class="vf-line"><span class="lbl">IDENTIDAD (NIF)</span><span class="val">{{ inv.customerNif }}</span></div>
                <div class="vf-line"><span class="lbl">RAZÓN SOCIAL</span><span class="val text-uppercase">{{ inv.customerName }}</span></div>
              </section>

              <section class="vf-info-card full">
                <h4 class="section-title text-uppercase">Liquidación Tributaria</h4>
                <div class="vf-grid">
                  <div class="vf-line"><span class="lbl">BASE IMPONIBLE</span><span class="val">{{ formatCurrencyEu(inv.subtotal) }}</span></div>
                  <div class="vf-line"><span class="lbl">CUOTA IVA (21%)</span><span class="val">{{ formatCurrencyEu(inv.taxAmount) }}</span></div>
                  <div class="vf-line"><span class="lbl">TOTAL NETO</span><span class="val text-brand">{{ formatCurrencyEu(inv.total) }}</span></div>
                </div>
              </section>
            </div>

            @if (inv.qrCode) {
              <section class="vf-qr-section">
                <h4 class="section-title text-uppercase">Código de Verificación QR (AEAT)</h4>
                <div class="qr-holder">
                  <img [src]="inv.qrCode" alt="QR VeriFactu" />
                </div>
                <p class="qr-hint text-uppercase">Escanee para validar la integridad legal del documento en la sede electrónica de la agencia tributaria.</p>
              </section>
            }
            
            <div class="modal-actions">
               <ui-josanz-button variant="glass" (clicked)="closeVerifactuQrModal()">SALIR DEL MÓDULO</ui-josanz-button>
            </div>
          </div>
        }
      </div>
    </ui-josanz-modal>
  `,
  styles: [
    `
      .page-container { padding: 0; max-width: 1600px; margin: 0 auto; }
      
      .page-header {
        display: flex; 
        justify-content: space-between; 
        align-items: flex-end;
        margin-bottom: 1.25rem;
        padding-bottom: 0.85rem;
        border-bottom: 1px solid var(--border-soft);
      }
      
      .page-title { 
        font-size: 1.35rem; 
        font-weight: 800; 
        color: #fff; 
        margin: 0 0 0.25rem 0; 
        letter-spacing: -0.02em;
        font-family: var(--font-main);
        line-height: 1.15;
      }
      
      .breadcrumb {
        display: flex;
        gap: 6px;
        font-size: 0.55rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: var(--text-muted);
      }
      .breadcrumb .active { color: var(--brand); }
      .breadcrumb .separator { opacity: 0.3; }
      
      .stats-row { 
        display: grid; 
        grid-template-columns: repeat(3, 1fr); 
        gap: 0.85rem; 
        margin-bottom: 1.15rem; 
      }
      
      .navigation-bar { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        margin-bottom: 1rem; 
        gap: 1rem;
        flex-wrap: wrap;
      }
      .navigation-bar ui-josanz-tabs { flex: 1 1 auto; min-width: 0; }
      .search-bar { flex: 1 1 220px; min-width: min(100%, 200px); max-width: 480px; }
      
      .invoice-link { 
        color: var(--brand); 
        text-decoration: none; 
        font-weight: 800; 
        font-size: 0.8rem;
        letter-spacing: 0.05em;
        transition: var(--transition-fast);
      }
      .invoice-link:hover { color: #fff; text-decoration: underline; }
      
      .currency-value { color: #fff; font-weight: 700; font-family: var(--font-main); font-size: 0.76rem; }
      .overdue { color: var(--danger); font-weight: 800; }
      
      .row-actions { display: flex; gap: 4px; }
      
      .btn-danger-ghost :host ::ng-deep .btn { color: var(--danger) !important; }
      .btn-danger-ghost :host ::ng-deep .btn:hover { background: var(--danger) !important; color: white !important; }

      .table-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.65rem 1rem;
        background: rgba(0, 0, 0, 0.1);
        border-top: 1px solid var(--border-soft);
      }

      .table-info { font-size: 0.55rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.06em; }

      /* Form Grid Refinement */
      .form-grid { display: flex; flex-direction: column; gap: 2.5rem; padding: 1rem 0; }
      .form-section { display: flex; flex-direction: column; gap: 1.5rem; }
      .section-title { 
        font-size: 0.75rem; 
        color: var(--brand); 
        letter-spacing: 0.2em; 
        font-weight: 900; 
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--border-soft);
      }
      .input-grid { 
        display: grid; 
        grid-template-columns: repeat(2, 1fr); 
        gap: 1.5rem; 
      }
      
      .field-label { font-size: 0.65rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 4px; }
      
      .tech-select {
        width: 100%;
        padding: 0.9rem 1.1rem;
        background: var(--bg-tertiary);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-md);
        color: #fff;
        font-size: 0.85rem;
        outline: none;
        transition: var(--transition-base);
      }
      .tech-select:focus { border-color: var(--brand); background: var(--bg-secondary); }

      .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; }

      /* QR Modal Modernization */
      .verifactu-container { padding: 1rem; }
      .vf-detail-premium { display: flex; flex-direction: column; gap: 2rem; }
      
      .vf-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 1.5rem;
        border-bottom: 2px solid var(--brand);
      }
      .vf-title-group .lbl { font-size: 0.6rem; color: var(--text-muted); letter-spacing: 0.2em; font-weight: 900; }
      .vf-title-group .val { font-size: 1.75rem; color: #fff; font-weight: 900; font-family: var(--font-display); }

      .vf-status-tag {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0.5rem 1.25rem;
        background: var(--bg-tertiary);
        border-radius: 100px;
        font-size: 0.7rem;
        font-weight: 900;
        color: var(--warning);
        border: 1px solid rgba(255, 184, 0, 0.2);
      }
      .vf-status-tag.sent { 
        color: var(--success); 
        background: rgba(0, 210, 138, 0.05); 
        border-color: var(--success); 
      }

      .vf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
      .vf-info-card { 
        background: var(--bg-tertiary); 
        border: 1px solid var(--border-soft); 
        border-radius: var(--radius-md); 
        padding: 1.5rem; 
      }
      .vf-info-card.full { grid-column: 1 / -1; }

      .vf-line { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.8rem; }
      .vf-line .lbl { color: var(--text-muted); font-weight: 800; }
      .vf-line .val { color: #fff; font-weight: 600; }
      .vf-line.hash .val { font-family: monospace; font-size: 0.6rem; word-break: break-all; opacity: 0.6; }
      
      .vf-qr-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2.5rem;
        background: #000;
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-soft);
      }
      .qr-holder { background: #fff; padding: 1.25rem; border-radius: 12px; margin-bottom: 1.5rem; }
      .qr-holder img { width: 200px; height: 200px; }
      .qr-hint { font-size: 0.7rem; color: var(--text-muted); text-align: center; max-width: 350px; line-height: 1.6; }

      .col-span-2 { grid-column: span 2; }
      .mr-2 { margin-right: 8px; }

      @media (max-width: 1024px) {
        .navigation-bar { flex-direction: column; align-items: stretch; }
        .search-bar { max-width: none; }
        .input-grid { grid-template-columns: 1fr; }
        .col-span-2 { grid-column: span 1; }
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
  allInvoices = this.facade.allInvoices;
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
    this.facade.searchInvoices(term);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadInvoices();
  }

  openCreateModal() {
    this.editingInvoice.set(null);
    const year = new Date().getFullYear();
    const count = this.allInvoices().length + 1;
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

  totalInvoiced = computed(() => this.allInvoices().reduce((acc, inv) => acc + (inv.total || 0), 0));
  totalPending = computed(() => this.allInvoices().filter(i => i.status === 'pending').reduce((acc, inv) => acc + (inv.total || 0), 0));
}
