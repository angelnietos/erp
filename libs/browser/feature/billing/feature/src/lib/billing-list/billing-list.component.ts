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
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  UiButtonComponent,
  UiFeatureFilterBarComponent,
  UiPaginationComponent,
  UiLoaderComponent,
  UiModalComponent,
  UiTabsComponent,
  UiStatCardComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
  UiFeatureAccessDeniedComponent,
  UiFeaturePageShellComponent,
} from '@josanz-erp/shared-ui-kit';
import { LucideAngularModule } from 'lucide-angular';
import {
  ThemeService,
  PluginStore,
  MasterFilterService,
  FilterableService,
  ToastService,
  GlobalAuthStore,
  rbacAllows,
} from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';
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
    UiButtonComponent,
    UiFeatureFilterBarComponent,
    UiPaginationComponent,
    UiLoaderComponent,
  UiModalComponent,
  UiTabsComponent,
  UiStatCardComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    LucideAngularModule,
    UiFeatureAccessDeniedComponent,
    UiFeaturePageShellComponent,
  ],
  template: `
    @if (!canAccess()) {
      <ui-feature-access-denied
        message="No tienes permiso para ver facturación."
        permissionHint="invoices.view"
      />
    } @else {
    <ui-feature-page-shell [extraClass]="'billing-container'">
      <ui-feature-header
        title="Facturación"
        breadcrumbLead="FACTURACIÓN Y FISCALIDAD"
        breadcrumbTail="CONTROL DE INGRESOS"
        subtitle="Gestión fiscal e integridad Verifactu (AEAT)"
        icon="banknote"
        actionLabel="EMITIR FACTURA"
        (actionClicked)="goToNewInvoice()"
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

      <ui-feature-filter-bar
        [appearance]="'feature'"
        [searchVariant]="'glass'"
        placeholder="Buscar por NIF, cliente o número..."
        (searchChange)="onSearch($event)"
      >
        <div uiFeatureFilterStates>
          <ui-tabs
            [tabs]="tabs()"
            [activeTab]="activeTab()"
            variant="underline"
            (tabChange)="onTabChange($event)"
          ></ui-tabs>
        </div>
        <ui-button
          variant="ghost"
          size="sm"
          icon="filter"
          [class.active]="showAdvancedFilters()"
          (clicked)="toggleAdvancedFilters()"
        >
          Filtros Avanzados
        </ui-button>
        <ui-button
          variant="ghost"
          size="sm"
          icon="rotate-cw"
          (clicked)="refreshInvoices()"
          title="Actualizar"
        >
          Actualizar
        </ui-button>
        <ui-button
          variant="ghost"
          size="sm"
          [icon]="sortDirection() === 1 ? 'ChevronUp' : 'ChevronDown'"
          (clicked)="toggleSort()"
        >
          Ordenar:
          {{
            sortField() === 'issueDate'
              ? 'fecha'
              : sortField() === 'total'
                ? 'total'
                : 'estado'
          }}
        </ui-button>
      </ui-feature-filter-bar>

      @if (error() && allInvoices().length > 0) {
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
          <span class="feature-load-error-banner__text">{{ error() }}</span>
          <ui-button
            variant="ghost"
            size="sm"
            icon="rotate-cw"
            (clicked)="refreshInvoices()"
          >
            Reintentar
          </ui-button>
        </div>
      }

      <!-- Advanced Filters -->
      @if (showAdvancedFilters()) {
        <div class="advanced-filters">
          <div class="filters-grid">
            <div class="filter-group">
              <label class="filter-label" for="status-filter">Estado</label>
              <select
                id="status-filter"
                class="filter-select"
                [(ngModel)]="statusFilter"
                (ngModelChange)="statusFilter.set($event); currentPage.set(1)"
              >
                <option value="all">Todos los estados</option>
                <option value="draft">Borrador</option>
                <option value="pending">Pendiente</option>
                <option value="paid">Pagada</option>
                <option value="sent">Enviada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label" for="date-from-filter"
                >Fecha desde</label
              >
              <input
                id="date-from-filter"
                type="date"
                class="filter-input"
                [(ngModel)]="dateFromFilter"
                (ngModelChange)="dateFromFilter.set($event); currentPage.set(1)"
              />
            </div>
            <div class="filter-group">
              <label class="filter-label" for="date-to-filter"
                >Fecha hasta</label
              >
              <input
                id="date-to-filter"
                type="date"
                class="filter-input"
                [(ngModel)]="dateToFilter"
                (ngModelChange)="dateToFilter.set($event); currentPage.set(1)"
              />
            </div>
            <div class="filter-group">
              <label class="filter-label" for="amount-min-filter"
                >Importe mínimo (€)</label
              >
              <input
                id="amount-min-filter"
                type="number"
                class="filter-input"
                placeholder="0"
                min="0"
                step="0.01"
                [(ngModel)]="amountMinFilter"
                (ngModelChange)="
                  amountMinFilter.set($event ? +$event : null);
                  currentPage.set(1)
                "
              />
            </div>
            <div class="filter-group">
              <label class="filter-label" for="amount-max-filter"
                >Importe máximo (€)</label
              >
              <input
                id="amount-max-filter"
                type="number"
                class="filter-input"
                placeholder="Sin límite"
                min="0"
                step="0.01"
                [(ngModel)]="amountMaxFilter"
                (ngModelChange)="
                  amountMaxFilter.set($event ? +$event : null);
                  currentPage.set(1)
                "
              />
            </div>
          </div>
        </div>
      }

      <!-- Bulk Actions Bar -->
      @if (hasSelections()) {
        <div class="bulk-actions-bar">
          <div class="bulk-info">
            <lucide-icon name="check-square" size="16" aria-hidden="true"></lucide-icon>
            <span
              >{{ selectedCount() }} factura{{
                selectedCount() === 1 ? '' : 's'
              }}
              seleccionada{{ selectedCount() === 1 ? '' : 's' }}</span
            >
          </div>
          <div class="bulk-buttons">
            <select
              class="bulk-status-select"
              (change)="bulkChangeStatus($event)"
            >
              <option value="">Cambiar estado</option>
              <option value="draft">Marcar como borrador</option>
              <option value="pending">Marcar como pendiente</option>
              <option value="paid">Marcar como pagada</option>
              <option value="sent">Marcar como enviada</option>
              <option value="cancelled">Marcar como cancelada</option>
            </select>
            <ui-button variant="danger" size="sm" (clicked)="bulkDelete()">
              <lucide-icon name="trash2" size="14" aria-hidden="true"></lucide-icon>
              Eliminar seleccionadas
            </ui-button>
            <ui-button variant="ghost" size="sm" (clicked)="clearSelection()">
              Cancelar
            </ui-button>
          </div>
        </div>
      }

      @if (isLoading() && allInvoices().length === 0) {
        <div class="feature-loader-wrap">
          <ui-loader message="Sincronizando facturas…"></ui-loader>
        </div>
      } @else if (error() && allInvoices().length === 0) {
        <div class="feature-error-screen" role="alert">
          <lucide-icon
            name="wifi-off"
            size="48"
            class="feature-error-screen__icon"
          ></lucide-icon>
          <h3>No se pudo cargar la facturación</h3>
          <p>{{ error() }}</p>
          <ui-button variant="solid" icon="rotate-cw" (clicked)="refreshInvoices()">
            Reintentar
          </ui-button>
        </div>
      } @else {
        <ui-feature-grid>
          <!-- Selection Header -->
          @if (paginatedInvoices().length > 0) {
            <div class="selection-header">
              <label class="checkbox-label" for="select-all-checkbox">
                <input
                  id="select-all-checkbox"
                  type="checkbox"
                  [checked]="isAllSelected()"
                  (change)="toggleSelectAll()"
                  class="selection-checkbox"
                />
                <span>Seleccionar todas</span>
              </label>
            </div>
          }

          @for (inv of paginatedInvoices(); track inv.id) {
            <ui-feature-card
              [name]="inv.invoiceNumber"
              [subtitle]="inv.clientName | uppercase"
              [avatarInitials]="getInitials(inv.invoiceNumber)"
              [avatarBackground]="getFiscalGradient(inv.verifactuStatus)"
              [status]="inv.status === 'paid' ? 'active' : 'offline'"
              [badgeLabel]="getStatusLabel(inv.status) | uppercase"
              [badgeVariant]="getStatusVariant(inv.status)"
              [showEdit]="true"
              [showDuplicate]="true"
              [showDelete]="inv.status === 'draft'"
              (cardClicked)="onRowClick(inv)"
              (editClicked)="goToEditInvoice(inv)"
              (duplicateClicked)="onDuplicate(inv)"
              (deleteClicked)="confirmDelete(inv)"
              [footerItems]="[
                { icon: 'calendar', label: formatDate(inv.issueDate) },
                {
                  icon: 'euro',
                  label: (inv.total || 0 | currency: 'EUR') || '-',
                },
                {
                  icon: 'shield',
                  label: inv.verifactuStatus
                    ? (getVerifactuLabel(inv.verifactuStatus) | uppercase)
                    : 'PENDIENTE',
                },
              ]"
            >
              <div card-extra class="card-selection">
                <input
                  type="checkbox"
                  [checked]="selectedInvoices().has(inv.id)"
                  (change)="toggleInvoiceSelection(inv.id)"
                  (click)="$event.stopPropagation()"
                  class="selection-checkbox"
                />
              </div>
              <div class="fiscal-indicators">
                @if (inv.verifactuStatus === 'sent') {
                  <span class="fiscal-badge success-glow">
                    <lucide-icon name="shield-check" size="12" aria-hidden="true"></lucide-icon>
                    AEAT REPORTED
                  </span>
                } @else if (inv.verifactuStatus === 'error') {
                  <span class="fiscal-badge error-glow">
                    <lucide-icon name="alert-triangle" size="12"></lucide-icon>
                    FISCAL ERROR
                  </span>
                }
              </div>

              <div footer-extra class="billing-extra-actions">
                <ui-button
                  variant="ghost"
                  size="sm"
                  icon="eye"
                  [routerLink]="['/billing', inv.id]"
                  title="Detalles"
                ></ui-button>

                @if (inv.status === 'draft') {
                  <ui-button
                    variant="ghost"
                    size="sm"
                    icon="play"
                    (click)="$event.stopPropagation(); issueInvoice(inv)"
                    class="text-success"
                    title="Emitir Factura"
                  ></ui-button>
                }

                @if (inv.status !== 'draft' && config.enableVerifactu) {
                  @if (
                    !inv.verifactuStatus ||
                    inv.verifactuStatus === 'pending' ||
                    inv.verifactuStatus === 'error'
                  ) {
                    <ui-button
                      variant="ghost"
                      size="sm"
                      [icon]="
                        inv.verifactuStatus === 'error'
                          ? 'refresh-cw'
                          : 'upload-cloud'
                      "
                      (click)="$event.stopPropagation(); sendToVerifactu(inv)"
                      [class.text-warning]="inv.verifactuStatus !== 'error'"
                      [class.text-danger]="inv.verifactuStatus === 'error'"
                      title="Enviar AEAT"
                    ></ui-button>
                  }
                  @if (inv.verifactuStatus === 'sent') {
                    <ui-button
                      variant="ghost"
                      size="sm"
                      icon="qr-code"
                      (click)="$event.stopPropagation(); viewVerifactuQr(inv)"
                      title="Ver Certificado"
                    ></ui-button>
                  }
                }
              </div>
            </ui-feature-card>
          } @empty {
            @if (filterProducesNoResults()) {
              <div class="feature-empty feature-empty--wide">
                <lucide-icon
                  name="search-x"
                  size="56"
                  class="feature-empty__icon"
                ></lucide-icon>
                <h3>Sin resultados</h3>
                <p>
                  Ninguna factura coincide con la búsqueda, la pestaña o los
                  filtros actuales.
                </p>
                <ui-button
                  variant="ghost"
                  icon="circle-x"
                  (clicked)="clearFiltersAndSearch()"
                >
                  Limpiar búsqueda y filtros
                </ui-button>
              </div>
            } @else {
              <div class="feature-empty feature-empty--wide">
                <lucide-icon
                  name="banknote"
                  size="56"
                  class="feature-empty__icon"
                ></lucide-icon>
                <h3>No hay facturas</h3>
                <p>
                  Comienza emitiendo una nueva factura o solicita un presupuesto
                  origen.
                </p>
                <ui-button
                  variant="solid"
                  (clicked)="goToNewInvoice()"
                  icon="CirclePlus"
                  >Emitir factura</ui-button
                >
              </div>
            }
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
    </ui-feature-page-shell>

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
              <p>
                Escanea este código para verificar la legalidad en la sede
                electrónica.
              </p>
            } @else {
              <ui-loader message="Generando certificado..."></ui-loader>
            }
          </div>

          <div class="qr-footer">
            <div class="stat">
              <span class="lbl">TOTAL OPERACIÓN</span>
              <span class="val">{{ formatCurrencyEu(inv.total) }}</span>
            </div>
            <ui-button variant="glass" (clicked)="closeVerifactuQrModal()"
              >CERRAR</ui-button
            >
          </div>
        </div>
      }
    </ui-modal>
    }
  `,
  styles: [
    `
      .flex-1 {
        flex: 1;
      }

      .fiscal-indicators {
        margin-top: 1rem;
      }
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
      .success-glow {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.2);
      }
      .error-glow {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.2);
      }

      .card-actions {
        display: flex;
        gap: 0.25rem;
      }
      .text-success {
        color: #10b981 !important;
      }
      .text-warning {
        color: #f59e0b !important;
      }
      .text-danger {
        color: #ef4444 !important;
      }

      .pagination-footer {
        margin-top: 3rem;
        display: flex;
        justify-content: center;
      }

      /* Form & QR Panel */
      .form-grid {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        padding: 1rem 0;
      }
      .form-hint {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
      .read-only-section {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .read-only-section .label {
        font-size: 0.6rem;
        font-weight: 800;
        color: var(--text-muted);
      }
      .read-only-section .value {
        font-size: 1rem;
        font-weight: 700;
      }
      .row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 2rem;
      }

      .qr-panel {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 1rem 0;
      }
      .qr-header h3 {
        font-size: 0.8rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }
      .qr-header .ref {
        font-size: 1.5rem;
        font-weight: 900;
      }
      .qr-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        text-align: center;
      }
      .qr-box {
        background: #fff;
        padding: 1rem;
        border-radius: 12px;
      }
      .qr-box img {
        width: 200px;
        height: 200px;
      }
      .qr-display p {
        font-size: 0.75rem;
        color: var(--text-muted);
        max-width: 250px;
      }
      .qr-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid var(--border-soft);
        padding-top: 1.5rem;
      }
      .qr-footer .stat {
        display: flex;
        flex-direction: column;
      }
      .qr-footer .lbl {
        font-size: 0.6rem;
        color: var(--text-muted);
      }
      .qr-footer .val {
        font-size: 1.1rem;
        font-weight: 800;
        color: #10b981;
      }

      /* Advanced Filters */
      .advanced-filters {
        margin: 1rem 0;
        padding: 1.5rem;
        background: var(--surface);
        border-radius: 12px;
        border: 1px solid var(--border-soft);
      }
      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }
      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .filter-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .filter-select,
      .filter-input {
        padding: 0.75rem;
        border: 1px solid var(--border-soft);
        border-radius: 8px;
        background: var(--background);
        color: var(--text);
        font-size: 0.875rem;
      }
      .filter-select:focus,
      .filter-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
      }

      /* Bulk Actions */
      .bulk-actions-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        background: var(--warning-light);
        border: 1px solid var(--warning);
        border-radius: 12px;
        margin: 1rem 0;
      }
      .bulk-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        color: var(--warning-dark);
      }
      .bulk-buttons {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }
      .bulk-status-select {
        padding: 0.5rem;
        border: 1px solid var(--border-soft);
        border-radius: 6px;
        background: var(--background);
        font-size: 0.875rem;
      }

      /* Selection */
      .selection-header {
        grid-column: 1 / -1;
        display: flex;
        justify-content: flex-end;
        padding: 1rem;
        border-bottom: 1px solid var(--border-soft);
      }
      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
      }
      .selection-checkbox {
        width: 16px;
        height: 16px;
        accent-color: var(--primary);
      }
      .card-selection {
        position: absolute;
        top: 1rem;
        right: 1rem;
      }

      /* Form Enhancements */
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .field-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .notes-textarea {
        padding: 0.75rem;
        border: 1px solid var(--border-soft);
        border-radius: 8px;
        background: var(--background);
        color: var(--text);
        font-size: 0.875rem;
        font-family: inherit;
        resize: vertical;
        min-height: 80px;
      }
      .notes-textarea:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
      }

      :host ::ng-deep .feature-filter-bar ui-button.active {
        background: var(--primary-light);
        color: var(--primary);
      }

      @media (max-width: 900px) {
        .row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingListComponent
  implements OnInit, OnDestroy, FilterableService<Invoice>
{
  public readonly config = inject(BILLING_FEATURE_CONFIG);
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly facade = inject(BillingFacade);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly toast = inject(ToastService);
  readonly verifactuStore = inject<VerifactuStore>(VerifactuStore);
  private readonly authStore = inject(GlobalAuthStore);
  readonly canAccess = rbacAllows(
    this.authStore,
    'invoices.view',
    'billing.view',
  );

  currentTheme = this.themeService.currentThemeData;
  tabs = this.facade.tabs;

  invoices = this.facade.invoices;
  allInvoices = this.facade.allInvoices;
  isLoading = this.facade.isLoading;
  error = this.facade.error;
  activeTab = this.facade.activeTab;
  currentPage = signal(1);
  sortField = signal<'issueDate' | 'total' | 'status'>('issueDate');
  sortDirection = signal<1 | -1>(-1);
  searchTerm = '';

  // Advanced filtering
  showAdvancedFilters = signal(false);
  statusFilter = signal<string>('all');
  dateFromFilter = signal<string>('');
  dateToFilter = signal<string>('');
  amountMinFilter = signal<number | null>(null);
  amountMaxFilter = signal<number | null>(null);

  // Bulk actions
  selectedInvoices = signal<Set<string>>(new Set());

  isVerifactuQrModalOpen = signal(false);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  onRowClick(inv: Invoice) {
    this.router.navigate(['/billing', inv.id]);
  }

  goToNewInvoice(): void {
    void this.router.navigate(['new'], { relativeTo: this.route });
  }

  goToEditInvoice(inv: Invoice): void {
    void this.router.navigate([inv.id, 'edit'], { relativeTo: this.route });
  }

  onDuplicate(inv: Invoice) {
    const { id, ...rest } = inv;
    void id;
    this.facade.createInvoice({
      ...rest,
      invoiceNumber: `${inv.invoiceNumber} (COPIA)`,
    });
  }

  confirmDelete(inv: Invoice) {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar la factura ${inv.invoiceNumber}?`,
      )
    ) {
      this.facade.deleteInvoice(inv.id);
    }
  }

  getInitials(num: string): string {
    return num.split('/').slice(-1)[0].slice(0, 2).toUpperCase();
  }

  getFiscalGradient(status: string | undefined): string {
    switch (status) {
      case 'sent':
        return 'linear-gradient(135deg, #10b981, #059669)';
      case 'error':
        return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'pending':
        return 'linear-gradient(135deg, #f59e0b, #d97706)';
      default:
        return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    }
  }

  ngOnInit() {
    this.masterFilter.registerProvider(this);
    this.loadInvoices();
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
  }

  /** Lógica de filtrado para el MasterFilterService */
  filter(query: string): Observable<Invoice[]> {
    const term = query.toLowerCase().trim();
    if (!term) return of(this.allInvoices());

    const matches = this.allInvoices().filter((inv: Invoice) => {
      const searchableText = [
        inv.invoiceNumber,
        inv.clientName,
        inv.nif || '',
        inv.status,
        inv.verifactuStatus || '',
      ]
        .join(' ')
        .toLowerCase();

      const normalizedTerm = this.normalizeSearchTerm(term);

      return (
        searchableText.includes(normalizedTerm) ||
        this.hasKeywordMatch(searchableText, normalizedTerm)
      );
    });
    return of(matches);
  }

  private normalizeSearchTerm(term: string): string {
    const synonyms: Record<string, string[]> = {
      pagada: ['pagada', 'paid', 'pagado', 'cobrado'],
      pendiente: ['pendiente', 'pending', 'impagada', 'pendiente'],
      enviada: ['enviada', 'sent', 'remitida'],
      borrador: ['borrador', 'draft', 'borradores'],
      factura: ['factura', 'invoice', 'recibo'],
      cliente: ['cliente', 'client', 'comprador'],
    };

    for (const [key, variants] of Object.entries(synonyms)) {
      if (variants.some((v) => term.includes(v))) {
        return key;
      }
    }
    return term;
  }

  private hasKeywordMatch(text: string, term: string): boolean {
    return (
      text.includes(term) ||
      term.split(' ').every((word) => text.includes(word))
    );
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
  }

  clearFiltersAndSearch(): void {
    this.searchTerm = '';
    this.masterFilter.search('');
    this.facade.searchInvoices('');
    this.facade.setTab('all');
    this.statusFilter.set('all');
    this.dateFromFilter.set('');
    this.dateToFilter.set('');
    this.amountMinFilter.set(null);
    this.amountMaxFilter.set(null);
    this.currentPage.set(1);
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

  getVerifactuVariant(
    status: string | undefined,
  ): 'success' | 'warning' | 'danger' | 'secondary' {
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
    this.allInvoices().reduce(
      (acc: number, inv: Invoice) => acc + (inv.total || 0),
      0,
    ),
  );

  totalPending = computed(() =>
    this.allInvoices()
      .filter((i: Invoice) => i.status === 'pending')
      .reduce((acc: number, inv: Invoice) => acc + (inv.total || 0), 0),
  );

  // Bulk actions computed
  selectedCount = computed(() => this.selectedInvoices().size);
  hasSelections = computed(() => this.selectedInvoices().size > 0);

  /** Base: pestaña + búsqueda del facade; luego filtros avanzados y ordenación. */
  filteredInvoices = computed(() => {
    let filtered = [...this.invoices()];

    if (this.statusFilter() !== 'all') {
      filtered = filtered.filter((inv) => inv.status === this.statusFilter());
    }

    if (this.dateFromFilter()) {
      const fromDate = new Date(this.dateFromFilter());
      filtered = filtered.filter((inv) => new Date(inv.issueDate) >= fromDate);
    }
    if (this.dateToFilter()) {
      const toDate = new Date(this.dateToFilter());
      filtered = filtered.filter((inv) => new Date(inv.issueDate) <= toDate);
    }

    const amountMin = this.amountMinFilter();
    if (amountMin !== null) {
      filtered = filtered.filter((inv) => (inv.total || 0) >= amountMin);
    }
    const amountMax = this.amountMaxFilter();
    if (amountMax !== null) {
      filtered = filtered.filter((inv) => (inv.total || 0) <= amountMax);
    }

    const field = this.sortField();
    const dir = this.sortDirection();
    filtered.sort((a, b) => {
      let cmp = 0;
      if (field === 'issueDate') {
        cmp =
          new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
      } else if (field === 'total') {
        cmp = (a.total || 0) - (b.total || 0);
      } else {
        cmp = (a.status || '').localeCompare(b.status || '', 'es', {
          sensitivity: 'base',
        });
      }
      return dir === 1 ? cmp : -cmp;
    });

    return filtered;
  });

  readonly filterProducesNoResults = computed(
    () =>
      this.allInvoices().length > 0 && this.filteredInvoices().length === 0,
  );

  paginatedInvoices = computed(() => {
    const filtered = this.filteredInvoices();
    const pageSize = 12; // Assuming 12 items per page
    const start = (this.currentPage() - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  });

  totalPages = computed(() => {
    const filtered = this.filteredInvoices();
    const pageSize = 12;
    return Math.ceil(filtered.length / pageSize);
  });

  isAllSelected = computed(() => {
    const paginated = this.paginatedInvoices();
    return (
      paginated.length > 0 &&
      paginated.every((inv) => this.selectedInvoices().has(inv.id))
    );
  });

  // Bulk actions methods
  toggleSelectAll() {
    const paginated = this.paginatedInvoices();
    const currentSelected = this.selectedInvoices();

    if (this.isAllSelected()) {
      const newSelected = new Set(currentSelected);
      paginated.forEach((inv) => newSelected.delete(inv.id));
      this.selectedInvoices.set(newSelected);
    } else {
      const newSelected = new Set(currentSelected);
      paginated.forEach((inv) => newSelected.add(inv.id));
      this.selectedInvoices.set(newSelected);
    }
  }

  toggleInvoiceSelection(invoiceId: string) {
    const currentSelected = this.selectedInvoices();
    const newSelected = new Set(currentSelected);

    if (newSelected.has(invoiceId)) {
      newSelected.delete(invoiceId);
    } else {
      newSelected.add(invoiceId);
    }

    this.selectedInvoices.set(newSelected);
  }

  bulkChangeStatus(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as
      | 'pending'
      | 'draft'
      | 'sent'
      | 'paid'
      | 'cancelled';

    if (!newStatus) return;

    const selectedIds = Array.from(this.selectedInvoices());
    selectedIds.forEach((id) => {
      this.facade.updateInvoice(id, { status: newStatus });
    });

    this.selectedInvoices.set(new Set());
    this.toast.show(`${selectedIds.length} facturas actualizadas`, 'success');
    target.value = ''; // Reset select
  }

  bulkDelete() {
    const selectedIds = Array.from(this.selectedInvoices());

    if (confirm(`¿Estás seguro de eliminar ${selectedIds.length} facturas?`)) {
      selectedIds.forEach((id) => this.facade.deleteInvoice(id));
      this.selectedInvoices.set(new Set());
      this.toast.show(`${selectedIds.length} facturas eliminadas`, 'success');
    }
  }

  clearSelection() {
    this.selectedInvoices.set(new Set());
  }

  // Advanced filtering methods
  toggleAdvancedFilters() {
    this.showAdvancedFilters.set(!this.showAdvancedFilters());
  }

  refreshInvoices() {
    this.facade.loadInvoices(true);
    this.toast.show('Facturas actualizadas', 'info');
  }

  toggleSort() {
    if (this.sortField() === 'issueDate') {
      this.sortField.set('total');
      this.sortDirection.set(-1);
    } else if (this.sortField() === 'total') {
      this.sortField.set('status');
    } else {
      this.sortField.set('issueDate');
      this.sortDirection.set(1);
    }
  }
}
