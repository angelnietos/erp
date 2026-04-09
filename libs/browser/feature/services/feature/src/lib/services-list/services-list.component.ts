import { Component, OnInit, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
} from 'lucide-angular';
import {
  UiButtonComponent,
  UiSearchComponent,
  UiStatCardComponent,
  UiLoaderComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
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
    UiButtonComponent,
    UiSearchComponent,
    UiStatCardComponent,
    UiLoaderComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="services-container">
      <ui-feature-header
        title="Servicios"
        subtitle="Catálogo de operaciones y tarifas vigentes"
        icon="wrench"
        actionLabel="NUEVO SERVICIO"
        routerLink="/services/new"
      ></ui-feature-header>

      <ui-feature-stats>
        <ui-stat-card 
          label="Total Servicios" 
          [value]="services().length.toString()" 
          icon="layers" 
          [accent]="true">
        </ui-stat-card>
        <ui-stat-card 
          label="Servicios Activos" 
          [value]="activeServicesCount().toString()" 
          icon="check-circle" 
          [trend]="15">
        </ui-stat-card>
        <ui-stat-card 
          label="Tipos de Oferta" 
          [value]="serviceTypesCount().toString()" 
          icon="layout">
        </ui-stat-card>
        <ui-stat-card
          label="Eficiencia"
          value="98.5%"
          icon="trending-up"
          [accent]="false"
        ></ui-stat-card>
      </ui-feature-stats>

      <div class="navigation-bar">
        <ui-search 
          variant="glass"
          placeholder="BUSCAR SERVICIOS POR NOMBRE O TIPO..." 
          (searchChange)="onSearchChange($event)"
          class="flex-1"
        ></ui-search>
      </div>

      @if (isLoading()) {
        <div class="loader-container">
          <ui-loader message="CARGANDO CATÁLOGO DE SERVICIOS..."></ui-loader>
        </div>
      } @else {
        <ui-feature-grid>
          @for (service of filteredServices(); track service.id) {
            <ui-feature-card
              [name]="service.name"
              [subtitle]="service.description || 'Sin descripción'"
              [avatarInitials]="getInitials(service.name)"
              [avatarBackground]="getTypeGradient(service.type)"
              [status]="service.isActive ? 'active' : 'offline'"
              [badgeLabel]="service.type"
              [badgeVariant]="getTypeBadgeVariant(service.type)"
              [showEdit]="true"
              [showDuplicate]="true"
              [showDelete]="true"
              (cardClicked)="onRowClick(service)"
              (editClicked)="onEdit(service)"
              (duplicateClicked)="onDuplicate(service)"
              (deleteClicked)="confirmDelete(service)"
              [footerItems]="[
                { icon: 'euro', label: 'Base: ' + (service.basePrice | currency:'EUR') },
                { icon: 'clock', label: 'Hora: ' + (service.hourlyRate ? (service.hourlyRate | currency:'EUR') : '-') }
              ]"
            >
              <div footer-extra class="service-extra-actions">
                 <ui-button variant="ghost" size="sm" icon="eye" [routerLink]="['/services', service.id]" title="Ver detalles"></ui-button>
              </div>
            </ui-feature-card>
          } @empty {
            <div class="empty-state">
              <lucide-icon name="wrench" size="64" class="empty-icon"></lucide-icon>
              <h3>Catálogo vacío</h3>
              <p>Comienza añadiendo servicios a tu lista comercial.</p>
              <ui-button variant="solid" routerLink="/services/new" icon="CirclePlus">Añadir servicio</ui-button>
            </div>
          }
        </ui-feature-grid>
      }
    </div>
  `,
  styles: [`
    .services-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .navigation-bar {
      margin-bottom: 2rem;
      background: var(--surface);
      padding: 0.75rem 1.5rem;
      border-radius: 16px;
      border: 1px solid var(--border-soft);
      display: flex;
    }

    .flex-1 { flex: 1; }

    .card-actions { display: flex; gap: 0.25rem; }
    .text-danger { color: var(--error) !important; }

    .loader-container { display: flex; justify-content: center; padding: 5rem; }

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

    @media (max-width: 900px) {
       .navigation-bar { padding: 1rem; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesListComponent implements OnInit, FilterableService<Service> {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly masterFilter = inject(MasterFilterService);

  currentTheme = this.themeService.currentThemeData;
  services = signal<Service[]>([]);
  isLoading = signal(false);

  private readonly router = inject(Router);

  onRowClick(service: Service) {
    this.router.navigate(['/services', service.id]);
  }

  onDuplicate(service: Service) {
    const newService: Service = {
      ...service,
      id: Math.random().toString(36).substring(7),
      name: `${service.name} (COPIA)`,
      createdAt: new Date().toISOString()
    };
    this.services.update(list => [newService, ...list]);
  }

  onEdit(service: Service) {
    this.router.navigate(['/services', service.id, 'edit']);
  }

  getInitials(name: string | undefined): string {
    return (name || 'S').slice(0, 2).toUpperCase();
  }

  getTypeGradient(type: string): string {
    switch (type) {
      case 'STREAMING': return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'PRODUCCIÓN': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'LED': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'TRANSPORTE': return 'linear-gradient(135deg, #6366f1, #4338ca)';
      case 'PERSONAL_TÉCNICO': return 'linear-gradient(135deg, #ec4899, #be185d)';
      default: return 'linear-gradient(135deg, #6b7280, #374151)';
    }
  }

  getTypeBadgeVariant(type: string): 'info' | 'success' | 'warning' | 'danger' | 'primary' | 'secondary' {
    switch (type) {
      case 'STREAMING': return 'info';
      case 'PRODUCCIÓN': return 'success';
      case 'LED': return 'warning';
      case 'TRANSPORTE': return 'info';
      case 'PERSONAL_TÉCNICO': return 'danger';
      default: return 'secondary';
    }
  }

  activeServicesCount = computed(() => this.services().filter((s: Service) => s.isActive).length);
  serviceTypesCount = computed(() => new Set(this.services().map((s: Service) => s.type)).size);

  filteredServices = computed(() => {
    const list = this.services();
    const t = this.masterFilter.query().trim().toLowerCase();
    if (!t) return list;
    return list.filter((s: Service) => 
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
    const matches = this.services().filter((s: Service) => 
      s.name.toLowerCase().includes(term) || 
      (s.description ?? '').toLowerCase().includes(term)
    );
    return of(matches);
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
