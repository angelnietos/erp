import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  UiButtonComponent,
  UiSearchComponent,
  UiPaginationComponent,
  UiBadgeComponent,
  UiLoaderComponent,
  UiModalComponent,
  UiTabsComponent,
  UiStatCardComponent,
  UiInputComponent,
  UiSelectComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
} from '@josanz-erp/shared-ui-kit';
import { LucideAngularModule } from 'lucide-angular';
import { ThemeService, PluginStore, MasterFilterService, FilterableService } from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';
import { BILLING_FEATURE_CONFIG } from '../billing-feature.config';
import { BillingFacade, Invoice } from '@josanz-erp/billing-data-access';
import { Budget } from '@josanz-erp/budget-api';
import { VerifactuStore } from '@josanz-erp/verifactu-data-access';

@Component({
  selector: 'lib-billing-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiButtonComponent,
    UiSearchComponent,
    UiPaginationComponent,
    UiLoaderComponent,
    UiModalComponent,
    UiTabsComponent,
    UiStatCardComponent,
    UiInputComponent,
    UiSelectComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="billing-container">
      <ui-feature-header
        title="Facturación"
        subtitle="Gestión fiscal e integridad Verifactu (AEAT)"
        icon="banknote"
        actionLabel="EMITIR FACTURA"
        (actionClicked)="openCreateModal()"
      ></ui-feature-header>

      <ui-feature-stats>
        <ui-stat-card
          label="Total Operado"
          [value]="formatCurrencyEu(totalInvoiced())"
          icon="trending-up"
          [accent]="true"
        ></ui-stat-card>
        <ui-stat-card
          label="Pendiente Cobro"
          [value]="formatCurrencyEu(totalPending())"
          icon="clock"
          [trend]="5"
        ></ui-stat-card>
        <ui-stat-card
          label="Documentos AEAT"
          [value]="allInvoices().length.toString()"
          icon="shield-check"
        ></ui-stat-card>
        <ui-stat-card
          label="Cumplimiento Fiscal"
          value="100%"
          icon="check-check"
          [accent]="false"
        ></ui-stat-card>
      </ui-feature-stats>

      <div class="navigation-bar">
        <ui-tabs
          [tabs]="tabs()"
          [activeTab]="activeTab()"
          variant="underline"
          (tabChange)="onTabChange($event)"
          class="flex-1"
        ></ui-tabs>

        <ui-search
          variant="glass"
          placeholder="BUSCAR NIF, CLIENTE O Nº..."
          (searchChange)="onSearch($event)"
          class="search-bar"
        ></ui-search>
      </div>

      @if (isLoading()) {
        <div class="loader-container">
          <ui-loader message="SINCRONIZANDO REGISTROS FISCALES..."></ui-loader>
        </div>
      } @else {
        <ui-feature-grid>
          @for (inv of invoices(); track inv.id) {
            <ui-feature-card
              [name]="inv.invoiceNumber"
              [subtitle]="inv.clientName | uppercase"
              [avatarInitials]="getInitials(inv.invoiceNumber)"
              [avatarBackground]="getFiscalGradient(inv.verifactuStatus)"
              [status]="inv.status === 'paid' ? 'active' : 'offline'"
              [badgeLabel]="getStatusLabel(inv.status) | uppercase"
              [badgeVariant]="getStatusVariant(inv.status)"
              (cardClicked)="onRowClick(inv)"
              (editClicked)="editInvoice(inv)"
              [footerItems]="[
                { icon: 'calendar', label: formatDate(inv.issueDate) },
                { icon: 'euro', label: ((inv.total || 0) | currency:'EUR') || '-' },
                { icon: 'shield', label: inv.verifactuStatus ? (getVerifactuLabel(inv.verifactuStatus) | uppercase) : 'PENDIENTE' }
              ]"
            >
              <div class="fiscal-indicators">
                 @if (inv.verifactuStatus === 'sent') {
                    <span class="fiscal-badge success-glow">
                       <lucide-icon name="shield-check" size="12"></lucide-icon> AEAT REPORTED
                    </span>
                 } @else if (inv.verifactuStatus === 'error') {
                    <span class="fiscal-badge error-glow">
                       <lucide-icon name="alert-triangle" size="12"></lucide-icon> FISCAL ERROR
                    </span>
                 }
              </div>

              <div footer-extra class="card-actions">
                 <ui-button variant="ghost" size="sm" icon="eye" [routerLink]="['/billing', inv.id]"></ui-button>
                 
                 @if (inv.status === 'draft') {
                    <ui-button variant="ghost" size="sm" icon="play" (click)="$event.stopPropagation(); issueInvoice(inv)" class="text-success"></ui-button>
                 }

                 @if (inv.status !== 'draft' && config.enableVerifactu) {
                    @if (!inv.verifactuStatus || inv.verifactuStatus === 'pending' || inv.verifactuStatus === 'error') {
                       <ui-button variant="ghost" size="sm" [icon]="inv.verifactuStatus === 'error' ? 'refresh-cw' : 'upload-cloud'" (click)="$event.stopPropagation(); sendToVerifactu(inv)" [class.text-warning]="inv.verifactuStatus !== 'error'" [class.text-danger]="inv.verifactuStatus === 'error'"></ui-button>
                    }
                    @if (inv.verifactuStatus === 'sent') {
                       <ui-button variant="ghost" size="sm" icon="qr-code" (click)="$event.stopPropagation(); viewVerifactuQr(inv)"></ui-button>
                    }
                 }
              </div>
            </ui-feature-card>
          } @empty {
            <div class="empty-state">
              <lucide-icon name="banknote" size="64" class="empty-icon"></lucide-icon>
              <h3>No hay facturas</h3>
              <p>Comienza emitiendo una nueva factura o solicita un presupuesto origen.</p>
              <ui-button variant="solid" (clicked)="openCreateModal()" icon="CirclePlus">Emitir factura</ui-button>
            </div>
          }
        </ui-feature-grid>

        <footer class="pagination-footer">
           <ui-pagination 
            [currentPage]="currentPage()" 
            [totalPages]="totalPages()"
            (pageChange)="onPageChange($event)"
          ></ui-pagination>
        </footer>
      }
    </div>

    <!-- Modals -->
    <ui-modal
      [isOpen]="isModalOpen()"
      [title]="editingInvoice() ? 'EDITAR FACTURA' : 'EMITIR FACTURA'"
      variant="glass"
      (closed)="closeModal()"
    >
      <div class="form-grid">
        @if (!editingInvoice()) {
          <p class="form-hint">
            Selecciona un presupuesto origen para importar datos comerciales de forma automática.
          </p>
          <ui-select
            label="PRESUPUESTO ORIGEN"
            placeholder="Seleccionar presupuesto..."
            [options]="budgetSelectOptions()"
            [(ngModel)]="formData.budgetId"
            icon="file-text"
          ></ui-select>
        } @else {
          <div class="read-only-section">
            <span class="label">CLIENTE</span>
            <span class="value">{{ editingInvoice()?.clientName }}</span>
          </div>
        }
        
        <ui-input label="NÚMERO DE FACTURA" [(ngModel)]="formData.invoiceNumber" placeholder="F/2026/XXXX" icon="hash"></ui-input>
        
        <div class="row">
          <ui-input label="EMISIÓN" type="date" [(ngModel)]="formData.issueDate" icon="calendar"></ui-input>
          <ui-input label="VENCIMIENTO" type="date" [(ngModel)]="formData.dueDate" icon="calendar-clock"></ui-input>
        </div>
      </div>
      <div class="modal-actions">
        <ui-button variant="ghost" (clicked)="closeModal()">CANCELAR</ui-button>
        <ui-button variant="solid" (clicked)="saveInvoice()" [disabled]="!editingInvoice() && !formData.budgetId" icon="save">
          {{ editingInvoice() ? 'GUARDAR CAMBIOS' : 'GENERAR BORRADOR' }}
        </ui-button>
      </div>
    </ui-modal>

    <ui-modal
      [isOpen]="isVerifactuQrModalOpen()"
      title="CERTIFICADO FISCAL AEAT"
      variant="glass"
      [showFooter]="false"
      (closed)="closeVerifactuQrModal()"
    >
      @if (verifactuStore.selectedInvoice(); as inv) {
        <div class="qr-panel">
          <div class="qr-header">
             <h3>Garantía de Integridad</h3>
             <span class="ref">{{ inv.series }}{{ inv.number }}</span>
          </div>

          <div class="qr-display">
             @if (inv.qrCode) {
               <div class="qr-box animate-scale-in">
                 <img [src]="inv.qrCode" alt="Verifactu QR" />
               </div>
               <p>Escanea este código para verificar la legalidad en la sede electrónica.</p>
             } @else {
               <ui-loader message="Generando certificado..."></ui-loader>
             }
          </div>

          <div class="qr-footer">
             <div class="stat">
               <span class="lbl">TOTAL OPERACIÓN</span>
               <span class="val">{{ formatCurrencyEu(inv.total) }}</span>
             </div>
             <ui-button variant="glass" (clicked)="closeVerifactuQrModal()">CERRAR</ui-button>
          </div>
        </div>
      }
    </ui-modal>
  `,
  styles: [`
    .billing-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .navigation-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      background: var(--surface);
      padding: 0.5rem 1.5rem;
      border-radius: 16px;
      border: 1px solid var(--border-soft);
      gap: 2rem;
    }

    .flex-1 { flex: 1; }
    .search-bar { width: 350px; }

    .loader-container { display: flex; justify-content: center; padding: 5rem; }

    .fiscal-indicators { margin-top: 1rem; }
    .fiscal-badge {
       display: inline-flex;
       align-items: center;
       gap: 0.25rem;
       font-size: 0.6rem;
       font-weight: 900;
       padding: 0.2rem 0.6rem;
       border-radius: 4px;
       letter-spacing: 0.05em;
    }
    .success-glow { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
    .error-glow { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }

    .card-actions { display: flex; gap: 0.25rem; }
    .text-success { color: #10b981 !important; }
    .text-warning { color: #f59e0b !important; }
    .text-danger { color: #ef4444 !important; }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 5rem;
      text-align: center;
      background: var(--surface);
      border-radius: 20px;
      border: 2px dashed var(--border-soft);
    }
    .empty-icon { color: var(--text-muted); opacity: 0.3; margin-bottom: 1.5rem; }

    .pagination-footer { margin-top: 3rem; display: flex; justify-content: center; }

    /* Form & QR Panel */
    .form-grid { display: flex; flex-direction: column; gap: 1.25rem; padding: 1rem 0; }
    .form-hint { font-size: 0.75rem; color: var(--text-muted); }
    .read-only-section { display: flex; flex-direction: column; gap: 0.25rem; }
    .read-only-section .label { font-size: 0.6rem; font-weight: 800; color: var(--text-muted); }
    .read-only-section .value { font-size: 1rem; font-weight: 700; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 2rem; }

    .qr-panel { display: flex; flex-direction: column; gap: 2rem; padding: 1rem 0; }
    .qr-header h3 { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
    .qr-header .ref { font-size: 1.5rem; font-weight: 900; }
    .qr-display { display: flex; flex-direction: column; align-items: center; gap: 1rem; text-align: center; }
    .qr-box { background: #fff; padding: 1rem; border-radius: 12px; }
    .qr-box img { width: 200px; height: 200px; }
    .qr-display p { font-size: 0.75rem; color: var(--text-muted); max-width: 250px; }
    .qr-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-soft); padding-top: 1.5rem; }
    .qr-footer .stat { display: flex; flex-direction: column; }
    .qr-footer .lbl { font-size: 0.6rem; color: var(--text-muted); }
    .qr-footer .val { font-size: 1.1rem; font-weight: 800; color: #10b981; }

    @media (max-width: 900px) {
       .navigation-bar { flex-direction: column; align-items: stretch; gap: 1rem; }
       .search-bar { width: 100%; }
       .row { grid-template-columns: 1fr; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingListComponent implements OnInit, OnDestroy, FilterableService<Invoice> {
  public readonly config = inject(BILLING_FEATURE_CONFIG);
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly facade = inject(BillingFacade);
  private readonly masterFilter = inject(MasterFilterService);
  readonly verifactuStore = inject<VerifactuStore>(VerifactuStore);

  currentTheme = this.themeService.currentThemeData;
  tabs = this.facade.tabs;

  invoices = this.facade.invoices;
  allInvoices = this.facade.allInvoices; 
  isLoading = this.facade.isLoading;
  activeTab = this.facade.activeTab;
  budgets = this.facade.budgets;
  currentPage = signal(1);
  totalPages = signal(1);
  searchTerm = '';

  isModalOpen = signal(false);
  isVerifactuQrModalOpen = signal(false);
  editingInvoice = signal<Invoice | null>(null);

  onRowClick(inv: Invoice) {
    // Navigate
  }

  getInitials(num: string): string {
    return num.split('/').slice(-1)[0].slice(0, 2).toUpperCase();
  }

  getFiscalGradient(status: string | undefined): string {
    switch (status) {
      case 'sent': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'error': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'pending': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      default: return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    }
  }

  formData: Partial<Invoice> = {
    budgetId: '',
    invoiceNumber: '',
    clientName: '',
    type: 'normal',
    status: 'draft',
    total: 0,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
  };

  budgetSelectOptions = computed(() => {
    const eligible = this.budgets().filter(
      (b: Budget) => b.status === 'ACCEPTED' || b.status === 'SENT',
    );
    return eligible.map((b: Budget) => ({
      label: `#${b.id.slice(0, 8).toUpperCase()} · ${(b.total || 0).toFixed(2)} € · ${b.status}`,
      value: b.id,
    }));
  });

  ngOnInit() {
    this.masterFilter.registerProvider(this);
    this.loadInvoices();
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
  }

  /** Lógica de filtrado para el MasterFilterService */
  filter(query: string): Observable<Invoice[]> {
    const term = query.toLowerCase();
    const matches = this.allInvoices().filter((inv: Invoice) => 
      inv.invoiceNumber.toLowerCase().includes(term) || 
      inv.clientName.toLowerCase().includes(term) ||
      (inv.nif ?? '').toLowerCase().includes(term)
    );
    return of(matches);
  }

  loadInvoices() {
    this.facade.loadInvoices();
  }
  onTabChange(tabId: string) {
    this.facade.setTab(tabId);
  }
  onSearch(term: string) {
    this.searchTerm = term;
    this.masterFilter.search(term);
    this.facade.searchInvoices(term);
  }
  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadInvoices();
  }

  openCreateModal() {
    this.editingInvoice.set(null);
    const today = new Date().toISOString().split('T')[0];
    this.formData = {
      budgetId: '',
      invoiceNumber: '',
      clientName: '',
      type: 'normal',
      status: 'draft',
      total: 0,
      issueDate: today,
      dueDate: today,
    };
    this.facade.loadBudgets();
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
    const invToEdit = this.editingInvoice();
    if (invToEdit) {
      this.facade.updateInvoice(invToEdit.id, this.formData);
    } else {
      if (!this.formData.budgetId) return;
      this.facade.createInvoice({
        budgetId: this.formData.budgetId,
        invoiceNumber:
          this.formData.invoiceNumber?.trim() ||
          `F/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`,
        clientName: '—',
        type: 'normal',
        status: 'draft',
        total: 0,
        issueDate:
          this.formData.issueDate || new Date().toISOString().split('T')[0],
        dueDate:
          this.formData.dueDate || new Date().toISOString().split('T')[0],
      });
    }
    this.closeModal();
  }

  issueInvoice(inv: Invoice) {
    if (!inv.id) return;
    this.facade.updateInvoice(inv.id, { status: 'pending' });
  }

  viewVerifactuQr(invoice: Invoice): void {
    this.verifactuStore.clearError();
    this.isVerifactuQrModalOpen.set(true);
    this.verifactuStore.loadInvoiceDetailWithQr(invoice.id);
  }

  sendToVerifactu(inv: Invoice): void {
    if (!inv.id) return;
    this.verifactuStore.clearError();
    this.facade.submitToVerifactu(inv.id);
  }

  rectifyInvoice(inv: Invoice): void {
    if (!inv.id) return;
    if (
      confirm(
        `¿Estás seguro de que deseas emitir una factura rectificativa para ${inv.invoiceNumber} y notificar a la AEAT?`,
      )
    ) {
      this.facade.cancelInvoice(inv.id);
    }
  }

  closeVerifactuQrModal(): void {
    this.isVerifactuQrModalOpen.set(false);
    this.verifactuStore.clearSelectedInvoice();
  }

  getStatusVariant(
    status: string,
  ): 'success' | 'warning' | 'info' | 'danger' | 'secondary' | 'primary' {
    const s = (status || '').toLowerCase();
    if (s === 'paid') return 'success';
    if (s === 'pending') return 'warning';
    if (s === 'sent') return 'info';
    if (s === 'cancelled') return 'danger';
    return 'secondary';
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'draft':
        return 'Borrador';
      case 'pending':
        return 'Pendiente';
      case 'paid':
        return 'Pagada';
      case 'sent':
        return 'Enviada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  }

  getVerifactuVariant(status: string | undefined): 'success' | 'warning' | 'danger' | 'secondary' {
    switch (status) {
      case 'sent':
        return 'success';
      case 'pending':
        return 'warning';
      case 'error':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getVerifactuLabel(status: string | undefined): string {
    switch (status) {
      case 'sent':
        return 'Enviada';
      case 'pending':
        return 'Pendiente';
      case 'error':
        return 'Error';
      default:
        return 'Sin enviar';
    }
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }

  formatCurrencyEu(amount: number | undefined): string {
    if (amount === undefined) return '0 €';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  totalInvoiced = computed(() =>
    this.allInvoices().reduce((acc: number, inv: Invoice) => acc + (inv.total || 0), 0),
  );

  totalPending = computed(() =>
    this.allInvoices()
      .filter((i: Invoice) => i.status === 'pending')
      .reduce((acc: number, inv: Invoice) => acc + (inv.total || 0), 0),
  );
}
