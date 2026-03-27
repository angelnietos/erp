import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiTableComponent, UiButtonComponent, UiSearchComponent, UiPaginationComponent, UiBadgeComponent, UiLoaderComponent } from '@josanz-erp/shared-ui-kit';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ClientService } from '@josanz-erp/clients-data-access';

export interface Client {
  id: string;
  name: string;
  description: string;
  sector: string;
  contact: string;
  email: string;
  phone: string;
  createdAt: string;
}

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    UiTableComponent, 
    UiButtonComponent, 
    UiSearchComponent, 
    UiPaginationComponent, 
    UiBadgeComponent,
    UiLoaderComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Clientes</h1>
          <p class="subtitle">Gestiona los clientes de la empresa</p>
        </div>
        <ui-josanz-button icon="plus" (clicked)="openCreateModal()">
          Nuevo Cliente
        </ui-josanz-button>
      </div>

      <div class="filters-bar">
        <ui-josanz-search 
          placeholder="Buscar clientes..." 
          (searchChange)="onSearch($event)"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <ui-josanz-loader message="Cargando clientes..."></ui-josanz-loader>
      } @else {
        <ui-josanz-table [columns]="columns" [data]="clients()">
          <ng-template #cellTemplate let-client let-key="key">
            @switch (key) {
              @case ('name') {
                <a [routerLink]="['/clients', client.id]" class="client-link">
                  {{ client.name }}
                </a>
              }
              @case ('sector') {
                <ui-josanz-badge>{{ client.sector }}</ui-josanz-badge>
              }
              @case ('createdAt') {
                {{ formatDate(client.createdAt) }}
              }
              @case ('actions') {
                <div class="actions">
                  <button class="action-btn" [routerLink]="['/clients', client.id]" title="Ver">
                    <i-lucide name="eye"></i-lucide>
                  </button>
                  <button class="action-btn" title="Editar">
                    <i-lucide name="pencil"></i-lucide>
                  </button>
                  <button class="action-btn danger" title="Eliminar">
                    <i-lucide name="trash-2"></i-lucide>
                  </button>
                </div>
              }
              @default {
                {{ client[key] }}
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
    .filters-bar { display: flex; gap: 16px; margin-bottom: 20px; }
    .client-link { color: #4F46E5; text-decoration: none; font-weight: 500; }
    .client-link:hover { text-decoration: underline; }
    .actions { display: flex; gap: 8px; }
    .action-btn {
      background: none; border: none; padding: 6px; cursor: pointer;
      color: #94A3B8; border-radius: 6px; transition: all 0.2s;
    }
    .action-btn:hover { background: rgba(255,255,255,0.1); color: white; }
    .action-btn.danger:hover { background: rgba(239,68,68,0.15); color: #EF4444; }
  `],
})
export class ClientsListComponent implements OnInit {
  columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'sector', header: 'Sector' },
    { key: 'contact', header: 'Contacto' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Teléfono' },
    { key: 'createdAt', header: 'Fecha Alta' },
    { key: 'actions', header: '', width: '120px' },
  ];

  clients = signal<Client[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  searchTerm = '';

  constructor(private clientService: ClientService) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.isLoading.set(true);
    // Mock data for now - will integrate with API
    setTimeout(() => {
      this.clients.set([
        {
          id: '1',
          name: 'Producciones Audiovisuales Madrid',
          description: 'Empresa de producción audiovisual',
          sector: 'Producción',
          contact: 'Juan García',
          email: 'juan@produccionesmadrid.es',
          phone: '+34 612 345 678',
          createdAt: '2026-01-15',
        },
        {
          id: '2',
          name: 'Cadena TV España',
          description: 'Televisión nacional',
          sector: 'Medios',
          contact: 'María López',
          email: 'maria@tvspain.es',
          phone: '+34 611 234 567',
          createdAt: '2026-02-01',
        },
        {
          id: '3',
          name: 'Film Studios Barcelona',
          description: 'Estudios cinematográficos',
          sector: 'Cine',
          contact: 'Carlos Rodríguez',
          email: 'carlos@filmstudios.es',
          phone: '+34 610 987 654',
          createdAt: '2026-02-10',
        },
      ]);
      this.isLoading.set(false);
      this.totalPages.set(1);
    }, 500);
  }

  onSearch(term: string) {
    this.searchTerm = term;
    // Implement search logic
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadClients();
  }

  openCreateModal() {
    // TODO: Open create client modal
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES');
  }
}