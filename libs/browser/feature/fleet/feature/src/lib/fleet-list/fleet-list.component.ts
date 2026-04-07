import { Component, OnInit, OnDestroy, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
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
  UiStatCardComponent,
  UIAIChatComponent
} from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore, MasterFilterService, FilterableService } from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';
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
    UiStatCardComponent,
    UiStatCardComponent,
    LucideAngularModule,
    UIAIChatComponent
  ],
  template: `
    <div class="page-container animate-fade-in" [class.high-perf]="pluginStore.highPerformanceMode()">
      <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
        <div class="header-breadcrumb">
          <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '66'">
            Gestión de Flota Logística
          </h1>
          <div class="breadcrumb">
            <span class="active" [style.color]="currentTheme().primary">UNIDADES LOGÍSTICAS</span>
            <span class="separator">/</span>
            <span>MONITOREO DE MOVILIDAD</span>
          </div>
        </div>
        <div class="header-actions">
          <ui-josanz-button variant="app" size="md" (clicked)="openCreateModal()" icon="plus">
            NUEVA UNIDAD
          </ui-josanz-button>
        </div>
      </header>

      <div class="stats-row">
        <ui-josanz-stat-card 
          label="Unidades Activas" 
          [value]="vehicles().length.toString()" 
          icon="truck" 
          [accent]="true">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="En Mantenimiento" 
          [value]="maintenanceCount().toString()" 
          icon="wrench" 
          [trend]="-2">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Alertas Técnicas" 
          [value]="alertCount().toString()" 
          icon="alert-triangle" 
          [class.text-danger]="alertCount() > 0">
        </ui-josanz-stat-card>
      </div>

      <div class="navigation-bar ui-glass-panel">
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
        <ui-josanz-card variant="glass" class="table-card" [class.neon-glow]="!pluginStore.highPerformanceMode()">
          <ui-josanz-table [columns]="columns" [data]="displayedVehicles()" variant="default">
            <ng-template #cellTemplate let-vehicle let-key="key">
              @switch (key) {
                @case ('plate') {
                  <div class="vehicle-cell">
                    <div class="vehicle-icon" [style.background]="currentTheme().primary + '15'">
                      <lucide-icon [name]="getVehicleIcon(vehicle.type)" [size]="14" [style.color]="currentTheme().primary"></lucide-icon>
                    </div>
                    <a [routerLink]="['/fleet', vehicle.id]" class="vehicle-link text-uppercase">
                      {{ vehicle.plate }}
                    </a>
                  </div>
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
                    <ui-josanz-button variant="ghost" size="sm" icon="eye" [routerLink]="['/fleet', vehicle.id]"></ui-josanz-button>
                    <ui-josanz-button variant="ghost" size="sm" icon="pencil" (clicked)="editVehicle(vehicle)"></ui-josanz-button>
                  </div>
                }
                @default {
                  {{ vehicle[key] }}
                }
              }
            </ng-template>
          </ui-josanz-table>

          <footer class="table-footer" [style.background]="currentTheme().primary + '05'">
            <div class="table-info uppercase">
              {{ displayedVehicles().length }} UNIDADES EN RANGO OPERATIVO
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
          <h3 class="section-title text-uppercase" [style.color]="currentTheme().primary">Especificaciones Técnicas</h3>
          <div class="input-grid">
            <ui-josanz-input label="Matrícula" [(ngModel)]="formData.plate" icon="hash"></ui-josanz-input>
            <ui-josanz-input label="Marca" [(ngModel)]="formData.brand" icon="car"></ui-josanz-input>
            <ui-josanz-input label="Modelo" [(ngModel)]="formData.model" icon="box"></ui-josanz-input>
            <ui-josanz-input label="Año" type="number" [(ngModel)]="formData.year" icon="calendar"></ui-josanz-input>
          </div>
        </div>
      </div>
      
      <div modal-footer class="modal-actions">
        <ui-josanz-button variant="ghost" (clicked)="closeModal()">CANCELAR</ui-josanz-button>
        <ui-josanz-button variant="glass" (clicked)="saveVehicle()" [disabled]="!formData.plate">
          {{ editingVehicle() ? 'ACTUALIZAR FICHA' : 'REGISTRAR UNIDAD' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <ui-josanz-ai-assistant feature="fleet"></ui-josanz-ai-assistant>
  `,
  styles: [`
    .page-container { padding: 0 120px 0 0; max-width: 100%; margin: 0 auto; }
    
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-end;
      margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .glow-text { 
      font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0; 
      letter-spacing: 0.05em; font-family: var(--font-main);
    }
    
    .breadcrumb {
      display: flex; gap: 8px; font-size: 0.6rem; font-weight: 700;
      letter-spacing: 0.1em; color: var(--text-muted); margin-top: 0.5rem;
    }
    
    .stats-row { 
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; 
    }

    .navigation-bar { 
      display: flex; justify-content: space-between; align-items: center; 
      margin-bottom: 1.5rem; padding: 0.25rem 1rem; border-radius: 12px;
      background: rgba(15, 15, 15, 0.4); border: 1px solid rgba(255,255,255,0.05);
    }

    .search-bar { width: 320px; }
    
    /* Table Luxe Refinement */
    .table-card { border-radius: 16px; overflow: hidden; }
    .neon-glow { box-shadow: 0 0 40px rgba(0, 0, 0, 0.4), inset 0 0 1px rgba(255, 255, 255, 0.1); }

    .vehicle-cell { display: flex; align-items: center; gap: 12px; }
    .vehicle-icon {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .vehicle-link { 
      color: #fff; text-decoration: none; font-weight: 700; font-size: 0.8rem;
      letter-spacing: 0.05em; transition: 0.2s;
    }
    .vehicle-link:hover { color: var(--brand); text-shadow: 0 0 10px var(--brand-glow); }
    
    .overdue { color: var(--danger); font-weight: 800; }
    .row-actions { display: flex; gap: 4px; }
    
    .table-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.75rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.05);
    }

    .form-section { display: flex; flex-direction: column; gap: 1.5rem; }
    .section-title { font-size: 0.7rem; font-weight: 900; letter-spacing: 0.15em; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .input-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }

    @media (max-width: 1024px) {
      .stats-row { grid-template-columns: 1fr; }
      .navigation-bar { flex-direction: column; align-items: stretch; gap: 1rem; padding: 1rem; }
      .search-bar { width: 100%; }
      .input-grid { grid-template-columns: 1fr; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FleetListComponent implements OnInit, OnDestroy, FilterableService<Vehicle> {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly vehicleService = inject(VehicleService);
  private readonly masterFilter = inject(MasterFilterService);

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
  editingVehicle = signal<Vehicle | null>(null);
  
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
    const matches = this.vehicles().filter(v => 
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
    const counts = {
      all: vehicles.length,
      available: vehicles.filter(v => v.status === 'available').length,
      in_use: vehicles.filter(v => v.status === 'in_use').length,
      maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    };
    this.tabs = this.tabs.map(tab => ({ ...tab, badge: counts[tab.id as keyof typeof counts] }));
  }

  onTabChange(tabId: string) { this.activeTab.set(tabId); }
  onSearch(term: string) { 
    this.searchFilter.set(term); 
    this.masterFilter.search(term);
  }
  onPageChange(page: number) { this.currentPage.set(page); this.loadVehicles(); }

  openCreateModal() {
    this.editingVehicle.set(null);
    this.formData = { plate: '', brand: '', model: '', year: new Date().getFullYear(), type: 'van', status: 'available' };
    this.isModalOpen.set(true);
  }

  editVehicle(vehicle: Vehicle) {
    this.editingVehicle.set(vehicle);
    this.formData = { ...vehicle };
    this.isModalOpen.set(true);
  }

  closeModal() { this.isModalOpen.set(false); this.editingVehicle.set(null); }

  saveVehicle() {
    if (!this.formData.plate) return;
    const vehicleToEdit = this.editingVehicle();
    if (vehicleToEdit) {
      this.vehicleService.updateVehicle(vehicleToEdit.id, this.formData).subscribe({
        next: (updated) => {
          this.vehicles.update(list => list.map(v => v.id === updated.id ? updated : v));
          this.closeModal();
        }
      });
    } else {
      this.vehicleService.createVehicle(this.formData as Omit<Vehicle, 'id'>).subscribe({
        next: (newV) => { 
          this.vehicles.update(list => [...list, newV]);
          this.closeModal();
        }
      });
    }
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

  maintenanceCount = computed(() => this.vehicles().filter(v => v.status === 'maintenance').length);
  alertCount = computed(() => this.vehicles().filter(v => this.isExpired(v.insuranceExpiry) || this.isExpired(v.itvExpiry)).length);

  displayedVehicles = computed(() => {
    let list = this.vehicles();
    const tab = this.activeTab();
    if (tab !== 'all') list = list.filter((v) => v.status === tab);
    const t = this.searchFilter().trim().toLowerCase();
    if (t) list = list.filter((v) => v.plate.toLowerCase().includes(t) || (v.brand || '').toLowerCase().includes(t));
    return list;
  });
}
