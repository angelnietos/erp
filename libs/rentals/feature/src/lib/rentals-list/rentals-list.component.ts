import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
    LucideAngularModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="glow-text">Alquileres</h1>
          <p class="subtitle">Control de expedientes de arrendamiento y disponibilidad de equipos</p>
        </div>
        <ui-josanz-button variant="primary" (clicked)="openCreateModal()">
          <lucide-icon name="plus" class="mr-2"></lucide-icon>
          Nuevo Alquiler
        </ui-josanz-button>
      </div>

      <div class="navigation-row">
        <ui-josanz-tabs [tabs]="tabs" [activeTab]="activeTab()" variant="underline" (tabChange)="onTabChange($event)"></ui-josanz-tabs>
      </div>

      <div class="filters-bar">
        <ui-josanz-search 
          variant="filled"
          placeholder="BUSCAR EXPEDIENTE O CLIENTE..." 
          (searchChange)="onSearch($event)"
          class="flex-1"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <ui-josanz-loader message="Consultando registros de alquiler..."></ui-josanz-loader>
      } @else {
        <ui-josanz-card variant="glass" class="table-card">
          <ui-josanz-table [columns]="columns" [data]="rentals()" variant="hover">
            <ng-template #cellTemplate let-rental let-key="key">
              @switch (key) {
                @case ('id') {
                  <a [routerLink]="['/rentals', rental.id]" class="rental-link">
                    #{{ rental.id.slice(0, 8) }}
                  </a>
                }
                @case ('status') {
                  <ui-josanz-badge [variant]="getStatusVariant(rental.status)">
                    {{ getStatusLabel(rental.status) }}
                  </ui-josanz-badge>
                }
                @case ('startDate') {
                  <span class="date-text">{{ formatDate(rental.startDate) }}</span>
                }
                @case ('endDate') {
                  <span class="date-text">{{ formatDate(rental.endDate) }}</span>
                }
                @case ('totalAmount') {
                  <span class="amount-text">{{ rental.totalAmount | currency:'EUR' }}</span>
                }
                @case ('actions') {
                  <div class="actions">
                    <button class="action-trigger" [routerLink]="['/rentals', rental.id]" title="Ver">
                      <lucide-icon name="eye" size="18"></lucide-icon>
                    </button>
                    @if (rental.status === 'DRAFT') {
                      <button class="action-trigger success" title="Activar" (click)="activateRental(rental)">
                        <lucide-icon name="play" size="18"></lucide-icon>
                      </button>
                    }
                    @if (rental.status === 'ACTIVE') {
                      <button class="action-trigger info" title="Completar" (click)="completeRental(rental)">
                        <lucide-icon name="check-circle" size="18"></lucide-icon>
                      </button>
                      <button class="action-trigger danger" title="Cancelar" (click)="cancelRental(rental)">
                        <lucide-icon name="x-circle" size="18"></lucide-icon>
                      </button>
                    }
                    <button class="action-trigger" (click)="editRental(rental)" title="Editar">
                      <lucide-icon name="pencil" size="18"></lucide-icon>
                    </button>
                    <button class="action-trigger danger" (click)="confirmDelete(rental)" title="Eliminar">
                      <lucide-icon name="trash-2" size="18"></lucide-icon>
                    </button>
                  </div>
                }
                @default {
                  {{ rental[key] }}
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
      [title]="editingRental() ? 'EXPEDIENTE ALQUILER: EDITAR' : 'EXPEDIENTE ALQUILER: NUEVO'"
      (closed)="closeModal()"
      variant="dark"
    >
      <div class="form-container">
        <div class="form-grid">
          <div class="form-col full-width">
            <label class="field-label" for="rental-client">Cliente Operatvo *</label>
            <input 
              type="text" 
              id="rental-client"
              class="technical-input"
              [(ngModel)]="formData.clientName" 
              name="clientName" 
              required
              placeholder="DENOMINACIÓN DEL CLIENTE"
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="rental-status">Estado del Expediente</label>
            <select id="rental-status" class="technical-select" [(ngModel)]="formData.status" name="status">
              <option value="DRAFT">BORRADOR</option>
              <option value="ACTIVE">ACTIVO</option>
              <option value="COMPLETED">COMPLETADO</option>
              <option value="CANCELLED">CANCELADO</option>
            </select>
          </div>
          
          <div class="form-col">
            <label class="field-label" for="rental-start">Fecha de Activación</label>
            <input 
              type="date" 
              id="rental-start"
              class="technical-input"
              [(ngModel)]="formData.startDate" 
              name="startDate" 
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="rental-end">Fecha de Finalización</label>
            <input 
              type="date" 
              id="rental-end"
              class="technical-input"
              [(ngModel)]="formData.endDate" 
              name="endDate" 
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="rental-items">Unidades Alquiladas</label>
            <input 
              type="number" 
              id="rental-items"
              class="technical-input"
              [(ngModel)]="formData.itemsCount" 
              name="itemsCount" 
              placeholder="0"
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="rental-amount">Importe Consolidado (€)</label>
            <input 
              type="number" 
              id="rental-amount"
              class="technical-input"
              [(ngModel)]="formData.totalAmount" 
              name="totalAmount" 
              placeholder="0.00"
              step="0.01"
            >
          </div>
        </div>
      </div>
      
      <div modal-footer class="modal-footer">
        <ui-josanz-button variant="ghost" (clicked)="closeModal()">
          ABORTAR
        </ui-josanz-button>
        <ui-josanz-button 
          variant="primary"
          (clicked)="saveRental()"
          [disabled]="!formData.clientName"
        >
          {{ editingRental() ? 'ACTUALIZAR EXPEDIENTE' : 'CREAR EXPEDIENTE' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- Delete Confirmation Modal -->
    <ui-josanz-modal
      [isOpen]="isDeleteModalOpen()"
      title="ADVERTENCIA: ELIMINACIÓN DE EXPEDIENTE"
      (closed)="closeDeleteModal()"
      variant="dark"
    >
      <div class="delete-warning">
        <lucide-icon name="alert-triangle" class="warning-icon"></lucide-icon>
        <div class="warning-content">
          <p>¿Estás seguro de que deseas eliminar el alquiler <strong>#{{ rentalToDelete()?.id?.slice(0, 8) }}</strong>?</p>
          <p class="critical-text">ESTA ACCIÓN ES IRREVERSIBLE Y ELIMINARÁ EL EXPEDIENTE DE LA BASE DE DATOS.</p>
        </div>
      </div>
      
      <div modal-footer>
        <ui-josanz-button variant="ghost" (clicked)="closeDeleteModal()">
          CANCELAR
        </ui-josanz-button>
        <ui-josanz-button variant="danger" (clicked)="deleteRental()">
          ELIMINAR DEFINITIVAMENTE
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>
  `,
  styles: [`
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
    
    .rental-link { 
      color: var(--brand); 
      text-decoration: none; 
      font-weight: 900; 
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-family: var(--font-display);
      transition: all 0.2s;
    }
    .rental-link:hover { color: #fff; text-shadow: 0 0 10px var(--brand-glow); }
    
    .date-text { color: var(--text-muted); font-size: 0.85rem; font-weight: 600; }
    .amount-text { color: #fff; font-weight: 800; font-family: var(--font-display); }

    .actions { display: flex; gap: 10px; }
    
    .action-trigger { 
      background: var(--bg-tertiary); 
      border: 1px solid var(--border-soft); 
      color: var(--text-muted); 
      cursor: pointer; 
      width: 34px;
      height: 34px;
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
    .action-trigger.info:hover { border-color: var(--info); color: var(--info); box-shadow: 0 0 10px rgba(96, 165, 250, 0.4); }
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
    .form-col.full-width { grid-column: 1 / -1; }
    
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
    }

    .mr-2 { margin-right: 8px; }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .glow-text { font-size: 1.8rem; }
    }
  `],

})
export class RentalsListComponent implements OnInit {
  private rentalService = inject(RentalService);

  tabs = [
    { id: 'all', label: 'Todos', badge: 0 },
    { id: 'DRAFT', label: 'Borrador', badge: 0 },
    { id: 'ACTIVE', label: 'Activos', badge: 0 },
    { id: 'COMPLETED', label: 'Completados', badge: 0 },
    { id: 'CANCELLED', label: 'Cancelados', badge: 0 },
  ];

  columns = [
    { key: 'id', header: 'Referencia', width: '120px' },
    { key: 'clientName', header: 'Cliente' },
    { key: 'startDate', header: 'Inicio', width: '120px' },
    { key: 'endDate', header: 'Fin', width: '120px' },
    { key: 'itemsCount', header: 'Items', width: '80px' },
    { key: 'totalAmount', header: 'Importe', width: '120px' },
    { key: 'status', header: 'Estado', width: '120px' },
    { key: 'actions', header: '', width: '140px' },
  ];

  rentals = signal<Rental[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  activeTab = signal('all');
  searchTerm = '';
  
  // Modal state
  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  editingRental = signal<Rental | null>(null);
  rentalToDelete = signal<Rental | null>(null);
  
  // Form data
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
    this.isLoading.set(true);
    
    if (tabId === 'all') {
      this.loadRentals();
    } else {
      this.rentalService.getRentalsByStatus(tabId).subscribe({
        next: (rentals) => {
          this.rentals.set(rentals);
          this.isLoading.set(false);
        }
      });
    }
  }

  onSearch(term: string) {
    this.searchTerm = term;
    if (term.trim()) {
      this.isLoading.set(true);
      this.rentalService.searchRentals(term).subscribe({
        next: (rentals) => {
          this.rentals.set(rentals);
          this.isLoading.set(false);
        }
      });
    } else {
      this.loadRentals();
    }
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
}

