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
import { LucideAngularModule, PlusCircle, ArrowUp } from 'lucide-angular';
import {
  UiButtonComponent,
  UiSearchComponent,
  UiLoaderComponent,
  UiModalComponent,
  UiInputComponent,
  UiBadgeComponent,
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
    UiBadgeComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="clients-container">
      <!-- Header Section -->
      <div class="clients-header">
        <div class="header-content">
          <div class="header-title-section">
            <div class="title-icon">
              <lucide-icon name="building-2" size="32"></lucide-icon>
            </div>
            <div class="title-text">
              <h1 class="main-title">Clientes</h1>
              <p class="subtitle">Gestión completa de tu cartera de clientes</p>
            </div>
          </div>
          <div class="header-actions">
            <ui-button
              variant="solid"
              size="md"
              (clicked)="openCreateModal()"
              icon="plus-circle"
              class="create-btn"
            >
              Nuevo Cliente
            </ui-button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card stat-primary">
          <div class="stat-icon">
            <lucide-icon name="users" size="24"></lucide-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ clients().length }}</div>
            <div class="stat-label">Total Clientes</div>
            <div class="stat-trend">
              <lucide-icon name="trending-up" size="14"></lucide-icon>
              <span>+12% este mes</span>
            </div>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon">
            <lucide-icon name="user-plus" size="24"></lucide-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ newClientsCount() }}</div>
            <div class="stat-label">Nuevos este mes</div>
            <div class="stat-trend">
              <lucide-icon name="trending-up" size="14"></lucide-icon>
              <span>+8% vs mes anterior</span>
            </div>
          </div>
        </div>

        <div class="stat-card stat-warning">
          <div class="stat-icon">
            <lucide-icon name="briefcase" size="24"></lucide-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ activeSectorsCount() }}</div>
            <div class="stat-label">Sectores activos</div>
            <div class="stat-trend">
              <lucide-icon name="activity" size="14"></lucide-icon>
              <span>Diversificación</span>
            </div>
          </div>
        </div>

        <div class="stat-card stat-info">
          <div class="stat-icon">
            <lucide-icon name="dollar-sign" size="24"></lucide-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ totalRevenue() | number:'1.0-0' }}€</div>
            <div class="stat-label">Ingresos totales</div>
            <div class="stat-trend">
              <lucide-icon name="trending-up" size="14"></lucide-icon>
              <span>+15% crecimiento</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="controls-section">
        <div class="search-container">
          <ui-search
            variant="glass"
            placeholder="Buscar por nombre, sector o contacto..."
            (searchChange)="onSearch($event)"
            class="search-input"
          ></ui-search>
        </div>
        <div class="filter-buttons">
          <ui-button variant="ghost" size="sm" icon="filter" class="filter-btn">
            Filtros
          </ui-button>
          <ui-button variant="ghost" size="sm" icon="sort-asc" class="sort-btn">
            Ordenar
          </ui-button>
        </div>
      </div>

      <!-- Clients Grid -->
      @if (isLoading()) {
        <div class="loading-container">
          <ui-loader message="Cargando clientes..."></ui-loader>
        </div>
      } @else {
        <div class="clients-grid">
          @for (client of filteredClients(); track client.id) {
            <div class="client-card" (click)="goToDetail(client)">
              <div class="card-header">
                <div class="client-avatar">
                  <div class="avatar-initials">{{ getInitials(client.name) }}</div>
                  <div class="avatar-status" [class.active]="getClientStatus(client) === 'active'"></div>
                </div>
                <div class="client-actions">
                  <ui-button
                    variant="ghost"
                    size="sm"
                    icon="more-vertical"
                    (click)="$event.stopPropagation(); openClientMenu(client, $event)"
                    class="menu-btn"
                  ></ui-button>
                </div>
              </div>

              <div class="card-content">
                <div class="client-info">
                  <h3 class="client-name">{{ client.name }}</h3>
                  <div class="client-meta">
                    <ui-badge variant="secondary" size="sm">{{ client.sector || 'General' }}</ui-badge>
                    <span class="client-contact">{{ client.contact || 'Sin contacto' }}</span>
                  </div>
                </div>

                <div class="client-stats">
                  <div class="stat-item">
                    <lucide-icon name="briefcase" size="16"></lucide-icon>
                    <span>{{ getClientProjects(client) }} proyectos</span>
                  </div>
                  <div class="stat-item">
                    <lucide-icon name="dollar-sign" size="16"></lucide-icon>
                    <span>{{ getClientRevenue(client) | number:'1.0-0' }}€</span>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <div class="client-date">
                  <lucide-icon name="calendar" size="14"></lucide-icon>
                  <span>Cliente desde {{ formatDate(client.createdAt) }}</span>
                </div>
                <div class="client-rating">
                  <lucide-icon name="star" size="14" [class.filled]="true"></lucide-icon>
                  <span>{{ getClientRating(client) }}/5</span>
                </div>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <div class="empty-icon">
                <lucide-icon name="users" size="64"></lucide-icon>
              </div>
              <div class="empty-content">
                <h3 class="empty-title">No hay clientes</h3>
                <p class="empty-description">Comienza añadiendo tu primer cliente para gestionar tu cartera comercial.</p>
                <ui-button variant="solid" (clicked)="openCreateModal()" icon="plus">
                  Añadir primer cliente
                </ui-button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Create/Edit Modal -->
      <ui-modal
        [isOpen]="isModalOpen()"
        [title]="editingClient() ? 'Editar cliente' : 'Nuevo cliente'"
        (closed)="closeModal()"
        variant="glass"
        size="lg"
      >
        <div class="modal-form">
          <div class="form-grid">
            <ui-input
              label="Nombre completo"
              [(ngModel)]="formData.name"
              icon="user"
              placeholder="Nombre del cliente"
              class="form-input"
            ></ui-input>

            <ui-input
              label="Sector de actividad"
              [(ngModel)]="formData.sector"
              icon="briefcase"
              placeholder="Ej: Tecnología, Construcción..."
            ></ui-input>

            <ui-input
              label="Persona de contacto"
              [(ngModel)]="formData.contact"
              icon="user-check"
              placeholder="Nombre del contacto principal"
            ></ui-input>

            <ui-input
              label="Email principal"
              [(ngModel)]="formData.email"
              icon="mail"
              placeholder="cliente@empresa.com"
              type="email"
            ></ui-input>

            <ui-input
              label="Teléfono"
              [(ngModel)]="formData.phone"
              icon="phone"
              placeholder="+34 600 000 000"
            ></ui-input>

            <ui-input
              label="Dirección fiscal"
              [(ngModel)]="formData.address"
              icon="map-pin"
              placeholder="Dirección completa"
              class="full-width"
            ></ui-input>
          </div>

          <div class="form-notes">
            <ui-input
              label="Notas adicionales"
              [(ngModel)]="formData.notes"
              icon="file-text"
              placeholder="Información adicional sobre el cliente..."
              class="full-width"
            ></ui-input>
          </div>
        </div>

        <div class="modal-actions">
          <ui-button variant="ghost" (clicked)="closeModal()">
            Cancelar
          </ui-button>
          <ui-button
            variant="solid"
            (clicked)="saveClient()"
            [loading]="isSaving()"
            icon="save"
          >
            {{ editingClient() ? 'Actualizar' : 'Crear' }} cliente
          </ui-button>
        </div>
      </ui-modal>
    </div>
  `,
  styles: [`
    .clients-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      min-height: 100vh;
    }

    /* Header Styles */
    .clients-header {
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2rem;
      background: var(--surface);
      border-radius: 16px;
      border: 1px solid var(--border-soft);
      box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.1);
    }

    .header-title-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .title-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: linear-gradient(135deg, var(--brand), var(--brand-secondary));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 8px 24px -8px var(--brand-glow);
    }

    .title-text h1 {
      font-size: 2.25rem;
      font-weight: 800;
      margin: 0;
      color: var(--text-primary);
      background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .title-text p {
      font-size: 1rem;
      color: var(--text-muted);
      margin: 0.5rem 0 0 0;
    }

    .create-btn {
      background: linear-gradient(135deg, var(--brand), var(--brand-secondary));
      border: none;
      box-shadow: 0 4px 16px -4px var(--brand-glow);
      transition: all 0.3s ease;
    }

    .create-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px -4px var(--brand-glow);
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: var(--surface);
      border-radius: 16px;
      padding: 1.5rem;
      border: 1px solid var(--border-soft);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.1);
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.15);
      border-color: var(--border-hover);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .stat-primary .stat-icon { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
    .stat-success .stat-icon { background: linear-gradient(135deg, #10b981, #059669); }
    .stat-warning .stat-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .stat-info .stat-icon { background: linear-gradient(135deg, #6366f1, #4f46e5); }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-muted);
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--success);
      font-weight: 500;
    }

    /* Controls Section */
    .controls-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      align-items: center;
    }

    .search-container {
      flex: 1;
    }

    .search-input {
      width: 100%;
    }

    .filter-buttons {
      display: flex;
      gap: 0.5rem;
    }

    /* Clients Grid */
    .clients-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 1.5rem;
    }

    .client-card {
      background: var(--surface);
      border-radius: 16px;
      border: 1px solid var(--border-soft);
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
      box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.1);
    }

    .client-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.2);
      border-color: var(--brand);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 1.5rem 0 1.5rem;
    }

    .client-avatar {
      position: relative;
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.25rem;
      box-shadow: 0 4px 12px -4px rgba(99, 102, 241, 0.4);
    }

    .avatar-status {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--text-muted);
      border: 3px solid var(--surface);
    }

    .avatar-status.active {
      background: var(--success);
    }

    .client-actions {
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .client-card:hover .client-actions {
      opacity: 1;
    }

    .menu-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      padding: 0;
    }

    .card-content {
      padding: 1rem 1.5rem;
    }

    .client-info {
      margin-bottom: 1rem;
    }

    .client-name {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
      line-height: 1.3;
    }

    .client-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .client-contact {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .client-stats {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .card-footer {
      padding: 0 1.5rem 1.5rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .client-date,
    .client-rating {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .client-rating .filled {
      color: #fbbf24;
      fill: currentColor;
    }

    /* Empty State */
    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      background: var(--surface);
      border-radius: 16px;
      border: 2px dashed var(--border-soft);
    }

    .empty-icon {
      color: var(--text-muted);
      margin-bottom: 1.5rem;
      opacity: 0.6;
    }

    .empty-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .empty-description {
      color: var(--text-muted);
      margin: 0 0 2rem 0;
      max-width: 400px;
    }

    /* Loading */
    .loading-container {
      grid-column: 1 / -1;
      display: flex;
      justify-content: center;
      padding: 4rem;
    }

    /* Modal Styles */
    .modal-form {
      padding: 1rem 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .form-notes {
      margin-bottom: 1rem;
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      padding-top: 1rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .clients-container {
        padding: 1rem;
      }

      .header-content {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
        padding: 1.5rem;
      }

      .header-title-section {
        flex-direction: column;
        gap: 1rem;
      }

      .title-text h1 {
        font-size: 1.875rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .controls-section {
        flex-direction: column;
        gap: 1rem;
      }

      .clients-grid {
        grid-template-columns: 1fr;
      }

      .client-stats {
        flex-direction: column;
        gap: 0.5rem;
      }

      .card-footer {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
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
  isSaving = signal(false);

  formData: Partial<Client & { notes?: string }> = {
    name: '',
    description: '',
    sector: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
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

  totalRevenue = computed(() => {
    // Calculate total revenue from all clients
    // Since Client interface doesn't have revenue field, using a placeholder calculation
    return this.clients().length * 25000; // Placeholder: 25k per client
  });

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
    this.isSaving.set(true);
    const clientToEdit = this.editingClient();
    if (clientToEdit) {
      this.facade.updateClient(clientToEdit.id, this.formData);
    } else {
      this.facade.createClient(
        this.formData as Omit<Client, 'id' | 'createdAt'>,
      );
    }
    // Simulate async operation
    setTimeout(() => {
      this.isSaving.set(false);
      this.closeModal();
    }, 1000);
  }

  confirmDelete(client: Client) {
    if (
      confirm(`¿Estás seguro de que deseas eliminar el cliente ${client.name}?`)
    ) {
      this.facade.deleteClient(client.id);
    }
  }

  getClientInitials(client: Client): string {
    return client.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  getClientStatus(client: Client): 'active' | 'inactive' {
    // Lógica simple: si tiene email y teléfono, está activo
    return client.email && client.phone ? 'active' : 'inactive';
  }

  getClientColor(client: Client): string {
    const colors = [
      'linear-gradient(135deg, #6366f1, #8b5cf6)',
      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #ef4444, #dc2626)',
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    ];
    const index = client.name.length % colors.length;
    return colors[index];
  }

  onClientClick(client: Client) {
    // Navegar al detalle del cliente
    // Por ahora solo abrimos el modal de edición
    this.editClient(client);
  }

  getClientStats(client: Client) {
    // Estadísticas básicas del cliente
    return {
      projects: Math.floor(Math.random() * 10) + 1, // Placeholder
      revenue: Math.floor(Math.random() * 50000) + 10000, // Placeholder
      lastActivity: new Date(client.createdAt || Date.now()).toLocaleDateString('es-ES'),
    };
  }

  goToDetail(client: Client) {
    // Navigate to client detail page
    this.editClient(client);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  openClientMenu(client: Client, event: Event) {
    // Open context menu for client actions
    event.stopPropagation();
    // For now, just show edit option
    this.editClient(client);
  }

  getClientProjects(client: Client): number {
    // Return number of projects for this client
    return Math.floor(Math.random() * 5) + 1; // Placeholder
  }

  getClientRevenue(client: Client): number {
    // Return revenue for this client
    return Math.floor(Math.random() * 100000) + 50000; // Placeholder
  }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES');
  }

  getClientRating(client: Client): number {
    // Return client rating (1-5)
    return Math.floor(Math.random() * 3) + 3; // Placeholder: 3-5 stars
  }
}
