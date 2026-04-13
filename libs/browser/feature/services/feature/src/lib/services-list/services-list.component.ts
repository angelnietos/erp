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
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiSearchComponent,
  UiStatCardComponent,
  UiLoaderComponent,
  UiModalComponent,
  UiInputComponent,
  UiPaginationComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  ThemeService,
  PluginStore,
  MasterFilterService,
  FilterableService,
  AIFormBridgeService,
  ToastService,
} from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';
import { ServicesStore, Service } from '../services.store';

@Component({
  selector: 'lib-services-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiButtonComponent,
    UiSearchComponent,
    UiStatCardComponent,
    UiLoaderComponent,
    UiModalComponent,
    UiInputComponent,
    UiPaginationComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="services-container">
      <ui-feature-header
        title="Servicios"
        subtitle="Catálogo de operaciones y tarifas vigentes"
        icon="wrench"
        actionLabel="Nuevo Servicio"
        (actionClicked)="openCreateModal()"
      ></ui-feature-header>

      <ui-feature-stats>
        <ui-stat-card
          label="Total Servicios"
          [value]="store.services().length.toString()"
          icon="layers"
          [accent]="true"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Servicios Activos"
          [value]="store.activeCount().toString()"
          icon="check-circle"
          [trend]="15"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Tipos de Oferta"
          [value]="store.typesCount().toString()"
          icon="layout"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Eficiencia"
          value="98.5%"
          icon="trending-up"
          [accent]="false"
        ></ui-stat-card>
      </ui-feature-stats>

      <!-- Search and Filters -->
      <div class="feature-controls">
        <div class="search-container">
          <ui-search
            variant="glass"
            placeholder="Buscar por nombre, tipo o descripción..."
            (searchChange)="onSearchChange($event)"
          ></ui-search>
        </div>
        <div class="actions-group">
          <ui-button variant="ghost" size="sm" icon="filter">Filtros</ui-button>
          <ui-button
            variant="ghost"
            size="sm"
            [icon]="sortDirection() === 1 ? 'ChevronUp' : 'ChevronDown'"
            (clicked)="toggleSort()"
          >
            ORDENAR:
            {{
              sortField() === 'name'
                ? 'NOMBRE'
                : sortField() === 'basePrice'
                  ? 'PRECIO'
                  : 'TIPO'
            }}
          </ui-button>
        </div>
      </div>

      @if (store.isLoading()) {
        <div class="loader-container">
          <ui-loader message="CARGANDO CATÁLOGO DE SERVICIOS..."></ui-loader>
        </div>
      } @else {
        <ui-feature-grid>
          @for (service of paginatedServices(); track service.id) {
            <ui-feature-card
              [name]="service.name"
              [subtitle]="service.description || 'Sin descripción'"
              [avatarInitials]="getInitials(service.name)"
              [avatarBackground]="getTypeGradient(service.type)"
              [status]="service.isActive ? 'active' : 'offline'"
              [badgeLabel]="service.type"
              [badgeVariant]="getTypeBadgeVariant(service.type)"
              [showEdit]="true"
              [showDuplicate]="true"
              [showDelete]="true"
              (cardClicked)="onRowClick(service)"
              (editClicked)="editService(service)"
              (duplicateClicked)="onDuplicate(service)"
              (deleteClicked)="confirmDelete(service)"
              [footerItems]="[
                {
                  icon: 'euro',
                  label: 'Base: ' + (service.basePrice | currency: 'EUR'),
                },
                {
                  icon: 'clock',
                  label:
                    'Hora: ' +
                    (service.hourlyRate
                      ? (service.hourlyRate | currency: 'EUR')
                      : '-'),
                },
              ]"
            >
              <div footer-extra class="service-extra-actions">
                <ui-button
                  variant="ghost"
                  size="sm"
                  icon="eye"
                  [routerLink]="['/services', service.id]"
                  title="Ver detalles"
                ></ui-button>
              </div>
            </ui-feature-card>
          } @empty {
            <div class="empty-state">
              <lucide-icon
                name="wrench"
                size="64"
                class="empty-icon"
              ></lucide-icon>
              <h3>No hay servicios</h3>
              <p>
                Comienza añadiendo tu primer servicio para gestionar tu catálogo
                comercial.
              </p>
              <ui-button
                variant="solid"
                (clicked)="openCreateModal()"
                icon="CirclePlus"
              >
                Añadir primer servicio
              </ui-button>
            </div>
          }
        </ui-feature-grid>
      }

      <!-- Pagination -->
      @if (filteredServices().length > 12) {
        <div class="pagination-footer">
          <ui-pagination
            [currentPage]="currentPage()"
            [totalPages]="totalPages()"
            (pageChange)="onPageChange($event)"
          ></ui-pagination>
        </div>
      }

      <!-- Create/Edit Modal -->
      <ui-modal
        [isOpen]="isModalOpen()"
        [title]="editingService() ? 'Editar servicio' : 'Nuevo servicio'"
        (closed)="closeModal()"
        variant="glass"
      >
        <div class="modal-form">
          <!-- Form Errors -->
          @if (formErrors().length > 0) {
            <div class="form-errors">
              @for (error of formErrors(); track $index) {
                <div class="error-message">
                  <lucide-icon name="AlertCircle" size="16"></lucide-icon>
                  <span>{{ error }}</span>
                </div>
              }
            </div>
          }

          <div class="form-section">
            <h4 class="section-title">Información General</h4>
            <div class="form-grid">
              <ui-input
                label="Nombre del servicio *"
                [(ngModel)]="formData.name"
                icon="wrench"
                placeholder="Nombre del servicio"
                required
              ></ui-input>
              <ui-input
                label="Tipo"
                [(ngModel)]="formData.type"
                icon="tag"
                placeholder="Ej: Servicio, Mantenimiento..."
              ></ui-input>
              <ui-input
                label="Precio base (€)"
                [(ngModel)]="formData.basePrice"
                icon="euro"
                type="number"
                placeholder="0.00"
              ></ui-input>
              <ui-input
                label="Tarifa hora (€)"
                [(ngModel)]="formData.hourlyRate"
                icon="clock"
                type="number"
                placeholder="0.00"
              ></ui-input>
            </div>
          </div>

          <div class="form-section">
            <h4 class="section-title">Descripción</h4>
            <ui-input
              label="Descripción"
              [(ngModel)]="formData.description"
              icon="file-text"
              placeholder="Descripción detallada del servicio"
            ></ui-input>
          </div>
        </div>

        <div class="modal-actions">
          <ui-button variant="ghost" (clicked)="closeModal()"
            >Cancelar</ui-button
          >
          <ui-button
            variant="solid"
            (clicked)="saveService()"
            [loading]="isSaving()"
            icon="save"
          >
            {{ editingService() ? 'Guardar cambios' : 'Crear servicio' }}
          </ui-button>
        </div>
      </ui-modal>
    </div>
  `,
  styles: [
    `
      .services-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
        min-height: 100vh;
      }

      .feature-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        background: var(--surface);
        padding: 0.5rem 1.5rem;
        border-radius: 16px;
        border: 1px solid var(--border-soft);
        gap: 2rem;
      }

      .search-container {
        flex: 1;
      }

      .actions-group {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .loader-container {
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

      .empty-icon {
        color: var(--text-muted);
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      /* Modal Form Styles */
      .modal-form {
        padding: 1rem 0;
      }

      .form-errors {
        background: var(--danger-light);
        border: 1px solid var(--danger);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1.5rem;
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--danger);
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
      }

      .error-message:last-child {
        margin-bottom: 0;
      }

      .form-section {
        margin-bottom: 1.5rem;
      }

      .section-title {
        font-size: 1rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--text-primary);
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.5rem;
      }

      .pagination-footer {
        margin-top: 3rem;
        display: flex;
        justify-content: center;
      }

      @media (max-width: 768px) {
        .feature-controls {
          flex-direction: column;
          align-items: stretch;
        }
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
      }

      @media (max-width: 900px) {
        .navigation-bar {
          padding: 1rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesListComponent
  implements OnInit, OnDestroy, FilterableService<Service>
{
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly aiFormBridge = inject(AIFormBridgeService);
  private readonly toast = inject(ToastService);
  readonly store = inject(ServicesStore);

  // Signals for UI state
  isModalOpen = signal(false);
  editingService = signal<Service | null>(null);
  isSaving = signal(false);
  formErrors = signal<string[]>([]);
  currentPage = signal(1);
  totalPages = computed(() => {
    const pageSize = 12;
    return Math.ceil(this.filteredServices().length / pageSize);
  });
  sortField = signal<'name' | 'basePrice' | 'type'>('name');
  sortDirection = signal<1 | -1>(1);

  formData: Partial<Service> = {
    name: '',
    description: '',
    type: 'STREAMING',
    basePrice: 0,
    hourlyRate: 0,
    isActive: true,
  };

  private readonly router = inject(Router);
  private readonly _searchQuery = signal('');

  readonly filteredServices = computed(() => {
    let list = [...this.store.services()];
    const t = this.masterFilter.query().trim().toLowerCase();

    // 1. Search filter
    if (t) {
      list = list.filter(
        (s: Service) =>
          s.name.toLowerCase().includes(t) ||
          (s.description ?? '').toLowerCase().includes(t) ||
          s.type.toLowerCase().includes(t),
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
      } else if (field === 'basePrice') {
        valA = a.basePrice || 0;
        valB = b.basePrice || 0;
      } else if (field === 'type') {
        valA = a.type;
        valB = b.type;
      }

      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
  });

  paginatedServices = computed(() => {
    const all = this.filteredServices();
    const page = this.currentPage();
    const pageSize = 12;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return all.slice(start, end);
  });

  ngOnInit() {
    this.aiFormBridge.registerDataProxy(
      this.formData as Record<string, unknown>,
    );
    this.masterFilter.registerProvider(this);
    this.store.load();
  }

  ngOnDestroy() {
    this.aiFormBridge.unregisterDataProxy(
      this.formData as Record<string, unknown>,
    );
    this.masterFilter.unregisterProvider();
  }

  onSearchChange(term: string) {
    this._searchQuery.set(term);
    this.masterFilter.search(term);
  }

  filter(query: string): Observable<Service[]> {
    const term = query.toLowerCase().trim();
    if (!term) return of(this.store.services());

    const matches = this.store.services().filter((s: Service) => {
      const searchableText = [s.name, s.description ?? '', s.type]
        .join(' ')
        .toLowerCase();

      const normalizedTerm = this.normalizeSearchTerm(term);

      return (
        searchableText.includes(normalizedTerm) ||
        this.hasKeywordMatch(searchableText, normalizedTerm)
      );
    });
    return of(matches);
  }

  private normalizeSearchTerm(term: string): string {
    const synonyms: Record<string, string[]> = {
      servicio: ['servicio', 'service', 'oferta'],
      mantenimiento: [
        'mantenimiento',
        'maintenance',
        'reparacion',
        'reparación',
      ],
      consultoria: [
        'consultoria',
        'consultoría',
        'consulting',
        'asesoria',
        'asesoría',
      ],
      activo: ['activo', 'active', 'habilitado'],
      inactivo: ['inactivo', 'inactive', 'deshabilitado'],
    };

    for (const [key, variants] of Object.entries(synonyms)) {
      if (variants.some((v) => term.includes(v))) {
        return key;
      }
    }
    return term;
  }

  private hasKeywordMatch(text: string, term: string): boolean {
    return (
      text.includes(term) ||
      term.split(' ').every((word) => text.includes(word))
    );
  }

  onEdit(service: Service) {
    this.router.navigate(['/services', service.id, 'edit']);
  }

  onDuplicate(service: Service) {
    this.store.duplicate(service.id);
  }

  confirmDelete(service: Service) {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar el servicio ${service.name}?`,
      )
    ) {
      this.store.remove(service.id);
    }
  }

  getInitials(name: string | undefined): string {
    return (name || 'S').slice(0, 2).toUpperCase();
  }

  getTypeGradient(type: string): string {
    switch (type) {
      case 'STREAMING':
        return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'PRODUCCIÓN':
        return 'linear-gradient(135deg, #10b981, #059669)';
      case 'LED':
        return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'TRANSPORTE':
        return 'linear-gradient(135deg, #6366f1, #4338ca)';
      case 'PERSONAL_TÉCNICO':
        return 'linear-gradient(135deg, #ec4899, #be185d)';
      default:
        return 'linear-gradient(135deg, #6b7280, #374151)';
    }
  }

  getTypeBadgeVariant(
    type: string,
  ): 'info' | 'success' | 'warning' | 'danger' | 'primary' | 'secondary' {
    switch (type) {
      case 'STREAMING':
        return 'info';
      case 'PRODUCCIÓN':
        return 'success';
      case 'LED':
        return 'warning';
      case 'TRANSPORTE':
        return 'info';
      case 'PERSONAL_TÉCNICO':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  toggleSort() {
    if (this.sortField() === 'name') {
      this.sortField.set('basePrice');
      this.sortDirection.set(-1);
    } else if (this.sortField() === 'basePrice') {
      this.sortField.set('type');
    } else {
      this.sortField.set('name');
      this.sortDirection.set(1);
    }
  }

  openCreateModal() {
    this.editingService.set(null);
    this.formData = {
      name: '',
      description: '',
      type: 'STREAMING',
      basePrice: 0,
      hourlyRate: 0,
      isActive: true,
    };
    this.formErrors.set([]);
    this.isModalOpen.set(true);
  }

  editService(service: Service) {
    this.editingService.set(service);
    this.formData = { ...service };
    this.formErrors.set([]);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingService.set(null);
    this.formErrors.set([]);
  }

  saveService() {
    const errors: string[] = [];

    if (!this.formData.name?.trim()) {
      errors.push('El nombre del servicio es obligatorio');
    }

    if (this.formData.basePrice && this.formData.basePrice < 0) {
      errors.push('El precio base no puede ser negativo');
    }

    if (this.formData.hourlyRate && this.formData.hourlyRate < 0) {
      errors.push('La tarifa por hora no puede ser negativa');
    }

    if (errors.length > 0) {
      this.formErrors.set(errors);
      return;
    }

    this.formErrors.set([]);
    this.isSaving.set(true);

    // Simulate async operation
    setTimeout(() => {
      this.isSaving.set(false);
      this.toast.show(
        this.editingService()
          ? 'Servicio actualizado correctamente'
          : 'Servicio creado correctamente',
        'success',
      );
      this.closeModal();
    }, 1000);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onRowClick(service: Service) {
    // Navigate to service detail or edit
    this.editService(service);
  }
}
