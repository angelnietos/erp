import { Component, OnInit, signal, inject } from '@angular/core';
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
  TabItem,
} from '@josanz-erp/shared-ui-kit';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Alquileres</h1>
          <p class="subtitle">Gestiona los alquileres de equipos</p>
        </div>
        <ui-josanz-button icon="plus" (clicked)="openCreateModal()">
          Nuevo Alquiler
        </ui-josanz-button>
      </div>

      <ui-josanz-tabs [tabs]="tabs" [activeTab]="activeTab()" (tabChange)="onTabChange($event)"></ui-josanz-tabs>

      <div class="filters-bar">
        <ui-josanz-search 
          placeholder="Buscar alquileres..." 
          (searchChange)="onSearch($event)"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <ui-josanz-loader message="Cargando alquileres..."></ui-josanz-loader>
      } @else {
        <ui-josanz-table [columns]="columns" [data]="rentals()">
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
                {{ formatDate(rental.startDate) }}
              }
              @case ('endDate') {
                {{ formatDate(rental.endDate) }}
              }
              @case ('totalAmount') {
                {{ rental.totalAmount | currency:'EUR' }}
              }
              @case ('actions') {
                <div class="actions">
                  <button class="action-btn" [routerLink]="['/rentals', rental.id]" title="Ver">
                    <lucide-icon name="eye"></lucide-icon>
                  </button>
                  @if (rental.status === 'DRAFT') {
                    <button class="action-btn success" title="Activar" (click)="activateRental(rental)">
                      <lucide-icon name="play"></lucide-icon>
                    </button>
                  }
                  @if (rental.status === 'ACTIVE') {
                    <button class="action-btn" title="Completar" (click)="completeRental(rental)">
                      <lucide-icon name="check-circle"></lucide-icon>
                    </button>
                    <button class="action-btn danger" title="Cancelar" (click)="cancelRental(rental)">
                      <lucide-icon name="x-circle"></lucide-icon>
                    </button>
                  }
                  <button class="action-btn" (click)="editRental(rental)" title="Editar">
                    <lucide-icon name="pencil"></lucide-icon>
                  </button>
                  <button class="action-btn danger" (click)="confirmDelete(rental)" title="Eliminar">
                    <lucide-icon name="trash-2"></lucide-icon>
                  </button>
                </div>
              }
              @default {
                {{ rental[key] }}
              }
            }
          </ng-template>
        </ui-josanz-table>

        <ui-josanz-pagination 
          [currentPage]="currentPage()" 
          [totalPages]="totalPages()"
          (pageChange)="onPageChange($event)"
        ></ui-josanz-pagination>
      }
    </div>

    <!-- Create/Edit Modal -->
    <ui-josanz-modal 
      [isOpen]="isModalOpen()" 
      [title]="editingRental() ? 'Editar Alquiler' : 'Nuevo Alquiler'"
      (closed)="closeModal()"
    >
      <form>
        <div class="form-grid">
          <div class="form-group">
            <label for="clientName">Cliente *</label>
            <input 
              type="text" 
              id="clientName"
              [(ngModel)]="formData.clientName" 
              name="clientName" 
              required
              placeholder="Nombre del cliente"
            >
          </div>
          
          <div class="form-group">
            <label for="status">Estado</label>
            <select id="status" [(ngModel)]="formData.status" name="status">
              <option value="DRAFT">Borrador</option>
              <option value="ACTIVE">Activo</option>
              <option value="COMPLETED">Completado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="startDate">Fecha de Inicio</label>
            <input 
              type="date" 
              id="startDate"
              [(ngModel)]="formData.startDate" 
              name="startDate" 
            >
          </div>
          
          <div class="form-group">
            <label for="endDate">Fecha de Fin</label>
            <input 
              type="date" 
              id="endDate"
              [(ngModel)]="formData.endDate" 
              name="endDate" 
            >
          </div>
          
          <div class="form-group">
            <label for="itemsCount">Número de Items</label>
            <input 
              type="number" 
              id="itemsCount"
              [(ngModel)]="formData.itemsCount" 
              name="itemsCount" 
              placeholder="0"
            >
          </div>
          
          <div class="form-group">
            <label for="totalAmount">Importe Total (€)</label>
            <input 
              type="number" 
              id="totalAmount"
              [(ngModel)]="formData.totalAmount" 
              name="totalAmount" 
              placeholder="0.00"
              step="0.01"
            >
          </div>
        </div>
      </form>
      
      <div modal-footer>
        <ui-josanz-button variant="secondary" (clicked)="closeModal()">
          Cancelar
        </ui-josanz-button>
        <ui-josanz-button 
          (clicked)="saveRental()"
          [disabled]="!formData.clientName"
        >
          {{ editingRental() ? 'Actualizar' : 'Crear' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- Delete Confirmation Modal -->
    <ui-josanz-modal
      [isOpen]="isDeleteModalOpen()"
      title="Confirmar Eliminación"
      (closed)="closeDeleteModal()"
    >
      <p>¿Estás seguro de que deseas eliminar el alquiler <strong>#{{ rentalToDelete()?.id?.slice(0, 8) }}</strong>?</p>
      <p class="warning-text">Esta acción no se puede deshacer.</p>
      
      <div modal-footer>
        <ui-josanz-button variant="secondary" (clicked)="closeDeleteModal()">
          Cancelar
        </ui-josanz-button>
        <ui-josanz-button variant="danger" (clicked)="deleteRental()">
          Eliminar
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px;
    }
    .header-content h1 { margin: 0 0 4px 0; color: white; font-size: 28px; font-weight: 700; }
    .subtitle { margin: 0; color: #94A3B8; font-size: 14px; }
    .filters-bar { display: flex; gap: 16px; margin: 20px 0; }
    .rental-link { color: #4F46E5; text-decoration: none; font-weight: 500; font-family: monospace; }
    .rental-link:hover { text-decoration: underline; }
    .actions { display: flex; gap: 8px; }
    .action-btn {
      background: none; border: none; padding: 6px; cursor: pointer;
      color: #94A3B8; border-radius: 6px; transition: all 0.2s;
    }
    .action-btn:hover { background: rgba(255,255,255,0.1); color: white; }
    .action-btn.success:hover { background: rgba(34,197,94,0.15); color: #22C55E; }
    .action-btn.danger:hover { background: rgba(239,68,68,0.15); color: #EF4444; }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      color: #94A3B8;
      font-size: 13px;
      font-weight: 500;
    }
    .form-group input,
    .form-group select {
      background: #0F172A;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px 12px;
      color: white;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #4F46E5;
    }
    .form-group input::placeholder {
      color: #64748B;
    }
    .warning-text {
      color: #EF4444;
      font-size: 14px;
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

    if (this.editingRental()) {
      this.rentalService.updateRental(this.editingRental()!.id, this.formData).subscribe({
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

