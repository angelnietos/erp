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
  UiTableComponent,
  UiStatCardComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  ThemeService,
  PluginStore,
  ServicesCatalogApiService,
  ServiceCatalogItemDto,
} from '@josanz-erp/shared-data-access';
import { openPrintableDocument, escapeHtml } from '@josanz-erp/shared-utils';
import { BudgetService } from '@josanz-erp/budget-data-access';
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
    UiTableComponent,
    UiStatCardComponent,
  ],
  template: `
    <div
      class="page-container animate-fade-in"
      [class.high-perf]="pluginStore.highPerformanceMode()"
    >
      @if (isLoading()) {
        <ui-josanz-loader
          message="Sincronizando expediente fiscal..."
        ></ui-josanz-loader>
      } @else if (budget()) {
        <header
          class="page-header"
          [style.border-bottom-color]="currentTheme().primary + '33'"
        >
          <div class="header-breadcrumb">
            <button class="back-btn" routerLink="/budgets">
              <lucide-icon name="arrow-left" size="14"></lucide-icon>
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
            <ui-josanz-button
              variant="glass"
              size="md"
              icon="file-text"
              (clicked)="downloadPDF()"
              >GENERAR PDF</ui-josanz-button
            >
            <ui-josanz-button
              variant="primary"
              size="md"
              icon="send"
              (clicked)="sendToClient()"
              >ENVIAR FIRMA</ui-josanz-button
            >
          </div>
        </header>

        <div class="stats-row">
          <ui-josanz-stat-card
            label="Total Presupuestado"
            [value]="formatCurrencyEu(budget()?.total || 0)"
            icon="wallet"
            [accent]="true"
          >
          </ui-josanz-stat-card>
          <ui-josanz-stat-card
            label="Estado Actual"
            [value]="getStatusLabel(budget()?.status)"
            [icon]="getStatusIcon(budget()?.status)"
          >
          </ui-josanz-stat-card>
          <ui-josanz-stat-card
            label="Vencimiento Oferta"
            [value]="formatDate(budget()?.endDate)"
            icon="calendar-clock"
          >
          </ui-josanz-stat-card>
        </div>

        <div class="main-content">
          <ui-josanz-card variant="glass" title="Detalle de Líneas Comerciales">
            <ui-josanz-table
              [columns]="itemColumns"
              [data]="budget()?.items || []"
            >
              <ng-template #cellTemplate let-item let-key="key">
                @switch (key) {
                  @case ('price') {
                    <span class="font-mono">{{
                      formatCurrencyEu(item.price)
                    }}</span>
                  }
                  @case ('discount') {
                    <span>{{ item.discount }}%</span>
                  }
                  @case ('tax') {
                    <span>{{ item.tax }}%</span>
                  }
                  @default {
                    {{ item[key] }}
                  }
                }
              </ng-template>
            </ui-josanz-table>
          </ui-josanz-card>

          <div class="sidebar-info">
            <ui-josanz-card variant="glass" title="Servicios para presupuestar">
              <p class="catalog-hint">
                Referencia el catálogo tipificado al redactar líneas; precios orientativos.
              </p>
              @if (servicesLoading()) {
                <ui-josanz-loader
                  message="Cargando catálogo..."
                ></ui-josanz-loader>
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
              <ui-josanz-button
                variant="glass"
                size="sm"
                class="full-width catalog-link"
                routerLink="/services"
              >
                Abrir catálogo completo
              </ui-josanz-button>
            </ui-josanz-card>

            <ui-josanz-card variant="glass" title="Información Logística">
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
            </ui-josanz-card>

            <ui-josanz-card variant="glass" title="Acciones de Seguimiento">
              <div class="actions-grid">
                @if (budget()?.status === 'ACCEPTED') {
                  <ui-josanz-button
                    variant="primary"
                    class="full-width"
                    icon="truck"
                    (clicked)="createDelivery()"
                  >
                    GENERAR ALBARÁN
                  </ui-josanz-button>
                  <ui-josanz-button
                    variant="glass"
                    class="full-width"
                    icon="history"
                    (clicked)="createInvoice()"
                  >
                    EMITIR FACTURA
                  </ui-josanz-button>
                } @else {
                  <ui-josanz-button
                    variant="glass"
                    class="full-width"
                    (clicked)="approveBudget()"
                    >FORZAR ACEPTACIÓN</ui-josanz-button
                  >
                }
              </div>
            </ui-josanz-card>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 0;
        max-width: 100%;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
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
  private readonly servicesCatalog = inject(ServicesCatalogApiService);

  currentTheme = this.themeService.currentThemeData;
  budget = signal<Budget | null>(null);
  isLoading = signal(true);
  catalogServices = signal<ServiceCatalogItemDto[]>([]);
  servicesLoading = signal(true);

  itemColumns = [
    { key: 'productId', header: 'Producto ID' },
    { key: 'quantity', header: 'Cant.', width: '80px' },
    { key: 'price', header: 'Precio', width: '120px' },
    { key: 'discount', header: 'Descuento', width: '100px' },
    { key: 'tax', header: 'Impuesto', width: '100px' },
  ];

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
    this.isLoading.set(true);
    this.budgetService.getBudget(id).subscribe({
      next: (budget) => {
        this.budget.set(budget);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading budget:', error);
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
        return 'x-circle';
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
