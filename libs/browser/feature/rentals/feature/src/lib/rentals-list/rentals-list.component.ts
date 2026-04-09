import { Component, OnInit, OnDestroy, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
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
import { ThemeService, PluginStore, MasterFilterService, FilterableService } from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';
import { Rental, RentalService, RentalSignatureStatus } from '@josanz-erp/rentals-data-access';

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
    LucideAngularModule
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
          [accent]="true">
        </ui-stat-card>
        <ui-stat-card 
          label="Pendientes Inicio" 
          [value]="draftCount().toString()" 
          icon="clock" 
          [trend]="1">
        </ui-stat-card>
        <ui-stat-card 
          label="Facturación Ciclo" 
          [value]="formatCurrencyEu(totalRevenue())" 
          icon="trending-up">
        </ui-stat-card>
        <ui-stat-card 
          label="Eficiencia" 
          value="92%" 
          icon="check-circle"
          [accent]="false">
        </ui-stat-card>
      </ui-feature-stats>

      <div class="feature-controls">
        <ui-tabs 
          [tabs]="tabs" 
          [activeTab]="activeTab()" 
          variant="underline" 
          (tabChange)="onTabChange($event)"
          class="flex-1"
        ></ui-tabs>
        
        <div class="search-container">
          <ui-search 
            variant="glass"
            placeholder="BUSCAR EXPEDIENTE O CLIENTE..." 
            (searchChange)="onSearch($event)"
          ></ui-search>
        </div>
      </div>

      @if (isLoading()) {
        <div class="loader-container">
          <ui-loader message="SINCRONIZANDO REGISTROS DE OPERACIÓN..."></ui-loader>
        </div>
      } @else {
        <ui-feature-grid>
          @for (rental of displayedRentals(); track rental.id) {
            <ui-feature-card
              [name]="rental.clientName"
              [subtitle]="'REF: ' + (rental.id.slice(0, 8) | uppercase)"
              [avatarInitials]="getInitials(rental.clientName)"
              [avatarBackground]="getStatusGradient(rental.status)"
              [status]="rental.status === 'ACTIVE' ? 'active' : 'offline'"
              [badgeLabel]="getStatusLabel(rental.status) | uppercase"
              [badgeVariant]="getStatusVariant(rental.status)"
              (cardClicked)="onRowClick(rental)"
              (editClicked)="editRental(rental)"
              [footerItems]="[
                { icon: 'calendar', label: ((rental.startDate || '') | date:'dd/MM/yy') || '-' },
                { icon: 'package', label: rental.itemsCount + ' unid.' },
                { icon: 'euro', label: ((rental.totalAmount || 0) | currency:'EUR') || '-' }
              ]"
            >
              <div class="rental-extras">
                 <div class="signature-status">
                    @if (rental.signatureStatus === 'SIGNED') {
                       <span class="sig-badge signed">
                         <lucide-icon name="check-circle" size="12"></lucide-icon> FIRMADO
                       </span>
                    } @else {
                       <span class="sig-badge pending">
                         <lucide-icon name="clock" size="12"></lucide-icon> PEN. FIRMA
                       </span>
                    }
                 </div>
              </div>

              <div footer-extra class="card-actions">
                 <ui-button variant="ghost" size="sm" icon="pen-tool" (click)="$event.stopPropagation(); openSignatureModal(rental)"></ui-button>
                 @if (rental.status === 'DRAFT') {
                    <ui-button variant="ghost" size="sm" icon="play" (click)="$event.stopPropagation(); activateRental(rental)" class="text-success"></ui-button>
                 }
              </div>
            </ui-feature-card>
          } @empty {
            <div class="empty-state">
              <lucide-icon name="key" size="64" class="empty-icon"></lucide-icon>
              <h3>No hay expedientes</h3>
              <p>Comienza creando un nuevo registro de alquiler para tus clientes.</p>
              <ui-button variant="solid" (clicked)="openCreateModal()" icon="CirclePlus">Nuevo expediente</ui-button>
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
      [title]="editingRental() ? 'EDITAR EXPEDIENTE' : 'NUEVO EXPEDIENTE'"
      variant="glass"
      (closed)="closeModal()"
    >
      <div class="form-grid">
         <ui-input label="CLIENTE / PRODUCCIÓN" [(ngModel)]="formData.clientName" placeholder="Ej: Producciones S.L." icon="user"></ui-input>
         <div class="row">
            <ui-input label="INICIO" type="date" [(ngModel)]="formData.startDate" icon="calendar"></ui-input>
            <ui-input label="RETORNO" type="date" [(ngModel)]="formData.endDate" icon="calendar"></ui-input>
         </div>
         <div class="row">
            <ui-input label="UNIDADES" type="number" [(ngModel)]="formData.itemsCount" icon="package"></ui-input>
            <ui-input label="IMPORTE (€)" type="number" [(ngModel)]="formData.totalAmount" icon="euro"></ui-input>
         </div>
      </div>
      <div class="modal-actions">
        <ui-button variant="ghost" (clicked)="closeModal()">CANCELAR</ui-button>
        <ui-button variant="solid" (clicked)="saveRental()" [disabled]="!formData.clientName" icon="save">GUARDAR</ui-button>
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
          <p>Estado de firma: <strong>{{ getSignatureLabel(rs.signatureStatus) | uppercase }}</strong></p>
          <ui-input label="Email del firmante" [(ngModel)]="signatureEmail" placeholder="email@cliente.com" icon="mail"></ui-input>
        </div>
      }
      <div class="modal-actions">
        <ui-button variant="ghost" (clicked)="closeSignatureModal()">CERRAR</ui-button>
        <ui-button variant="glass" (clicked)="markSignaturePending()">SOLICITAR FIRMA</ui-button>
        <ui-button variant="solid" (clicked)="markSignatureSigned()" icon="check">FIRMADO</ui-button>
      </div>
    </ui-modal>
  `,
  styles: [`
    .rentals-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .flex-1 { flex: 1; }

    .loader-container { display: flex; justify-content: center; padding: 5rem; }

    .rental-extras { margin-top: 1rem; }
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
    .sig-badge.signed { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .sig-badge.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

    .card-actions { display: flex; gap: 0.25rem; }
    .text-success { color: var(--success) !important; }

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

    /* Modal Form Styles */
    .form-grid { display: flex; flex-direction: column; gap: 1.25rem; padding: 1rem 0; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 2rem; }
    .sig-panel { padding: 1rem 0; }
    .sig-panel h3 { font-size: 1.1rem; margin-bottom: 0.5rem; }
    .sig-panel p { color: var(--text-muted); margin-bottom: 1.5rem; }

    @media (max-width: 900px) {
       .navigation-bar { flex-direction: column; align-items: stretch; gap: 1rem; }
       .search-bar { width: 100%; }
       .row { grid-template-columns: 1fr; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalsListComponent implements OnInit, OnDestroy, FilterableService<Rental> {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly rentalService = inject(RentalService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly masterFilter = inject(MasterFilterService);

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

  rentals = signal<Rental[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  activeTab = signal('all');
  searchFilter = signal('');
  
  isModalOpen = signal(false);
  isSignatureModalOpen = signal(false);
  rentalForSignature = signal<Rental | null>(null);
  signatureEmail = '';
  editingRental = signal<Rental | null>(null);
  
  formData: Partial<Rental> = {
    clientName: '', status: 'DRAFT', startDate: '', endDate: '', itemsCount: 0, totalAmount: 0
  };

  ngOnInit() {
    this.masterFilter.registerProvider(this);
    this.loadRentals();
    if (this.route.snapshot.queryParamMap.get('openCreate')) {
      queueMicrotask(() => this.openCreateModal());
    }
  }

  ngOnDestroy() {
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
      error: () => this.isLoading.set(false)
    });
  }

  updateTabs(list: Rental[]) {
    const counts: Record<string, number> = {
      all: list.length,
      DRAFT: list.filter((r: Rental) => r.status === 'DRAFT').length,
      ACTIVE: list.filter((r: Rental) => r.status === 'ACTIVE').length,
      COMPLETED: list.filter((r: Rental) => r.status === 'COMPLETED').length,
    };
    this.tabs = this.tabs.map(t => ({ ...t, badge: counts[t.id] || 0 }));
  }

  onTabChange(id: string) { this.activeTab.set(id); }
  onSearch(term: string) { 
    this.searchFilter.set(term); 
    this.masterFilter.search(term);
  }

  filter(query: string): Observable<Rental[]> {
    const term = query.toLowerCase();
    const result = this.rentals().filter((r: Rental) => 
      r.id.toLowerCase().includes(term) || 
      (r.clientName ?? '').toLowerCase().includes(term)
    );
    return of(result);
  }
  onPageChange(p: number) { this.currentPage.set(p); this.loadRentals(); }

  openCreateModal() {
    this.editingRental.set(null);
    this.formData = { clientName: '', status: 'DRAFT', startDate: new Date().toISOString().split('T')[0], itemsCount: 0, totalAmount: 0 };
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
      case 'ACTIVE': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'DRAFT': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'COMPLETED': return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'CANCELLED': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default: return 'linear-gradient(135deg, #6b7280, #374151)';
    }
  }

  editRental(rental: Rental) {
    this.editingRental.set(rental);
    this.formData = { ...rental };
    this.isModalOpen.set(true);
  }

  closeModal() { this.isModalOpen.set(false); this.editingRental.set(null); }

  saveRental() {
    if (!this.formData.clientName) return;
    const toEdit = this.editingRental();
    if (toEdit) {
      this.rentalService.updateRental(toEdit.id, this.formData).subscribe({
        next: (upd) => {
          this.rentals.update(list => list.map(r => r.id === upd.id ? upd : r));
          this.closeModal();
        }
      });
    } else {
      this.rentalService.createRental(this.formData as Omit<Rental, 'id' | 'createdAt'>).subscribe({
        next: (newR) => {
          this.rentals.update(list => [...list, newR]);
          this.closeModal();
        }
      });
    }
  }

  activateRental(rental: Rental) {
    this.rentalService.activateRental(rental.id).subscribe({
      next: (upd) => this.rentals.update(list => list.map(r => r.id === upd.id ? upd : r))
    });
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
      case 'SIGNED': return 'Firmado';
      case 'PENDING': return 'Pendiente de firma';
      default: return 'Sin iniciar';
    }
  }

  markSignaturePending() {
    const r = this.rentalForSignature();
    if (!r) return;
    this.rentalService.updateRental(r.id, { signatureStatus: 'PENDING' }).subscribe({
      next: (upd) => {
        this.rentals.update((list) => list.map((x) => (x.id === upd.id ? upd : x)));
        this.rentalForSignature.set(upd);
      },
    });
  }

  markSignatureSigned() {
    const r = this.rentalForSignature();
    if (!r) return;
    this.rentalService.updateRental(r.id, { signatureStatus: 'SIGNED' }).subscribe({
      next: (upd: Rental) => {
        this.rentals.update((list: Rental[]) => list.map((x: Rental) => (x.id === upd.id ? upd : x)));
        this.rentalForSignature.set(upd);
        this.closeSignatureModal();
      },
    });
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'danger' | 'secondary' | 'primary' {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'info';
      case 'DRAFT': return 'warning';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'DRAFT': return 'Borrador';
      case 'ACTIVE': return 'Activo';
      case 'COMPLETED': return 'Completado';
      default: return status;
    }
  }

  formatCurrencyEu(amount: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  }

  activeCount = computed(() => this.rentals().filter((r: Rental) => r.status === 'ACTIVE').length);
  draftCount = computed(() => this.rentals().filter((r: Rental) => r.status === 'DRAFT').length);
  totalRevenue = computed(() => this.rentals().filter((r: Rental) => r.status === 'ACTIVE' || r.status === 'COMPLETED').reduce((acc: number, r: Rental) => acc + r.totalAmount, 0));

  displayedRentals = computed(() => {
    let list = this.rentals();
    const tab = this.activeTab();
    if (tab !== 'all') list = list.filter((r: Rental) => r.status === tab);
    const s = this.searchFilter().trim().toLowerCase();
    if (s) list = list.filter((r: Rental) => (r.clientName || '').toLowerCase().includes(s) || r.id.toLowerCase().includes(s));
    return list;
  });
}
