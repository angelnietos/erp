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
} from '@josanz-erp/shared-ui-kit';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Vehicle, VehicleService } from '@josanz-erp/fleet-data-access';

@Component({
  selector: 'lib-fleet-list',
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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Flota de Vehículos</h1>
          <p class="subtitle">Gestiona vehículos y conductores</p>
        </div>
        <ui-josanz-button icon="plus" (clicked)="openCreateModal()">
          Nuevo Vehículo
        </ui-josanz-button>
      </div>

      <ui-josanz-tabs [tabs]="tabs" [activeTab]="activeTab()" (tabChange)="onTabChange($any($event))"></ui-josanz-tabs>

      <div class="filters-bar">
        <ui-josanz-search 
          placeholder="Buscar vehículos..." 
          (searchChange)="onSearch($event)"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <ui-josanz-loader message="Cargando flota..."></ui-josanz-loader>
      } @else {
        <ui-josanz-table [columns]="columns" [data]="vehicles()">
          <ng-template #cellTemplate let-vehicle let-key="key">
            @switch (key) {
              @case ('plate') {
                <a [routerLink]="['/fleet', vehicle.id]" class="vehicle-link">
                  {{ vehicle.plate }}
                </a>
              }
              @case ('type') {
                <ui-josanz-badge>{{ getTypeLabel(vehicle.type) }}</ui-josanz-badge>
              }
              @case ('status') {
                <ui-josanz-badge [variant]="getStatusVariant(vehicle.status)">
                  {{ getStatusLabel(vehicle.status) }}
                </ui-josanz-badge>
              }
              @case ('insuranceExpiry') {
                <span [class.expired]="isExpired(vehicle.insuranceExpiry)">
                  {{ formatDate(vehicle.insuranceExpiry) }}
                </span>
              }
              @case ('itvExpiry') {
                <span [class.expired]="isExpired(vehicle.itvExpiry)">
                  {{ formatDate(vehicle.itvExpiry) }}
                </span>
              }
              @case ('actions') {
                <div class="actions">
                  <button class="action-btn" [routerLink]="['/fleet', vehicle.id]" title="Ver">
                    <lucide-icon name="eye"></lucide-icon>
                  </button>
                  <button class="action-btn" (click)="editVehicle(vehicle)" title="Editar">
                    <lucide-icon name="pencil"></lucide-icon>
                  </button>
                  <button class="action-btn danger" (click)="confirmDelete(vehicle)" title="Eliminar">
                    <lucide-icon name="trash-2"></lucide-icon>
                  </button>
                </div>
              }
              @default {
                {{ vehicle[key] }}
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
      [title]="editingVehicle() ? 'Editar Vehículo' : 'Nuevo Vehículo'"
      (closed)="closeModal()"
    >
      <form>
        <div class="form-grid">
          <div class="form-group">
            <label for="plate">Matrícula *</label>
            <input 
              type="text" 
              id="plate"
              [(ngModel)]="formData.plate" 
              name="plate" 
              required
              placeholder="1234-ABC"
            >
          </div>
          
          <div class="form-group">
            <label for="brand">Marca *</label>
            <input 
              type="text" 
              id="brand"
              [(ngModel)]="formData.brand" 
              name="brand" 
              required
              placeholder="Mercedes"
            >
          </div>
          
          <div class="form-group">
            <label for="model">Modelo *</label>
            <input 
              type="text" 
              id="model"
              [(ngModel)]="formData.model" 
              name="model" 
              required
              placeholder="Sprinter 316"
            >
          </div>
          
          <div class="form-group">
            <label for="year">Año</label>
            <input 
              type="number" 
              id="year"
              [(ngModel)]="formData.year" 
              name="year" 
              placeholder="2022"
            >
          </div>
          
          <div class="form-group">
            <label for="type">Tipo</label>
            <select id="type" [(ngModel)]="formData.type" name="type">
              <option value="van">Furgón</option>
              <option value="truck">Camión</option>
              <option value="car">Coche</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="status">Estado</label>
            <select id="status" [(ngModel)]="formData.status" name="status">
              <option value="available">Disponible</option>
              <option value="in_use">En Uso</option>
              <option value="maintenance">Mantenimiento</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="currentDriver">Conductor Asignado</label>
            <input 
              type="text" 
              id="currentDriver"
              [(ngModel)]="formData.currentDriver" 
              name="currentDriver" 
              placeholder="Nombre del conductor"
            >
          </div>
          
          <div class="form-group">
            <label for="insuranceExpiry">Vencimiento Seguro</label>
            <input 
              type="date" 
              id="insuranceExpiry"
              [(ngModel)]="formData.insuranceExpiry" 
              name="insuranceExpiry" 
            >
          </div>
          
          <div class="form-group">
            <label for="itvExpiry">Vencimiento ITV</label>
            <input 
              type="date" 
              id="itvExpiry"
              [(ngModel)]="formData.itvExpiry" 
              name="itvExpiry" 
            >
          </div>
        </div>
      </form>
      
      <div modal-footer>
        <ui-josanz-button variant="secondary" (clicked)="closeModal()">
          Cancelar
        </ui-josanz-button>
        <ui-josanz-button 
          (clicked)="saveVehicle()"
          [disabled]="!formData.plate || !formData.brand || !formData.model"
        >
          {{ editingVehicle() ? 'Actualizar' : 'Crear' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- Delete Confirmation Modal -->
    <ui-josanz-modal
      [isOpen]="isDeleteModalOpen()"
      title="Confirmar Eliminación"
      (closed)="closeDeleteModal()"
    >
      <p>¿Estás seguro de que deseas eliminar el vehículo <strong>{{ vehicleToDelete()?.plate }}</strong>?</p>
      <p class="warning-text">Esta acción no se puede deshacer.</p>
      
      <div modal-footer>
        <ui-josanz-button variant="secondary" (clicked)="closeDeleteModal()">
          Cancelar
        </ui-josanz-button>
        <ui-josanz-button variant="danger" (clicked)="deleteVehicle()">
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
    .vehicle-link { color: #4F46E5; text-decoration: none; font-weight: 600; font-family: monospace; }
    .vehicle-link:hover { text-decoration: underline; }
    .expired { color: #EF4444; }
    .actions { display: flex; gap: 8px; }
    .action-btn {
      background: none; border: none; padding: 6px; cursor: pointer;
      color: #94A3B8; border-radius: 6px; transition: all 0.2s;
    }
    .action-btn:hover { background: rgba(255,255,255,0.1); color: white; }
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
export class FleetListComponent implements OnInit {
  private vehicleService = inject(VehicleService);

  tabs = [
    { id: 'all', label: 'Todos', badge: 0 },
    { id: 'available', label: 'Disponibles', badge: 0 },
    { id: 'in_use', label: 'En Uso', badge: 0 },
    { id: 'maintenance', label: 'Mantenimiento', badge: 0 },
  ];

  columns = [
    { key: 'plate', header: 'Matrícula' },
    { key: 'brand', header: 'Marca' },
    { key: 'model', header: 'Modelo' },
    { key: 'year', header: 'Año', width: '80px' },
    { key: 'type', header: 'Tipo', width: '100px' },
    { key: 'status', header: 'Estado', width: '120px' },
    { key: 'currentDriver', header: 'Conductor' },
    { key: 'insuranceExpiry', header: 'Seguro' },
    { key: 'itvExpiry', header: 'ITV' },
    { key: 'actions', header: '', width: '100px' },
  ];

  vehicles = signal<Vehicle[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  activeTab = signal('all');
  searchTerm = '';
  
  // Modal state
  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  editingVehicle = signal<Vehicle | null>(null);
  vehicleToDelete = signal<Vehicle | null>(null);
  
  // Form data
  formData: Partial<Vehicle> = {
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'van',
    status: 'available',
    currentDriver: '',
    insuranceExpiry: '',
    itvExpiry: ''
  };

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.isLoading.set(true);
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles: Vehicle[]) => {
        this.vehicles.set(vehicles);
        this.updateTabBadges(vehicles);
        this.isLoading.set(false);
        this.totalPages.set(1);
      },
      error: (err: Error) => {
        console.error('Error loading vehicles:', err);
        this.isLoading.set(false);
      }
    });
  }

  updateTabBadges(vehicles: Vehicle[]) {
    const counts = {
      all: vehicles.length,
      available: vehicles.filter(v => v.status === 'available').length,
      in_use: vehicles.filter(v => v.status === 'in_use').length,
      maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    };
    this.tabs = this.tabs.map(tab => ({ ...tab, badge: counts[tab.id as keyof typeof counts] }));
  }

  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
    this.isLoading.set(true);
    
    if (tabId === 'all') {
      this.loadVehicles();
    } else {
      this.vehicleService.getVehiclesByStatus(tabId).subscribe({
        next: (vehicles: Vehicle[]) => {
          this.vehicles.set(vehicles);
          this.isLoading.set(false);
        }
      });
    }
  }

  onSearch(term: string) {
    this.searchTerm = term;
    if (term.trim()) {
      this.isLoading.set(true);
      this.vehicleService.searchVehicles(term).subscribe({
        next: (vehicles: Vehicle[]) => {
          this.vehicles.set(vehicles);
          this.isLoading.set(false);
        }
      });
    } else {
      this.loadVehicles();
    }
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadVehicles();
  }

  openCreateModal() {
    this.editingVehicle.set(null);
    this.formData = {
      plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      type: 'van',
      status: 'available',
      currentDriver: '',
      insuranceExpiry: '',
      itvExpiry: ''
    };
    this.isModalOpen.set(true);
  }

  editVehicle(vehicle: Vehicle) {
    this.editingVehicle.set(vehicle);
    this.formData = { ...vehicle };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingVehicle.set(null);
  }

  saveVehicle() {
    if (!this.formData.plate || !this.formData.brand || !this.formData.model) return;

    if (this.editingVehicle()) {
      this.vehicleService.updateVehicle(this.editingVehicle()!.id, this.formData).subscribe({
        next: (updated: Vehicle) => {
          this.vehicles.update(vehicles => 
            vehicles.map(v => v.id === updated.id ? updated : v)
          );
          this.closeModal();
        },
        error: (err: Error) => console.error('Error updating vehicle:', err)
      });
    } else {
      this.vehicleService.createVehicle(this.formData as Omit<Vehicle, 'id' | 'createdAt'>).subscribe({
        next: (newVehicle: Vehicle) => {
          this.vehicles.update(vehicles => [...vehicles, newVehicle]);
          this.closeModal();
        },
        error: (err: Error) => console.error('Error creating vehicle:', err)
      });
    }
  }

  confirmDelete(vehicle: Vehicle) {
    this.vehicleToDelete.set(vehicle);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.vehicleToDelete.set(null);
  }

  deleteVehicle() {
    const vehicle = this.vehicleToDelete();
    if (!vehicle) return;

    this.vehicleService.deleteVehicle(vehicle.id).subscribe({
      next: (success: boolean) => {
        if (success) {
          this.vehicles.update(vehicles => vehicles.filter(v => v.id !== vehicle.id));
        }
        this.closeDeleteModal();
      },
      error: (err: Error) => console.error('Error deleting vehicle:', err)
    });
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'van': return 'Furgón';
      case 'truck': return 'Camión';
      case 'car': return 'Coche';
      default: return type;
    }
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'default' {
    switch (status) {
      case 'available': return 'success';
      case 'in_use': return 'warning';
      case 'maintenance': return 'info';
      default: return 'default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'available': return 'Disponible';
      case 'in_use': return 'En Uso';
      case 'maintenance': return 'Mantenimiento';
      default: return status;
    }
  }

  isExpired(date: string): boolean {
    return new Date(date) < new Date();
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }
}

