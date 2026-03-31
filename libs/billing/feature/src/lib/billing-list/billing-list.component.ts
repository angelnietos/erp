import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
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
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';
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
    <div class="page-container animate-fade-in" [class.high-perf]="pluginStore.highPerformanceMode()">
      <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
        <div class="header-breadcrumb">
          <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '66'">
            Facturación & Integridad Fiscal
          </h1>
          <div class="breadcrumb">
            <span class="active" [style.color]="currentTheme().primary">GESTIÓN INTEGRAL</span>
            <span class="separator">/</span>
            <span>VERIFACTU REGULATION (AEAT)</span>
          </div>
        </div>
        <div class="header-actions">
           @if (config.enableCreate) {
             <ui-josanz-button variant="glass" size="md" (clicked)="openCreateModal()" icon="plus">
               EMITIR FACTURA
             </ui-josanz-button>
           }
        </div>
      </header>

      <div class="stats-row">
        <ui-josanz-stat-card 
          label="Total Operado" 
          [value]="formatCurrencyEu(totalInvoiced())" 
          icon="trending-up" 
          [accent]="true">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Pendiente Cobro" 
          [value]="formatCurrencyEu(totalPending())" 
          icon="clock" 
          [trend]="5">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Documentos AEAT" 
          [value]="allInvoices().length.toString()" 
          icon="shield-check">
        </ui-josanz-stat-card>
      </div>

      <div class="navigation-bar ui-glass-panel">
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
          <ui-josanz-loader message="SINCRONIZANDO REGISTROS FISCALES..."></ui-josanz-loader>
        </div>
      } @else {
        <ui-josanz-card variant="glass" class="table-card" [class.neon-glow]="!pluginStore.highPerformanceMode()">
          <ui-josanz-table [columns]="columns" [data]="invoices()" variant="default">
            <ng-template #cellTemplate let-inv let-key="key">
              @switch (key) {
                @case ('invoiceNumber') {
                  <a [routerLink]="['/billing', inv.id]" class="invoice-link text-uppercase" [style.color]="currentTheme().primary">
                    {{ inv.invoiceNumber }}
                  </a>
                }
                @case ('status') {
                  <ui-josanz-badge [variant]="getStatusVariant(inv.status)">
                    {{ getStatusLabel(inv.status) | uppercase }}
                  </ui-josanz-badge>
                }
                @case ('verifactuStatus') {
                  @if (inv.verifactuStatus) {
                    <div class="vf-status-cell">
                      <ui-josanz-badge [variant]="getVerifactuVariant(inv.verifactuStatus)">
                        {{ getVerifactuLabel(inv.verifactuStatus) | uppercase }}
                      </ui-josanz-badge>
                      @if (inv.verifactuStatus === 'sent') {
                        <lucide-icon name="shield-check" [size]="12" [style.color]="currentTheme().success"></lucide-icon>
                      }
                    </div>
                  } @else {
                    <span class="text-muted">—</span>
                  }
                }
                @case ('total') {
                  <span class="currency-value">{{ inv.total | currency: 'EUR' }}</span>
                }
                @case ('actions') {
                  <div class="row-actions">
                    <ui-josanz-button variant="ghost" size="sm" icon="eye" [routerLink]="['/billing', inv.id]"></ui-josanz-button>
                    @if (config.enableVerifactu) {
                       <ui-josanz-button variant="ghost" size="sm" icon="qr-code" (clicked)="viewVerifactuQr(inv)"></ui-josanz-button>
                    }
                  </div>
                }
                @default {
                  {{ inv[key] }}
                }
              }
            </ng-template>
          </ui-josanz-table>

          <footer class="table-footer" [style.background]="currentTheme().primary + '05'">
            <div class="table-info uppercase">
              {{ invoices().length }} DOCUMENTOS LEGALES EN VISTA
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
        } @else if (verifactuStore.selectedInvoice(); as inv) {
          <div class="vf-detail-premium">
            <header class="vf-header" [style.border-bottom-color]="currentTheme().primary">
              <div class="vf-title-group">
                <span class="lbl text-uppercase">Garantía de Integridad</span>
                <span class="val text-uppercase">{{ inv.series }}{{ inv.number }}</span>
              </div>
              <div class="vf-status-tag" [class.sent]="inv.verifactuStatus === 'sent'">
                <span class="text-uppercase">ESTADO: {{ inv.verifactuStatus }}</span>
              </div>
            </header>

            <div class="vf-grid">
               <section class="vf-info-card">
                  <h4 class="section-title text-uppercase" [style.color]="currentTheme().primary">Liquidación Tributaria</h4>
                  <div class="vf-line"><span class="lbl">TOTAL OPERACIÓN</span><span class="val text-brand">{{ formatCurrencyEu(inv.total) }}</span></div>
               </section>
            </div>

            @if (inv.qrCode) {
              <section class="vf-qr-section">
                <div class="qr-holder">
                  <img [src]="inv.qrCode" alt="QR VeriFactu" />
                </div>
                <p class="qr-hint text-uppercase">Validación legal en sede electrónica de la AEAT.</p>
              </section>
            }
          </div>
        }
      </div>
    </ui-josanz-modal>
  `,
  styles: [
    `
      .page-container { padding: 0; max-width: 1600px; margin: 0 auto; }
      
      .page-header {
        display: flex; justify-content: space-between; align-items: flex-end;
        margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);
      }
      
      .glow-text { 
        font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0; 
        letter-spacing: 0.05em; font-family: var(--font-main);
      }
      
      .breadcrumb {
        display: flex; gap: 8px; font-size: 0.6rem; font-weight: 700;
        letter-spacing: 0.1em; color: var(--text-muted); margin-top: 0.5rem;
      }
      
      .stats-row { 
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; 
      }
      
      .navigation-bar { 
        display: flex; justify-content: space-between; align-items: center; 
        margin-bottom: 1.5rem; padding: 0.25rem 1rem; border-radius: 12px;
        background: rgba(15, 15, 15, 0.4); border: 1px solid rgba(255,255,255,0.05);
      }

      .search-bar { width: 320px; }
      
      /* Table Luxe Refinement */
      .table-card { border-radius: 16px; overflow: hidden; }
      .neon-glow { box-shadow: 0 0 40px rgba(0, 0, 0, 0.4), inset 0 0 1px rgba(255, 255, 255, 0.1); }

      .invoice-link { 
        text-decoration: none; font-weight: 800; font-size: 0.8rem;
        letter-spacing: 0.05em; transition: 0.2s;
      }
      .invoice-link:hover { color: #fff !important; text-shadow: 0 0 10px var(--brand-glow); }
      
      .vf-status-cell { display: flex; align-items: center; gap: 8px; }
      .currency-value { color: #fff; font-weight: 700; font-size: 0.8rem; }
      .row-actions { display: flex; gap: 4px; }
      
      .table-footer {
        display: flex; justify-content: space-between; align-items: center;
        padding: 0.75rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.05);
      }

      /* QR Modal Modernization */
      .vf-detail-premium { display: flex; flex-direction: column; gap: 2rem; }
      .vf-header { display: flex; justify-content: space-between; padding-bottom: 1rem; border-bottom: 2px solid; }
      .vf-title-group .lbl { font-size: 0.6rem; color: var(--text-muted); font-weight: 900; }
      .vf-title-group .val { font-size: 1.5rem; color: #fff; font-weight: 900; }

      .vf-qr-section { display: flex; flex-direction: column; align-items: center; }
      .qr-holder { background: #fff; padding: 1rem; border-radius: 12px; }
      .qr-holder img { width: 180px; height: 180px; }

      @media (max-width: 1024px) {
        .page-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
        .stats-row { grid-template-columns: 1fr; }
        .navigation-bar { flex-direction: column; align-items: stretch; gap: 1rem; padding: 1rem; }
        .search-bar { width: 100%; }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingListComponent implements OnInit {
  public readonly config = inject(BILLING_FEATURE_CONFIG);
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly facade = inject(BillingFacade);
  readonly verifactuStore = inject(VerifactuStore);

  currentTheme = this.themeService.currentTheme;
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
  isVerifactuQrModalOpen = signal(false);
  editingInvoice = signal<Invoice | null>(null);

  formData: Partial<Invoice> = {
    invoiceNumber: '', clientName: '', type: 'normal', status: 'draft',
    total: 0, issueDate: new Date().toISOString().split('T')[0]
  };

  ngOnInit() { this.loadInvoices(); }

  loadInvoices() { this.facade.loadInvoices(); }
  onTabChange(tabId: string) { this.facade.setTab(tabId); }
  onSearch(term: string) { this.searchTerm = term; this.facade.searchInvoices(term); }
  onPageChange(page: number) { this.currentPage.set(page); this.loadInvoices(); }

  openCreateModal() {
    this.editingInvoice.set(null);
    this.formData = { invoiceNumber: 'F/2026/...', clientName: '', type: 'normal', status: 'draft', total: 0 };
    this.isModalOpen.set(true);
  }

  editInvoice(invoice: Invoice) { this.editingInvoice.set(invoice); this.formData = { ...invoice }; this.isModalOpen.set(true); }
  closeModal() { this.isModalOpen.set(false); this.editingInvoice.set(null); }

  saveInvoice() {
    if (!this.formData.clientName) return;
    const invToEdit = this.editingInvoice();
    if (invToEdit) this.facade.updateInvoice(invToEdit.id, this.formData);
    else this.facade.createInvoice(this.formData as any);
    this.closeModal();
  }

  viewVerifactuQr(invoice: Invoice): void {
    this.verifactuStore.clearError();
    this.isVerifactuQrModalOpen.set(true);
    this.verifactuStore.loadInvoiceDetailWithQr(invoice.id);
  }

  closeVerifactuQrModal(): void {
    this.isVerifactuQrModalOpen.set(false);
    this.verifactuStore.clearSelectedInvoice();
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

  formatDate(date: string): string { return date ? new Date(date).toLocaleDateString('es-ES') : '-'; }

  formatCurrencyEu(amount: number | undefined): string {
    return amount != null ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount) : '-';
  }

  totalInvoiced = computed(() => this.allInvoices().reduce((acc, inv) => acc + (inv.total || 0), 0));
  totalPending = computed(() => this.allInvoices().filter(i => i.status === 'pending').reduce((acc, inv) => acc + (inv.total || 0), 0));
}
