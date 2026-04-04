import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Plus,
  Search,
  Edit,
  Trash2,
} from 'lucide-angular';
import {
  UiTableComponent,
  UiButtonComponent,
  UiSearchComponent,
  UiBadgeComponent,
  UiLoaderComponent,
} from '@josanz-erp/shared-ui-kit';

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
    UiBadgeComponent,
    UiLoaderComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">Servicios</h1>
          <p class="page-subtitle">Gestión de catálogo de servicios</p>
        </div>
        <div class="header-actions">
          <lib-ui-button
            variant="primary"
            [icon]="Plus"
            routerLink="/services/new"
          >
            Nuevo Servicio
          </lib-ui-button>
        </div>
      </header>

      <div class="content-section">
        <div class="filters-section">
          <lib-ui-search
            placeholder="Buscar servicios..."
            (searchChange)="onSearchChange($event)"
          >
          </lib-ui-search>
        </div>

        <div class="table-section">
          <lib-ui-table
            [data]="services()"
            [columns]="columns"
            [loading]="loading()"
            (rowClick)="onRowClick($event)"
          >
            <ng-template #actionsTemplate let-service>
              <div class="action-buttons">
                <lib-ui-button
                  variant="ghost"
                  size="sm"
                  [icon]="Edit"
                  [routerLink]="['/services', service.id]"
                >
                  Editar
                </lib-ui-button>
                <lib-ui-button
                  variant="ghost"
                  size="sm"
                  [icon]="Trash2"
                  (click)="onDelete(service)"
                >
                  Eliminar
                </lib-ui-button>
              </div>
            </ng-template>
          </lib-ui-table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .header-content h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 600;
        color: #111827;
      }

      .header-content p {
        margin: 0.5rem 0 0 0;
        color: #6b7280;
      }

      .content-section {
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      }

      .filters-section {
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .table-section {
        padding: 1.5rem;
      }

      .action-buttons {
        display: flex;
        gap: 0.5rem;
      }
    `,
  ],
})
export class ServicesListComponent implements OnInit {
  private readonly Plus = Plus;
  private readonly Search = Search;
  private readonly Edit = Edit;
  private readonly Trash2 = Trash2;

  services = signal<Service[]>([]);
  loading = signal(false);
  searchTerm = signal('');

  columns = [
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'description', label: 'Descripción', sortable: false },
    { key: 'type', label: 'Tipo', sortable: true },
    { key: 'basePrice', label: 'Precio Base', sortable: true },
    { key: 'hourlyRate', label: 'Tarifa Horaria', sortable: true },
    { key: 'isActive', label: 'Activo', sortable: true },
    { key: 'createdAt', label: 'Creado', sortable: true },
    { key: 'actions', label: 'Acciones', template: 'actionsTemplate' },
  ];

  ngOnInit() {
    this.loadServices();
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.loadServices();
  }

  onRowClick(service: Service) {
    // Navigate to detail
  }

  onDelete(service: Service) {
    // Implement delete logic
    console.log('Delete service:', service);
  }

  private loadServices() {
    // Mock data for now
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
  }
}
