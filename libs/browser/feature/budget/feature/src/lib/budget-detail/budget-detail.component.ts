import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UiLoaderComponent,
  UiStatCardComponent,
  UiFeaturePageShellComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  ThemeService,
  PluginStore,
  ServicesCatalogApiService,
  ServiceCatalogItemDto,
} from '@josanz-erp/shared-data-access';
import { openPrintableDocument, escapeHtml } from '@josanz-erp/shared-utils';
import { BudgetService, BudgetStore } from '@josanz-erp/budget-data-access';
import { Budget, BudgetItem } from '@josanz-erp/budget-api';

@Component({
  selector: 'lib-budget-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    UiCardComponent,
    UiButtonComponent,
    UiLoaderComponent,
    UiStatCardComponent,
    UiFeaturePageShellComponent,
  ],
  template: `
    <ui-feature-page-shell
      [variant]="'widthOnly'"
      [fadeIn]="true"
      [extraClass]="pluginStore.highPerformanceMode() ? 'high-perf' : ''"
    >
      <div class="budget-detail__stack">
      @if (isLoading()) {
        <ui-loader
          message="Sincronizando expediente fiscal..."
        ></ui-loader>
      } @else if (budget()) {
        <header
          class="page-header"
          [style.border-bottom-color]="currentTheme().primary + '33'"
        >
          <div class="header-breadcrumb">
            <button
              type="button"
              class="back-btn"
              routerLink="/budgets"
              aria-label="Volver al listado de presupuestos"
            >
              <lucide-icon name="arrow-left" size="14" aria-hidden="true"></lucide-icon>
              VOLVER AL LISTADO
            </button>
            <h1
              class="page-title text-uppercase glow-text"
              [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'"
            >
              Presupuesto #{{ budget()?.id?.slice(0, 8) }}
            </h1>
            <div class="breadcrumb">
              <span class="active" [style.color]="currentTheme().primary"
                >Cliente ID: {{ budget()?.clientId }}</span
              >
              <span class="separator">/</span>
              <span>EXPEDIENTE COMERCIAL</span>
            </div>
          </div>
          <div class="header-actions">
            <ui-button
              variant="glass"
              size="md"
              icon="file-text"
              (clicked)="downloadPDF()"
              >GENERAR PDF</ui-button
            >
            <ui-button
              variant="primary"
              size="md"
              icon="send"
              (clicked)="sendToClient()"
              >ENVIAR FIRMA</ui-button
            >
          </div>
        </header>

        <div class="stats-row">
          <ui-stat-card
            label="Total Presupuestado"
            [value]="formatCurrencyEu(budget()?.total || 0)"
            icon="wallet"
            [accent]="true"
          >
          </ui-stat-card>
          <ui-stat-card
            label="Estado Actual"
            [value]="getStatusLabel(budget()?.status)"
            [icon]="getStatusIcon(budget()?.status)"
          >
          </ui-stat-card>
          <ui-stat-card
            label="Vencimiento Oferta"
            [value]="formatDate(budget()?.endDate)"
            icon="calendar-clock"
          >
          </ui-stat-card>
        </div>

        <div class="main-content">
          <ui-card variant="glass" title="Detalle de Líneas Comerciales">
            <div class="line-items-cards" role="list">
              @for (line of budget()?.items || []; track line.id) {
                <article class="line-item-card" role="listitem">
                  <h3 class="line-item-card__title">Producto {{ line.productId }}</h3>
                  <dl class="line-item-card__grid">
                    <div>
                      <dt>Cantidad</dt>
                      <dd>{{ line.quantity }}</dd>
                    </div>
                    <div>
                      <dt>Precio</dt>
                      <dd class="font-mono">{{ formatCurrencyEu(line.price) }}</dd>
                    </div>
                    <div>
                      <dt>Descuento</dt>
                      <dd>{{ line.discount }}%</dd>
                    </div>
                    <div>
                      <dt>Impuesto</dt>
                      <dd>{{ line.tax }}%</dd>
                    </div>
                  </dl>
                </article>
              } @empty {
                <p class="line-items-empty">Sin líneas en este presupuesto.</p>
              }
            </div>
          </ui-card>

          <div class="sidebar-info">
            <ui-card variant="glass" title="Servicios para presupuestar">
              <p class="catalog-hint">
                Referencia el catálogo tipificado al redactar líneas; precios orientativos.
              </p>
              @if (servicesLoading()) {
                <ui-loader
                  message="Cargando catálogo..."
                ></ui-loader>
              } @else if (catalogServices().length === 0) {
                <p class="catalog-empty">Sin datos de catálogo (revisa API o tenant).</p>
              } @else {
                <ul class="service-mini-list">
                  @for (s of catalogServices(); track s.id) {
                    <li class="service-mini-row">
                      <span class="service-name">{{ s.name }}</span>
                      <span class="service-type">{{ s.type }}</span>
                      <span class="font-mono service-price">{{
                        formatCurrencyEu(s.basePrice)
                      }}</span>
                    </li>
                  }
                </ul>
              }
              <ui-button
                variant="glass"
                size="sm"
                class="full-width catalog-link"
                routerLink="/services"
              >
                Abrir catálogo completo
              </ui-button>
            </ui-card>

            <ui-card variant="glass" title="Información Logística">
              <div class="info-list">
                <div class="info-item">
                  <span class="label">CREADO</span>
                  <span class="value">{{
                    formatDate(budget()?.createdAt)
                  }}</span>
                </div>
                <div class="info-item">
                  <span class="label">FIN PRODUCCIÓN</span>
                  <span class="value">{{ formatDate(budget()?.endDate) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">CREADO</span>
                  <span class="value">{{
                    formatDate(budget()?.createdAt)
                  }}</span>
                </div>
              </div>
            </ui-card>

            <ui-card variant="glass" title="Acciones de Seguimiento">
              <div class="actions-grid">
                @if (budget()?.status === 'ACCEPTED') {
                  <ui-button
                    variant="primary"
                    class="full-width"
                    icon="truck"
                    (clicked)="createDelivery()"
                  >
                    GENERAR ALBARÁN
                  </ui-button>
                  <ui-button
                    variant="glass"
                    class="full-width"
                    icon="history"
                    (clicked)="createInvoice()"
                  >
                    EMITIR FACTURA
                  </ui-button>
                } @else {
                  <ui-button
                    variant="glass"
                    class="full-width"
                    (clicked)="approveBudget()"
                    >FORZAR ACEPTACIÓN</ui-button
                  >
                }
              </div>
            </ui-card>
          </div>
        </div>
      }
      </div>
    </ui-feature-page-shell>
  `,
  styles: [
    `
      .budget-detail__stack {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
      }

      .back-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.6rem;
        font-weight: 800;
        cursor: pointer;
        padding: 0;
        margin-bottom: 0.5rem;
        transition: color 0.3s;
      }
      .back-btn:hover {
        color: #fff;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .glow-text {
        font-size: 1.6rem;
        font-weight: 900;
        color: #fff;
        margin: 0;
        letter-spacing: 0.05em;
        font-family: var(--font-main);
      }

      .breadcrumb {
        display: flex;
        gap: 8px;
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: var(--text-muted);
        margin-top: 0.5rem;
      }

      .stats-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .main-content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1.5rem;
      }

      .line-items-cards {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .line-item-card {
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-md, 8px);
        padding: 0.85rem 1rem;
        background: color-mix(in srgb, var(--surface) 92%, transparent);
      }
      .line-item-card__title {
        margin: 0 0 0.65rem 0;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.35;
        word-break: break-word;
      }
      .line-item-card__grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.65rem 1rem;
        margin: 0;
      }
      .line-item-card__grid > div {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        min-width: 0;
      }
      .line-item-card__grid dt {
        margin: 0;
        font-size: 0.58rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--text-muted);
      }
      .line-item-card__grid dd {
        margin: 0;
        font-size: 0.8rem;
        color: var(--text-secondary);
      }
      .line-items-empty {
        margin: 0;
        font-size: 0.8rem;
        color: var(--text-muted);
      }
      @media (max-width: 520px) {
        .line-item-card__grid {
          grid-template-columns: 1fr;
        }
      }

      .sidebar-info {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .info-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .info-item .label {
        font-size: 0.55rem;
        font-weight: 700;
        color: var(--text-muted);
        letter-spacing: 0.1em;
      }
      .info-item .value {
        font-size: 0.65rem;
        font-weight: 800;
        color: #fff;
      }

      .actions-grid {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .full-width {
        width: 100%;
      }

      .catalog-hint {
        font-size: 0.65rem;
        color: var(--text-muted);
        margin: 0 0 0.75rem;
        line-height: 1.4;
      }
      .catalog-empty {
        font-size: 0.65rem;
        color: var(--text-muted);
        margin: 0 0 0.75rem;
      }
      .service-mini-list {
        list-style: none;
        margin: 0 0 0.75rem;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-height: 200px;
        overflow-y: auto;
      }
      .service-mini-row {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 0.5rem;
        align-items: center;
        font-size: 0.6rem;
        padding-bottom: 0.35rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      .service-name {
        font-weight: 700;
        color: #fff;
      }
      .service-type {
        color: var(--text-muted);
        text-transform: uppercase;
        font-size: 0.5rem;
        letter-spacing: 0.06em;
      }
      .service-price {
        color: var(--text-muted);
        white-space: nowrap;
      }
      .catalog-link {
        margin-top: 0.25rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetDetailComponent implements OnInit {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly budgetService = inject(BudgetService);
  readonly store = inject(BudgetStore);
  private readonly servicesCatalog = inject(ServicesCatalogApiService);

  currentTheme = this.themeService.currentThemeData;
  budget = signal<Budget | null>(null);
  isLoading = signal(true);
  catalogServices = signal<ServiceCatalogItemDto[]>([]);
  servicesLoading = signal(true);

  ngOnInit() {
    this.loadCatalog();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBudget(id);
    }
  }

  loadCatalog() {
    this.servicesLoading.set(true);
    this.servicesCatalog.list().subscribe({
      next: (rows) => {
        this.catalogServices.set(rows.filter((s) => s.isActive !== false));
        this.servicesLoading.set(false);
      },
      error: () => {
        this.catalogServices.set([]);
        this.servicesLoading.set(false);
      },
    });
  }

  loadBudget(id: string) {
    const fromStore = this.store.budgets().find((b) => b.id === id);
    if (fromStore) {
      this.budget.set(fromStore);
      this.isLoading.set(false);
    } else {
      this.isLoading.set(true);
    }
    this.budgetService.getBudget(id).subscribe({
      next: (budget) => {
        if (budget) {
          this.budget.set(budget);
        } else if (!fromStore) {
          this.budget.set(null);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading budget:', error);
        if (!fromStore) {
          this.budget.set(null);
        }
        this.isLoading.set(false);
      },
    });
  }

  getStatusLabel(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'ACEPTADO';
      case 'sent':
        return 'ENVIADO';
      case 'draft':
        return 'BORRADOR';
      case 'rejected':
        return 'RECHAZADO';
      default:
        return 'DESCONOCIDO';
    }
  }

  getStatusIcon(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'check-circle';
      case 'sent':
        return 'navigation';
      case 'rejected':
        return 'circle-x';
      default:
        return 'help-circle';
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }

  formatCurrencyEu(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  }

  downloadPDF() {
    const b = this.budget();
    if (!b) return;
    const rows = b.items
      .map(
        (it: BudgetItem) =>
          `<tr><td>${escapeHtml(it.productId)}</td><td>${it.quantity}</td><td>${escapeHtml(
            this.formatCurrencyEu(it.price),
          )}</td><td>${it.discount}%</td><td>${it.tax}%</td></tr>`,
      )
      .join('');
    const body = `
      <h1>Presupuesto comercial</h1>
      <div class="meta">
        <div><strong>Nº expediente:</strong> ${escapeHtml(b.id)}</div>
        <div><strong>Cliente ID:</strong> ${escapeHtml(b.clientId)}</div>
        <div><strong>Estado:</strong> ${escapeHtml(this.getStatusLabel(b.status))}</div>
        <div><strong>Inicio:</strong> ${escapeHtml(this.formatDate(b.startDate))}</div>
        <div><strong>Fin:</strong> ${escapeHtml(this.formatDate(b.endDate))}</div>
        <div><strong>Creado:</strong> ${escapeHtml(this.formatDate(b.createdAt))}</div>
      </div>
      <table>
        <thead><tr><th>Producto ID</th><th>Cant.</th><th>Precio</th><th>Descuento</th><th>Impuesto</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="totals">Total: ${escapeHtml(this.formatCurrencyEu(b.total))}</p>
    `;
    openPrintableDocument(`Presupuesto ${b.id.slice(0, 8)}`, body);
  }
  sendToClient() {
    const budget = this.budget();
    if (!budget) return;
    this.budgetService.sendBudget(budget.id).subscribe({
      next: (updatedBudget) => {
        this.budget.set(updatedBudget);
      },
      error: (error) => {
        console.error('Error sending budget:', error);
      },
    });
  }

  approveBudget() {
    const budget = this.budget();
    if (!budget) return;
    this.budgetService.acceptBudget(budget.id).subscribe({
      next: (updatedBudget) => {
        this.budget.set(updatedBudget);
      },
      error: (error) => {
        console.error('Error approving budget:', error);
      },
    });
  }
  createDelivery() {
    this.router.navigate(['/delivery'], {
      queryParams: { budgetId: this.budget()?.id },
    });
  }
  
  createInvoice() {
    this.router.navigate(['/billing'], {
      queryParams: { budgetId: this.budget()?.id },
    });
  }
}
