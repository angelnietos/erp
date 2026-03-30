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
  UiCardComponent,
  UiTabsComponent,
} from '@josanz-erp/shared-ui-kit';
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
    UiCardComponent,
    UiTabsComponent,
    LucideAngularModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="glow-text">Flota Logística</h1>
          <p class="subtitle">Monitoreo de unidades de transporte y asignación de conductores</p>
        </div>
        <ui-josanz-button variant="primary" (clicked)="openCreateModal()">
          <lucide-icon name="plus" class="mr-2"></lucide-icon>
          Nuevo Vehículo
        </ui-josanz-button>
      </div>

      <div class="navigation-row">
        <ui-josanz-tabs [tabs]="tabs" [activeTab]="activeTab()" variant="underline" (tabChange)="onTabChange($any($event))"></ui-josanz-tabs>
      </div>

      <div class="filters-bar">
        <ui-josanz-search 
          variant="filled"
          placeholder="BUSCAR MATRÍCULA O CONDUCTOR..." 
          (searchChange)="onSearch($event)"
          class="flex-1"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <ui-josanz-loader message="Sincronizando telemetría de flota..."></ui-josanz-loader>
      } @else {
        <ui-josanz-card variant="glass" class="table-card">
          <ui-josanz-table [columns]="columns" [data]="vehicles()" variant="hover">
            <ng-template #cellTemplate let-vehicle let-key="key">
              @switch (key) {
                @case ('plate') {
                  <a [routerLink]="['/fleet', vehicle.id]" class="vehicle-link">
                    {{ vehicle.plate }}
                  </a>
                }
                @case ('type') {
                  <ui-josanz-badge variant="info">{{ getTypeLabel(vehicle.type) }}</ui-josanz-badge>
                }
                @case ('status') {
                  <ui-josanz-badge [variant]="getStatusVariant(vehicle.status)">
                    {{ getStatusLabel(vehicle.status) }}
                  </ui-josanz-badge>
                }
                @case ('insuranceExpiry') {
                  <span class="expiry-text" [class.expired]="isExpired(vehicle.insuranceExpiry)">
                    {{ formatDate(vehicle.insuranceExpiry) }}
                  </span>
                }
                @case ('itvExpiry') {
                  <span class="expiry-text" [class.expired]="isExpired(vehicle.itvExpiry)">
                    {{ formatDate(vehicle.itvExpiry) }}
                  </span>
                }
                @case ('actions') {
                  <div class="actions">
                    <button class="action-trigger" [routerLink]="['/fleet', vehicle.id]" title="Ver">
                      <lucide-icon name="eye" size="18"></lucide-icon>
                    </button>
                    <button class="action-trigger" (click)="editVehicle(vehicle)" title="Editar">
                      <lucide-icon name="pencil" size="18"></lucide-icon>
                    </button>
                    <button class="action-trigger danger" (click)="confirmDelete(vehicle)" title="Eliminar">
                      <lucide-icon name="trash-2" size="18"></lucide-icon>
                    </button>
                  </div>
                }
                @default {
                  {{ vehicle[key] }}
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
      [title]="editingVehicle() ? 'REGISTRO DE UNIDAD: EDITAR' : 'REGISTRO DE UNIDAD: NUEVO'"
      (closed)="closeModal()"
      variant="dark"
    >
      <div class="form-container">
        <div class="form-grid">
          <div class="form-col">
            <label class="field-label" for="fleet-plate">Matrícula *</label>
            <input 
              type="text" 
              id="fleet-plate"
              class="technical-input"
              [(ngModel)]="formData.plate" 
              name="plate" 
              required
              placeholder="1234-ABC"
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="fleet-brand">Marca *</label>
            <input 
              type="text" 
              id="fleet-brand"
              class="technical-input"
              [(ngModel)]="formData.brand" 
              name="brand" 
              required
              placeholder="MERCEDES / IVECO"
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="fleet-model">Modelo *</label>
            <input 
              type="text" 
              id="fleet-model"
              class="technical-input"
              [(ngModel)]="formData.model" 
              name="model" 
              required
              placeholder="SPRINTER 316 / DAILY"
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="fleet-year">Año de Fabricación</label>
            <input 
              type="number" 
              id="fleet-year"
              class="technical-input"
              [(ngModel)]="formData.year" 
              name="year" 
              placeholder="2024"
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="fleet-type">Tipo de Unidad</label>
            <select id="fleet-type" class="technical-select" [(ngModel)]="formData.type" name="type">
              <option value="van">FURGÓN</option>
              <option value="truck">CAMIÓN</option>
              <option value="car">COCHE</option>
            </select>
          </div>
          
          <div class="form-col">
            <label class="field-label" for="fleet-status">Estado Operativo</label>
            <select id="fleet-status" class="technical-select" [(ngModel)]="formData.status" name="status">
              <option value="available">DISPONIBLE</option>
              <option value="in_use">EN USO</option>
              <option value="maintenance">MANTENIMIENTO</option>
            </select>
          </div>
          
          <div class="form-col">
            <label class="field-label" for="fleet-driver">Conductor Asignado</label>
            <input 
              type="text" 
              id="fleet-driver"
              class="technical-input"
              [(ngModel)]="formData.currentDriver" 
              name="currentDriver" 
              placeholder="NOMBRE DEL CONDUCTOR"
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="fleet-ins-exp">Vencimiento Seguro</label>
            <input 
              type="date" 
              id="fleet-ins-exp"
              class="technical-input"
              [(ngModel)]="formData.insuranceExpiry" 
              name="insuranceExpiry" 
            >
          </div>
          
          <div class="form-col">
            <label class="field-label" for="fleet-itv-exp">Vencimiento ITV</label>
            <input 
              type="date" 
              id="fleet-itv-exp"
              class="technical-input"
              [(ngModel)]="formData.itvExpiry" 
              name="itvExpiry" 
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
          (clicked)="saveVehicle()"
          [disabled]="!formData.plate || !formData.brand || !formData.model"
        >
          {{ editingVehicle() ? 'ACTUALIZAR REGISTRO' : 'CONFIRMAR ALTA' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- Delete Confirmation Modal -->
    <ui-josanz-modal
      [isOpen]="isDeleteModalOpen()"
      title="ADVERTENCIA: ELIMINACIÓN DE UNIDAD"
      (closed)="closeDeleteModal()"
      variant="dark"
    >
      <div class="delete-warning">
        <lucide-icon name="alert-triangle" class="warning-icon"></lucide-icon>
        <div class="warning-content">
          <p>¿Estás seguro de que deseas eliminar el vehículo <strong>{{ vehicleToDelete()?.plate }}</strong>?</p>
          <p class="critical-text">ESTA ACCIÓN ES IRREVERSIBLE Y ELIMINARÁ EL VEHÍCULO DE LA FLOTA ACTIVA.</p>
        </div>
      </div>
      
      <div modal-footer>
        <ui-josanz-button variant="ghost" (clicked)="closeDeleteModal()">
          CANCELAR
        </ui-josanz-button>
        <ui-josanz-button variant="danger" (clicked)="deleteVehicle()">
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
    
    .vehicle-link { 
      color: var(--brand); 
      text-decoration: none; 
      font-weight: 900; 
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-family: var(--font-display);
      transition: all 0.2s;
    }
    .vehicle-link:hover { color: #fff; text-shadow: 0 0 10px var(--brand-glow); }
    
    .expiry-text { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
    .expired { color: var(--danger); text-shadow: 0 0 5px rgba(239, 68, 68, 0.4); }
    
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

    const vehicleToEdit = this.editingVehicle();
    if (vehicleToEdit) {
      this.vehicleService.updateVehicle(vehicleToEdit.id, this.formData).subscribe({
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

