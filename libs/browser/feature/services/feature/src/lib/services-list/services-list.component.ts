import { Component, OnInit, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
} from 'lucide-angular';
import {
  UiTableComponent,
  UiButtonComponent,
  UiSearchComponent,
  UiCardComponent,
  UiStatCardComponent,
  UiBadgeComponent,
  UiLoaderComponent,
} from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore, MasterFilterService, FilterableService } from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';

export interface Service {
  id: string;
  name: string;
  description?: string;
  type:
    | 'STREAMING'
    | 'PRODUCCIÓN'
    | 'LED'
    | 'TRANSPORTE'
    | 'PERSONAL_TÉCNICO'
    | 'VIDEO_TÉCNICO';
  basePrice: number;
  hourlyRate?: number;
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'lib-services-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiTableComponent,
    UiButtonComponent,
    UiSearchComponent,
    UiCardComponent,
    UiStatCardComponent,
    UiBadgeComponent,
    UiLoaderComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="page-container animate-fade-in" [class.perf-optimized]="pluginStore.highPerformanceMode()">
      <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
        <div class="header-breadcrumb">
          <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'">
            Catálogo de Servicios
          </h1>
          <div class="breadcrumb">
            <span class="active" [style.color]="currentTheme().primary">GESTIÓN OPERATIVA</span>
            <span class="separator">/</span>
            <span>SERVICIOS Y PRODUCTOS</span>
          </div>
        </div>
        <div class="header-actions">
          <ui-josanz-button variant="glass" size="md" routerLink="/services/new" icon="plus">
            NUEVO SERVICIO
          </ui-josanz-button>
        </div>
      </header>

      <div class="stats-row">
        <ui-josanz-stat-card 
          label="Total Servicios" 
          [value]="services().length.toString()" 
          icon="wrench" 
          [accent]="true">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Servicios Activos" 
          [value]="activeServicesCount().toString()" 
          icon="check-circle" 
          [trend]="15">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Tipos de Servicio" 
          [value]="serviceTypesCount().toString()" 
          icon="layers">
        </ui-josanz-stat-card>
      </div>

      <div class="filters-bar ui-glass-panel">
        <ui-josanz-search 
          variant="filled"
          placeholder="BUSCAR SERVICIOS POR NOMBRE O TIPO..." 
          (searchChange)="onSearchChange($event)"
          class="flex-1 max-w-md"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <div class="loader-container">
          <ui-josanz-loader message="CARGANDO CATÁLOGO DE SERVICIOS..."></ui-josanz-loader>
        </div>
      } @else {
        <ui-josanz-card variant="glass" class="table-card" [class.neon-glow]="!pluginStore.highPerformanceMode()">
          <ui-josanz-table [columns]="columns" [data]="filteredServices()" variant="default">
            <ng-template #cellTemplate let-service let-key="key">
              @switch (key) {
                @case ('name') {
                  <a [routerLink]="['/services', service.id]" class="service-link" [style.color]="currentTheme().primary">
                    {{ service.name | uppercase }}
                  </a>
                }
                @case ('type') {
                  <ui-josanz-badge [variant]="getTypeVariant(service.type)" [color]="getTypeColor(service.type)">
                    {{ service.type }}
                  </ui-josanz-badge>
                }
                @case ('isActive') {
                  <ui-josanz-badge [variant]="service.isActive ? 'filled' : 'outline'" [color]="service.isActive ? 'success' : 'default'">
                    {{ service.isActive ? 'ACTIVO' : 'INACTIVO' }}
                  </ui-josanz-badge>
                }
                @case ('basePrice') {
                  <span class="price-text">{{ service.basePrice | currency:'EUR':'symbol':'1.2-2' }}</span>
                }
                @case ('hourlyRate') {
                  <span class="price-text">{{ service.hourlyRate ? (service.hourlyRate | currency:'EUR':'symbol':'1.2-2') : '-' }}</span>
                }
                @case ('actions') {
                  <div class="row-actions">
                    <ui-josanz-button variant="ghost" size="sm" icon="eye" [routerLink]="['/services', service.id]"></ui-josanz-button>
                    <ui-josanz-button variant="ghost" size="sm" icon="pencil" (clicked)="editService(service)"></ui-josanz-button>
                    <ui-josanz-button variant="ghost" size="sm" icon="trash-2" (clicked)="confirmDelete(service)" [style.color]="currentTheme().danger"></ui-josanz-button>
                  </div>
                }
                @default {
                  {{ service[key] }}
                }
              }
            </ng-template>
          </ui-josanz-table>
        </ui-josanz-card>
      }
    </div>

  `,
  styles: [
    `
    .page-container {
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
      box-sizing: border-box;
    }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-end;
      margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .header-breadcrumb {
      flex: 1;
    }

    .page-title {
      margin: 0 0 0.5rem 0;
      font-size: clamp(1.5rem, 2vw, 2rem);
      font-weight: 800;
      letter-spacing: 0.04em;
      font-family: var(--font-display);
    }

    .breadcrumb {
      display: flex; gap: 8px; font-size: 0.75rem; font-weight: 800;
      letter-spacing: 0.15em; color: var(--text-muted); margin-top: 0.5rem;
      text-transform: uppercase;
    }

    .separator {
      opacity: 0.5;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .stats-row { 
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; 
    }

    .filters-bar { 
      display: flex; gap: 1rem; margin-bottom: 1.5rem; padding: 0.75rem 1rem; border-radius: 12px;
    }

    .table-card {
      overflow: hidden;
    }

    .price-text {
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .text-uppercase {
      text-transform: uppercase;
    }

    .glow-text { 
      font-size: clamp(1.5rem, 2vw, 2rem); font-weight: 800; color: #fff; margin: 0; 
      letter-spacing: 0.04em; font-family: var(--font-display);
    }

    .flex-1 {
      flex: 1;
    }

    .max-w-md {
      max-width: 28rem;
    }

    .service-link {
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s;
    }

    .service-link:hover {
      opacity: 0.8;
    }

    .row-actions {
      display: flex;
      gap: 0.5rem;
    }

    .loader-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3rem;
      background: rgba(255,255,255,0.05);
      border-radius: 0.75rem;
    }

    @media (max-width: 1024px) {
      .stats-row {
        grid-template-columns: 1fr;
      }
      .page-header {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesListComponent implements OnInit, FilterableService<Service> {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly masterFilter = inject(MasterFilterService);

  currentTheme = this.themeService.currentThemeData;
  services = signal<Service[]>([]);
  isLoading = signal(false);
  columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'description', header: 'Descripción' },
    { key: 'type', header: 'Tipo' },
    { key: 'basePrice', header: 'Precio Base' },
    { key: 'hourlyRate', header: 'Tarifa Horaria' },
    { key: 'isActive', header: 'Estado' },
    { key: 'createdAt', header: 'Creado' },
    { key: 'actions', header: 'Acciones' },
  ];

  activeServicesCount = computed(() => this.services().filter(s => s.isActive).length);
  serviceTypesCount = computed(() => new Set(this.services().map(s => s.type)).size);

  filteredServices = computed(() => {
    const list = this.services();
    const t = this.masterFilter.query().trim().toLowerCase();
    if (!t) return list;
    return list.filter(s => 
      s.name.toLowerCase().includes(t) || 
      (s.description ?? '').toLowerCase().includes(t) || 
      s.type.toLowerCase().includes(t)
    );
  });

  ngOnInit() {
    this.masterFilter.registerProvider(this);
    this.loadServices();
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
  }

  onSearchChange(term: string) {
    this.masterFilter.search(term);
  }

  filter(query: string): Observable<Service[]> {
    const term = query.toLowerCase();
    const matches = this.services().filter(s => 
      s.name.toLowerCase().includes(term) || 
      (s.description ?? '').toLowerCase().includes(term)
    );
    return of(matches);
  }

  onRowClick(service: Service) {
    void service;
    // Navigate to detail - implement when table supports rowClick
  }

  onDelete(service: Service) {
    // Implement delete logic
    console.log('Delete service:', service);
  }

  editService(service: Service) {
    // Implement edit logic
    console.log('Edit service:', service);
  }

  confirmDelete(service: Service) {
    if (confirm(`¿Estás seguro de que deseas eliminar el servicio ${service.name}?`)) {
      this.onDelete(service);
    }
  }

  getTypeVariant(type: string): 'filled' | 'outline' | 'ghost' {
    switch (type) {
      case 'STREAMING':
      case 'PRODUCCIÓN':
      case 'LED':
      case 'TRANSPORTE':
      case 'PERSONAL_TÉCNICO':
      case 'VIDEO_TÉCNICO':
        return 'filled';
      default:
        return 'outline';
    }
  }

  getTypeColor(type: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' {
    switch (type) {
      case 'STREAMING': return 'primary';
      case 'PRODUCCIÓN': return 'success';
      case 'LED': return 'warning';
      case 'TRANSPORTE': return 'info';
      case 'PERSONAL_TÉCNICO': return 'danger';
      case 'VIDEO_TÉCNICO': return 'info';
      default: return 'default';
    }
  }

  private initialServices: Service[] = [
    {
      id: '1',
      name: 'Servicio de Streaming Básico',
      description: 'Transmisión en vivo básica',
      type: 'STREAMING',
      basePrice: 500,
      hourlyRate: 50,
      isActive: true,
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      name: 'Producción Audio/Video Completa',
      description: 'Producción completa de eventos',
      type: 'PRODUCCIÓN',
      basePrice: 2000,
      hourlyRate: 150,
      isActive: true,
      createdAt: '2024-01-02',
    },
    {
      id: '3',
      name: 'Pantalla LED 4x3m Exterior',
      description: 'Instalación y soporte de pantalla LED P3.9',
      type: 'LED',
      basePrice: 1200,
      hourlyRate: 0,
      isActive: true,
      createdAt: '2024-02-10',
    },
    {
      id: '4',
      name: 'Transporte Logístico Pesado',
      description: 'Camión 12t para material audiovisual',
      type: 'TRANSPORTE',
      basePrice: 300,
      hourlyRate: 40,
      isActive: true,
      createdAt: '2024-02-15',
    },
  ];

  private loadServices() {
    this.isLoading.set(true);
    // Simulate loading
    setTimeout(() => {
      this.services.set(this.initialServices);
      this.isLoading.set(false);
    }, 600);
  }
}
