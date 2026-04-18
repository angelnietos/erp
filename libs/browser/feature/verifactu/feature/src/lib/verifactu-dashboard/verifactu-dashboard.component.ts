import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiBadgeComponent,
  UiButtonComponent,
  UiCardComponent,
  UiModalComponent,
  UiFeatureFilterBarComponent,
  UiStatCardComponent,
  UiFeatureAccessDeniedComponent,
  UiLoaderComponent,
  UiFeaturePageShellComponent,
  UiFeatureHeaderComponent,
} from '@josanz-erp/shared-ui-kit';
import { VerifactuStore } from '@josanz-erp/verifactu-data-access';
import type { VerifactuRecord } from '@josanz-erp/verifactu-api';
import { getStoredTenantId } from '@josanz-erp/identity-data-access';
import {
  ThemeService,
  PluginStore,
  GlobalAuthStore,
  rbacAllows,
} from '@josanz-erp/shared-data-access';

@Component({
  selector: 'verifactu-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    UiCardComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiFeatureFilterBarComponent,
    UiStatCardComponent,
    UiModalComponent,
    UiFeatureAccessDeniedComponent,
    UiLoaderComponent,
    UiFeaturePageShellComponent,
    UiFeatureHeaderComponent,
  ],
  template: `
    @if (!canAccess()) {
      <ui-feature-access-denied
        message="No tienes permiso para ver VeriFactu."
        permissionHint="verifactu.view"
      />
    } @else {
    <ui-feature-page-shell
      [variant]="'padMd'"
      [fadeIn]="true"
      [extraClass]="'page-container' + (pluginStore.highPerformanceMode() ? ' high-perf' : '')"
    >
      <ui-feature-header
        title="Panel Veri*Factu"
        breadcrumbLead="CUMPLIMIENTO FISCAL"
        breadcrumbTail="MONITOR SIANE"
      >
        <div actions class="verifactu-top-actions">
          <div class="tenant-selector ui-glass-panel">
            <lucide-icon name="building-2" size="14"></lucide-icon>
            <input
              type="text"
              [ngModel]="tenantId()"
              (ngModelChange)="tenantId.set($event)"
              placeholder="UUID tenant (login)"
            />
            <button type="button" class="sync-btn" (click)="loadRecords()">
              <lucide-icon name="refresh-cw" size="14"></lucide-icon>
            </button>
          </div>
          @if (!tenantId()) {
            <span class="tenant-hint"
              >Sin tenant en sesión: inicia sesión o pega el UUID del
              tenant.</span
            >
          }
          <ui-button
            variant="primary"
            size="md"
            icon="file-up"
            (clicked)="submitInvoice()"
            >REPORTE DIRECTO</ui-button
          >
        </div>
      </ui-feature-header>

      <div class="stats-row">
        <ui-stat-card
          label="Facturas Reportadas"
          [value]="store.records().length.toString()"
          icon="shield-check"
          [accent]="true"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Estado Servicio"
          value="OPERATIVO"
          icon="activity"
          [trend]="1"
        >
        </ui-stat-card>
        <ui-stat-card label="Latencia Media" value="124ms" icon="timer">
        </ui-stat-card>
      </div>

      <div class="dashboard-grid">
        <ui-card variant="glass" title="Registro de Operaciones Fiscales">
          <ui-feature-filter-bar
            [framed]="false"
            [appearance]="'feature'"
            [searchVariant]="'glass'"
            placeholder="Buscar por referencia, cliente o NIF..."
            (searchChange)="searchTerm.set($event)"
          />

          @if (store.loading() && !hasAnyRecords()) {
            <div class="feature-loader-wrap">
              <ui-loader message="Cargando registros fiscales…"></ui-loader>
            </div>
          } @else if (
            store.error() && !hasAnyRecords() && !store.loading()
          ) {
            <div class="feature-error-screen" role="alert">
              <lucide-icon
                name="wifi-off"
                size="56"
                class="feature-error-screen__icon"
              ></lucide-icon>
              <h3>No se pudo cargar el registro</h3>
              <p>
                {{
                  store.error() ||
                    'Comprueba la conexión, el tenant y vuelve a intentarlo.'
                }}
              </p>
              <ui-button variant="solid" (clicked)="retryLoadRecords()"
                >Reintentar</ui-button
              >
            </div>
          } @else if (!hasTenant() && !hasAnyRecords()) {
            <div class="feature-empty feature-empty--wide">
              <lucide-icon
                name="building-2"
                size="64"
                class="feature-empty__icon"
              ></lucide-icon>
              <h3>Sin tenant</h3>
              <p>
                Indica el UUID del tenant arriba o inicia sesión para cargar el
                registro fiscal.
              </p>
            </div>
          } @else if (
            hasTenant() &&
            !hasAnyRecords() &&
            !store.loading() &&
            !store.error()
          ) {
            <div class="feature-empty feature-empty--wide">
              <lucide-icon
                name="inbox"
                size="64"
                class="feature-empty__icon"
              ></lucide-icon>
              <h3>Sin registros fiscales</h3>
              <p>No hay operaciones VeriFactu para este tenant todavía.</p>
            </div>
          } @else if (filterProducesNoResults()) {
            <div class="feature-empty feature-empty--wide">
              <lucide-icon
                name="search-x"
                size="64"
                class="feature-empty__icon"
              ></lucide-icon>
              <h3>Sin resultados</h3>
              <p>Ningún registro coincide con la búsqueda actual.</p>
              <ui-button variant="ghost" size="sm" (clicked)="clearSearch()">
                Limpiar búsqueda
              </ui-button>
            </div>
          } @else {
            @if (store.error() && hasAnyRecords()) {
              <div
                class="feature-load-error-banner"
                role="status"
                aria-live="polite"
              >
                <lucide-icon
                  name="alert-circle"
                  size="20"
                  class="feature-load-error-banner__icon"
                ></lucide-icon>
                <span class="feature-load-error-banner__text">{{
                  store.error()
                }}</span>
                <ui-button variant="ghost" size="sm" (clicked)="retryLoadRecords()"
                  >Reintentar</ui-button
                >
              </div>
            }
            <div class="table-container">
              <table class="luxe-table">
                <thead>
                  <tr>
                    <th>REFERENCIA</th>
                    <th>EMISIÓN</th>
                    <th>BASE IMP.</th>
                    <th>ESTADO AEAT</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  @for (record of filteredRecords(); track record.id) {
                    <tr class="luxe-row">
                      <td class="font-mono">
                        {{ record.reference || record.invoiceId.slice(0, 8) }}
                      </td>
                      <td>{{ formatDate(record.createdAt) }}</td>
                      <td class="font-mono">
                        {{ formatCurrency(record.total) }}
                      </td>
                      <td>
                        <ui-badge [variant]="getStatusVariant(record.status)">
                          {{ record.status }}
                        </ui-badge>
                      </td>
                      <td>
                        <button
                          class="icon-btn"
                          (click)="viewInvoiceDetail(record)"
                        >
                          <lucide-icon name="eye" size="14"></lucide-icon>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </ui-card>

        <div class="side-panel">
          <ui-card variant="glass" title="Envío Manual">
            <div class="manual-form">
              <div class="form-group">
                <label>ID FACTURA</label>
                <input
                  type="text"
                  [ngModel]="invoiceIdToSubmit()"
                  (ngModelChange)="invoiceIdToSubmit.set($event)"
                  placeholder="INV-2026-XXXX"
                />
              </div>
              <ui-button
                variant="glass"
                class="full-width"
                (clicked)="submitInvoice()"
                >ENVIAR A VERIFACTU</ui-button
              >
            </div>
          </ui-card>

          <ui-card variant="glass" title="Certificados Activos">
            <div class="cert-item">
              <div
                class="cert-icon"
                [style.background]="currentTheme().primary + '22'"
              >
                <lucide-icon
                  name="shield-check"
                  [style.color]="currentTheme().primary"
                  size="16"
                ></lucide-icon>
              </div>
              <div class="cert-info">
                <span class="cert-name">FNMT-MODULAR-2026</span>
                <span class="cert-expiry">VENCE: 12/2026</span>
              </div>
            </div>
          </ui-card>
        </div>
      </div>
    </ui-feature-page-shell>

    <ui-modal
      class="verifactu-detail-modal"
      [isOpen]="isDetailModalOpen()"
      title="Detalle factura VeriFactu"
      variant="dark"
      [showFooter]="true"
      (closed)="closeDetailModal()"
    >
      @if (store.loading() && !store.selectedInvoice()) {
        <div class="feature-loader-wrap detail-modal-loader">
          <ui-loader message="Cargando detalle fiscal…"></ui-loader>
        </div>
      } @else if (store.error() && !store.selectedInvoice()) {
        <div class="feature-load-error-banner detail-modal-banner" role="alert">
          <lucide-icon
            name="alert-circle"
            size="20"
            class="feature-load-error-banner__icon"
          ></lucide-icon>
          <span class="feature-load-error-banner__text">{{
            store.error()
          }}</span>
          <ui-button variant="ghost" size="sm" (clicked)="retryDetailLoad()"
            >Reintentar</ui-button
          >
        </div>
      } @else if (store.selectedInvoice(); as inv) {
        <div class="detail-grid">
          <div class="detail-block">
            <span class="detail-label">Cliente</span>
            <span class="detail-value">{{ inv.customerName }}</span>
          </div>
          <div class="detail-block">
            <span class="detail-label">NIF</span>
            <span class="detail-value">{{ inv.customerNif || '—' }}</span>
          </div>
          <div class="detail-block">
            <span class="detail-label">Emisión</span>
            <span class="detail-value">{{ inv.issueDate }}</span>
          </div>
          <div class="detail-block">
            <span class="detail-label">Estado VeriFactu</span>
            <span class="detail-value">{{ inv.verifactuStatus }}</span>
          </div>
          <div class="detail-block span-2">
            <span class="detail-label">Importes</span>
            <span class="detail-value">
              Base {{ formatCurrency(inv.subtotal) }} · IVA
              {{ formatCurrency(inv.taxAmount) }} ·
              <strong>Total {{ formatCurrency(inv.total) }}</strong>
            </span>
          </div>
          @if (inv.aeatReference) {
            <div class="detail-block span-2">
              <span class="detail-label">Referencia AEAT</span>
              <span class="detail-value font-mono">{{
                inv.aeatReference
              }}</span>
            </div>
          }
          @if (inv.hashChain?.currentHash; as currentHash) {
            <div class="detail-block span-2">
              <span class="detail-label">Huella registro</span>
              <span class="detail-hash">{{ currentHash }}</span>
            </div>
          }
          @if (inv.qrCode) {
            <div class="detail-qr span-2">
              <span class="detail-label">QR VeriFactu</span>
              <img [src]="inv.qrCode" alt="Código QR factura" class="qr-img" />
            </div>
          }
        </div>
      }
      <div modal-footer>
        <ui-button variant="ghost" (clicked)="closeDetailModal()"
          >Cerrar</ui-button
        >
      </div>
    </ui-modal>
    }
  `,
  styles: [
    `

      .verifactu-top-actions {
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;
      }
      .tenant-hint {
        font-size: 0.6rem;
        color: var(--text-muted);
        max-width: 220px;
        line-height: 1.3;
      }

      .tenant-selector {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 12px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .tenant-selector input {
        background: none;
        border: none;
        color: #fff;
        font-size: 0.7rem;
        font-weight: 700;
        width: 100px;
        outline: none;
      }
      .sync-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        display: flex;
        transition: color 0.2s;
      }
      .sync-btn:hover {
        color: #fff;
      }

      .stats-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1.5rem;
      }

      .table-container {
        overflow-x: auto;
        margin-top: 1rem;
      }
      .luxe-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }
      .luxe-table th {
        font-size: 0.55rem;
        font-weight: 900;
        color: var(--text-muted);
        letter-spacing: 0.15em;
        padding: 1rem;
        text-transform: uppercase;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      .luxe-table td {
        padding: 1.25rem 1rem;
        font-size: 0.7rem;
        color: #fff;
        border-bottom: 1px solid rgba(255, 255, 255, 0.02);
      }
      .luxe-row:hover {
        background: rgba(255, 255, 255, 0.02);
      }

      .icon-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-secondary);
        width: 28px;
        height: 28px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
      }
      .icon-btn:hover {
        background: var(--brand);
        color: #fff;
        border-color: var(--brand);
      }

      .detail-modal-loader {
        padding: 2rem 1rem 3rem;
      }

      .detail-modal-banner {
        margin-bottom: 0.5rem;
      }

      .side-panel {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .manual-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .form-group label {
        font-size: 0.55rem;
        font-weight: 900;
        color: var(--text-muted);
        letter-spacing: 0.1em;
      }
      .form-group input {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        padding: 12px;
        color: #fff;
        font-family: var(--font-main);
        font-size: 0.8rem;
        outline: none;
        transition: border-color 0.2s;
      }
      .form-group input:focus {
        border-color: var(--brand);
      }
      .full-width {
        width: 100%;
      }

      .cert-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0.5rem 0;
      }
      .cert-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cert-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .cert-name {
        font-size: 0.65rem;
        font-weight: 900;
        color: #fff;
      }
      .cert-expiry {
        font-size: 0.5rem;
        color: var(--text-muted);
      }

      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem 1.25rem;
      }
      .detail-block {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .detail-block.span-2 {
        grid-column: 1 / -1;
      }
      .detail-label {
        font-size: 0.55rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        text-transform: uppercase;
      }
      .detail-value {
        font-size: 0.8rem;
        color: #fff;
      }
      .font-mono {
        font-family: ui-monospace, monospace;
        font-size: 0.7rem;
        word-break: break-all;
      }
      .detail-hash {
        font-size: 0.65rem;
        color: var(--text-secondary);
        word-break: break-all;
        line-height: 1.4;
      }
      .detail-qr {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }
      .qr-img {
        max-width: 220px;
        height: auto;
        border-radius: 8px;
        background: #fff;
        padding: 8px;
      }

      :host ::ng-deep .verifactu-detail-modal .modal-overlay {
        z-index: 12000;
      }
    `,
  ],
})
export class VerifactuDashboardComponent implements OnInit {
  protected readonly store = inject(VerifactuStore);
  private readonly cdr = inject(ChangeDetectorRef);
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly authStore = inject(GlobalAuthStore);
  readonly canAccess = rbacAllows(
    this.authStore,
    'verifactu.view',
    'invoices.submit',
  );

  currentTheme = this.themeService.currentThemeData;
  tenantId = signal('');
  invoiceIdToSubmit = signal('');
  searchTerm = signal('');

  filteredRecords = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.store.records();
    return this.store
      .records()
      .filter(
        (record) =>
          (record.reference || record.invoiceId).toLowerCase().includes(term) ||
          record.customerName?.toLowerCase().includes(term) ||
          record.customerNif?.toLowerCase().includes(term),
      );
  });

  readonly hasAnyRecords = computed(() => this.store.records().length > 0);

  readonly hasTenant = computed(() => this.tenantId().trim().length > 0);

  /** Hay datos pero el filtro de búsqueda no devuelve filas. */
  readonly filterProducesNoResults = computed(() => {
    if (!this.hasAnyRecords() || this.filteredRecords().length > 0) {
      return false;
    }
    return this.searchTerm().trim().length > 0;
  });

  selectedInvoiceId = signal('');
  isDetailModalOpen = signal(false);

  constructor() {
    effect(() => {
      this.store.records();
      this.store.selectedInvoice();
      this.store.loading();
      this.store.error();
      this.isDetailModalOpen();
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.tenantId.set(getStoredTenantId() ?? '');
    this.loadRecords();
  }

  loadRecords(): void {
    const tenant = this.tenantId().trim();
    if (tenant) {
      this.store.loadRecords(tenant);
    }
  }

  retryLoadRecords(): void {
    this.store.clearError();
    this.loadRecords();
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  retryDetailLoad(): void {
    const id = this.selectedInvoiceId();
    if (!id) {
      return;
    }
    this.store.clearError();
    this.store.loadInvoiceDetailWithQr(id);
  }

  submitInvoice(): void {
    const tenant = this.tenantId();
    const invoiceId = this.invoiceIdToSubmit();
    if (tenant && invoiceId) {
      this.store.submitInvoiceDirect(invoiceId, tenant);
      this.invoiceIdToSubmit.set('');
      setTimeout(() => this.loadRecords(), 500);
    }
  }

  viewInvoiceDetail(record: VerifactuRecord): void {
    // API detail is keyed by Invoice.id, not VerifactuLog.id (record.id).
    this.store.loadInvoiceDetailWithQr(record.invoiceId);
    this.selectedInvoiceId.set(record.invoiceId);
    this.isDetailModalOpen.set(true);
  }

  closeDetailModal(): void {
    this.isDetailModalOpen.set(false);
    this.store.clearSelectedInvoice();
  }

  getStatusVariant(
    status: string,
  ): 'success' | 'warning' | 'error' | 'info' | 'default' {
    switch (status) {
      case 'COMPLETED':
      case 'SENT':
      case 'SUCCESS':
        return 'success';
      case 'PROCESSING':
      case 'PENDING':
        return 'warning';
      case 'FAILED':
      case 'ERROR':
        return 'error';
      default:
        return 'default';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }
}
