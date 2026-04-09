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
    <div
      class="clients-page"
      [class.perf-optimized]="pluginStore.highPerformanceMode()"
    >
      <header
        class="page-header"
        [style.border-bottom-color]="currentTheme().primary + '33'"
      >
        <div class="header-content">
          <h1 class="page-title">Directorio CRM / Clientes</h1>
          <nav class="breadcrumb">
            <span class="active" [style.color]="currentTheme().primary"
              >Gestión comercial</span
            >
            <span class="sep">/</span>
            <span>Base de datos operativa</span>
          </nav>
        </div>
        <div class="header-actions">
          <ui-josanz-button
            variant="glass"
            size="md"
            (clicked)="openCreateModal()"
            icon="plus"
          >
            Nuevo cliente
          </ui-josanz-button>
        </div>
      </header>

      <div class="stats-row">
        <ui-josanz-stat-card
          label="Total Clientes"
          [value]="clients().length.toString()"
          icon="users"
          [accent]="true"
        >
        </ui-josanz-stat-card>
        <ui-josanz-stat-card
          label="Nuevos este mes"
          [value]="newClientsCount().toString()"
          icon="user-plus"
          [trend]="12"
        >
        </ui-josanz-stat-card>
        <ui-josanz-stat-card
          label="Sectores Activos"
          [value]="activeSectorsCount().toString()"
          icon="briefcase"
        >
        </ui-josanz-stat-card>
      </div>

      <div class="filters-bar">
        <ui-josanz-search
          variant="filled"
          placeholder="Buscar por nombre, sector o contacto..."
          (searchChange)="onSearch($event)"
          class="search-input"
        ></ui-josanz-search>
      </div>

      @if (isLoading()) {
        <div class="loader-wrapper">
          <ui-josanz-loader
            message="Sincronizando directorio de clientes..."
          ></ui-josanz-loader>
        </div>
      } @else {
        <ui-josanz-card variant="glass" class="table-card">
          <ui-josanz-table
            [columns]="columns"
            [data]="filteredClients()"
            variant="default"
            [virtualScroll]="filteredClients().length > 24"
          >
            <ng-template #cellTemplate let-client let-key="key">
              @switch (key) {
                @case ('name') {
                  <a
                    [routerLink]="['/clients', client.id]"
                    class="client-link"
                    [style.color]="currentTheme().primary"
                  >
                    {{ client.name }}
                  </a>
                }
                @case ('sector') {
                  <ui-josanz-badge variant="info">{{
                    client.sector || 'General'
                  }}</ui-josanz-badge>
                }
                @case ('actions') {
                  <div class="row-actions">
                    <ui-josanz-button
                      variant="ghost"
                      size="sm"
                      icon="eye"
                      [routerLink]="['/clients', client.id]"
                      title="Ver"
                    ></ui-josanz-button>
                    <ui-josanz-button
                      variant="ghost"
                      size="sm"
                      icon="pencil"
                      (clicked)="editClient(client)"
                      title="Editar"
                    ></ui-josanz-button>
                    <ui-josanz-button
                      variant="ghost"
                      size="sm"
                      icon="trash-2"
                      (clicked)="confirmDelete(client)"
                      [style.color]="currentTheme().danger"
                      title="Eliminar"
                    ></ui-josanz-button>
                  </div>
                }
                @default {
                  {{ client[key] }}
                }
              }
            </ng-template>
          </ui-josanz-table>

          <footer
            class="table-footer"
            [style.background]="currentTheme().primary + '05'"
          >
            <div class="table-info">
              {{ filteredClients().length }} registros en directorio
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
      [title]="editingClient() ? 'Modificar cliente' : 'Nuevo cliente'"
      (closed)="closeModal()"
      variant="dark"
    >
      <div class="form-container">
        <div class="form-grid">
          <ui-josanz-input
            label="Nombre del cliente *"
            [(ngModel)]="formData.name"
            icon="user"
            placeholder="Nombre completo"
            class="full-width"
          ></ui-josanz-input>
          <ui-josanz-input
            label="Sector industrial"
            [(ngModel)]="formData.sector"
            icon="briefcase"
            placeholder="Sector"
          ></ui-josanz-input>
          <ui-josanz-input
            label="Contacto principal"
            [(ngModel)]="formData.contact"
            icon="phone"
            placeholder="Nombre de contacto"
          ></ui-josanz-input>
          <ui-josanz-input
            label="Email corporativo"
            [(ngModel)]="formData.email"
            icon="mail"
            placeholder="email@empresa.com"
          ></ui-josanz-input>
          <ui-josanz-input
            label="Teléfono directo"
            [(ngModel)]="formData.phone"
            icon="smartphone"
            placeholder="+34 000 000 000"
          ></ui-josanz-input>
          <ui-josanz-input
            label="Sede comercial"
            [(ngModel)]="formData.address"
            icon="map-pin"
            placeholder="Dirección física"
            class="full-width"
          ></ui-josanz-input>
        </div>
      </div>

      <div modal-footer class="modal-footer">
        <ui-josanz-button variant="ghost" (clicked)="closeModal()"
          >Cancelar</ui-josanz-button
        >
        <ui-josanz-button
          variant="glass"
          (clicked)="saveClient()"
          [disabled]="!formData.name"
        >
          {{ editingClient() ? 'Actualizar' : 'Crear cliente' }}
        </ui-josanz-button>
      </div>
    </ui-josanz-modal>
  `,
  styles: [
    `
      .clients-page {
        padding: 1.5rem;
        max-width: 1400px;
        margin: 0 auto;
        box-sizing: border-box;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .header-content {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .page-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #fff;
        margin: 0;
        letter-spacing: 0.02em;
      }

      .breadcrumb {
        display: flex;
        gap: 8px;
        font-size: 0.8rem;
        font-weight: 500;
        color: var(--text-muted);
      }

      .breadcrumb .sep {
        opacity: 0.5;
      }

      .breadcrumb .active {
        font-weight: 600;
      }

      .stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .filters-bar {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .search-input {
        max-width: 400px;
        width: 100%;
      }

      .client-link {
        text-decoration: none;
        font-weight: 600;
        transition: color 0.2s;
      }
      .client-link:hover {
        color: #fff !important;
      }

      .row-actions {
        display: flex;
        gap: 6px;
      }

      .table-card {
        border-radius: 12px;
        overflow: hidden;
      }

      .table-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.25rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .table-info {
        font-size: 0.85rem;
        color: var(--text-muted);
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem;
        padding: 1rem 0;
      }
      .full-width {
        grid-column: 1 / -1;
      }
      .modal-footer {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        padding-top: 1rem;
      }

      .loader-wrapper {
        display: flex;
        justify-content: center;
        padding: 3rem;
      }

      @media (max-width: 1024px) {
        .stats-row {
          grid-template-columns: 1fr;
        }
        .form-grid {
          grid-template-columns: 1fr;
        }
        .page-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
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
