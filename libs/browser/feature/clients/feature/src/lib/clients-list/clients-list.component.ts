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
  memoizedStats = new Map<string, { projects: number; revenue: number; rating: number }>();

  sortField = signal<'name' | 'revenue' | 'projects'>('name');
  sortDirection = signal<1 | -1>(1);

  filteredClients = computed(() => {
    let list = [...this.clients()];
    const t = this.masterFilter.query().trim().toLowerCase();
    
    // 1. Search filter
    if (t) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(t) ||
          (c.sector ?? '').toLowerCase().includes(t) ||
          (c.contact ?? '').toLowerCase().includes(t) ||
          (c.email ?? '').toLowerCase().includes(t),
      );
    }

    // 2. Sort
    const field = this.sortField();
    const dir = this.sortDirection();

    return list.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (field === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (field === 'revenue') {
        valA = this.getClientRevenue(a);
        valB = this.getClientRevenue(b);
      } else if (field === 'projects') {
        valA = this.getClientProjects(a);
        valB = this.getClientProjects(b);
      }

      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
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

  toggleSort() {
    if (this.sortField() === 'name') {
      this.sortField.set('revenue');
      this.sortDirection.set(-1); // Default to highest revenue
    } else if (this.sortField() === 'revenue') {
      this.sortField.set('projects');
    } else {
      this.sortField.set('name');
      this.sortDirection.set(1);
    }
  }

  getClientProjects(client: Client): number {
    return this.getOrCreateStats(client.id).projects;
  }

  getClientRevenue(client: Client): number {
    return this.getOrCreateStats(client.id).revenue;
  }

  getClientRating(client: Client): number {
    return this.getOrCreateStats(client.id).rating;
  }

  private getOrCreateStats(clientId: string) {
    if (!this.memoizedStats.has(clientId)) {
      this.memoizedStats.set(clientId, {
        projects: Math.floor(Math.random() * 5) + 1,
        revenue: Math.floor(Math.random() * 100000) + 50000,
        rating: Math.floor(Math.random() * 3) + 3,
      });
    }
    return this.memoizedStats.get(clientId)!;
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
