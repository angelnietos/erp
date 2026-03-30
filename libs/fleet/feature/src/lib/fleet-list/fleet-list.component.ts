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
  UiInputComponent,
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
    UiInputComponent,
    LucideAngularModule
  ],
  template: `
    <div class="page-container animate-fade-in">
      <header class="page-header">
        <div class="header-main">
          <h1 class="page-title text-uppercase">Gestión de Flota Logística</h1>
          <div class="breadcrumb">
            <span class="active">UNIDADES LOGÍSTICAS</span>
            <span class="separator">/</span>
            <span>MONITOREO DE MOVILIDAD</span>
          </div>
        </div>
        <ui-josanz-button variant="primary" size="md" (clicked)="openCreateModal()" icon="plus">
          NUEVA UNIDAD
        </ui-josanz-button>
      </header>

      <div class="navigation-bar">
        <ui-josanz-tabs 
          [tabs]="tabs" 
          [activeTab]="activeTab()" 
          variant="underline" 
          (tabChange)="onTabChange($event)"
        ></ui-josanz-tabs>
        
        <ui-josanz-search 
          variant="filled"
          placeholder="BUSCAR MATRÍCULA O CONDUCTOR..." 
          (searchChange)="onSearch($event)"
          class="search-bar"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <div class="loader-container">
          <ui-josanz-loader message="SINCRONIZANDO TELEMETRÍA DE FLOTA..."></ui-josanz-loader>
        </div>
      } @else {
        <ui-josanz-card variant="glass" class="table-card">
          <ui-josanz-table [columns]="columns" [data]="vehicles()" variant="default">
            <ng-template #cellTemplate let-vehicle let-key="key">
              @switch (key) {
                @case ('plate') {
                  <a [routerLink]="['/fleet', vehicle.id]" class="vehicle-link text-uppercase">
                    {{ vehicle.plate }}
                  </a>
                }
                @case ('type') {
                  <ui-josanz-badge variant="info">{{ getTypeLabel(vehicle.type) | uppercase }}</ui-josanz-badge>
                }
                @case ('status') {
                  <ui-josanz-badge [variant]="getStatusVariant(vehicle.status)">
                    {{ getStatusLabel(vehicle.status) | uppercase }}
                  </ui-josanz-badge>
                }
                @case ('insuranceExpiry') {
                  <span class="text-secondary font-mono" [class.overdue]="isExpired(vehicle.insuranceExpiry)">
                    {{ formatDate(vehicle.insuranceExpiry) }}
                  </span>
                }
                @case ('itvExpiry') {
                  <span class="text-secondary font-mono" [class.overdue]="isExpired(vehicle.itvExpiry)">
                    {{ formatDate(vehicle.itvExpiry) }}
                  </span>
                }
                @case ('actions') {
                  <div class="row-actions">
                    <button class="action-btn" [routerLink]="['/fleet', vehicle.id]" title="Detalles">
                      <lucide-icon name="eye" size="16"></lucide-icon>
                    </button>
                    <button class="action-btn" (click)="editVehicle(vehicle)" title="Editar">
                      <lucide-icon name="pencil" size="16"></lucide-icon>
                    </button>
                    <button class="action-btn danger" (click)="confirmDelete(vehicle)" title="Eliminar">
                      <lucide-icon name="trash-2" size="16"></lucide-icon>
                    </button>
                  </div>
                }
                @default {
                  {{ vehicle[key] }}
                }
              }
            </ng-template>
          </ui-josanz-table>

          <footer class="table-footer">
            <div class="table-info uppercase">
              {{ vehicles().length }} UNIDADES EN RANGO OPERATIVO
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
      [title]="editingVehicle() ? 'MODIFICACIÓN DE FICHA TÉCNICA' : 'REGISTRO DE NUEVA UNIDAD'"
      (closed)="closeModal()"
      variant="dark"
    >
      <div class="form-grid">
        <div class="form-section">
          <h3 class="section-title text-uppercase">Especificaciones Técnicas</h3>
          <div class="input-grid">
            <ui-josanz-input 
              label="Matrícula" 
              [(ngModel)]="formData.plate" 
              placeholder="1234-ABC"
              icon="hash"
              id="fleet-plate"
            ></ui-josanz-input>
            
            <ui-josanz-input 
              label="Marca" 
              [(ngModel)]="formData.brand" 
              placeholder="PEUGEOT / IVECO"
              icon="car"
              id="fleet-brand"
            ></ui-josanz-input>
            
            <ui-josanz-input 
              label="Modelo" 
              [(ngModel)]="formData.model" 
              placeholder="BOXER / DAILY"
              icon="box"
              id="fleet-model"
            ></ui-josanz-input>
            
            <ui-josanz-input 
              label="Año" 
              type="number" 
              [(ngModel)]="formData.year" 
              icon="calendar"
              id="fleet-year"
            ></ui-josanz-input>

            <div class="form-group">
              <label for="fleet-type" class="field-label text-uppercase">Categoría</label>
              <select id="fleet-type" class="tech-select" [(ngModel)]="formData.type" name="type">
                <option value="van">FURGÓN (V-01)</option>
                <option value="truck">CAMIÓN (T-02)</option>
                <option value="car">TURISMO (C-03)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title text-uppercase">Estado y Operatividad</h3>
          <div class="input-grid">
            <div class="form-group">
              <label for="fleet-status" class="field-label text-uppercase">Disponibilidad</label>
              <select id="fleet-status" class="tech-select" [(ngModel)]="formData.status" name="status">
                <option value="available">DISPONIBLE PARA RUTA</option>
                <option value="in_use">ASIGNADO A OPERACIÓN</option>
                <option value="maintenance">MANTENIMIENTO PREVENTIVO</option>
              </select>
            </div>
            
            <ui-josanz-input 
              label="Conductor Asignado" 
              [(ngModel)]="formData.currentDriver" 
              placeholder="NOMBRE DEL PERSONAL..."
              icon="user"
              id="fleet-driver"
            ></ui-josanz-input>
            
            <ui-josanz-input 
              label="Vencimiento Seguro" 
              type="date" 
              [(ngModel)]="formData.insuranceExpiry"
              icon="shield-check"
              id="fleet-ins"
            ></ui-josanz-input>
            
            <ui-josanz-input 
              label="Vencimiento ITV" 
              type="date" 
              [(ngModel)]="formData.itvExpiry"
              icon="activity"
              id="fleet-itv"
            ></ui-josanz-input>
          </div>
        </div>
      </div>
      
      <div modal-footer class="modal-actions">
        <ui-josanz-button variant="ghost" (clicked)="closeModal()">CANCELAR</ui-josanz-button>
        <ui-josanz-button 
          variant="glass"
          (clicked)="saveVehicle()"
          [disabled]="!formData.plate || !formData.brand || !formData.model"
        >
          <lucide-icon name="save" size="18" class="mr-2"></lucide-icon>
          {{ editingVehicle() ? 'ACTUALIZAR FICHA' : 'REGISTRAR UNIDAD' }}
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
          <p class="text-uppercase">¿ESTÁ SEGURO DE QUE DESEA ELIMINAR EL VEHÍCULO <strong>{{ vehicleToDelete()?.plate }}</strong>?</p>
          <p class="critical-text text-uppercase">CUALQUIER HISTORIAL DE TELEMETRÍA SERÁ ARCHIVADO PERO NO PODRÁ SER ASIGNADO A RUTAS ACTIVAS.</p>
        </div>
      </div>
      
      <div modal-footer class="modal-actions">
        <ui-josanz-button variant="ghost" (clicked)="closeDeleteModal()">ABORTAR</ui-josanz-button>
        <ui-josanz-button variant="danger" (clicked)="deleteVehicle()">CONFIRMAR BAJA</ui-josanz-button>
      </div>
    </ui-josanz-modal>
  `,
  styles: [`
    .page-container { padding: 2.5rem; max-width: 1600px; margin: 0 auto; }
    
    .page-header {
      display: flex; 
      justify-content: space-between; 
      align-items: flex-end;
      margin-bottom: 3rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-soft);
    }
    
    .page-title { 
      font-size: 2.25rem; 
      font-weight: 900; 
      color: #fff; 
      margin: 0 0 0.5rem 0; 
      letter-spacing: -0.02em;
      font-family: var(--font-display);
    }
    
    .breadcrumb {
      display: flex;
      gap: 8px;
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: var(--text-muted);
    }
    .breadcrumb .active { color: var(--brand); }
    .breadcrumb .separator { opacity: 0.3; }
    
    .navigation-bar { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 2rem; 
      gap: 2rem;
    }
    .search-bar { max-width: 400px; }
    
    .vehicle-link { 
      color: var(--brand); 
      text-decoration: none; 
      font-weight: 800; 
      font-size: 0.8rem;
      letter-spacing: 0.05em;
      transition: var(--transition-fast);
    }
    .vehicle-link:hover { color: #fff; text-decoration: underline; }
    
    .overdue { color: var(--danger); font-weight: 800; }
    
    .row-actions { display: flex; gap: 6px; }
    
    .action-btn { 
      background: var(--bg-tertiary); 
      border: 1px solid var(--border-soft); 
      color: var(--text-secondary); 
      cursor: pointer; 
      width: 34px;
      height: 34px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition-base);
    }
    
    .action-btn:hover { 
      color: #fff; 
      border-color: var(--brand);
      background: var(--brand-muted);
      transform: translateY(-2px);
    }
    
    .action-btn.danger:hover { background: var(--danger); border-color: var(--danger); }

    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: rgba(0, 0, 0, 0.1);
      border-top: 1px solid var(--border-soft);
    }

    .table-info { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); letter-spacing: 0.1em; }

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
    .input-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    
    .field-label { font-size: 0.65rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 4px; }
    
    .tech-select {
      width: 100%;
      padding: 0.9rem 1.1rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md);
      color: #fff;
      font-size: 0.85rem;
      outline: none;
      transition: var(--transition-base);
    }
    .tech-select:focus { border-color: var(--brand); background: var(--bg-secondary); }

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
      .input-grid { grid-template-columns: 1fr; }
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
    { key: 'plate', header: 'MATRÍCULA' },
    { key: 'brand', header: 'MARCA' },
    { key: 'model', header: 'MODELO' },
    { key: 'year', header: 'AÑO', width: '80px' },
    { key: 'type', header: 'TIPO', width: '100px' },
    { key: 'status', header: 'ESTADO', width: '150px' },
    { key: 'currentDriver', header: 'CONDUCTOR' },
    { key: 'insuranceExpiry', header: 'SEGURO' },
    { key: 'itvExpiry', header: 'ITV' },
    { key: 'actions', header: '', width: '120px' },
  ];

  vehicles = signal<Vehicle[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  activeTab = signal('all');
  searchTerm = '';
  
  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  editingVehicle = signal<Vehicle | null>(null);
  vehicleToDelete = signal<Vehicle | null>(null);
  
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
    this.loadVehicles();
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
    if (!date) return false;
    return new Date(date) < new Date();
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }
}
