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
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';

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
          <ui-josanz-table [columns]="columns" [data]="services()" variant="default">
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
      min-height: 100vh;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
    }

    .header-breadcrumb {
      flex: 1;
    }

    .page-title {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: 0.025em;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      opacity: 0.8;
    }

    .separator {
      opacity: 0.5;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .filters-bar {
      margin-bottom: 1.5rem;
      padding: 1.25rem;
      border-radius: 0.75rem;
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
      background: linear-gradient(135deg, var(--primary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
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
export class ServicesListComponent implements OnInit {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);

  currentTheme = this.themeService.currentThemeData;
  services = signal<Service[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');

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

  ngOnInit() {
    this.loadServices();
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.loadServices();
  }

  onRowClick(service: Service) {
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
    return 'filled';
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

  private loadServices() {
    this.isLoading.set(true);
    // Simulate loading
    setTimeout(() => {
      this.services.set([
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
      ]);
      this.isLoading.set(false);
    }, 1000);
  }
}
