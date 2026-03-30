import { Component, OnInit, signal, inject, computed } from '@angular/core';
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
  UiStatCardComponent
} from '@josanz-erp/shared-ui-kit';
import { Client, ClientsFacade } from '@josanz-erp/clients-data-access';
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
    LucideAngularModule,
  ],
  template: `
    <div class="page-container animate-slide-up">
      <header class="page-header">
        <div class="header-breadcrumb">
          <h1 class="page-title text-uppercase">Directorio de Clientes</h1>
          <div class="breadcrumb">
            <span class="active">GESTIÓN COMERCIAL</span>
            <span class="separator">/</span>
            <span>BASE DE DATOS</span>
          </div>
        </div>
        <div class="header-actions">
          <ui-josanz-button variant="primary" size="md" (clicked)="openCreateModal()" icon="plus">
            NUEVO CLIENTE
          </ui-josanz-button>
        </div>
      </header>

      <div class="stats-row animate-slide-up">
        <ui-josanz-stat-card label="Total Clientes" [value]="clients().length.toString()" icon="users" [accent]="true"></ui-josanz-stat-card>
        <ui-josanz-stat-card label="Nuevos este mes" [value]="newClientsCount().toString()" icon="user-plus" [trend]="12"></ui-josanz-stat-card>
        <ui-josanz-stat-card label="Sectores Activos" [value]="activeSectorsCount().toString()" icon="briefcase"></ui-josanz-stat-card>
      </div>

      <div class="filters-bar">
        <ui-josanz-search 
          variant="filled"
          placeholder="BUSCAR CLEINTES POR NOMBRE O SECTOR..." 
          (searchChange)="onSearch($any($event))"
          class="flex-1 max-w-md"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <div class="loader-container">
          <ui-josanz-loader message="SINCRONIZANDO BASE DE DATOS..."></ui-josanz-loader>
        </div>
      } @else {
        <ui-josanz-card variant="glass" class="table-card ui-neon">
          <ui-josanz-table [columns]="columns" [data]="clients()" variant="default">
            <ng-template #cellTemplate let-client let-key="key">
              @switch (key) {
                @case ('name') {
                  <a [routerLink]="['/clients', client.id]" class="client-link">
                    {{ client.name | uppercase }}
                  </a>
                }
                @case ('sector') {
                  <ui-josanz-badge variant="info">{{ (client.sector || 'GENERAL') | uppercase }}</ui-josanz-badge>
                }
                @case ('createdAt') {
                  <span class="date-text font-mono">{{ formatDate(client.createdAt) }}</span>
                }
                @case ('actions') {
                  <div class="row-actions">
                    <ui-josanz-button variant="ghost" size="sm" icon="eye" [routerLink]="['/clients', client.id]" title="Detalles"></ui-josanz-button>
                    <ui-josanz-button variant="ghost" size="sm" icon="pencil" (clicked)="editClient(client)" title="Editar"></ui-josanz-button>
                    <ui-josanz-button variant="ghost" size="sm" icon="trash-2" (clicked)="confirmDelete(client)" title="Eliminar" class="btn-danger-ghost"></ui-josanz-button>
                  </div>
                }
                @default {
                  {{ client[key] }}
                }
              }
            </ng-template>
          </ui-josanz-table>

          <footer class="table-footer">
            <div class="table-info text-uppercase">
              {{ clients().length }} CLIENTES REGISTRADOS
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
           <div class="form-col">
             <label class="field-label" for="client-name">Nombre del Cliente *</label>
             <input 
               type="text" 
               id="client-name"
               class="technical-input"
               [(ngModel)]="formData.name" 
               name="name" 
               required
               placeholder="NOMBRE COMPLETO"
             >
           </div>
           
           <div class="form-col">
             <label class="field-label" for="client-sector">Sector Industrial</label>
             <input 
               type="text" 
               id="client-sector"
               class="technical-input"
               [(ngModel)]="formData.sector" 
               name="sector" 
               placeholder="SECTOR"
             >
           </div>
           
           <div class="form-col">
             <label class="field-label" for="client-contact">Contacto principal</label>
             <input 
               type="text" 
               id="client-contact"
               class="technical-input"
               [(ngModel)]="formData.contact" 
               name="contact" 
               placeholder="PERSONA DE CONTACTO"
             >
           </div>
           
           <div class="form-col">
             <label class="field-label" for="client-email">Correo Electrónico</label>
             <input 
               type="email" 
               id="client-email"
               class="technical-input"
               [(ngModel)]="formData.email" 
               name="email" 
               placeholder="EMAIL@SISTEMA.COM"
             >
           </div>
           
           <div class="form-col">
             <label class="field-label" for="client-phone">Teléfono</label>
             <input 
               type="tel" 
               id="client-phone"
               class="technical-input"
               [(ngModel)]="formData.phone" 
               name="phone" 
               placeholder="+34 000 000 000"
             >
           </div>
           
           <div class="form-col">
             <label class="field-label" for="client-address">Ubicación / Sede</label>
             <input 
               type="text" 
               id="client-address"
               class="technical-input"
               [(ngModel)]="formData.address" 
               name="address" 
               placeholder="DIRECCIÓN FÍSICA"
             >
           </div>
           
           <div class="form-col full-width">
             <label class="field-label" for="client-description">Observaciones Técnicas</label>
             <textarea 
               id="client-description"
               class="technical-textarea"
               [(ngModel)]="formData.description" 
               name="description" 
               rows="3"
               placeholder="NOTAS ADICIONALES"
             ></textarea>
           </div>
        </div>
      </div>
      
      <div modal-footer class="modal-footer">
        <ui-josanz-button variant="ghost" (clicked)="closeModal()">
          ABORTAR
        </ui-josanz-button>
        <ui-josanz-button 
          variant="primary"
          (clicked)="saveClient()"
          [disabled]="!formData.name"
        >
          {{ editingClient() ? 'ACTUALIZAR REGISTRO' : 'CONFIRMAR ALTA' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- Delete Confirmation Modal -->
    <ui-josanz-modal
      [isOpen]="isDeleteModalOpen()"
      title="ADVERTENCIA: ELIMINACIÓN DE REGISTRO"
      (closed)="closeDeleteModal()"
      variant="dark"
    >
      <div class="delete-warning">
        <lucide-icon name="alert-triangle" class="warning-icon"></lucide-icon>
        <div class="warning-content">
          <p>¿Estás seguro de que deseas eliminar el cliente <strong>{{ clientToDelete()?.name }}</strong>?</p>
          <p class="critical-text">ESTA ACCIÓN ES IRREVERSIBLE Y ELIMINARÁ TODOS LOS DATOS ASOCIADOS.</p>
        </div>
      </div>
      
      <div modal-footer>
        <ui-josanz-button variant="ghost" (clicked)="closeDeleteModal()">
          CANCELAR
        </ui-josanz-button>
        <ui-josanz-button variant="danger" (clicked)="deleteClient()">
          ELIMINAR DEFINITIVAMENTE
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>
  `,
  styles: [`
    .page-container { padding: 0; }
    
    .page-header {
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      margin-bottom: 1.15rem;
      border-bottom: 1px solid var(--border-soft);
      padding-bottom: 0.85rem;
    }
    
    .glow-text { 
      font-size: 1.35rem; 
      font-weight: 800; 
      color: #fff; 
      margin: 0; 
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-family: var(--font-main);
      text-shadow: 0 0 16px var(--brand-glow);
    }
    
    .subtitle { margin: 0.35rem 0 0 0; color: var(--text-secondary); font-size: 0.72rem; font-weight: 500; }
    
    .filters-bar { margin-bottom: 1rem; display: flex; }
    .flex-1 { flex: 1; }
    
    .client-link { 
      color: var(--brand); 
      text-decoration: none; 
      font-weight: 800; 
      text-transform: uppercase;
      letter-spacing: 0.05em;
      transition: all 0.2s;
    }
    .client-link:hover { color: #fff; text-shadow: 0 0 10px var(--brand-glow); }
    
    .date-text { color: var(--text-muted); font-size: 0.85rem; }
    
    .actions { display: flex; gap: 10px; }
    
    .action-trigger { 
      background: var(--bg-tertiary); 
      border: 1px solid var(--border-soft); 
      color: var(--text-muted); 
      cursor: pointer; 
      width: 34px;
      height: 34px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    
    .action-trigger:hover { 
      color: #fff; 
      border-color: var(--brand);
      background: var(--bg-secondary);
      box-shadow: 0 0 10px var(--brand-glow);
    }
    
    .action-trigger.danger:hover {
      border-color: var(--danger);
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
    }

    .pagination-wrapper {
      padding-top: 1rem;
      border-top: 1px solid var(--border-soft);
      margin-top: 1rem;
    }

    /* Form Styles */
    .form-container { padding: 1rem 0; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .form-col { display: flex; flex-direction: column; gap: 8px; }
    .form-col.full-width { grid-column: 1 / -1; }
    
    .field-label {
      font-size: 0.7rem;
      font-weight: 800;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    .technical-input, .technical-textarea {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      border-radius: 4px;
      padding: 12px 14px;
      color: #fff;
      font-size: 0.9rem;
      font-family: var(--font-main);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
    }
    
    .technical-input:focus, .technical-textarea:focus {
      border-color: var(--brand);
      background: var(--bg-secondary);
      box-shadow: 0 0 15px var(--brand-glow);
    }

    .delete-warning {
      display: flex;
      gap: 20px;
      align-items: center;
      padding: 1rem;
      background: rgba(239, 68, 68, 0.05);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 6px;
    }
    
    .warning-icon { color: var(--danger); width: 40px; height: 40px; }
    
    .critical-text {
      color: var(--danger);
      font-weight: 800;
      font-size: 0.75rem;
      margin-top: 8px;
    }

    .mr-2 { margin-right: 8px; }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .glow-text { font-size: 1.8rem; }
    }
  `],
})
export class ClientsListComponent implements OnInit {
  private readonly facade = inject(ClientsFacade);
  public readonly config = inject(CLIENTS_FEATURE_CONFIG);

  columns = this.config.defaultColumns;

  // Sync facade signals to the template
  clients = this.facade.clients;
  isLoading = this.facade.isLoading;
  currentPage = signal(1);
  totalPages = signal(1);
  searchTerm = '';
  
  // Modal state
  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  editingClient = signal<Client | null>(null);
  clientToDelete = signal<Client | null>(null);
  
  // Form data
  formData: Partial<Client> = {
    name: '',
    description: '',
    sector: '',
    contact: '',
    email: '',
    phone: '',
    address: ''
  };

  // Forms no longer need the ClientService in the constructor

  // Computed Metrics
  newClientsCount = computed(() => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return this.clients().filter(
      c => c.createdAt != null && new Date(c.createdAt) >= startOfMonth
    ).length;
  });

  activeSectorsCount = computed(() => {
    return new Set(this.clients().map(c => c.sector).filter(Boolean)).size;
  });

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.facade.loadClients();
  }

  onSearch(term: string) {
    this.searchTerm = term;
    if (term.trim()) {
      this.facade.searchClients(term);
    } else {
      this.facade.loadClients();
    }
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadClients();
  }

  openCreateModal() {
    this.editingClient.set(null);
    this.formData = {
      name: '',
      description: '',
      sector: '',
      contact: '',
      email: '',
      phone: '',
      address: ''
    };
    this.isModalOpen.set(true);
  }

  editClient(client: Client) {
    this.editingClient.set(client);
    this.formData = { ...client };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingClient.set(null);
  }

  saveClient() {
    if (!this.formData.name) return;

    const clientToEdit = this.editingClient();
    if (clientToEdit) {
      this.facade.updateClient(clientToEdit.id, this.formData);
      this.closeModal();
    } else {
      this.facade.createClient(this.formData as Omit<Client, 'id' | 'createdAt'>);
      this.closeModal();
    }
  }

  confirmDelete(client: Client) {
    this.clientToDelete.set(client);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.clientToDelete.set(null);
  }

  deleteClient() {
    const client = this.clientToDelete();
    if (!client) return;

    this.facade.deleteClient(client.id);
    this.closeDeleteModal();
  }

  formatDate(date: string | undefined): string {
    if (date == null || date === '') return '—';
    return new Date(date).toLocaleDateString('es-ES');
  }
}

