import { Component, OnInit, OnDestroy, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiSearchComponent,
  UiPaginationComponent,
  UiLoaderComponent,
  UiModalComponent,
  UiTabsComponent,
  UiInputComponent,
  UiStatCardComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
} from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore, MasterFilterService, FilterableService, ToastService } from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';
import { Vehicle, VehicleService } from '@josanz-erp/fleet-data-access';

@Component({
  selector: 'lib-fleet-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    UiButtonComponent, 
    UiSearchComponent, 
    UiPaginationComponent, 
    UiLoaderComponent,
    UiModalComponent,
    UiTabsComponent,
    UiInputComponent,
    UiStatCardComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    LucideAngularModule
  ],
  template: `
    <div class="fleet-container">
      <ui-feature-header
        title="Flota Logística"
        subtitle="Monitoreo de movilidad y mantenimiento preventivo"
        icon="truck"
        actionLabel="NUEVA UNIDAD"
        (actionClicked)="openCreateModal()"
      ></ui-feature-header>

      <ui-feature-stats>
        <ui-stat-card 
          label="Unidades Activas" 
          [value]="vehicles().length.toString()" 
          icon="truck" 
          [accent]="true">
        </ui-stat-card>
        <ui-stat-card 
          label="En Mantenimiento" 
          [value]="maintenanceCount().toString()" 
          icon="wrench" 
          [trend]="-2">
        </ui-stat-card>
        <ui-stat-card 
          label="Alertas Técnicas" 
          [value]="alertCount().toString()" 
          icon="alert-triangle" 
          [class.text-danger]="alertCount() > 0">
        </ui-stat-card>
        <ui-stat-card
          label="Sincronización GPS"
          value="Online"
          icon="navigation"
          [accent]="false"
        ></ui-stat-card>
      </ui-feature-stats>

      <div class="navigation-bar">
        <ui-tabs 
          [tabs]="tabs" 
          [activeTab]="activeTab()" 
          variant="underline" 
          (tabChange)="onTabChange($event)"
          class="flex-1"
        ></ui-tabs>
        
        <ui-search 
          variant="glass"
          placeholder="BUSCAR MATRÍCULA O CONDUCTOR..." 
          (searchChange)="onSearch($event)"
          class="search-bar"
        ></ui-search>
      </div>

      @if (isLoading()) {
        <div class="loader-container">
          <ui-loader message="SINCRONIZANDO TELEMETRÍA DE FLOTA..."></ui-loader>
        </div>
      } @else {
        <ui-feature-grid>
          @for (vehicle of displayedVehicles(); track vehicle.id) {
            <ui-feature-card
              [name]="vehicle.plate | uppercase"
              [subtitle]="(vehicle.brand + ' ' + vehicle.model) | uppercase"
              [avatarInitials]="getInitials(vehicle.plate)"
              [avatarBackground]="getVehicleGradient(vehicle.type)"
              [status]="vehicle.status === 'available' ? 'active' : 'offline'"
              [badgeLabel]="getStatusLabel(vehicle.status) | uppercase"
              [badgeVariant]="getStatusVariant(vehicle.status)"
              [showEdit]="true"
              [showDuplicate]="true"
              [showDelete]="true"
              (cardClicked)="onRowClick(vehicle)"
              (editClicked)="editVehicle(vehicle)"
              (duplicateClicked)="onDuplicate(vehicle)"
              (deleteClicked)="confirmDelete(vehicle)"
              [footerItems]="[
                { icon: 'calendar', label: 'Año: ' + vehicle.year },
                { icon: 'shield', label: 'Seguro: ' + formatDate(vehicle.insuranceExpiry) },
                { icon: 'check-square', label: 'ITV: ' + formatDate(vehicle.itvExpiry) }
              ]"
            >
              @if (isExpired(vehicle.insuranceExpiry) || isExpired(vehicle.itvExpiry)) {
                <div class="vehicle-alerts">
                 <span class="alert-badge overdue">
                    <lucide-icon name="alert-circle" size="12"></lucide-icon> ALERTA TÉCNICA
                 </span>
                </div>
              }
            </ui-feature-card>
          } @empty {
            <div class="empty-state">
              <lucide-icon name="truck" size="64" class="empty-icon"></lucide-icon>
              <h3>No hay unidades</h3>
              <p>Comienza registrando tu primer vehículo en la flota.</p>
              <ui-button variant="solid" (clicked)="openCreateModal()" icon="CirclePlus">Registrar unidad</ui-button>
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

    <!-- Modal solo para alta; la edición completa está en /fleet/:id/edit -->
    <ui-modal 
      [isOpen]="isModalOpen()" 
      title="REGISTRO DE NUEVA UNIDAD"
      (closed)="closeModal()"
      variant="glass"
    >
      <div class="form-grid">
         <ui-input label="Matrícula" [(ngModel)]="formData.plate" icon="hash"></ui-input>
         <div class="row">
            <ui-input label="Marca" [(ngModel)]="formData.brand" icon="car"></ui-input>
            <ui-input label="Modelo" [(ngModel)]="formData.model" icon="box"></ui-input>
         </div>
         <div class="row">
           <ui-input label="Año" type="number" [(ngModel)]="formData.year" icon="calendar"></ui-input>
           <ui-input label="Tipo" [(ngModel)]="formData.type" icon="truck"></ui-input>
         </div>
         <div class="row">
            <ui-input label="Seguro hasta" type="date" [(ngModel)]="formData.insuranceExpiry" icon="shield"></ui-input>
            <ui-input label="ITV hasta" type="date" [(ngModel)]="formData.itvExpiry" icon="check-square"></ui-input>
         </div>
      </div>
      <div class="modal-actions">
        <ui-button variant="ghost" (clicked)="closeModal()">CANCELAR</ui-button>
        <ui-button variant="solid" (clicked)="saveVehicle()" [disabled]="!formData.plate" icon="save">GUARDAR</ui-button>
      </div>
    </ui-modal>
  `,
  styles: [`
    .fleet-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .navigation-bar {
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

    .flex-1 { flex: 1; }
    .search-bar { width: 350px; }

    .loader-container { display: flex; justify-content: center; padding: 5rem; }

    .vehicle-alerts { margin-top: 1rem; }
    .alert-badge {
       display: inline-flex;
       align-items: center;
       gap: 0.25rem;
       font-size: 0.65rem;
       font-weight: 800;
       padding: 0.2rem 0.6rem;
       border-radius: 4px;
       letter-spacing: 0.05em;
    }
    .alert-badge.overdue { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

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

    @media (max-width: 900px) {
       .navigation-bar { flex-direction: column; align-items: stretch; gap: 1rem; }
       .search-bar { width: 100%; }
       .row { grid-template-columns: 1fr; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FleetListComponent implements OnInit, OnDestroy, FilterableService<Vehicle> {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly vehicleService = inject(VehicleService);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  currentTheme = this.themeService.currentThemeData;

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
    { key: 'status', header: 'ESTADO', width: '120px' },
    { key: 'insuranceExpiry', header: 'SEGURO' },
    { key: 'itvExpiry', header: 'ITV' },
    { key: 'actions', header: '', width: '100px' },
  ];

  vehicles = signal<Vehicle[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  activeTab = signal('all');
  searchFilter = signal('');
  
  isModalOpen = signal(false);

  formData: Partial<Vehicle> = {
    plate: '', brand: '', model: '', year: new Date().getFullYear(),
    type: 'van', status: 'available', insuranceExpiry: '', itvExpiry: ''
  };

  ngOnInit() { 
    this.masterFilter.registerProvider(this);
    this.loadVehicles(); 
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
  }

  /** Lógica de filtrado para el MasterFilterService */
  filter(query: string): Observable<Vehicle[]> {
    const term = query.toLowerCase();
    const matches = this.vehicles().filter((v: Vehicle) => 
      v.plate.toLowerCase().includes(term) || 
      (v.brand ?? '').toLowerCase().includes(term) ||
      (v.model ?? '').toLowerCase().includes(term)
    );
    return of(matches);
  }

  loadVehicles() {
    this.isLoading.set(true);
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles: Vehicle[]) => {
        this.vehicles.set(vehicles);
        this.updateTabBadges(vehicles);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  updateTabBadges(vehicles: Vehicle[]) {
    const counts: Record<string, number> = {
      all: vehicles.length,
      available: vehicles.filter((v: Vehicle) => v.status === 'available').length,
      in_use: vehicles.filter((v: Vehicle) => v.status === 'in_use').length,
      maintenance: vehicles.filter((v: Vehicle) => v.status === 'maintenance').length,
    };
    this.tabs = this.tabs.map(tab => ({ ...tab, badge: counts[tab.id] || 0 }));
  }

  onTabChange(tabId: string) { this.activeTab.set(tabId); }
  onSearch(term: string) { 
    this.searchFilter.set(term); 
    this.masterFilter.search(term);
  }
  onPageChange(page: number) { this.currentPage.set(page); this.loadVehicles(); }

  openCreateModal() {
    this.formData = {
      plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      type: 'van',
      status: 'available',
      insuranceExpiry: '',
      itvExpiry: '',
      mileage: 0,
      capacity: 0,
    };
    this.isModalOpen.set(true);
  }

  onRowClick(vehicle: Vehicle) {
    this.router.navigate(['/fleet', vehicle.id]);
  }

  getInitials(plate: string): string {
    return (plate || 'V').slice(0, 2).toUpperCase();
  }

  getVehicleGradient(type: string): string {
    switch (type) {
      case 'van': return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'truck': return 'linear-gradient(135deg, #10b981, #059669)';
      default: return 'linear-gradient(135deg, #6b7280, #374151)';
    }
  }

  editVehicle(vehicle: Vehicle) {
    this.router.navigate(['/fleet', vehicle.id, 'edit']);
  }

  onDuplicate(vehicle: Vehicle) {
    const { id: _omitId, ...rest } = vehicle;
    void _omitId;
    this.vehicleService
      .createVehicle({
        ...rest,
        plate: `${vehicle.plate}-C`,
      } as Omit<Vehicle, 'id'>)
      .subscribe({
        next: (newV: Vehicle) => {
          this.vehicles.update((list) => [...list, newV]);
          this.updateTabBadges(this.vehicles());
          this.toast.show(`Unidad duplicada: ${newV.plate}`, 'success');
        },
        error: () =>
          this.toast.show('No se pudo duplicar la unidad.', 'error'),
      });
  }

  confirmDelete(vehicle: Vehicle) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el vehículo ${vehicle.plate}?`)) {
      return;
    }
    this.vehicleService.deleteVehicle(vehicle.id).subscribe({
      next: () => {
        this.vehicles.update((list) => list.filter((v) => v.id !== vehicle.id));
        this.updateTabBadges(this.vehicles());
        this.toast.show(`Unidad ${vehicle.plate} eliminada`, 'success');
      },
      error: () => {
        this.toast.show('No se pudo eliminar la unidad. Inténtalo de nuevo.', 'error');
      },
    });
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveVehicle() {
    if (!this.formData.plate?.trim()) {
      this.toast.show('Indica una matrícula válida', 'error');
      return;
    }
    this.vehicleService
      .createVehicle(this.formData as Omit<Vehicle, 'id'>)
      .subscribe({
        next: (newV: Vehicle) => {
          this.vehicles.update((list) => [...list, newV]);
          this.updateTabBadges(this.vehicles());
          this.toast.show(`Unidad ${newV.plate} registrada`, 'success');
          this.closeModal();
        },
        error: () =>
          this.toast.show('No se pudo registrar la unidad.', 'error'),
      });
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'van': return 'Furgón';
      case 'truck': return 'Camión';
      default: return 'Coche';
    }
  }

  getVehicleIcon(type: string): string {
    switch (type) {
      case 'van': return 'truck';
      case 'truck': return 'clapperboard'; // Custom icons
      default: return 'car';
    }
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'secondary' | 'primary' | 'danger' {
    switch (status) {
      case 'available': return 'success';
      case 'in_use': return 'warning';
      case 'maintenance': return 'info';
      default: return 'secondary';
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

  isExpired(date: string | undefined): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }

  maintenanceCount = computed(() => this.vehicles().filter((v: Vehicle) => v.status === 'maintenance').length);
  alertCount = computed(() => this.vehicles().filter((v: Vehicle) => this.isExpired(v.insuranceExpiry) || this.isExpired(v.itvExpiry)).length);

  displayedVehicles = computed(() => {
    let list = this.vehicles();
    const tab = this.activeTab();
    if (tab !== 'all') list = list.filter((v: Vehicle) => v.status === tab);
    const t = this.searchFilter().trim().toLowerCase();
    if (t) list = list.filter((v: Vehicle) => v.plate.toLowerCase().includes(t) || (v.brand || '').toLowerCase().includes(t));
    return list;
  });
}
