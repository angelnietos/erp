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
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiFeatureFilterBarComponent,
  UiPaginationComponent,
  UiLoaderComponent,
  UiTabsComponent,
  UiStatCardComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
  UiFeatureAccessDeniedComponent,
  UiFeaturePageShellComponent,
} from '@josanz-erp/shared-ui-kit';
import { Product, InventoryFacade } from '@josanz-erp/inventory-data-access';
import {
  ThemeService,
  PluginStore,
  MasterFilterService,
  FilterableService,
  AIFormBridgeService,
  ToastService,
  GlobalAuthStore,
  rbacAllows,
} from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';
import { INVENTORY_FEATURE_CONFIG } from '../inventory-feature.config';

@Component({
  selector: 'lib-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiButtonComponent,
    UiFeatureFilterBarComponent,
    UiPaginationComponent,
    UiLoaderComponent,
    UiTabsComponent,
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
        message="No tienes permiso para ver inventario."
        permissionHint="products.view"
      />
    } @else {
    <ui-feature-page-shell [extraClass]="'inventory-container'">
      <ui-feature-header
        title="Inventario"
        breadcrumbLead="ACTIVOS"
        breadcrumbTail="STOCK E INVENTARIO"
        subtitle="Monitoreo global de activos y recursos"
        icon="package"
        actionLabel="NUEVO PRODUCTO"
        (actionClicked)="goToNewProduct()"
      ></ui-feature-header>

      <ui-feature-stats>
        <ui-stat-card
          label="Total Equipos"
          [value]="allProducts().length.toString()"
          icon="package"
          [accent]="true"
        ></ui-stat-card>
        <ui-stat-card
          label="Stock Crítico"
          [value]="criticalCount().toString()"
          icon="alert-octagon"
          [trend]="-2"
        ></ui-stat-card>
        <ui-stat-card
          label="Valoración Flota"
          [value]="formatCurrencyEu(totalValue())"
          icon="bar-chart-3"
        ></ui-stat-card>
        <ui-stat-card
          label="Sincronización"
          value="Online"
          icon="refresh-cw"
          [accent]="false"
        ></ui-stat-card>
      </ui-feature-stats>

      <ui-feature-filter-bar
        [appearance]="'feature'"
        [searchVariant]="'glass'"
        placeholder="Buscar equipamiento o SKU…"
        (searchChange)="onSearch($event)"
      >
        <div uiFeatureFilterStates>
          <ui-tabs
            [tabs]="tabs()"
            [activeTab]="activeTab()"
            variant="underline"
            (tabChange)="onTabChange($event)"
          ></ui-tabs>
        </div>
        <ui-button
          variant="ghost"
          size="sm"
          icon="rotate-cw"
          (clicked)="refreshProducts()"
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
          Ordenar: nombre
        </ui-button>
      </ui-feature-filter-bar>

      @if (error() && allProducts().length > 0) {
        <div
          class="feature-load-error-banner"
          role="status"
          aria-live="polite"
        >
          <lucide-icon
            name="alert-circle"
            size="20"
            class="feature-load-error-banner__icon"
            aria-hidden="true"
          ></lucide-icon>
          <span class="feature-load-error-banner__text">{{ error() }}</span>
          <ui-button
            variant="ghost"
            size="sm"
            icon="rotate-cw"
            (clicked)="refreshProducts()"
          >
            Reintentar
          </ui-button>
        </div>
      }

      @if (isLoading() && allProducts().length === 0) {
        <div class="feature-loader-wrap">
          <ui-loader message="Sincronizando inventario…"></ui-loader>
        </div>
      } @else if (error() && allProducts().length === 0) {
        <div class="feature-error-screen" role="alert">
          <lucide-icon
            name="wifi-off"
            size="48"
            class="feature-error-screen__icon"
            aria-hidden="true"
          ></lucide-icon>
          <h3>No se pudo cargar el inventario</h3>
          <p>{{ error() }}</p>
          <ui-button variant="solid" icon="rotate-cw" (clicked)="refreshProducts()">
            Reintentar
          </ui-button>
        </div>
      } @else {
        <ui-feature-grid>
          @for (product of sortedProducts(); track product.id) {
            <ui-feature-card
              [name]="product.name | uppercase"
              [subtitle]="product.category | uppercase"
              [avatarInitials]="getInitials(product.name)"
              [avatarBackground]="
                product.type === 'serialized'
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
              "
              [status]="
                product.status === 'available'
                  ? 'active'
                  : product.status === 'reserved'
                    ? 'warning'
                    : 'danger'
              "
              [badgeLabel]="getStatusLabel(product.status) | uppercase"
              [badgeVariant]="getStatusVariant(product.status)"
              [showEdit]="true"
              [showDuplicate]="true"
              [showDelete]="true"
              (cardClicked)="onRowClick(product)"
              (editClicked)="editProduct(product)"
              (duplicateClicked)="onDuplicate(product)"
              (deleteClicked)="confirmDelete(product)"
              [footerItems]="[
                { icon: 'layers', label: 'Stock: ' + product.totalStock },
                {
                  icon: 'euro',
                  label: (product.dailyRate | currency: 'EUR') + ' / día',
                },
              ]"
            >
              <div class="product-meta">
                <span class="sku">SKU: {{ product.sku || 'N/A' }}</span>
              </div>
            </ui-feature-card>
          } @empty {
            @if (filterProducesNoResults()) {
              <div class="feature-empty feature-empty--wide">
                <lucide-icon
                  name="search-x"
                  size="56"
                  class="feature-empty__icon"
                  aria-hidden="true"
                ></lucide-icon>
                <h3>Sin resultados</h3>
                <p>
                  Ningún producto coincide con la búsqueda o los filtros
                  actuales.
                </p>
                <ui-button
                  variant="ghost"
                  icon="circle-x"
                  (clicked)="clearFiltersAndSearch()"
                >
                  Limpiar búsqueda y filtros
                </ui-button>
              </div>
            } @else {
              <div class="feature-empty feature-empty--wide">
                <lucide-icon
                  name="box"
                  size="56"
                  class="feature-empty__icon"
                  aria-hidden="true"
                ></lucide-icon>
                <h3>No hay productos</h3>
                <p>
                  El inventario está vacío. Comienza registrando tu primer activo.
                </p>
                <ui-button
                  variant="solid"
                  (clicked)="goToNewProduct()"
                  icon="CirclePlus"
                  >Registrar equipo</ui-button
                >
              </div>
            }
          }
        </ui-feature-grid>

        <footer class="pagination-footer">
          <ui-pagination
            [currentPage]="currentPage()"
            [totalPages]="totalPages()"
            (pageChange)="onPageChange($event)"
          ></ui-pagination>
        </footer>
      }
    </ui-feature-page-shell>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      :host ::ng-deep .inventory-container {
        --grid-min-col-width: 280px;
        width: min(100%, 1280px);
        min-height: calc(100vh - 64px);
        margin: 0 auto;
        padding: clamp(1rem, 2.6vw, 2rem);
        gap: 1.25rem;
        background:
          radial-gradient(circle at 78% 12%, rgba(245, 158, 11, 0.14), transparent 22rem),
          linear-gradient(180deg, rgba(10, 10, 10, 0.96), rgba(2, 6, 23, 0.98));
        border-radius: 0;
        box-shadow: none;
        backdrop-filter: none;
      }

      :host ::ng-deep .inventory-container::before {
        display: none;
      }

      :host ::ng-deep ui-feature-header .feature-header {
        margin: 0 0 1rem;
      }

      :host ::ng-deep ui-feature-header .header-content {
        background: rgba(15, 23, 42, 0.94);
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 24px;
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.28);
      }

      :host ::ng-deep ui-feature-header .header-content::before {
        opacity: 0.35;
      }

      :host ::ng-deep ui-feature-header .main-title,
      :host ::ng-deep ui-feature-header .subtitle {
        color: #f8fafc;
      }

      :host ::ng-deep ui-feature-stats {
        padding: 0;
      }

      :host ::ng-deep ui-feature-stats .stats-wrapper {
        margin-bottom: 1rem;
      }

      :host ::ng-deep ui-feature-stats .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1rem;
      }

      :host ::ng-deep ui-feature-filter-bar .feature-filter-bar {
        margin-bottom: 1rem;
      }

      :host ::ng-deep ui-feature-filter-bar .feature-filter-bar--framed,
      :host ::ng-deep ui-search-toolbar .search-toolbar--feature {
        background: rgba(15, 23, 42, 0.94);
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 20px;
        box-shadow: 0 16px 44px rgba(0, 0, 0, 0.24);
        backdrop-filter: none;
      }

      :host ::ng-deep ui-tabs {
        display: block;
        max-width: 100%;
      }

      :host ::ng-deep ui-feature-grid .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(var(--grid-min-col-width), 1fr)) !important;
        gap: 1rem;
        margin-top: 1rem;
        align-items: stretch;
      }

      :host ::ng-deep ui-feature-card .feature-card {
        background: rgba(15, 23, 42, 0.96);
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 22px;
        box-shadow: 0 18px 55px rgba(0, 0, 0, 0.28);
        overflow: hidden;
      }

      :host ::ng-deep ui-feature-card .feature-card:hover {
        transform: translateY(-3px);
        border-color: color-mix(in srgb, var(--brand) 45%, rgba(148, 163, 184, 0.22));
      }

      :host ::ng-deep ui-feature-card .card-header {
        padding: 1.1rem 1.1rem 0.75rem;
      }

      :host ::ng-deep ui-feature-card .card-body {
        padding: 0 1.1rem 1rem;
      }

      :host ::ng-deep ui-feature-card .card-footer {
        padding: 0.9rem 1.1rem;
        background: rgba(2, 6, 23, 0.45);
        border-top: 1px solid rgba(148, 163, 184, 0.16);
      }

      :host ::ng-deep ui-feature-card .item-name {
        color: #f8fafc;
        white-space: normal;
      }

      :host ::ng-deep ui-feature-card .subtitle,
      :host ::ng-deep ui-feature-card .footer-item {
        color: #cbd5e1;
      }

      .flex-1 {
        flex: 1;
      }

      /* ─── Product meta badge (SKU) dentro de las tarjetas ─── */
      .product-meta {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        margin-top: 0.6rem;
        padding: 4px 10px;
        background: color-mix(in srgb, var(--brand) 6%, var(--surface-secondary) 94%);
        border: 1px solid color-mix(in srgb, var(--brand) 14%, var(--border-soft) 86%);
        border-radius: 6px;
        display: inline-flex;
        width: fit-content;
      }

      .sku {
        font-family: 'Share Tech Mono', ui-monospace, monospace;
        font-size: 0.68rem;
        font-weight: 600;
        color: color-mix(in srgb, var(--brand) 80%, var(--text-muted) 20%);
        letter-spacing: 0.07em;
        text-transform: uppercase;
      }

      /* ─── Pagination footer ─── */
      .pagination-footer {
        margin-top: 2.5rem;
        padding-top: 1.5rem;
        display: flex;
        justify-content: center;
        border-top: 1px solid var(--border-soft);
      }

      /* ─── Error banner (carga parcial) ─── */
      .feature-load-error-banner {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.85rem 1.25rem;
        background: color-mix(in srgb, var(--warning) 8%, var(--surface) 92%);
        border: 1px solid color-mix(in srgb, var(--warning) 25%, var(--border-soft) 75%);
        border-radius: 12px;
        font-size: 0.875rem;
        color: var(--text-primary);
      }

      .feature-load-error-banner__icon {
        color: var(--warning);
        flex-shrink: 0;
      }

      .feature-load-error-banner__text {
        flex: 1;
      }

      /* ─── Error screen (sin datos) ─── */
      .feature-error-screen {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 340px;
        gap: 1.25rem;
        text-align: center;
        padding: 3rem;
        background: color-mix(in srgb, var(--danger) 5%, var(--surface) 95%);
        border: 1px dashed color-mix(in srgb, var(--danger) 30%, var(--border-soft) 70%);
        border-radius: 20px;
      }

      .feature-error-screen__icon {
        color: var(--danger-muted);
        opacity: 0.7;
      }

      .feature-error-screen h3 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
      }

      .feature-error-screen p {
        font-size: 0.875rem;
        color: var(--text-muted);
        margin: 0;
        max-width: 36rem;
      }

      /* ─── Loader wrap ─── */
      .feature-loader-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 340px;
      }

      /* ─── Empty states ─── */
      .feature-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        gap: 1rem;
        text-align: center;
        padding: 3rem 2rem;
        border: 1px dashed var(--border-soft);
        border-radius: 16px;
        background: color-mix(in srgb, var(--brand) 3%, var(--surface) 97%);
        transition: background 0.3s ease;
      }

      .feature-empty--wide {
        grid-column: 1 / -1;
      }

      .feature-empty__icon {
        color: var(--text-muted);
        opacity: 0.45;
      }

      .feature-empty h3 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
      }

      .feature-empty p {
        font-size: 0.9rem;
        color: var(--text-muted);
        margin: 0;
        max-width: 32rem;
        line-height: 1.6;
      }

      /* ─── BABOONI LUXE INVENTORY OVERRIDES ─── */
      :host-context(html[data-erp-tenant='babooni']) .product-meta {
        background: rgba(2, 6, 23, 0.58);
        border-color: rgba(245, 158, 11, 0.22);
        border-radius: 8px;
        margin-top: 0.75rem;
        padding: 5px 12px;
      }

      :host-context(html[data-erp-tenant='babooni']) .sku {
        color: var(--brand);
        font-weight: 700;
        font-size: 0.65rem;
        letter-spacing: 0.08em;
      }

      :host-context(html[data-erp-tenant='babooni']) .feature-empty {
        background: rgba(15, 23, 42, 0.94);
        border-color: rgba(148, 163, 184, 0.22);
        border-radius: 20px;
        padding: 4rem 2rem;
      }

      :host-context(html[data-erp-tenant='babooni']) .feature-empty h3 {
        font-size: 1.35rem;
        font-weight: 700;
        color: #f8fafc;
      }

      :host-context(html[data-erp-tenant='babooni']) .feature-empty p {
        font-size: 0.9rem;
        color: var(--text-muted);
      }

      :host-context(html[data-erp-tenant='babooni']) .pagination-footer {
        border-top-color: color-mix(in srgb, var(--border-soft) 40%, transparent);
      }

      /* ─── Responsive ─── */
      @media (max-width: 640px) {
        :host ::ng-deep ui-feature-stats .stats-grid {
          grid-template-columns: 1fr;
        }

        :host ::ng-deep ui-feature-grid .feature-grid {
          grid-template-columns: 1fr !important;
        }

        .feature-empty {
          min-height: 240px;
          padding: 2rem 1rem;
        }

        .pagination-footer {
          margin-top: 1.5rem;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .product-meta,
        .feature-empty {
          transition: none;
        }
      }
     `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryListComponent
  implements OnInit, OnDestroy, FilterableService<Product>
{
  public readonly config = inject(INVENTORY_FEATURE_CONFIG);
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly facade = inject(InventoryFacade);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly aiFormBridge = inject(AIFormBridgeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly authStore = inject(GlobalAuthStore);
  readonly canAccess = rbacAllows(this.authStore, 'products.view', 'products.manage');

  currentTheme = this.themeService.currentThemeData;
  tabs = this.facade.tabs;
  columns = this.config.defaultColumns;

  products = this.facade.products;
  allProducts = this.facade.allProducts;
  isLoading = this.facade.isLoading;
  error = this.facade.error;
  activeTab = this.facade.activeTab;

  readonly hasAnyProducts = computed(() => this.allProducts().length > 0);
  readonly filterProducesNoResults = computed(
    () => this.hasAnyProducts() && this.products().length === 0,
  );
  currentPage = signal(1);
  totalPages = signal(1);
  searchTerm = '';
  sortField = signal<'name'>('name');
  sortDirection = signal<1 | -1>(1);

  /** Lista filtrada del facade, ordenada según `sortField` y `sortDirection`. */
  sortedProducts = computed(() => {
    const items = [...this.products()];
    const dir = this.sortDirection();
    const field = this.sortField();
    items.sort((a, b) => {
      const aVal = field === 'name' ? (a.name || '') : '';
      const bVal = field === 'name' ? (b.name || '') : '';
      const cmp = aVal.localeCompare(bVal, 'es', { sensitivity: 'base' });
      return dir === 1 ? cmp : -cmp;
    });
    return items;
  });

  private readonly listAiFormProxy: Record<string, unknown> = {};

  ngOnInit() {
    this.aiFormBridge.registerDataProxy(this.listAiFormProxy);
    this.masterFilter.registerProvider(this);
    this.loadProducts();
  }

  ngOnDestroy() {
    this.aiFormBridge.unregisterDataProxy(this.listAiFormProxy);
    this.masterFilter.unregisterProvider();
  }

  /** Lógica de filtrado para el MasterFilterService */
  filter(query: string): Observable<Product[]> {
    const term = query.toLowerCase().trim();
    if (!term) return of(this.allProducts());

    const matches = this.allProducts().filter((p: Product) => {
      const searchableText = [
        p.name,
        p.sku ?? '',
        p.category ?? '',
        p.description ?? '',
        p.type,
        p.status,
      ]
        .join(' ')
        .toLowerCase();

      // Enhanced matching for common Spanish terms
      const normalizedTerm = this.normalizeSearchTerm(term);

      return (
        searchableText.includes(normalizedTerm) ||
        this.hasKeywordMatch(searchableText, normalizedTerm)
      );
    });
    return of(matches);
  }

  private normalizeSearchTerm(term: string): string {
    // Handle common Spanish variations and synonyms
    const synonyms: Record<string, string[]> = {
      pantalla: ['pantalla', 'screen', 'display', 'monitor', 'led'],
      led: ['led', 'pantalla led', 'screen led'],
      equipo: ['equipo', 'equipment', 'device'],
      audio: ['audio', 'sound', 'speaker'],
      video: ['video', 'camera', 'camara'],
      luz: ['luz', 'light', 'lighting'],
      proyector: ['proyector', 'projector'],
      microfono: ['microfono', 'mic', 'microphone'],
      altavoz: ['altavoz', 'speaker', 'bocina'],
    };

    for (const [key, variants] of Object.entries(synonyms)) {
      if (variants.some((v) => term.includes(v))) {
        return key; // Return the canonical term for broader matching
      }
    }
    return term;
  }

  private hasKeywordMatch(text: string, term: string): boolean {
    // Check for exact matches and partial matches
    return (
      text.includes(term) ||
      term.split(' ').every((word) => text.includes(word))
    );
  }

  loadProducts() {
    this.facade.loadProducts();
  }
  onTabChange(tabId: string) {
    this.facade.setTab(tabId);
  }
  onSearch(term: string) {
    this.searchTerm = term;
    this.masterFilter.search(term);
    this.facade.searchProducts(term);
  }
  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  refreshProducts() {
    this.facade.loadProducts(true);
  }

  clearFiltersAndSearch(): void {
    this.searchTerm = '';
    this.masterFilter.search('');
    this.facade.searchProducts('');
    this.facade.setTab('all');
    this.currentPage.set(1);
  }

  toggleSort() {
    this.sortDirection.set(this.sortDirection() === 1 ? -1 : 1);
  }

  goToNewProduct(): void {
    void this.router.navigate(['new'], { relativeTo: this.route });
  }

  onRowClick(product: Product) {
    void this.router.navigate([product.id], { relativeTo: this.route });
  }

  getInitials(name: string | undefined): string {
    return (name || 'P')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  editProduct(product: Product) {
    void this.router.navigate([product.id, 'edit'], { relativeTo: this.route });
  }

  onDuplicate(product: Product) {
    const { id: _omitId, ...rest } = product;
    void _omitId;
    this.facade
      .createProduct({
        ...rest,
        name: `${product.name} (COPIA)`,
        sku: product.sku ? `${product.sku}-COPY` : '',
      })
      .subscribe({
        next: () =>
          this.toast.show(
            `Copia creada a partir de «${product.name}»`,
            'success',
          ),
        error: () =>
          this.toast.show('No se pudo duplicar el producto.', 'error'),
      });
  }

  confirmDelete(product: Product) {
    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar el producto ${product.name}?`,
      )
    ) {
      return;
    }
    this.facade.deleteProduct(product.id).subscribe({
      next: (ok) => {
        if (ok) {
          this.toast.show(
            `«${product.name}» eliminado del inventario`,
            'success',
          );
        } else {
          this.toast.show('No se pudo eliminar el producto.', 'error');
        }
      },
      error: () =>
        this.toast.show('Error al eliminar. Inténtalo de nuevo.', 'error'),
    });
  }

  getStatusVariant(
    status: string,
  ): 'success' | 'warning' | 'info' | 'secondary' | 'primary' | 'danger' {
    switch (status) {
      case 'available':
        return 'success';
      case 'reserved':
        return 'warning';
      case 'maintenance':
        return 'info';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'reserved':
        return 'Reservado';
      case 'maintenance':
        return 'Mantenimiento';
      default:
        return status;
    }
  }

  formatCurrencyEu(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  totalValue = computed(() =>
    this.allProducts().reduce(
      (acc: number, p: Product) =>
        acc + (p.dailyRate ?? 0) * (p.totalStock ?? 0),
      0,
    ),
  );
  criticalCount = computed(
    () =>
      this.allProducts().filter(
        (p: Product) => (p.availableStock ?? 0) < (p.totalStock ?? 0) * 0.2,
      ).length,
  );
}
