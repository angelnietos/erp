import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiTableComponent, UiButtonComponent, UiSearchComponent, UiPaginationComponent, UiBadgeComponent, UiLoaderComponent, UiTabsComponent, TabItem } from '@josanz-erp/shared-ui-kit';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  type: 'van' | 'truck' | 'car';
  status: 'available' | 'in_use' | 'maintenance';
  currentDriver?: string;
  insuranceExpiry: string;
  itvExpiry: string;
  imageUrl?: string;
}

@Component({
  selector: 'lib-fleet-list',
  standalone: true,
  imports: [CommonModule, RouterModule, UiTableComponent, UiButtonComponent, UiSearchComponent, UiPaginationComponent, UiBadgeComponent, UiLoaderComponent, UiTabsComponent],
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

      <ui-josanz-tabs [tabs]="tabs" [activeTab]="activeTab()" (tabChange)="onTabChange($event)"></ui-josanz-tabs>

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
                    <i-lucide name="eye"></i-lucide>
                  </button>
                  <button class="action-btn" title="Editar">
                    <i-lucide name="pencil"></i-lucide>
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
  `],
})
export class FleetListComponent implements OnInit {
  tabs: TabItem[] = [
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

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.isLoading.set(true);
    setTimeout(() => {
      this.vehicles.set([
        {
          id: 'veh-001',
          plate: '1234-ABC',
          brand: 'Mercedes',
          model: 'Sprinter 316',
          year: 2022,
          type: 'van',
          status: 'available',
          insuranceExpiry: '2026-12-31',
          itvExpiry: '2026-06-15',
        },
        {
          id: 'veh-002',
          plate: '5678-BCD',
          brand: 'Ford',
          model: 'Transit',
          year: 2021,
          type: 'van',
          status: 'in_use',
          currentDriver: 'Carlos Rodríguez',
          insuranceExpiry: '2026-08-20',
          itvExpiry: '2026-04-10',
        },
        {
          id: 'veh-003',
          plate: '9012-DEF',
          brand: 'Iveco',
          model: 'Daily',
          year: 2020,
          type: 'truck',
          status: 'maintenance',
          insuranceExpiry: '2026-05-15',
          itvExpiry: '2026-03-01',
        },
      ]);
      this.isLoading.set(false);
      this.totalPages.set(1);
    }, 500);
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

  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
  }

  onSearch(term: string) {
    this.searchTerm = term;
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadVehicles();
  }

  openCreateModal() {
    // TODO
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES');
  }
}