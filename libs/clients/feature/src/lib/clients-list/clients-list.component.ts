import { Component, OnInit, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
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
  UiStatCardComponent,
  UiInputComponent
} from '@josanz-erp/shared-ui-kit';
import { Client, ClientsFacade } from '@josanz-erp/clients-data-access';
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';
import { CLIENTS_FEATURE_CONFIG } from '../clients-feature.config';

@Component({
  selector: 'lib-clients-list',
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
    UiStatCardComponent,
    UiInputComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="page-container animate-fade-in" [class.perf-optimized]="pluginStore.highPerformanceMode()">
      <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
        <div class="header-breadcrumb">
          <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'">
            Directorio CRM / Clientes
          </h1>
          <div class="breadcrumb">
            <span class="active" [style.color]="currentTheme().primary">GESTIÓN COMERCIAL</span>
            <span class="separator">/</span>
            <span>BASE DE DATOS OPERATIVA</span>
          </div>
        </div>
        <div class="header-actions">
          <ui-josanz-button variant="glass" size="md" (clicked)="openCreateModal()" icon="plus">
            NUEVO REGISTRO
          </ui-josanz-button>
        </div>
      </header>

      <div class="stats-row">
        <ui-josanz-stat-card 
          label="Total Clientes" 
          [value]="clients().length.toString()" 
          icon="users" 
          [accent]="true">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Nuevos este mes" 
          [value]="newClientsCount().toString()" 
          icon="user-plus" 
          [trend]="12">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Sectores Activos" 
          [value]="activeSectorsCount().toString()" 
          icon="briefcase">
        </ui-josanz-stat-card>
      </div>

      <div class="filters-bar ui-glass-panel">
        <ui-josanz-search 
          variant="filled"
          placeholder="BUSCAR CLIENTES POR NOMBRE, SECTOR O CONTACTO..." 
          (searchChange)="onSearch($event)"
          class="flex-1 max-w-md"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <div class="loader-container">
          <ui-josanz-loader message="SINCRONIZANDO DIRECTORIO DE CLIENTES..."></ui-josanz-loader>
        </div>
      } @else {
        <ui-josanz-card variant="glass" class="table-card" [class.neon-glow]="!pluginStore.highPerformanceMode()">
          <ui-josanz-table [columns]="columns" [data]="clients()" variant="default">
            <ng-template #cellTemplate let-client let-key="key">
              @switch (key) {
                @case ('name') {
                  <a [routerLink]="['/clients', client.id]" class="client-link" [style.color]="currentTheme().primary">
                    {{ client.name | uppercase }}
                  </a>
                }
                @case ('sector') {
                  <ui-josanz-badge variant="info">{{ (client.sector || 'GENERAL') | uppercase }}</ui-josanz-badge>
                }
                @case ('actions') {
                  <div class="row-actions">
                    <ui-josanz-button variant="ghost" size="sm" icon="eye" [routerLink]="['/clients', client.id]"></ui-josanz-button>
                    <ui-josanz-button variant="ghost" size="sm" icon="pencil" (clicked)="editClient(client)"></ui-josanz-button>
                    <ui-josanz-button variant="ghost" size="sm" icon="trash-2" (clicked)="confirmDelete(client)" [style.color]="currentTheme().danger"></ui-josanz-button>
                  </div>
                }
                @default {
                  {{ client[key] }}
                }
              }
            </ng-template>
          </ui-josanz-table>

          <footer class="table-footer" [style.background]="currentTheme().primary + '05'">
            <div class="table-info uppercase">
              {{ clients().length }} REGISTROS EN DIRECTORIO
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
      [title]="editingClient() ? 'MODIFICACIÓN DE PERFIL CLIENTE' : 'ALTA DE NUEVO CLIENTE'"
      (closed)="closeModal()"
      variant="dark"
    >
      <div class="form-container">
        <div class="form-grid">
           <ui-josanz-input label="Nombre del Cliente *" [(ngModel)]="formData.name" icon="user" placeholder="NOMBRE COMPLETO" class="full-width"></ui-josanz-input>
           <ui-josanz-input label="Sector Industrial" [(ngModel)]="formData.sector" icon="briefcase" placeholder="SECTOR"></ui-josanz-input>
           <ui-josanz-input label="Contacto Principal" [(ngModel)]="formData.contact" icon="phone" placeholder="NOMBRE DE CONTACTO"></ui-josanz-input>
           <ui-josanz-input label="Email Corporativo" [(ngModel)]="formData.email" icon="mail" placeholder="EMAIL@SISTEMA.COM"></ui-josanz-input>
           <ui-josanz-input label="Teléfono Directo" [(ngModel)]="formData.phone" icon="smartphone" placeholder="+34 000 000 000"></ui-josanz-input>
           <ui-josanz-input label="Sede Comercial" [(ngModel)]="formData.address" icon="map-pin" placeholder="DIRECCIÓN FÍSICA" class="full-width"></ui-josanz-input>
        </div>
      </div>
      
      <div modal-footer class="modal-footer">
        <ui-josanz-button variant="ghost" (clicked)="closeModal()">ABORTAR</ui-josanz-button>
        <ui-josanz-button variant="glass" (clicked)="saveClient()" [disabled]="!formData.name">
          {{ editingClient() ? 'ACTUALIZAR REGISTRO' : 'CONFIRMAR ALTA' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>
  `,
  styles: [`
    .page-container { padding: 0; max-width: 100%; margin: 0 auto; }
    
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

    .filters-bar { 
      display: flex; gap: 1rem; margin-bottom: 1.5rem; padding: 0.75rem 1rem; border-radius: 12px;
      background: rgba(15, 15, 15, 0.4); border: 1px solid rgba(255,255,255,0.05);
    }
    
    .client-link { 
      text-decoration: none; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.05em; transition: 0.2s;
    }
    .client-link:hover { color: #fff !important; text-shadow: 0 0 10px var(--brand-glow); }
    
    .row-actions { display: flex; gap: 4px; }
    
    .table-card { border-radius: 16px; overflow: hidden; }
    .neon-glow { box-shadow: 0 0 40px rgba(0, 0, 0, 0.4), inset 0 0 1px rgba(255, 255, 255, 0.1); }

    .table-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.75rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.05);
    }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; padding: 1rem 0; }
    .full-width { grid-column: 1 / -1; }
    .modal-footer { display: flex; gap: 1rem; justify-content: flex-end; }

    @media (max-width: 1024px) {
      .stats-row { grid-template-columns: 1fr; }
      .form-grid { grid-template-columns: 1fr; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsListComponent implements OnInit {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly facade = inject(ClientsFacade);
  public readonly config = inject(CLIENTS_FEATURE_CONFIG);

  currentTheme = this.themeService.currentThemeData;
  columns = this.config.defaultColumns;

  clients = this.facade.clients;
  isLoading = this.facade.isLoading;
  currentPage = signal(1);
  totalPages = signal(1);
  
  isModalOpen = signal(false);
  editingClient = signal<Client | null>(null);
  
  formData: Partial<Client> = {
    name: '', description: '', sector: '', contact: '', email: '', phone: '', address: ''
  };

  newClientsCount = computed(() => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return this.clients().filter(c => c.createdAt != null && new Date(c.createdAt) >= startOfMonth).length;
  });

  activeSectorsCount = computed(() => new Set(this.clients().map(c => c.sector).filter(Boolean)).size);

  ngOnInit() { this.loadClients(); }
  loadClients() { this.facade.loadClients(); }

  onSearch(term: string) {
    if (term.trim()) this.facade.searchClients(term);
    else this.facade.loadClients();
  }

  onPageChange(page: number) { this.currentPage.set(page); this.loadClients(); }

  openCreateModal() {
    this.editingClient.set(null);
    this.formData = { name: '', description: '', sector: '', contact: '', email: '', phone: '', address: '' };
    this.isModalOpen.set(true);
  }

  editClient(client: Client) {
    this.editingClient.set(client);
    this.formData = { ...client };
    this.isModalOpen.set(true);
  }

  closeModal() { this.isModalOpen.set(false); this.editingClient.set(null); }

  saveClient() {
    if (!this.formData.name) return;
    const clientToEdit = this.editingClient();
    if (clientToEdit) this.facade.updateClient(clientToEdit.id, this.formData);
    else this.facade.createClient(this.formData as Omit<Client, 'id' | 'createdAt'>);
    this.closeModal();
  }

  confirmDelete(client: Client) {
    if (confirm(`¿Estás seguro de que deseas eliminar el cliente ${client.name}?`)) {
      this.facade.deleteClient(client.id);
    }
  }
}

