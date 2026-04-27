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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiFeatureFilterBarComponent,
  UiPaginationComponent,
  UiLoaderComponent,
  UiTabsComponent,
  UiStatCardComponent,
  UiModalComponent,
  UiInputComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
  UiFeatureAccessDeniedComponent,
  UiFeaturePageShellComponent,
  UiSelectComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  ThemeService,
  PluginStore,
  MasterFilterService,
  FilterableService,
  AIFormBridgeService,
  ToastService,
  GlobalAuthStore,
  rbacAllows,
} from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';
import {
  Rental,
  RentalService,
  RentalSignatureStatus,
} from '@josanz-erp/rentals-data-access';

@Component({
  selector: 'lib-rentals-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiButtonComponent,
    UiFeatureFilterBarComponent,
    UiPaginationComponent,
    UiLoaderComponent,
    UiTabsComponent,
    UiStatCardComponent,
    UiModalComponent,
    UiInputComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    LucideAngularModule,
    UiFeatureAccessDeniedComponent,
    UiFeaturePageShellComponent,
    UiSelectComponent,
  ],
  template: `
    @if (!canAccess()) {
      <ui-feature-access-denied
        message="No tienes permiso para ver alquileres."
        permissionHint="rentals.view"
      />
    } @else {
    <ui-feature-page-shell [extraClass]="'rentals-container'">
      <ui-feature-header
        title="Alquileres"
        breadcrumbLead="OPERACIONES"
        breadcrumbTail="ALQUILERES Y EXPEDIENTES"
        subtitle="Gestión operativa y monitoreo de expedientes"
        icon="key"
        actionLabel="NUEVO EXPEDIENTE"
        (actionClicked)="goToNewRental()"
      ></ui-feature-header>

      <ui-feature-stats>
        <ui-stat-card
          label="Expedientes Activos"
          [value]="activeCount().toString()"
          icon="activity"
          [accent]="true"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Pendientes Inicio"
          [value]="draftCount().toString()"
          icon="clock"
          [trend]="1"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Facturación Ciclo"
          [value]="formatCurrencyEu(totalRevenue())"
          icon="trending-up"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Eficiencia"
          value="92%"
          icon="check-circle"
          [accent]="false"
        >
        </ui-stat-card>
      </ui-feature-stats>

      <ui-feature-filter-bar
        [appearance]="'feature'"
        [searchVariant]="'glass'"
        placeholder="Buscar por propiedad, inquilino o cliente..."
        (searchChange)="onSearch($event)"
      >
        <div uiFeatureFilterStates>
          <ui-tabs
            [tabs]="tabs"
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
          (clicked)="refreshRentals()"
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
            sortField() === 'clientName'
              ? 'cliente'
              : sortField() === 'totalAmount'
                ? 'total'
                : 'estado'
          }}
        </ui-button>
      </ui-feature-filter-bar>

      <!-- Advanced Filters -->
      @if (showAdvancedFilters()) {
        <div class="advanced-filters">
          <div class="filters-grid">
              <ui-select
                id="status-filter"
                label="Estado"
                [options]="[
                  { label: 'Todos los estados', value: 'all' },
                  { label: 'Borrador', value: 'DRAFT' },
                  { label: 'Activo', value: 'ACTIVE' },
                  { label: 'Completado', value: 'COMPLETED' },
                  { label: 'Cancelado', value: 'CANCELLED' }
                ]"
                [(ngModel)]="statusFilterSignal"
              ></ui-select>
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
            <div class="filter-actions">
              <ui-button variant="ghost" size="sm" (clicked)="clearFilters()">
                Limpiar filtros
              </ui-button>
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
              >{{ selectedCount() }} alquiler{{
                selectedCount() === 1 ? '' : 'es'
              }}
              seleccionado{{ selectedCount() === 1 ? '' : 's' }}</span
            >
          </div>
          <div class="bulk-buttons">
            <ui-select
              variant="minimal"
              placeholder="Cambiar estado"
              [options]="[
                { label: 'Marcar como borrador', value: 'DRAFT' },
                { label: 'Marcar como activo', value: 'ACTIVE' },
                { label: 'Marcar como completado', value: 'COMPLETED' },
                { label: 'Marcar como cancelado', value: 'CANCELLED' }
              ]"
              (change)="bulkChangeStatusFromSelect($event)"
            ></ui-select>
            <ui-button variant="danger" size="sm" (clicked)="bulkDelete()">
              <lucide-icon name="trash2" size="14" aria-hidden="true"></lucide-icon>
              Eliminar seleccionados
            </ui-button>
            <ui-button variant="ghost" size="sm" (clicked)="clearSelection()">
              Cancelar
            </ui-button>
          </div>
        </div>
      }

      @if (loadError() && rentals().length > 0) {
        <div
          class="feature-load-error-banner"
          role="status"
          aria-live="polite"
        >
          <lucide-icon
            name="alert-circle"
            size="20"
            class="feature-load-error-banner__icon"
            aria-hidden="true"
          ></lucide-icon>
          <span class="feature-load-error-banner__text">{{ loadError() }}</span>
          <ui-button
            variant="ghost"
            size="sm"
            icon="rotate-cw"
            (clicked)="refreshRentals()"
          >
            Reintentar
          </ui-button>
        </div>
      }

      @if (isLoading() && rentals().length === 0) {
        <div class="feature-loader-wrap">
          <ui-loader message="Sincronizando alquileres…"></ui-loader>
        </div>
      } @else if (loadError() && rentals().length === 0) {
        <div class="feature-error-screen" role="alert">
          <lucide-icon
            name="wifi-off"
            size="48"
            class="feature-error-screen__icon"
            aria-hidden="true"
          ></lucide-icon>
          <h3>No se pudo cargar el listado</h3>
          <p>{{ loadError() }}</p>
          <ui-button variant="solid" icon="rotate-cw" (clicked)="refreshRentals()">
            Reintentar
          </ui-button>
        </div>
      } @else {
        <ui-feature-grid>
          <!-- Selection Header -->
          @if (paginatedRentals().length > 0) {
            <div class="selection-header">
              <label class="checkbox-label" for="select-all-checkbox">
                <input
                  id="select-all-checkbox"
                  type="checkbox"
                  [checked]="isAllSelected()"
                  (change)="toggleSelectAll()"
                  class="selection-checkbox"
                />
                <span>Seleccionar todos</span>
              </label>
            </div>
          }

          @for (rental of paginatedRentals(); track rental.id) {
            <ui-feature-card
              [name]="rental.clientName"
              [subtitle]="'REF: ' + (rental.id.slice(0, 8) | uppercase)"
              [avatarInitials]="getInitials(rental.clientName)"
              [avatarBackground]="getStatusGradient(rental.status)"
              [status]="rental.status === 'ACTIVE' ? 'active' : 'offline'"
              [badgeLabel]="getStatusLabel(rental.status) | uppercase"
              [badgeVariant]="getStatusVariant(rental.status)"
              [showEdit]="true"
              [showDuplicate]="true"
              [showDelete]="true"
              (cardClicked)="onRowClick(rental)"
              (editClicked)="goToEditRental(rental)"
              (duplicateClicked)="onDuplicate(rental)"
              (deleteClicked)="confirmDelete(rental)"
              [footerItems]="[
                {
                  icon: 'calendar',
                  label: (rental.startDate || '' | date: 'dd/MM/yy') || '-',
                },
                { icon: 'package', label: rental.itemsCount + ' unid.' },
                {
                  icon: 'euro',
                  label: (rental.totalAmount || 0 | currency: 'EUR') || '-',
                },
              ]"
            >
              <div card-extra class="card-selection">
                <input
                  type="checkbox"
                  [checked]="selectedRentals().has(rental.id)"
                  (change)="toggleRentalSelection(rental.id)"
                  (click)="$event.stopPropagation()"
                  class="selection-checkbox"
                />
              </div>
              <div class="rental-extras">
                <div class="signature-status">
                  @if (rental.signatureStatus === 'SIGNED') {
                    <span class="sig-badge signed">
                      <lucide-icon name="check-circle" size="12" aria-hidden="true"></lucide-icon>
                      FIRMADO
                    </span>
                  } @else {
                    <span class="sig-badge pending">
                      <lucide-icon name="clock" size="12" aria-hidden="true"></lucide-icon> PEN.
                      FIRMA
                    </span>
                  }
                </div>
              </div>

              <div footer-extra class="card-extra-actions">
                <ui-button
                  variant="ghost"
                  size="sm"
                  icon="pen-tool"
                  (click)="$event.stopPropagation(); openSignatureModal(rental)"
                  title="Gestionar firma"
                ></ui-button>
                @if (rental.status === 'DRAFT') {
                  <ui-button
                    variant="ghost"
                    size="sm"
                    icon="play"
                    (click)="$event.stopPropagation(); activateRental(rental)"
                    class="text-success"
                    title="Activar expediente"
                  ></ui-button>
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
                  aria-hidden="true"
                ></lucide-icon>
                <h3>Sin resultados</h3>
                <p>
                  Ningún expediente coincide con la búsqueda, la pestaña o los
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
                  name="key"
                  size="56"
                  class="feature-empty__icon"
                  aria-hidden="true"
                ></lucide-icon>
                <h3>No hay expedientes</h3>
                <p>
                  Comienza añadiendo tu primer expediente de alquiler para
                  gestionar tus propiedades.
                </p>
                <ui-button
                  variant="solid"
                  (clicked)="goToNewRental()"
                  icon="CirclePlus"
                >
                  Añadir primer expediente
                </ui-button>
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
      [isOpen]="isSignatureModalOpen()"
      title="FIRMA DIGITAL"
      variant="glass"
      (closed)="closeSignatureModal()"
    >
      @if (rentalForSignature(); as rs) {
        <div class="sig-panel">
          <h3>Expediente #{{ rs.id.slice(0, 8) | uppercase }}</h3>
          <p>
            Estado de firma:
            <strong>{{
              getSignatureLabel(rs.signatureStatus) | uppercase
            }}</strong>
          </p>
          <ui-input
            label="Email del firmante"
            [(ngModel)]="signatureEmail"
            placeholder="email@cliente.com"
            icon="mail"
          ></ui-input>
        </div>
      }
      <div class="modal-actions">
        <ui-button variant="ghost" (clicked)="closeSignatureModal()"
          >CERRAR</ui-button
        >
        <ui-button variant="glass" (clicked)="markSignaturePending()"
          >SOLICITAR FIRMA</ui-button
        >
        <ui-button
          variant="solid"
          (clicked)="markSignatureSigned()"
          icon="check"
          >FIRMADO</ui-button
        >
      </div>
    </ui-modal>
    }
  `,
  styles: [
    `
      .rental-extras {
        margin-top: 1rem;
      }
      .sig-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.65rem;
        font-weight: 800;
        padding: 0.2rem 0.6rem;
        border-radius: 4px;
        letter-spacing: 0.05em;
      }
      .sig-badge.signed {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
      }
      .sig-badge.pending {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
      }

      .card-actions {
        display: flex;
        gap: 0.25rem;
      }
      .text-success {
        color: var(--success) !important;
      }

      .pagination-footer {
        margin-top: 3rem;
        display: flex;
        justify-content: center;
      }

      /* BABOONI LUXE RENTALS OVERRIDES */
      :host-context(html[data-erp-tenant='babooni']) .advanced-filters {
        background: rgba(255, 255, 255, 0.55);
        backdrop-filter: blur(14px);
        border: 1px solid color-mix(in srgb, var(--border-soft) 40%, transparent);
        border-radius: 20px;
        padding: 2rem;
        box-shadow: 0 10px 40px -15px rgba(0, 0, 0, 0.08);
        margin: 1.5rem 0;
      }

      :host-context(html[data-erp-tenant='babooni']) .bulk-actions-bar {
        background: #ffffff;
        border: 1px solid var(--brand);
        border-radius: 16px;
        padding: 1rem 2rem;
        box-shadow: 0 12px 32px -8px rgba(var(--brand-rgb), 0.15);
        margin: 1.5rem 0;
      }

      :host-context(html[data-erp-tenant='babooni']) .selection-header {
        background: rgba(255, 255, 255, 0.4);
        border-radius: 12px;
        padding: 0.75rem 1.25rem;
        border-bottom: none;
        margin-bottom: 1rem;
      }

      :host-context(html[data-erp-tenant='babooni']) .sig-badge {
        background: rgba(255, 255, 255, 0.85);
        padding: 0.35rem 0.85rem;
        border-radius: 8px;
        font-weight: 850;
        font-size: 0.62rem;
        letter-spacing: 0.05em;
        box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        border: 1px solid rgba(0,0,0,0.02);
      }

      :host-context(html[data-erp-tenant='babooni']) .sig-badge.signed { color: #10b981; }
      :host-context(html[data-erp-tenant='babooni']) .sig-badge.pending { color: #f59e0b; }

      :host-context(html[data-erp-tenant='babooni']) .card-extra-actions {
        background: rgba(255, 255, 255, 0.8);
        padding: 4px;
        border-radius: 10px;
        display: flex;
        gap: 2px;
      }
       /* Modal Form Styles */
      .modal-form {
        padding: 1rem 0;
      }

      .form-errors {
        background: var(--danger-light);
        border: 1px solid var(--danger);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1.5rem;
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--danger);
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
      }

      .error-message:last-child {
        margin-bottom: 0;
      }

      .form-section {
        margin-bottom: 1.5rem;
      }

      .section-title {
        font-size: 1rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--text-primary);
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.5rem;
      }

      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
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
      .sig-panel {
        padding: 1rem 0;
      }
      .sig-panel h3 {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
      }
      .sig-panel p {
        color: var(--text-muted);
        margin-bottom: 1.5rem;
      }

      @media (max-width: 900px) {
        .navigation-bar {
          flex-direction: column;
          align-items: stretch;
          gap: 1rem;
        }
        .search-bar {
          width: 100%;
        }
        .row {
          grid-template-columns: 1fr;
        }
      }

      .advanced-filters {
        background: var(--surface);
        border: 1px solid var(--border-soft);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        animation: slideDown 0.3s ease-out;
      }

      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        align-items: end;
      }

      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .filter-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .filter-select,
      .filter-input {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--border-soft);
        border-radius: 8px;
        background: var(--background);
        color: var(--text-primary);
        font-size: 0.875rem;
        transition: border-color 0.2s ease;
      }

      .filter-select:focus,
      .filter-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
      }

      .filter-actions {
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .bulk-actions-bar {
        background: var(--warning-light);
        border: 1px solid var(--warning);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        margin-bottom: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        animation: slideDown 0.3s ease-out;
      }

      .bulk-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--warning);
        font-weight: 600;
      }

      .bulk-buttons {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }

      .bulk-status-select {
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--border-soft);
        border-radius: 6px;
        background: var(--background);
        color: var(--text-primary);
        font-size: 0.875rem;
      }

      .selection-header {
        grid-column: 1 / -1;
        background: var(--surface);
        border: 1px solid var(--border-soft);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        font-weight: 600;
        color: var(--text-primary);
      }

      .selection-checkbox {
        width: 16px;
        height: 16px;
        accent-color: var(--primary);
        cursor: pointer;
      }

      .card-selection {
        position: absolute;
        top: 1rem;
        right: 1rem;
      }

      .input-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .input-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .form-input {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--border-soft);
        border-radius: 8px;
        background: var(--surface);
        color: var(--text-primary);
        font-family: inherit;
        font-size: 0.875rem;
        transition: border-color 0.2s ease;
      }

      .form-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
      }

      .form-field {
        margin-bottom: 1.5rem;
      }

      .field-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }

      .notes-textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-soft);
        border-radius: 8px;
        background: var(--surface);
        color: var(--text-primary);
        font-family: inherit;
        font-size: 0.875rem;
        resize: vertical;
        min-height: 80px;
        transition: border-color 0.2s ease;
      }

      .notes-textarea:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalsListComponent
  implements OnInit, OnDestroy, FilterableService<Rental>
{
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly rentalService = inject(RentalService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly aiFormBridge = inject(AIFormBridgeService);
  private readonly toast = inject(ToastService);
  private readonly authStore = inject(GlobalAuthStore);
  readonly canAccess = rbacAllows(
    this.authStore,
    'rentals.view',
    'rentals.manage',
    'rentals.approve',
  );

  // Signals for UI state
  currentPage = signal(1);
  totalPages = computed(() => {
    const pageSize = 12;
    return Math.ceil(this.filteredRentals().length / pageSize);
  });
  sortField = signal<'clientName' | 'totalAmount' | 'status'>('clientName');
  sortDirection = signal<1 | -1>(1);

  // Additional signals
  rentals = signal<Rental[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);
  activeTab = signal('all');
  searchFilter = signal('');
  isSignatureModalOpen = signal(false);
  rentalForSignature = signal<Rental | null>(null);
  signatureEmail = '';

  // Filter signals
  statusFilter = signal<string>('all');
  dateFromFilter = signal<string>('');
  dateToFilter = signal<string>('');
  amountMinFilter = signal<number | null>(null);
  amountMaxFilter = signal<number | null>(null);
  showAdvancedFilters = signal(false);

  // Bulk actions signals
  selectedRentals = signal<Set<string>>(new Set());

  currentTheme = this.themeService.currentThemeData;

  tabs = [
    { id: 'all', label: 'Todos', badge: 0 },
    { id: 'DRAFT', label: 'Borrador', badge: 0 },
    { id: 'ACTIVE', label: 'Activos', badge: 0 },
    { id: 'COMPLETED', label: 'Completados', badge: 0 },
  ];

  columns = [
    { key: 'id', header: 'REFERENCIA', width: '120px' },
    { key: 'clientName', header: 'CLIENTE' },
    { key: 'startDate', header: 'INICIO', width: '120px' },
    { key: 'endDate', header: 'FIN', width: '120px' },
    { key: 'itemsCount', header: 'UNIDADES', width: '80px' },
    { key: 'totalAmount', header: 'IMPORTE', width: '120px' },
    { key: 'status', header: 'ESTADO', width: '120px' },
    { key: 'signature', header: 'FIRMA', width: '72px' },
    { key: 'actions', header: '', width: '150px' },
  ];

  private readonly listAiFormProxy: Record<string, unknown> = {};

  ngOnInit() {
    this.aiFormBridge.registerDataProxy(this.listAiFormProxy);
    this.masterFilter.registerProvider(this);
    this.loadRentals();
    if (this.route.snapshot.queryParamMap.get('openCreate')) {
      queueMicrotask(() =>
        this.router.navigate(['new'], { relativeTo: this.route, replaceUrl: true }),
      );
    }
  }

  ngOnDestroy() {
    this.aiFormBridge.unregisterDataProxy(this.listAiFormProxy);
    this.masterFilter.unregisterProvider();
  }

  loadRentals() {
    this.loadError.set(null);
    this.isLoading.set(true);
    this.rentalService.getRentals().subscribe({
      next: (list) => {
        this.rentals.set(list);
        this.rentalService.seedListCache(list);
        this.updateTabs(list);
        this.isLoading.set(false);
        this.loadError.set(null);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set(
          'No se pudieron cargar los alquileres. Comprueba la conexión e inténtalo de nuevo.',
        );
      },
    });
  }

  updateTabs(list: Rental[]) {
    const counts: Record<string, number> = {
      all: list.length,
      DRAFT: list.filter((r: Rental) => r.status === 'DRAFT').length,
      ACTIVE: list.filter((r: Rental) => r.status === 'ACTIVE').length,
      COMPLETED: list.filter((r: Rental) => r.status === 'COMPLETED').length,
    };
    this.tabs = this.tabs.map((t) => ({ ...t, badge: counts[t.id] || 0 }));
  }

  onTabChange(id: string) {
    this.activeTab.set(id);
  }
  onSearch(term: string) {
    this.searchFilter.set(term);
    this.masterFilter.search(term);
  }

  filter(query: string): Observable<Rental[]> {
    const term = query.toLowerCase().trim();
    if (!term) return of(this.rentals());

    const matches = this.rentals().filter((r: Rental) => {
      const searchableText = [r.id, r.clientName || '', r.status]
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
      activo: ['activo', 'active', 'vigente'],
      borrador: ['borrador', 'draft', 'borradores'],
      completado: ['completado', 'completed', 'finalizado', 'terminado'],
      alquiler: ['alquiler', 'rental', 'arrendamiento'],
      inquilino: ['inquilino', 'tenant', 'arrendatario'],
      propiedad: ['propiedad', 'property', 'inmueble'],
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

  onRowClick(rental: Rental) {
    this.router.navigate(['/rentals', rental.id]);
  }

  goToNewRental(): void {
    void this.router.navigate(['new'], { relativeTo: this.route });
  }

  goToEditRental(rental: Rental): void {
    void this.router.navigate([rental.id, 'edit'], { relativeTo: this.route });
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters.set(!this.showAdvancedFilters());
  }

  clearFilters() {
    this.statusFilter.set('all');
    this.dateFromFilter.set('');
    this.dateToFilter.set('');
    this.amountMinFilter.set(null);
    this.amountMaxFilter.set(null);
    this.currentPage.set(1);
  }

  clearFiltersAndSearch(): void {
    this.searchFilter.set('');
    this.masterFilter.search('');
    this.activeTab.set('all');
    this.clearFilters();
  }

  refreshRentals() {
    this.loadRentals();
    this.toast.show('Alquileres actualizados', 'info');
  }

  toggleSelectAll() {
    const paginated = this.paginatedRentals();
    const currentSelected = this.selectedRentals();
    const newSelected = new Set(currentSelected);

    if (this.isAllSelected()) {
      paginated.forEach((r) => newSelected.delete(r.id));
    } else {
      paginated.forEach((r) => newSelected.add(r.id));
    }

    this.selectedRentals.set(newSelected);
  }

  toggleRentalSelection(rentalId: string) {
    const currentSelected = this.selectedRentals();
    const newSelected = new Set(currentSelected);

    if (newSelected.has(rentalId)) {
      newSelected.delete(rentalId);
    } else {
      newSelected.add(rentalId);
    }

    this.selectedRentals.set(newSelected);
  }

  clearSelection() {
    this.selectedRentals.set(new Set());
  }

  bulkChangeStatus(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;

    if (!newStatus) return;

    const selectedIds = Array.from(this.selectedRentals());
    if (selectedIds.length === 0) return;

    // Reset select
    target.value = '';

    // Simulate bulk update
    selectedIds.forEach((id) => {
      console.log(`Changing status of ${id} to ${newStatus}`);
    });

    this.toast.show(
      `${selectedIds.length} alquiler${selectedIds.length === 1 ? '' : 'es'} actualizado${selectedIds.length === 1 ? '' : 's'}`,
      'success',
    );
    this.clearSelection();
    this.refreshRentals();
  }

  bulkDelete() {
    const selectedIds = Array.from(this.selectedRentals());
    if (selectedIds.length === 0) return;

    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar ${selectedIds.length} alquiler${selectedIds.length === 1 ? '' : 'es'}?`,
      )
    ) {
      return;
    }

    // Simulate bulk delete
    selectedIds.forEach((id) => {
      console.log(`Deleting rental ${id}`);
    });

    this.toast.show(
      `${selectedIds.length} alquiler${selectedIds.length === 1 ? '' : 'es'} eliminado${selectedIds.length === 1 ? '' : 's'}`,
      'success',
    );
    this.clearSelection();
    this.refreshRentals();
  }

  getInitials(name: string): string {
    return (name || '??')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  getStatusGradient(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'linear-gradient(135deg, #10b981, #059669)';
      case 'DRAFT':
        return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'COMPLETED':
        return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'CANCELLED':
        return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default:
        return 'linear-gradient(135deg, #6b7280, #374151)';
    }
  }

  activateRental(rental: Rental) {
    this.rentalService.activateRental(rental.id).subscribe({
      next: (upd) =>
        this.rentals.update((list) =>
          list.map((r) => (r.id === upd.id ? upd : r)),
        ),
    });
  }

  onDuplicate(rental: Rental) {
    const { id, createdAt, ...rest } = rental;
    void id;
    void createdAt;
    this.rentalService
      .createRental({
        ...rest,
        clientName: `${rental.clientName} (COPIA)`,
      })
      .subscribe((newR) => {
        this.rentals.update((list) => [...list, newR]);
      });
  }

  confirmDelete(rental: Rental) {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar el expediente de ${rental.clientName}?`,
      )
    ) {
      this.rentalService.deleteRental(rental.id).subscribe(() => {
        this.rentals.update((list) => list.filter((r) => r.id !== rental.id));
      });
    }
  }

  openSignatureModal(rental: Rental) {
    this.rentalForSignature.set(rental);
    this.signatureEmail = '';
    this.isSignatureModalOpen.set(true);
  }

  closeSignatureModal() {
    this.isSignatureModalOpen.set(false);
    this.rentalForSignature.set(null);
  }

  getSignatureLabel(s?: RentalSignatureStatus): string {
    switch (s) {
      case 'SIGNED':
        return 'Firmado';
      case 'PENDING':
        return 'Pendiente de firma';
      default:
        return 'Sin iniciar';
    }
  }

  markSignaturePending() {
    const r = this.rentalForSignature();
    if (!r) return;
    this.rentalService
      .updateRental(r.id, { signatureStatus: 'PENDING' })
      .subscribe({
        next: (upd) => {
          this.rentals.update((list) =>
            list.map((x) => (x.id === upd.id ? upd : x)),
          );
          this.rentalForSignature.set(upd);
        },
      });
  }

  markSignatureSigned() {
    const r = this.rentalForSignature();
    if (!r) return;
    this.rentalService
      .updateRental(r.id, { signatureStatus: 'SIGNED' })
      .subscribe({
        next: (upd: Rental) => {
          this.rentals.update((list: Rental[]) =>
            list.map((x: Rental) => (x.id === upd.id ? upd : x)),
          );
          this.rentalForSignature.set(upd);
          this.closeSignatureModal();
        },
      });
  }

  getStatusVariant(
    status: string,
  ): 'success' | 'warning' | 'info' | 'danger' | 'secondary' | 'primary' {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'info';
      case 'DRAFT':
        return 'warning';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'DRAFT':
        return 'Borrador';
      case 'ACTIVE':
        return 'Activo';
      case 'COMPLETED':
        return 'Completado';
      default:
        return status;
    }
  }

  formatCurrencyEu(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  activeCount = computed(
    () => this.rentals().filter((r: Rental) => r.status === 'ACTIVE').length,
  );
  draftCount = computed(
    () => this.rentals().filter((r: Rental) => r.status === 'DRAFT').length,
  );
  totalRevenue = computed(() =>
    this.rentals()
      .filter((r: Rental) => r.status === 'ACTIVE' || r.status === 'COMPLETED')
      .reduce((acc: number, r: Rental) => acc + r.totalAmount, 0),
  );

  filteredRentals = computed(() => {
    let list = [...this.rentals()];
    const tab = this.activeTab();
    if (tab !== 'all') list = list.filter((r: Rental) => r.status === tab);

    // Advanced filters
    const statusFilter = this.statusFilter();
    const dateFrom = this.dateFromFilter();
    const dateTo = this.dateToFilter();
    const amountMin = this.amountMinFilter();
    const amountMax = this.amountMaxFilter();

    if (statusFilter !== 'all') {
      list = list.filter((r) => r.status === statusFilter);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      list = list.filter((r) => {
        const startDate = new Date(r.startDate || '');
        return startDate >= fromDate;
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      list = list.filter((r) => {
        const startDate = new Date(r.startDate || '');
        return startDate <= toDate;
      });
    }

    if (amountMin !== null) {
      list = list.filter((r) => (r.totalAmount || 0) >= amountMin);
    }

    if (amountMax !== null) {
      list = list.filter((r) => (r.totalAmount || 0) <= amountMax);
    }

    const t = this.masterFilter.query().trim().toLowerCase();

    // 1. Search filter
    if (t) {
      list = list.filter(
        (r: Rental) =>
          (r.clientName || '').toLowerCase().includes(t) ||
          r.status.toLowerCase().includes(t),
      );
    }

    // 2. Sort
    const field = this.sortField();
    const dir = this.sortDirection();

    return list.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (field === 'clientName') {
        valA = (a.clientName || '').toLowerCase();
        valB = (b.clientName || '').toLowerCase();
      } else if (field === 'totalAmount') {
        valA = a.totalAmount || 0;
        valB = b.totalAmount || 0;
      } else if (field === 'status') {
        valA = a.status;
        valB = b.status;
      }

      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
  });

  paginatedRentals = computed(() => {
    const all = this.filteredRentals();
    const page = this.currentPage();
    const pageSize = 12;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return all.slice(start, end);
  });

  selectedCount = computed(() => this.selectedRentals().size);

  isAllSelected = computed(() => {
    const paginated = this.paginatedRentals();
    return (
      paginated.length > 0 &&
      paginated.every((r) => this.selectedRentals().has(r.id))
    );
  });

  hasSelections = computed(() => this.selectedRentals().size > 0);

  readonly hasAnyRentals = computed(() => this.rentals().length > 0);
  readonly filterProducesNoResults = computed(
    () => this.hasAnyRentals() && this.filteredRentals().length === 0,
  );

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  get statusFilterSignal() {
    return this.statusFilter();
  }

  set statusFilterSignal(val: string) {
    this.statusFilter.set(val);
    this.currentPage.set(1);
  }

  bulkChangeStatusFromSelect(val: string) {
    if (!val) return;
    this.bulkChangeStatus({ target: { value: val } } as any);
  }
  toggleSort() {
    if (this.sortField() === 'clientName') {
      this.sortField.set('totalAmount');
      this.sortDirection.set(-1);
    } else if (this.sortField() === 'totalAmount') {
      this.sortField.set('status');
    } else {
      this.sortField.set('clientName');
      this.sortDirection.set(1);
    }
  }
}
