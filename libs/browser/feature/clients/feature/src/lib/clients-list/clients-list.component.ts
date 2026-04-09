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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, PlusCircle, ArrowUp } from 'lucide-angular';
import {
  UiButtonComponent,
  UiSearchComponent,
  UiLoaderComponent,
  UiModalComponent,
  UiInputComponent,
  UiBadgeComponent,
  UiStatCardComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
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
    UiStatCardComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="clients-container">
      <!-- Standard Header -->
      <ui-feature-header
        title="Clientes"
        subtitle="Gestión completa de tu cartera de clientes"
        icon="building-2"
        actionLabel="Nuevo Cliente"
        (actionClicked)="openCreateModal()"
      ></ui-feature-header>

      <!-- Standard Stats -->
      <ui-feature-stats>
        <ui-stat-card
          label="Total Clientes"
          [value]="clients().length.toString()"
          icon="users"
          [trend]="12"
          [accent]="true"
        ></ui-stat-card>
        <ui-stat-card
          label="Nuevos este mes"
          [value]="newClientsCount().toString()"
          icon="user-plus"
          [trend]="8"
        ></ui-stat-card>
        <ui-stat-card
          label="Sectores activos"
          [value]="activeSectorsCount().toString()"
          icon="briefcase"
        ></ui-stat-card>
        <ui-stat-card
          label="Ingresos totales"
          [value]="(totalRevenue() | number:'1.0-0') + '€'"
          icon="dollar-sign"
          [trend]="15"
        ></ui-stat-card>
      </ui-feature-stats>

      <!-- Search and Filters -->
      <div class="controls-section">
        <ui-search
          variant="glass"
          placeholder="Buscar por nombre, sector o contacto..."
          (searchChange)="onSearch($event)"
          class="flex-1"
        ></ui-search>
        <div class="filter-actions">
           <ui-button variant="ghost" size="sm" icon="filter">Filtros</ui-button>
           <ui-button variant="ghost" size="sm" icon="ArrowUp">Ordenar</ui-button>
        </div>
      </div>

      <!-- Clients Grid -->
      @if (isLoading()) {
        <div class="loading-container">
          <ui-loader message="Cargando clientes..."></ui-loader>
        </div>
      } @else {
        <ui-feature-grid>
          @for (client of filteredClients(); track client.id) {
            <ui-feature-card
              [name]="client.name"
              [subtitle]="client.contact || 'Sin contacto'"
              [avatarInitials]="getInitials(client.name)"
              [avatarBackground]="getClientColor(client)"
              [status]="getClientStatus(client) === 'active' ? 'active' : 'offline'"
              [badgeLabel]="client.sector || 'General'"
              (cardClicked)="goToDetail(client)"
              (editClicked)="editClient(client)"
              [footerItems]="[
                { icon: 'briefcase', label: getClientProjects(client) + ' proyectos' },
                { icon: 'dollar-sign', label: (getClientRevenue(client) | number:'1.0-0') + '€' }
              ]"
            >
              <div footer-extra class="client-rating">
                 <lucide-icon name="star" size="12" class="filled"></lucide-icon>
                 <span>{{ getClientRating(client) }}/5</span>
              </div>
            </ui-feature-card>
          } @empty {
            <div class="empty-state">
              <lucide-icon name="users" size="64" class="empty-icon"></lucide-icon>
              <h3>No hay clientes</h3>
              <p>Comienza añadiendo tu primer cliente para gestionar tu cartera comercial.</p>
              <ui-button variant="solid" (clicked)="openCreateModal()" icon="CirclePlus">
                Añadir primer cliente
              </ui-button>
            </div>
          }
        </ui-feature-grid>
      }

      <!-- Create/Edit Modal -->
      <ui-modal
        [isOpen]="isModalOpen()"
        [title]="editingClient() ? 'Editar cliente' : 'Nuevo cliente'"
        (closed)="closeModal()"
        variant="glass"
      >
        <div class="modal-form">
          <!-- Form sections as before, but simplified if possible -->
          <div class="form-section">
             <h4 class="section-title">Información General</h4>
             <div class="form-grid">
               <ui-input label="Nombre completo *" [(ngModel)]="formData.name" icon="user" placeholder="Nombre del cliente" required></ui-input>
               <ui-input label="CIF/NIF" [(ngModel)]="formData.taxId" icon="hash" placeholder="B12345678"></ui-input>
               <ui-input label="Sector" [(ngModel)]="formData.sector" icon="briefcase" placeholder="Ej: Tecnología"></ui-input>
               <ui-input label="Tipo" [(ngModel)]="formData.type" icon="building-2" placeholder="Empresa, Particular..."></ui-input>
             </div>
          </div>
          
          <div class="form-section">
             <h4 class="section-title">Información de Contacto</h4>
             <div class="form-grid">
               <ui-input label="Persona contacto" [(ngModel)]="formData.contact" icon="user-check"></ui-input>
               <ui-input label="Email" [(ngModel)]="formData.email" icon="mail" type="email"></ui-input>
               <ui-input label="Teléfono" [(ngModel)]="formData.phone" icon="phone"></ui-input>
             </div>
          </div>
        </div>

        <div class="modal-actions">
          <ui-button variant="ghost" (clicked)="closeModal()">Cancelar</ui-button>
          <ui-button variant="solid" (clicked)="saveClient()" [loading]="isSaving()" icon="save">
            {{ editingClient() ? 'Guardar cambios' : 'Crear cliente' }}
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

    .controls-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      align-items: center;
      background: var(--surface);
      padding: 1rem;
      border-radius: 12px;
      border: 1px solid var(--border-soft);
    }

    .flex-1 { flex: 1; }

    .filter-actions {
       display: flex;
       gap: 0.5rem;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 4rem;
    }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem;
      text-align: center;
      background: var(--surface);
      border-radius: 16px;
      border: 2px dashed var(--border-soft);
    }

    .empty-icon { color: var(--text-muted); margin-bottom: 1rem; opacity: 0.5; }

    .client-rating {
       display: flex;
       align-items: center;
       gap: 0.25rem;
       font-size: 0.75rem;
       color: var(--text-muted);
       font-weight: 600;
    }

    .client-rating .filled { color: #fbbf24; fill: currentColor; }

    /* Modal Form Styles */
    .modal-form { padding: 1rem 0; }
    .form-section { margin-bottom: 1.5rem; }
    .section-title { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .controls-section { flex-direction: column; align-items: stretch; }
    }
  `],
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

    .client-summary {
      background: var(--surface-secondary);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border: 1px solid var(--border-soft);
    }

    .summary-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .client-avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--brand), var(--brand-secondary));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 1.125rem;
      flex-shrink: 0;
    }

    .client-info h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .client-meta {
      margin: 0.25rem 0;
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    .client-updated {
      margin: 0.25rem 0;
      color: var(--text-muted);
      font-size: 0.75rem;
      font-style: italic;
    }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-soft);
    }

    .stat {
      text-align: center;
    }

    .stat-label {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    .stat-value {
      display: block;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .form-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: var(--surface-secondary);
      border-radius: 12px;
      border: 1px solid var(--border-soft);
    }

    .section-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 1rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .section-title::before {
      content: '';
      width: 4px;
      height: 20px;
      background: linear-gradient(135deg, var(--brand), var(--brand-secondary));
      border-radius: 2px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      padding-top: 1rem;
    }

    .form-errors {
      margin-top: 1rem;
      padding: 1rem;
      background: var(--error-background, #fef2f2);
      border: 1px solid var(--error-border, #fecaca);
      border-radius: 8px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--error-text, #dc2626);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .error-message:last-child {
      margin-bottom: 0;
    }

    /* Modal size overrides */
    :host ::ng-deep ui-modal.modal-xl .modal-content {
      max-width: 95vw;
      min-width: 800px;
    }

    /* Responsive adjustments */
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
  private readonly router = inject(Router);
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
  formErrors = signal<string[]>([]);

  formData: Partial<Client & { notes?: string }> = {
    name: '',
    description: '',
    taxId: '',
    sector: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'España',
    type: 'company',
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
      taxId: '',
      sector: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: '',
      country: 'España',
      type: 'company',
      notes: '',
    };
    this.formErrors.set([]);
    this.isModalOpen.set(true);
  }

  editClient(client: Client) {
    this.editingClient.set(client);
    this.formData = { ...client };
    this.formErrors.set([]);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingClient.set(null);
    this.formErrors.set([]);
  }

  saveClient() {
    // Validation
    const errors: string[] = [];
    if (!this.formData.name?.trim()) {
      errors.push('El nombre del cliente es obligatorio');
    }
    if (this.formData.email && !this.isValidEmail(this.formData.email)) {
      errors.push('El email no tiene un formato válido');
    }
    if (this.formData.phone && !this.isValidPhone(this.formData.phone)) {
      errors.push('El teléfono no tiene un formato válido');
    }

    if (errors.length > 0) {
      this.formErrors.set(errors);
      return;
    }

    this.formErrors.set([]);
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
    this.router.navigate([client.id], { relativeTo: this.route });
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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{9,}$/;
    return phoneRegex.test(phone);
  }
}
