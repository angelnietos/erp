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
  UiSearchComponent,
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
} from '@josanz-erp/shared-ui-kit';
import {
  ThemeService,
  PluginStore,
  MasterFilterService,
  FilterableService,
  AIFormBridgeService,
  ToastService,
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
    UiSearchComponent,
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
  ],
  template: `
    <div class="rentals-container">
      <ui-feature-header
        title="Alquileres"
        subtitle="Gestión operativa y monitoreo de expedientes"
        icon="key"
        actionLabel="NUEVO EXPEDIENTE"
        (actionClicked)="openCreateModal()"
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

      <!-- Search and Filters -->
      <div class="feature-controls">
        <div class="search-container">
          <ui-search
            variant="glass"
            placeholder="Buscar por propiedad, inquilino o cliente..."
            (searchChange)="onSearch($event)"
          ></ui-search>
        </div>
        <div class="actions-group">
          <ui-tabs
            [tabs]="tabs"
            [activeTab]="activeTab()"
            variant="underline"
            (tabChange)="onTabChange($event)"
          ></ui-tabs>
          <ui-button variant="ghost" size="sm" icon="filter">Filtros</ui-button>
          <ui-button
            variant="ghost"
            size="sm"
            [icon]="sortDirection() === 1 ? 'ChevronUp' : 'ChevronDown'"
            (clicked)="toggleSort()"
          >
            ORDENAR:
            {{
              sortField() === 'clientName'
                ? 'CLIENTE'
                : sortField() === 'totalAmount'
                  ? 'TOTAL'
                  : 'ESTADO'
            }}
          </ui-button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="loader-container">
          <ui-loader
            message="SINCRONIZANDO REGISTROS DE OPERACIÓN..."
          ></ui-loader>
        </div>
      } @else {
        <ui-feature-grid>
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
              (editClicked)="editRental(rental)"
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
              <div class="rental-extras">
                <div class="signature-status">
                  @if (rental.signatureStatus === 'SIGNED') {
                    <span class="sig-badge signed">
                      <lucide-icon name="check-circle" size="12"></lucide-icon>
                      FIRMADO
                    </span>
                  } @else {
                    <span class="sig-badge pending">
                      <lucide-icon name="clock" size="12"></lucide-icon> PEN.
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
            <div class="empty-state">
              <lucide-icon
                name="key"
                size="64"
                class="empty-icon"
              ></lucide-icon>
              <h3>No hay expedientes</h3>
              <p>
                Comienza añadiendo tu primer expediente de alquiler para
                gestionar tus propiedades.
              </p>
              <ui-button
                variant="solid"
                (clicked)="openCreateModal()"
                icon="CirclePlus"
              >
                Añadir primer expediente
              </ui-button>
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

    <!-- Create/Edit Modal -->
    <ui-modal
      [isOpen]="isModalOpen()"
      [title]="editingRental() ? 'Editar expediente' : 'Nuevo expediente'"
      (closed)="closeModal()"
      variant="glass"
    >
      <div class="modal-form">
        <!-- Form Errors -->
        @if (formErrors().length > 0) {
          <div class="form-errors">
            @for (error of formErrors(); track $index) {
              <div class="error-message">
                <lucide-icon name="AlertCircle" size="16"></lucide-icon>
                <span>{{ error }}</span>
              </div>
            }
          </div>
        }

        <div class="form-section">
          <h4 class="section-title">Información General</h4>
          <div class="form-grid">
            <ui-input
              label="Cliente *"
              [(ngModel)]="formData.clientName"
              icon="building"
              placeholder="Nombre del cliente"
              required
            ></ui-input>
            <ui-input
              label="ID Cliente"
              [(ngModel)]="formData.clientId"
              icon="hash"
              placeholder="ID del cliente"
            ></ui-input>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-title">Condiciones del Alquiler</h4>
          <div class="form-grid">
            <ui-input
              label="Fecha inicio"
              [(ngModel)]="formData.startDate"
              icon="calendar"
              type="date"
            ></ui-input>
            <ui-input
              label="Fecha fin"
              [(ngModel)]="formData.endDate"
              icon="calendar"
              type="date"
            ></ui-input>
            <ui-input
              label="Número de items"
              [(ngModel)]="formData.itemsCount"
              icon="package"
              type="number"
              placeholder="0"
            ></ui-input>
            <ui-input
              label="Importe total (€)"
              [(ngModel)]="formData.totalAmount"
              icon="euro"
              type="number"
              placeholder="0.00"
            ></ui-input>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <ui-button variant="ghost" (clicked)="closeModal()">Cancelar</ui-button>
        <ui-button
          variant="solid"
          (clicked)="saveRental()"
          [loading]="isSaving()"
          icon="save"
        >
          {{ editingRental() ? 'Guardar cambios' : 'Crear expediente' }}
        </ui-button>
      </div>
    </ui-modal>

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
  `,
  styles: [
    `
      .rentals-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
        min-height: 100vh;
      }

      .feature-controls {
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

      .search-container {
        flex: 1;
      }

      .actions-group {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .loader-container {
        display: flex;
        justify-content: center;
        padding: 4rem;
      }

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

      .empty-state {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 4rem;
        text-align: center;
        background: var(--surface);
        border-radius: 16px;
        border: 2px dashed var(--border-soft);
      }

      .empty-icon {
        color: var(--text-muted);
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      .pagination-footer {
        margin-top: 3rem;
        display: flex;
        justify-content: center;
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
        .feature-controls {
          flex-direction: column;
          align-items: stretch;
        }
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

  // Signals for UI state
  isModalOpen = signal(false);
  editingRental = signal<Rental | null>(null);
  isSaving = signal(false);
  formErrors = signal<string[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  sortField = signal<'clientName' | 'totalAmount' | 'status'>('clientName');
  sortDirection = signal<1 | -1>(1);

  // Additional signals
  rentals = signal<Rental[]>([]);
  isLoading = signal(true);
  activeTab = signal('all');
  searchFilter = signal('');
  isSignatureModalOpen = signal(false);
  rentalForSignature = signal<Rental | null>(null);
  signatureEmail = '';

  formData: Partial<Rental> = {
    clientId: '',
    clientName: '',
    startDate: '',
    endDate: '',
    itemsCount: 0,
    totalAmount: 0,
    status: 'DRAFT',
  };

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

  ngOnInit() {
    this.aiFormBridge.registerDataProxy(
      this.formData as Record<string, unknown>,
    );
    this.masterFilter.registerProvider(this);
    this.loadRentals();
    if (this.route.snapshot.queryParamMap.get('openCreate')) {
      queueMicrotask(() => this.openCreateModal());
    }
  }

  ngOnDestroy() {
    this.aiFormBridge.unregisterDataProxy(
      this.formData as Record<string, unknown>,
    );
    this.masterFilter.unregisterProvider();
  }

  loadRentals() {
    this.isLoading.set(true);
    this.rentalService.getRentals().subscribe({
      next: (list) => {
        this.rentals.set(list);
        this.updateTabs(list);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
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

  openCreateModal() {
    this.editingRental.set(null);
    this.formData = {
      clientName: '',
      status: 'DRAFT',
      startDate: new Date().toISOString().split('T')[0],
      itemsCount: 0,
      totalAmount: 0,
    };
    this.isModalOpen.set(true);
  }

  onRowClick(rental: Rental) {
    this.router.navigate(['/rentals', rental.id]);
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

  closeModal() {
    this.isModalOpen.set(false);
    this.editingRental.set(null);
  }

  saveRental() {
    const errors: string[] = [];

    if (!this.formData.clientName?.trim()) {
      errors.push('El cliente es obligatorio');
    }

    if (this.formData.startDate && this.formData.endDate) {
      const startDate = new Date(this.formData.startDate);
      const endDate = new Date(this.formData.endDate);
      if (endDate <= startDate) {
        errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    if (this.formData.totalAmount && this.formData.totalAmount < 0) {
      errors.push('El importe total no puede ser negativo');
    }

    if (errors.length > 0) {
      this.formErrors.set(errors);
      return;
    }

    this.formErrors.set([]);
    this.isSaving.set(true);

    const toEdit = this.editingRental();
    if (toEdit) {
      this.rentalService.updateRental(toEdit.id, this.formData).subscribe({
        next: (upd) => {
          this.rentals.update((list) =>
            list.map((r) => (r.id === upd.id ? upd : r)),
          );
          this.isSaving.set(false);
          this.toast.show('Expediente actualizado correctamente', 'success');
          this.closeModal();
        },
        error: () => {
          this.isSaving.set(false);
          this.toast.show('Error al actualizar el expediente', 'error');
        },
      });
    } else {
      this.rentalService
        .createRental(this.formData as Omit<Rental, 'id' | 'createdAt'>)
        .subscribe({
          next: (newR) => {
            this.rentals.update((list) => [...list, newR]);
            this.isSaving.set(false);
            this.toast.show('Expediente creado correctamente', 'success');
            this.closeModal();
          },
          error: () => {
            this.isSaving.set(false);
            this.toast.show('Error al crear el expediente', 'error');
          },
        });
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
      let valA: any = '';
      let valB: any = '';

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

    this.totalPages.set(Math.ceil(all.length / pageSize));

    return all.slice(start, end);
  });

  onPageChange(page: number) {
    this.currentPage.set(page);
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

  editRental(rental: Rental) {
    this.editingRental.set(rental);
    this.formData = { ...rental };
    this.formErrors.set([]);
    this.isModalOpen.set(true);
  }
}
