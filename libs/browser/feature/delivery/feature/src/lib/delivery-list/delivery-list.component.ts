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
  UiFeatureFilterBarComponent,
  UiLoaderComponent,
  UiModalComponent,
  UiInputComponent,
  UiTextareaComponent,
  UiStatCardComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
  UiFeatureAccessDeniedComponent,
  UiFeaturePageShellComponent,
} from '@josanz-erp/shared-ui-kit';
import { DeliveryFacade, DeliveryNote } from '@josanz-erp/delivery-data-access';
import {
  ThemeService,
  PluginStore,
  MasterFilterService,
  FilterableService,
  ToastService,
  AIFormBridgeService,
  GlobalAuthStore,
  rbacAllows,
} from '@josanz-erp/shared-data-access';
import { DELIVERY_FEATURE_CONFIG } from '../delivery-feature.config';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'lib-delivery-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiButtonComponent,
    UiFeatureFilterBarComponent,
    UiLoaderComponent,
    UiModalComponent,
    UiInputComponent,
    UiTextareaComponent,
    UiStatCardComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    LucideAngularModule,
    UiFeatureAccessDeniedComponent,
    UiFeaturePageShellComponent,
  ],
  template: `
    @if (!canAccess()) {
      <ui-feature-access-denied
        message="No tienes permiso para ver albaranes."
        permissionHint="delivery.view"
      />
    } @else {
    <ui-feature-page-shell [extraClass]="'delivery-container'">
      <ui-feature-header
        title="Albaranes"
        subtitle="Gestión de manifiestos logísticos y manifiestos de carga"
        icon="truck"
        actionLabel="NUEVO ALBARÁN"
        (actionClicked)="openCreateModal()"
      ></ui-feature-header>

      <ui-feature-stats>
        <ui-stat-card
          label="Salidas Hoy"
          [value]="todayCount().toString()"
          icon="truck"
          [accent]="true"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Pendientes Firma"
          [value]="pendingCount().toString()"
          icon="pen-tool"
          [trend]="2"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Retornos Realizados"
          [value]="returnCount().toString()"
          icon="rotate-ccw"
        >
        </ui-stat-card>
        <ui-stat-card
          label="Entregas a Tiempo"
          value="94%"
          icon="timer"
          [accent]="false"
        ></ui-stat-card>
      </ui-feature-stats>

      <ui-feature-filter-bar
        [appearance]="'feature'"
        [searchVariant]="'glass'"
        placeholder="Buscar albarán, cliente o referencia…"
        (searchChange)="onSearch($event)"
      >
        <ui-button
          variant="ghost"
          size="sm"
          icon="rotate-cw"
          (clicked)="refreshDeliveryNotes()"
          title="Actualizar"
        >
          Actualizar
        </ui-button>
        <ui-button
          variant="ghost"
          size="sm"
          [icon]="sortDirection() === 1 ? 'ChevronUp' : 'ChevronDown'"
          (clicked)="toggleSort()"
        >
          Ordenar:
          {{
            sortField() === 'deliveryDate'
              ? 'fecha'
              : sortField() === 'clientName'
                ? 'cliente'
                : 'estado'
          }}
        </ui-button>
      </ui-feature-filter-bar>

      @if (error() && deliveryNotes().length > 0) {
        <div
          class="feature-load-error-banner"
          role="status"
          aria-live="polite"
        >
          <lucide-icon
            name="alert-circle"
            size="20"
            class="feature-load-error-banner__icon"
          ></lucide-icon>
          <span class="feature-load-error-banner__text">{{ error() }}</span>
          <ui-button
            variant="ghost"
            size="sm"
            icon="rotate-cw"
            (clicked)="refreshDeliveryNotes()"
          >
            Reintentar
          </ui-button>
        </div>
      }

      @if (isLoading() && deliveryNotes().length === 0) {
        <div class="feature-loader-wrap">
          <ui-loader message="Sincronizando albaranes…"></ui-loader>
        </div>
      } @else if (error() && deliveryNotes().length === 0) {
        <div class="feature-error-screen" role="alert">
          <lucide-icon
            name="wifi-off"
            size="48"
            class="feature-error-screen__icon"
          ></lucide-icon>
          <h3>No se pudo cargar el listado</h3>
          <p>{{ error() }}</p>
          <ui-button
            variant="solid"
            icon="rotate-cw"
            (clicked)="refreshDeliveryNotes()"
          >
            Reintentar
          </ui-button>
        </div>
      } @else {
        <ui-feature-grid>
          @for (delivery of filteredDeliveryNotes(); track delivery.id) {
            <ui-feature-card
              [name]="delivery.clientName || 'Sin cliente'"
              [subtitle]="'Ref: ' + delivery.budgetId"
              [avatarInitials]="getInitials(delivery.budgetId)"
              [avatarBackground]="getStatusGradient(delivery.status)"
              [status]="
                delivery.status === 'signed' || delivery.status === 'completed'
                  ? 'active'
                  : 'offline'
              "
              [badgeLabel]="getStatusLabel(delivery.status) | uppercase"
              [badgeVariant]="getStatusVariant(delivery.status)"
              [showEdit]="true"
              [showDuplicate]="true"
              [showDelete]="true"
              (cardClicked)="onRowClick(delivery)"
              (editClicked)="editDelivery(delivery)"
              (duplicateClicked)="onDuplicate(delivery)"
              (deleteClicked)="confirmDelete(delivery)"
              [footerItems]="[
                { icon: 'calendar', label: delivery.deliveryDate },
                { icon: 'box', label: delivery.itemsCount + ' bultos' },
              ]"
            >
              <div footer-extra class="delivery-extra-actions">
                <ui-button
                  variant="ghost"
                  size="sm"
                  icon="eye"
                  [routerLink]="['/delivery', delivery.id]"
                  title="Detalles"
                ></ui-button>
                @if (delivery.status === 'pending') {
                  <ui-button
                    variant="ghost"
                    size="sm"
                    icon="pen-tool"
                    (clicked)="signDelivery($event, delivery)"
                    class="text-success"
                    title="Firmar"
                  ></ui-button>
                }
              </div>
            </ui-feature-card>
          } @empty {
            @if (filterProducesNoResults()) {
              <div class="feature-empty feature-empty--wide">
                <lucide-icon
                  name="search-x"
                  size="56"
                  class="feature-empty__icon"
                ></lucide-icon>
                <h3>Sin resultados</h3>
                <p>
                  Ningún albarán coincide con la búsqueda actual. Prueba con
                  otros términos.
                </p>
                <ui-button
                  variant="ghost"
                  icon="circle-x"
                  (clicked)="clearFiltersAndSearch()"
                >
                  Limpiar búsqueda
                </ui-button>
              </div>
            } @else {
              <div class="feature-empty feature-empty--wide">
                <lucide-icon
                  name="truck"
                  size="56"
                  class="feature-empty__icon"
                ></lucide-icon>
                <h3>Sin albaranes</h3>
                <p>
                  Aún no hay manifiestos. Crea el primero para seguir la entrega.
                </p>
                <ui-button
                  variant="solid"
                  (clicked)="openCreateModal()"
                  icon="CirclePlus"
                  >Crear albarán</ui-button
                >
              </div>
            }
          }
        </ui-feature-grid>
      }
    </ui-feature-page-shell>

    <!-- Modal solo para alta; la edición está en /delivery/:id/edit -->
    <ui-modal
      [isOpen]="isModalOpen()"
      title="NUEVO ALBARÁN"
      (closed)="closeModal()"
      variant="dark"
    >
      <div class="form-grid">
        <ui-input
          label="Referencia Presupuesto"
          [(ngModel)]="formData.budgetId"
          placeholder="#PR-0000"
          icon="file-text"
        ></ui-input>
        <ui-input
          label="Cliente Receptor"
          [(ngModel)]="formData.clientName"
          placeholder="RAZÓN SOCIAL..."
          icon="user"
        ></ui-input>
        <ui-input
          label="Fecha de Salida"
          type="date"
          [(ngModel)]="formData.deliveryDate"
          icon="calendar"
        ></ui-input>
        <ui-input
          label="Retorno Previsto"
          type="date"
          [(ngModel)]="formData.returnDate"
          icon="rotate-ccw"
        ></ui-input>
        <ui-input
          label="Unidades Consignadas"
          type="number"
          [(ngModel)]="formData.itemsCount"
          icon="box"
          class="full-width"
        ></ui-input>
        <ui-textarea
          label="Notas de Operación"
          [(ngModel)]="formData.notes"
          [rows]="3"
          placeholder="OBSERVACIONES..."
          variant="filled"
          class="full-width"
        ></ui-textarea>
      </div>

      <div modal-footer class="modal-footer-box">
        <ui-button variant="ghost" (clicked)="closeModal()">CANCELAR</ui-button>
        <ui-button
          variant="glass"
          (clicked)="saveDelivery()"
          [disabled]="!formData.budgetId || !formData.clientName"
        >
          CONFIRMAR
        </ui-button>
      </div>
    </ui-modal>
    }
  `,
  styles: [
    `
      .navigation-bar {
        margin-bottom: 2rem;
        background: var(--surface);
        padding: 0.75rem 1.5rem;
        border-radius: 16px;
        border: 1px solid var(--border-soft);
        display: flex;
      }

      .flex-1 {
        flex: 1;
      }

      .flex-1 {
        flex: 1;
      }
      .search-bar {
        width: 350px;
      }

      .pagination-footer {
        margin-top: 3rem;
        display: flex;
        justify-content: center;
      }

      .flex-1 {
        flex: 1;
      }
      .card-actions {
        display: flex;
        gap: 0.25rem;
      }
      .text-success {
        color: var(--success) !important;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        padding: 1rem 0;
      }
      .full-width {
        grid-column: 1 / -1;
      }
      .modal-footer-box {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        padding-top: 1rem;
      }

      @media (max-width: 900px) {
        .navigation-bar {
          padding: 1rem;
        }
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryListComponent
  implements OnInit, OnDestroy, FilterableService<DeliveryNote>
{
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly facade = inject(DeliveryFacade);
  public readonly config = inject(DELIVERY_FEATURE_CONFIG);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly toast = inject(ToastService);
  private readonly aiFormBridge = inject(AIFormBridgeService);
  private readonly authStore = inject(GlobalAuthStore);
  readonly canAccess = rbacAllows(this.authStore, 'delivery.view', 'delivery.manage');

  currentTheme = this.themeService.currentThemeData;

  private readonly router = inject(Router);

  onRowClick(delivery: DeliveryNote) {
    this.router.navigate(['/delivery', delivery.id]);
  }

  onDuplicate(delivery: DeliveryNote) {
    const { id: _omitId, ...rest } = delivery;
    void _omitId;
    this.facade
      .createDeliveryNote({
        ...rest,
        budgetId: `${delivery.budgetId} (CLON)`,
      })
      .subscribe({
        next: () =>
          this.toast.show(
            `Copia creada a partir de ${delivery.budgetId}`,
            'success',
          ),
        error: () =>
          this.toast.show('No se pudo duplicar el albarán.', 'error'),
      });
  }

  confirmDelete(delivery: DeliveryNote) {
    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar el albarán ${delivery.budgetId}?`,
      )
    ) {
      return;
    }
    this.facade.deleteDeliveryNote(delivery.id).subscribe({
      next: (ok) => {
        if (ok) {
          this.toast.show(`Albarán ${delivery.budgetId} eliminado`, 'success');
        } else {
          this.toast.show('No se pudo eliminar el albarán.', 'error');
        }
      },
      error: () =>
        this.toast.show('Error al eliminar. Inténtalo de nuevo.', 'error'),
    });
  }

  getInitials(id: string): string {
    return id.slice(0, 2).toUpperCase();
  }

  getStatusGradient(status: string): string {
    switch (status) {
      case 'signed':
        return 'linear-gradient(135deg, #10b981, #059669)';
      case 'completed':
        return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'pending':
        return 'linear-gradient(135deg, #f59e0b, #d97706)';
      default:
        return 'linear-gradient(135deg, #6b7280, #374151)';
    }
  }

  deliveryNotes = this.facade.deliveryNotes;
  isLoading = this.facade.isLoading;
  error = this.facade.error;

  readonly hasAnyDeliveryNotes = computed(
    () => this.deliveryNotes().length > 0,
  );
  readonly filterProducesNoResults = computed(
    () =>
      this.hasAnyDeliveryNotes() && this.filteredDeliveryNotes().length === 0,
  );

  currentPage = signal(1);
  totalPages = signal(1);

  isModalOpen = signal(false);

  sortField = signal<'deliveryDate' | 'clientName' | 'status'>('deliveryDate');
  sortDirection = signal<1 | -1>(-1);

  formData: Partial<DeliveryNote> = {
    budgetId: '',
    clientName: '',
    status: 'draft',
    deliveryDate: '',
    returnDate: '',
    itemsCount: 0,
    notes: '',
  };

  filteredDeliveryNotes = computed(() => {
    let list = [...this.deliveryNotes()];
    const t = this.masterFilter.query().trim().toLowerCase();
    if (t) {
      list = list.filter(
        (d: DeliveryNote) =>
          d.budgetId.toLowerCase().includes(t) ||
          (d.clientName ?? '').toLowerCase().includes(t) ||
          (d.notes ?? '').toLowerCase().includes(t),
      );
    }
    const field = this.sortField();
    const dir = this.sortDirection();
    list.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';
      if (field === 'deliveryDate') {
        valA = new Date(a.deliveryDate || '').getTime();
        valB = new Date(b.deliveryDate || '').getTime();
      } else if (field === 'clientName') {
        valA = (a.clientName || '').toLowerCase();
        valB = (b.clientName || '').toLowerCase();
      } else {
        valA = (a.status || '').toLowerCase();
        valB = (b.status || '').toLowerCase();
      }
      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
    return list;
  });

  ngOnInit() {
    this.aiFormBridge.registerDataProxy(
      this.formData as Record<string, unknown>,
    );
    this.masterFilter.registerProvider(this);
    this.loadDeliveryNotes();
  }

  ngOnDestroy() {
    this.aiFormBridge.unregisterDataProxy(
      this.formData as Record<string, unknown>,
    );
    this.masterFilter.unregisterProvider();
  }

  loadDeliveryNotes() {
    this.facade.loadDeliveryNotes();
  }

  refreshDeliveryNotes() {
    this.facade.loadDeliveryNotes(true);
  }

  clearFiltersAndSearch(): void {
    this.masterFilter.search('');
  }

  onSearch(term: string) {
    this.masterFilter.search(term);
    // Filtrado local vía computed
  }

  toggleSort() {
    if (this.sortField() === 'deliveryDate') {
      this.sortField.set('clientName');
      this.sortDirection.set(1);
    } else if (this.sortField() === 'clientName') {
      this.sortField.set('status');
      this.sortDirection.set(1);
    } else {
      this.sortField.set('deliveryDate');
      this.sortDirection.set(-1);
    }
  }

  filter(query: string): Observable<DeliveryNote[]> {
    const term = query.toLowerCase().trim();
    if (!term) return of(this.deliveryNotes());

    const matches = this.deliveryNotes().filter((d: DeliveryNote) => {
      const searchableText = [
        d.budgetId,
        d.clientName ?? '',
        d.notes ?? '',
        d.status,
        d.deliveryDate ?? '',
      ]
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
      albaran: ['albaran', 'delivery', 'albarán', 'manifiesto'],
      pendiente: ['pendiente', 'pending'],
      completado: ['completado', 'completed'],
      firmado: ['firmado', 'signed'],
      borrador: ['borrador', 'draft'],
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

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  openCreateModal() {
    this.formData = {
      budgetId: '',
      clientName: '',
      status: 'draft',
      deliveryDate: new Date().toISOString().split('T')[0],
      returnDate: '',
      itemsCount: 0,
      notes: '',
    };
    this.isModalOpen.set(true);
  }

  editDelivery(delivery: DeliveryNote) {
    this.router.navigate(['/delivery', delivery.id, 'edit']);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveDelivery() {
    if (!this.formData.budgetId?.trim() || !this.formData.clientName?.trim()) {
      this.toast.show('Indica presupuesto y cliente', 'error');
      return;
    }
    this.facade
      .createDeliveryNote(this.formData as Omit<DeliveryNote, 'id'>)
      .subscribe({
        next: () => {
          this.toast.show('Albarán registrado', 'success');
          this.closeModal();
        },
        error: () => this.toast.show('No se pudo crear el albarán.', 'error'),
      });
  }

  signDelivery(ev: Event, delivery: DeliveryNote) {
    ev.stopPropagation();
    const signature = prompt('Introduzca firma de conformidad (Digital ID):');
    if (signature) {
      this.facade.signDeliveryNote(delivery.id, signature).subscribe({
        next: () => this.toast.show('Albarán firmado correctamente', 'success'),
        error: () => this.toast.show('No se pudo registrar la firma.', 'error'),
      });
    }
  }

  getStatusVariant(
    status: string,
  ): 'success' | 'warning' | 'info' | 'secondary' | 'primary' {
    switch (status) {
      case 'signed':
        return 'success';
      case 'completed':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'draft':
        return 'Borrador';
      case 'pending':
        return 'Pendiente';
      case 'signed':
        return 'Firmado';
      case 'completed':
        return 'Completado';
      default:
        return status;
    }
  }

  todayCount = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.deliveryNotes().filter(
      (d: DeliveryNote) => d.deliveryDate === today,
    ).length;
  });

  pendingCount = computed(
    () =>
      this.deliveryNotes().filter((d: DeliveryNote) => d.status === 'pending')
        .length,
  );
  returnCount = computed(
    () =>
      this.deliveryNotes().filter(
        (d: DeliveryNote) => d.status === 'signed' || d.status === 'completed',
      ).length,
  );
}
