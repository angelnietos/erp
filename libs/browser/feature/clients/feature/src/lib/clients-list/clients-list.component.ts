import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiSearchComponent,
  UiLoaderComponent,
  UiModalComponent,
  UiInputComponent,
} from '@josanz-erp/shared-ui-kit';
import { take } from 'rxjs/operators';
import { Client, ClientsFacade } from '@josanz-erp/clients-data-access';
import {
  ThemeService,
  PluginStore,
  MasterFilterService,
  FilterableService,
  AIFormBridgeService,
} from '@josanz-erp/shared-data-access';
import { Observable, of, map } from 'rxjs';
import { CLIENTS_FEATURE_CONFIG } from '../clients-feature.config';

@Component({
  selector: 'lib-clients-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiButtonComponent,
    UiSearchComponent,
    UiLoaderComponent,
    UiModalComponent,
    UiInputComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="ns-clients">
      <div class="ns-header">
        <div class="ns-title-group">
          <h1 class="ns-title">Clientes</h1>
          <p class="ns-subtitle">Gestión comercial · Base de datos</p>
        </div>
        <ui-josanz-button
          variant="solid"
          size="md"
          (clicked)="openCreateModal()"
          icon="plus"
        >
          Nuevo
        </ui-josanz-button>
      </div>

      <div class="ns-stats">
        <div class="ns-stat">
          <div class="ns-stat-icon ns-blue">
            <lucide-icon name="users" size="20"></lucide-icon>
          </div>
          <div class="ns-stat-info">
            <span class="ns-stat-value">{{ clients().length }}</span>
            <span class="ns-stat-label">Clientes</span>
          </div>
        </div>
        <div class="ns-stat">
          <div class="ns-stat-icon ns-green">
            <lucide-icon name="user-plus" size="20"></lucide-icon>
          </div>
          <div class="ns-stat-info">
            <span class="ns-stat-value">{{ newClientsCount() }}</span>
            <span class="ns-stat-label">Nuevos mes</span>
          </div>
        </div>
        <div class="ns-stat">
          <div class="ns-stat-icon ns-orange">
            <lucide-icon name="briefcase" size="20"></lucide-icon>
          </div>
          <div class="ns-stat-info">
            <span class="ns-stat-value">{{ activeSectorsCount() }}</span>
            <span class="ns-stat-label">Sectores</span>
          </div>
        </div>
      </div>

      <div class="ns-search-bar">
        <ui-josanz-search
          variant="filled"
          placeholder="Buscar clientes..."
          (searchChange)="onSearch($event)"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <div class="ns-loading">
          <ui-josanz-loader message="Cargando..."></ui-josanz-loader>
        </div>
      } @else {
        <div class="ns-list">
          @for (client of filteredClients(); track client.id) {
            <div class="ns-card-item">
              <div class="ns-card-left">
                <div class="ns-avatar">{{ client.name.charAt(0) }}</div>
                <div class="ns-card-details">
                  <h3 class="ns-card-name">{{ client.name }}</h3>
                  <p class="ns-card-meta">
                    {{ client.sector || 'General' }} ·
                    {{ client.contact || 'Sin contacto' }}
                  </p>
                </div>
              </div>
              <div class="ns-card-actions">
                <ui-josanz-button
                  variant="ghost"
                  size="sm"
                  icon="eye"
                  [routerLink]="['/clients', client.id]"
                ></ui-josanz-button>
                <ui-josanz-button
                  variant="ghost"
                  size="sm"
                  icon="pencil"
                  (clicked)="editClient(client)"
                ></ui-josanz-button>
                <ui-josanz-button
                  variant="ghost"
                  size="sm"
                  icon="trash-2"
                  (clicked)="confirmDelete(client)"
                ></ui-josanz-button>
              </div>
            </div>
          } @empty {
            <div class="ns-empty">
              <lucide-icon name="users" size="48"></lucide-icon>
              <p>No hay clientes</p>
            </div>
          }
        </div>
      }
    </div>

    <ui-josanz-modal
      [isOpen]="isModalOpen()"
      [title]="editingClient() ? 'Editar' : 'Nuevo cliente'"
      (closed)="closeModal()"
      variant="dark"
    >
      <div class="ns-form">
        <ui-josanz-input
          label="Nombre"
          [(ngModel)]="formData.name"
          icon="user"
          placeholder="Nombre"
          class="ns-full"
        ></ui-josanz-input>
        <ui-josanz-input
          label="Sector"
          [(ngModel)]="formData.sector"
          icon="briefcase"
          placeholder="Sector"
        ></ui-josanz-input>
        <ui-josanz-input
          label="Contacto"
          [(ngModel)]="formData.contact"
          icon="phone"
          placeholder="Contacto"
        ></ui-josanz-input>
        <ui-josanz-input
          label="Email"
          [(ngModel)]="formData.email"
          icon="mail"
          placeholder="Email"
        ></ui-josanz-input>
        <ui-josanz-input
          label="Teléfono"
          [(ngModel)]="formData.phone"
          icon="phone"
          placeholder="Teléfono"
        ></ui-josanz-input>
        <ui-josanz-input
          label="Dirección"
          [(ngModel)]="formData.address"
          icon="map-pin"
          placeholder="Dirección"
          class="ns-full"
        ></ui-josanz-input>
      </div>
      <div class="ns-form-actions">
        <ui-josanz-button variant="ghost" (clicked)="closeModal()"
          >Cancelar</ui-josanz-button
        >
        <ui-josanz-button variant="solid" (clicked)="saveClient()">{{
          editingClient() ? 'Guardar' : 'Crear'
        }}</ui-josanz-button>
      </div>
    </ui-josanz-modal>
  `,
  styles: [
    `
      .ns-clients {
        padding: 1.5rem;
        max-width: 900px;
        margin: 0 auto;
      }

      .ns-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .ns-title-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .ns-title {
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0;
        color: var(--text-primary);
      }

      .ns-subtitle {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin: 0;
      }

      .ns-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .ns-stat {
        display: flex;
        align-items: center;
        gap: 0.875rem;
        padding: 1rem;
        background: var(--surface);
        border-radius: 12px;
        border: 1px solid var(--border-soft);
      }

      .ns-stat-icon {
        width: 42px;
        height: 42px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }

      .ns-blue {
        background: #3b82f6;
      }
      .ns-green {
        background: #10b981;
      }
      .ns-orange {
        background: #f59e0b;
      }

      .ns-stat-info {
        display: flex;
        flex-direction: column;
      }

      .ns-stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.1;
      }

      .ns-stat-label {
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      .ns-search-bar {
        margin-bottom: 1.5rem;
      }

      .ns-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .ns-card-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        background: var(--surface);
        border-radius: 12px;
        border: 1px solid var(--border-soft);
        transition: all 0.15s ease;
      }

      .ns-card-item:hover {
        border-color: var(--text-muted);
        transform: translateX(4px);
      }

      .ns-card-left {
        display: flex;
        align-items: center;
        gap: 0.875rem;
      }

      .ns-avatar {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: 700;
        font-size: 1rem;
      }

      .ns-card-details {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .ns-card-name {
        font-size: 0.95rem;
        font-weight: 600;
        margin: 0;
        color: var(--text-primary);
      }

      .ns-card-meta {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin: 0;
      }

      .ns-card-actions {
        display: flex;
        gap: 4px;
      }

      .ns-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        color: var(--text-muted);
        gap: 1rem;
      }

      .ns-loading {
        display: flex;
        justify-content: center;
        padding: 3rem;
      }

      .ns-form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        padding: 1rem 0;
      }

      .ns-full {
        grid-column: 1 / -1;
      }

      .ns-form-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        padding-top: 1rem;
      }

      @media (max-width: 640px) {
        .ns-stats {
          grid-template-columns: 1fr;
        }
        .ns-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
        .ns-form {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsListComponent
  implements OnInit, OnDestroy, FilterableService<Client>
{
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly facade = inject(ClientsFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly aiFormBridge = inject(AIFormBridgeService);
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
    name: '',
    description: '',
    sector: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
  };
  filteredClients = computed(() => {
    const list = this.clients();
    const t = this.masterFilter.query().trim().toLowerCase();
    if (!t) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(t) ||
        (c.sector ?? '').toLowerCase().includes(t) ||
        (c.contact ?? '').toLowerCase().includes(t) ||
        (c.email ?? '').toLowerCase().includes(t),
    );
  });

  newClientsCount = computed(() => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return this.clients().filter(
      (c) => c.createdAt != null && new Date(c.createdAt) >= startOfMonth,
    ).length;
  });

  activeSectorsCount = computed(
    () =>
      new Set(
        this.clients()
          .map((c) => c.sector)
          .filter(Boolean),
      ).size,
  );

  ngOnInit() {
    this.aiFormBridge.registerDataProxy(
      this.formData as Record<string, unknown>,
    );
    this.masterFilter.registerProvider(this);
    this.route.queryParamMap.pipe(take(1)).subscribe((q) => {
      const text = q.get('q')?.trim();
      if (text) {
        this.masterFilter.search(text);
      }
      this.loadClients();
    });
  }

  ngOnDestroy() {
    this.aiFormBridge.unregisterDataProxy(
      this.formData as Record<string, unknown>,
    );
    this.masterFilter.unregisterProvider();
  }

  /** Lógica de filtrado para el MasterFilterService */
  filter(query: string): Observable<Client[]> {
    const term = query.toLowerCase();
    const matches = this.clients().filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.sector ?? '').toLowerCase().includes(term) ||
        (c.contact ?? '').toLowerCase().includes(term),
    );
    return of(matches);
  }
  loadClients() {
    this.facade.loadClients();
  }

  onSearch(term: string) {
    this.masterFilter.search(term);
    // Siguiendo el patrón de alta reactividad, filtramos localmente vía filteredClients() a través del masterFilter
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
      address: '',
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
    if (clientToEdit) this.facade.updateClient(clientToEdit.id, this.formData);
    else
      this.facade.createClient(
        this.formData as Omit<Client, 'id' | 'createdAt'>,
      );
    this.closeModal();
  }

  confirmDelete(client: Client) {
    if (
      confirm(`¿Estás seguro de que deseas eliminar el cliente ${client.name}?`)
    ) {
      this.facade.deleteClient(client.id);
    }
  }
}
