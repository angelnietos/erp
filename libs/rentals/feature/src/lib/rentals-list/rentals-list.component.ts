import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
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
import { Rental, RentalService } from '@josanz-erp/rentals-data-access';

@Component({
  selector: 'lib-rentals-list',
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
    LucideAngularModule
  ],
  template: `
    <div class="page-container animate-slide-up">
      <header class="page-header">
        <div class="header-breadcrumb">
          <h1 class="page-title text-uppercase">Arrendamientos y Alquileres</h1>
          <div class="breadcrumb">
            <span class="active">GESTIÓN OPERATIVA</span>
            <span class="separator">/</span>
            <span>FLUJO DE EXPEDIENTES</span>
          </div>
        </div>
        <div class="header-actions">
          <ui-josanz-button variant="primary" size="md" (clicked)="openCreateModal()" icon="plus">
            NUEVO EXPEDIENTE
          </ui-josanz-button>
        </div>
      </header>

      <div class="stats-row animate-slide-up">
        <ui-josanz-stat-card label="Expedientes Activos" [value]="activeCount().toString()" icon="play-circle" [accent]="true"></ui-josanz-stat-card>
        <ui-josanz-stat-card label="Pendientes Inicio" [value]="draftCount().toString()" icon="clock" [trend]="1"></ui-josanz-stat-card>
        <ui-josanz-stat-card label="Facturación Ciclo" [value]="formatCurrencyEu(totalRevenue())" icon="trending-up"></ui-josanz-stat-card>
      </div>

      <div class="navigation-bar">
        <ui-josanz-tabs 
          [tabs]="tabs" 
          [activeTab]="activeTab()" 
          variant="underline" 
          (tabChange)="onTabChange($event)"
        ></ui-josanz-tabs>
        
        <ui-josanz-search 
          variant="filled"
          placeholder="Buscar expediente o cliente…" 
          (searchChange)="onSearch($event)"
          class="search-bar"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <div class="loader-container">
          <ui-josanz-loader message="SINCRONIZANDO REGISTROS DE ALQUILER..."></ui-josanz-loader>
        </div>
      } @else {
        <ui-josanz-card variant="glass" class="table-card ui-neon">
          <ui-josanz-table [columns]="columns" [data]="displayedRentals()" variant="default">
            <ng-template #cellTemplate let-rental let-key="key">
              @switch (key) {
                @case ('id') {
                  <a [routerLink]="['/rentals', rental.id]" class="rental-link">
                    #{{ rental.id.slice(0, 8) | uppercase }}
                  </a>
                }
                @case ('status') {
                  <ui-josanz-badge [variant]="getStatusVariant(rental.status)">
                    {{ getStatusLabel(rental.status) | uppercase }}
                  </ui-josanz-badge>
                }
                @case ('startDate') {
                  <span class="text-secondary font-mono">{{ formatDate(rental.startDate) }}</span>
                }
                @case ('endDate') {
                  <span class="text-secondary font-mono">{{ formatDate(rental.endDate) }}</span>
                }
                @case ('totalAmount') {
                  <span class="currency-value">{{ rental.totalAmount | currency:'EUR' }}</span>
                }
                @case ('actions') {
                  <div class="row-actions">
                    <ui-josanz-button variant="ghost" size="sm" icon="eye" [routerLink]="['/rentals', rental.id]" title="Detalles"></ui-josanz-button>
                    @if (rental.status === 'DRAFT') {
                      <ui-josanz-button variant="ghost" size="sm" icon="play" (clicked)="activateRental(rental)" title="Activar" class="btn-success-ghost"></ui-josanz-button>
                    }
                    <ui-josanz-button variant="ghost" size="sm" icon="pencil" (clicked)="editRental(rental)" title="Editar"></ui-josanz-button>
                    <ui-josanz-button variant="ghost" size="sm" icon="trash-2" (clicked)="confirmDelete(rental)" title="Eliminar" class="btn-danger-ghost"></ui-josanz-button>
                  </div>
                }
                @default {
                  {{ rental[key] }}
                }
              }
            </ng-template>
          </ui-josanz-table>

          <footer class="table-footer">
            <div class="table-info text-uppercase">
              {{ displayedRentals().length }} EXPEDIENTES EN LISTADO ACTUAL
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
      [title]="editingRental() ? 'MODIFICACIÓN DE EXPEDIENTE' : 'APERTURA DE NUEVO ARRENDAMIENTO'"
      (closed)="closeModal()"
      variant="dark"
    >
      <div class="form-grid">
        <div class="form-section">
          <h3 class="section-title text-uppercase">Información del Cliente</h3>
          <ui-josanz-input 
            label="Denominación del Cliente" 
            [(ngModel)]="formData.clientName" 
            placeholder="NOMBRE FISCAL O COMERCIAL..."
            icon="user"
            id="rental-client"
          ></ui-josanz-input>
        </div>

        <div class="form-section">
          <h3 class="section-title text-uppercase">Tiempos y Logística</h3>
          <div class="input-row">
            <ui-josanz-input 
              label="Fecha Inicio" 
              type="date" 
              [(ngModel)]="formData.startDate" 
              icon="calendar"
              id="rental-start"
            ></ui-josanz-input>
            
            <ui-josanz-input 
              label="Fecha Finalización" 
              type="date" 
              [(ngModel)]="formData.endDate" 
              icon="calendar-check"
              id="rental-end"
            ></ui-josanz-input>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title text-uppercase">Valores Consolidados</h3>
          <div class="input-row">
            <ui-josanz-input 
              label="Unidades Arrendadas" 
              type="number" 
              [(ngModel)]="formData.itemsCount" 
              icon="box"
              id="rental-items"
            ></ui-josanz-input>
            
            <ui-josanz-input 
              label="Importe Total Bruto" 
              type="number" 
              [(ngModel)]="formData.totalAmount" 
              placeholder="0.00"
              icon="euro"
              id="rental-amount"
            ></ui-josanz-input>
          </div>
        </div>
      </div>
      
      <div modal-footer class="modal-actions">
        <ui-josanz-button variant="ghost" (clicked)="closeModal()">CANCELAR</ui-josanz-button>
        <ui-josanz-button 
          variant="glass"
          (clicked)="saveRental()"
          [disabled]="!formData.clientName"
        >
          <lucide-icon name="save" size="18" class="mr-2"></lucide-icon>
          {{ editingRental() ? 'ACTUALIZAR EXPEDIENTE' : 'EMITIR CONTRATO' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- Delete Confirmation Modal -->
    <ui-josanz-modal
      [isOpen]="isDeleteModalOpen()"
      title="SISTEMA: ADVERTENCIA DE ELIMINACIÓN"
      (closed)="closeDeleteModal()"
      variant="dark"
    >
      <div class="delete-warning">
        <lucide-icon name="alert-triangle" size="40" class="warning-icon"></lucide-icon>
        <div class="warning-content">
          <p class="text-uppercase">¿ESTÁ SEGURO DE QUE DESEA ELIMINAR EL EXPEDIENTE <strong>#{{ rentalToDelete()?.id?.slice(0, 8) | uppercase }}</strong>?</p>
          <p class="critical-text text-uppercase">ESTA ACCIÓN ES IRREVERSIBLE. SE ELIMINARÁ TODA LA TRAZABILIDAD DEL ALQUILER.</p>
        </div>
      </div>
      
      <div modal-footer class="modal-actions">
        <ui-josanz-button variant="ghost" (clicked)="closeDeleteModal()">ABORTAR</ui-josanz-button>
        <ui-josanz-button variant="danger" (clicked)="deleteRental()">CONFIRMAR BAJA</ui-josanz-button>
      </div>
    </ui-josanz-modal>
  `,
  styles: [`
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
      
      .rental-link { 
        color: var(--brand); 
        text-decoration: none; 
        font-weight: 800; 
        font-family: var(--font-mono);
        font-size: 0.75rem;
        letter-spacing: 0.05em;
        transition: var(--transition-fast);
      }
      .rental-link:hover { color: #fff; text-decoration: underline; }
      
      .currency-value { color: #fff; font-weight: 700; font-family: var(--font-main); font-size: 0.76rem; }

      .row-actions { display: flex; gap: 4px; }
      
      .btn-success-ghost :host ::ng-deep .btn { color: var(--success) !important; }
      .btn-success-ghost :host ::ng-deep .btn:hover { background: var(--success) !important; color: white !important; }

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

    /* Form Styles */
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
    .input-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    
    .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; }

    .delete-warning {
      display: flex;
      gap: 20px;
      align-items: center;
      padding: 1.5rem;
      background: rgba(239, 68, 68, 0.05);
      border-radius: var(--radius-md);
    }
    .warning-icon { color: var(--danger); }
    .critical-text { color: var(--danger); font-weight: 800; font-size: 0.7rem; margin-top: 8px; opacity: 0.8; }

    .mr-2 { margin-right: 8px; }

    @media (max-width: 1024px) {
      .navigation-bar { flex-direction: column; align-items: stretch; }
      .search-bar { max-width: none; }
      .input-row { grid-template-columns: 1fr; }
    }
  `],
})
export class RentalsListComponent implements OnInit {
  private rentalService = inject(RentalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  tabs = [
    { id: 'all', label: 'Todos', badge: 0 },
    { id: 'DRAFT', label: 'Borrador', badge: 0 },
    { id: 'ACTIVE', label: 'Activos', badge: 0 },
    { id: 'COMPLETED', label: 'Completados', badge: 0 },
    { id: 'CANCELLED', label: 'Cancelados', badge: 0 },
  ];

  columns = [
    { key: 'id', header: 'REFERENCIA', width: '120px' },
    { key: 'clientName', header: 'CLIENTE' },
    { key: 'startDate', header: 'INICIO', width: '120px' },
    { key: 'endDate', header: 'FIN', width: '120px' },
    { key: 'itemsCount', header: 'UNIDADES', width: '80px' },
    { key: 'totalAmount', header: 'IMPORTE', width: '120px' },
    { key: 'status', header: 'ESTADO', width: '150px' },
    { key: 'actions', header: '', width: '160px' },
  ];

  rentals = signal<Rental[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  activeTab = signal('all');
  searchFilter = signal('');
  
  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  editingRental = signal<Rental | null>(null);
  rentalToDelete = signal<Rental | null>(null);
  
  formData: Partial<Rental> = {
    clientId: '',
    clientName: '',
    status: 'DRAFT',
    startDate: '',
    endDate: '',
    itemsCount: 0,
    totalAmount: 0
  };

  ngOnInit() {
    this.loadRentals();
    const openCreate = this.route.snapshot.queryParamMap.get('openCreate');
    if (openCreate === '1' || openCreate === 'true') {
      queueMicrotask(() => this.openCreateModal());
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { openCreate: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  loadRentals() {
    this.isLoading.set(true);
    this.rentalService.getRentals().subscribe({
      next: (rentals) => {
        this.rentals.set(rentals);
        this.updateTabs(rentals);
        this.isLoading.set(false);
        this.totalPages.set(1);
      },
      error: (err) => {
        console.error('Error loading rentals:', err);
        this.isLoading.set(false);
      }
    });
  }

  updateTabs(rentals: Rental[]) {
    const all = rentals.length;
    const draft = rentals.filter(r => r.status === 'DRAFT').length;
    const active = rentals.filter(r => r.status === 'ACTIVE').length;
    const completed = rentals.filter(r => r.status === 'COMPLETED').length;
    const cancelled = rentals.filter(r => r.status === 'CANCELLED').length;

    this.tabs = [
      { id: 'all', label: 'Todos', badge: all },
      { id: 'DRAFT', label: 'Borrador', badge: draft },
      { id: 'ACTIVE', label: 'Activos', badge: active },
      { id: 'COMPLETED', label: 'Completados', badge: completed },
      { id: 'CANCELLED', label: 'Cancelados', badge: cancelled },
    ];
  }

  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
  }

  onSearch(term: string) {
    this.searchFilter.set(term);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadRentals();
  }

  openCreateModal() {
    this.editingRental.set(null);
    this.formData = {
      clientId: '',
      clientName: '',
      status: 'DRAFT',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      itemsCount: 0,
      totalAmount: 0
    };
    this.isModalOpen.set(true);
  }

  editRental(rental: Rental) {
    this.editingRental.set(rental);
    this.formData = { ...rental };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingRental.set(null);
  }

  saveRental() {
    if (!this.formData.clientName) return;

    const rentalToEdit = this.editingRental();
    if (rentalToEdit) {
      this.rentalService.updateRental(rentalToEdit.id, this.formData).subscribe({
        next: (updated) => {
          this.rentals.update(rentals => 
            rentals.map(r => r.id === updated.id ? updated : r)
          );
          this.closeModal();
        },
        error: (err) => console.error('Error updating rental:', err)
      });
    } else {
      this.rentalService.createRental(this.formData as Omit<Rental, 'id' | 'createdAt'>).subscribe({
        next: (newRental) => {
          this.rentals.update(rentals => [...rentals, newRental]);
          this.closeModal();
        },
        error: (err) => console.error('Error creating rental:', err)
      });
    }
  }

  confirmDelete(rental: Rental) {
    this.rentalToDelete.set(rental);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.rentalToDelete.set(null);
  }

  deleteRental() {
    const rental = this.rentalToDelete();
    if (!rental) return;

    this.rentalService.deleteRental(rental.id).subscribe({
      next: (success) => {
        if (success) {
          this.rentals.update(rentals => rentals.filter(r => r.id !== rental.id));
        }
        this.closeDeleteModal();
      },
      error: (err) => console.error('Error deleting rental:', err)
    });
  }

  activateRental(rental: Rental) {
    this.rentalService.activateRental(rental.id).subscribe({
      next: (updated) => {
        this.rentals.update(rentals => 
          rentals.map(r => r.id === updated.id ? updated : r)
        );
      },
      error: (err) => console.error('Error activating rental:', err)
    });
  }

  completeRental(rental: Rental) {
    this.rentalService.completeRental(rental.id).subscribe({
      next: (updated) => {
        this.rentals.update(rentals => 
          rentals.map(r => r.id === updated.id ? updated : r)
        );
      },
      error: (err) => console.error('Error completing rental:', err)
    });
  }

  cancelRental(rental: Rental) {
    this.rentalService.cancelRental(rental.id).subscribe({
      next: (updated) => {
        this.rentals.update(rentals => 
          rentals.map(r => r.id === updated.id ? updated : r)
        );
      },
      error: (err) => console.error('Error cancelling rental:', err)
    });
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'error' | 'default' {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'info';
      case 'DRAFT': return 'warning';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'DRAFT': return 'Borrador';
      case 'ACTIVE': return 'Activo';
      case 'COMPLETED': return 'Completado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }

  formatCurrencyEu(amount: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  }

  activeCount = computed(() => this.rentals().filter(r => r.status === 'ACTIVE').length);
  draftCount = computed(() => this.rentals().filter(r => r.status === 'DRAFT').length);
  totalRevenue = computed(() => {
    return this.rentals()
      .filter(r => r.status === 'ACTIVE' || r.status === 'COMPLETED')
      .reduce((acc, r) => acc + r.totalAmount, 0);
  });

  displayedRentals = computed(() => {
    let list = this.rentals();
    const tab = this.activeTab();
    if (tab !== 'all') {
      list = list.filter((r) => r.status === tab);
    }
    const s = this.searchFilter().trim().toLowerCase();
    if (s) {
      list = list.filter(
        (r) =>
          (r.clientName || '').toLowerCase().includes(s) ||
          r.id.toLowerCase().includes(s)
      );
    }
    return list;
  });
}
