import { Component, OnInit, signal, inject } from '@angular/core';
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
  UiInputComponent, 
  UiTextareaComponent 
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
    UiInputComponent,
    UiTextareaComponent,
    LucideAngularModule
  ],
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
                    <lucide-icon name="eye"></lucide-icon>
                  </button>
                  <button class="action-btn" (click)="editClient(client)" title="Editar">
                    <lucide-icon name="pencil"></lucide-icon>
                  </button>
                  <button class="action-btn danger" (click)="confirmDelete(client)" title="Eliminar">
                    <lucide-icon name="trash-2"></lucide-icon>
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

    <!-- Create/Edit Modal -->
    <ui-josanz-modal 
      [isOpen]="isModalOpen()" 
      [title]="editingClient() ? 'Editar Cliente' : 'Nuevo Cliente'"
      (closed)="closeModal()"
    >
      <form (ngSubmit)="saveClient()" #clientForm="ngForm">
        <div class="form-grid">
          <div class="form-group">
            <label for="name">Nombre *</label>
            <input 
              type="text" 
              id="name"
              [(ngModel)]="formData.name" 
              name="name" 
              required
              placeholder="Nombre del cliente"
            >
          </div>
          
          <div class="form-group">
            <label for="sector">Sector</label>
            <input 
              type="text" 
              id="sector"
              [(ngModel)]="formData.sector" 
              name="sector" 
              placeholder="Sector del cliente"
            >
          </div>
          
          <div class="form-group">
            <label for="contact">Persona de Contacto</label>
            <input 
              type="text" 
              id="contact"
              [(ngModel)]="formData.contact" 
              name="contact" 
              placeholder="Nombre del contacto"
            >
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email"
              [(ngModel)]="formData.email" 
              name="email" 
              placeholder="email@ejemplo.com"
            >
          </div>
          
          <div class="form-group">
            <label for="phone">Teléfono</label>
            <input 
              type="tel" 
              id="phone"
              [(ngModel)]="formData.phone" 
              name="phone" 
              placeholder="+34 600 000 000"
            >
          </div>
          
          <div class="form-group">
            <label for="address">Dirección</label>
            <input 
              type="text" 
              id="address"
              [(ngModel)]="formData.address" 
              name="address" 
              placeholder="Dirección"
            >
          </div>
          
          <div class="form-group full-width">
            <label for="description">Descripción</label>
            <textarea 
              id="description"
              [(ngModel)]="formData.description" 
              name="description" 
              rows="3"
              placeholder="Descripción del cliente"
            ></textarea>
          </div>
        </div>
      </form>
      
      <div modal-footer>
        <ui-josanz-button variant="secondary" (clicked)="closeModal()">
          Cancelar
        </ui-josanz-button>
        <ui-josanz-button 
          (clicked)="saveClient()"
          [disabled]="!formData.name"
        >
          {{ editingClient() ? 'Actualizar' : 'Crear' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>

    <!-- Delete Confirmation Modal -->
    <ui-josanz-modal
      [isOpen]="isDeleteModalOpen()"
      title="Confirmar Eliminación"
      (closed)="closeDeleteModal()"
    >
      <p>¿Estás seguro de que deseas eliminar el cliente <strong>{{ clientToDelete()?.name }}</strong>?</p>
      <p class="warning-text">Esta acción no se puede deshacer.</p>
      
      <div modal-footer>
        <ui-josanz-button variant="secondary" (clicked)="closeDeleteModal()">
          Cancelar
        </ui-josanz-button>
        <ui-josanz-button variant="danger" (clicked)="deleteClient()">
          Eliminar
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>
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
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group.full-width {
      grid-column: 1 / -1;
    }
    .form-group label {
      color: #94A3B8;
      font-size: 13px;
      font-weight: 500;
    }
    .form-group input,
    .form-group textarea {
      background: #0F172A;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px 12px;
      color: white;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #4F46E5;
    }
    .form-group input::placeholder,
    .form-group textarea::placeholder {
      color: #64748B;
    }
    .warning-text {
      color: #EF4444;
      font-size: 14px;
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

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES');
  }
}

