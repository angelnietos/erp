import {
  Component,
  OnInit,
  signal,
  inject,
  computed,
  ChangeDetectionStrategy,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  LucideAngularModule,
  FileText,
  Calendar,
  Users,
  TrendingUp,
} from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UiSelectComponent,
  UiInputComponent,
  UiFeatureFilterBarComponent,
  UiFeatureAccessDeniedComponent,
  UiLoaderComponent,
  UiFeaturePageShellComponent,
  UiFeatureHeaderComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  PluginStore,
  ToastService,
  GlobalAuthStore,
  rbacAllows,
} from '@josanz-erp/shared-data-access';
import { escapeHtml, openPrintableDocument } from '@josanz-erp/shared-utils';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: typeof FileText;
  category:
    | 'events'
    | 'equipment'
    | 'projects'
    | 'sales'
    | 'inventory'
    | 'fleet';
}

interface ReportFilter {
  dateFrom: string;
  dateTo: string;
  clientId?: string;
  status?: string;
  type?: string;
}

interface Report {
  id: string;
  type: string;
  title: string;
  generatedAt: string;
  dateRange: string;
  filters: ReportFilter;
}

@Component({
  selector: 'lib-reports',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiCardComponent,
    UiButtonComponent,
    UiSelectComponent,
    UiInputComponent,
    UiFeatureFilterBarComponent,
    LucideAngularModule,
    UiFeatureAccessDeniedComponent,
    UiLoaderComponent,
    UiFeaturePageShellComponent,
    UiFeatureHeaderComponent,
  ],
  template: `
    <ui-feature-page-shell
      [variant]="'padMd'"
      [fadeIn]="true"
      [extraClass]="'page-container' + (pluginStore.highPerformanceMode() ? ' perf-optimized' : '')"
    >
      @if (!canAccess()) {
        <ui-feature-access-denied
          message="No tienes permiso para ver reportes."
          permissionHint="reports.view"
        />
      } @else {
      <ui-feature-header
        title="Sistema de Reportes"
        breadcrumbLead="ANÁLISIS Y REPORTING"
        breadcrumbTail="INFORMES EJECUTIVOS"
      />

      <div class="reports-content">
        @if (serverExportError()) {
          <div
            class="feature-load-error-banner"
            role="alert"
            aria-live="assertive"
          >
            <lucide-icon
              name="alert-circle"
              size="20"
              class="feature-load-error-banner__icon"
              aria-hidden="true"
            ></lucide-icon>
            <span class="feature-load-error-banner__text">{{
              serverExportError()
            }}</span>
            <ui-button
              variant="ghost"
              size="sm"
              icon="x"
              (clicked)="clearServerExportError()"
            >
              Cerrar
            </ui-button>
          </div>
        }
        <!-- Report Types Grid -->
        <div class="report-types-grid">
          @for (reportType of reportTypes(); track reportType.id) {
            <ui-card
              class="report-type-card"
              (click)="selectReportType(reportType)"
            >
              <div class="report-type-content">
                <div class="report-icon">
                  <lucide-icon [img]="reportType.icon" size="32" aria-hidden="true"></lucide-icon>
                </div>
                <div class="report-info">
                  <h3 class="report-name">{{ reportType.name }}</h3>
                  <p class="report-description text-friendly">
                    {{ reportType.description }}
                  </p>
                  <span class="report-category">{{
                    getCategoryName(reportType.category)
                  }}</span>
                </div>
              </div>
            </ui-card>
          }
        </div>

        <!-- Report Generation Form -->
        @if (selectedReportType()) {
          <div class="report-form-section">
            <ui-card>
              <div class="form-header">
                <h2>Generar Reporte: {{ selectedReportType()?.name }}</h2>
                <p class="text-friendly">
                  Configura los filtros y genera tu reporte
                </p>
              </div>

              @if (generationError()) {
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
                  <span class="feature-load-error-banner__text">{{
                    generationError()
                  }}</span>
                  <ui-button
                    variant="ghost"
                    size="sm"
                    icon="rotate-cw"
                    (clicked)="generateReport()"
                  >
                    Reintentar
                  </ui-button>
                </div>
              }

              <div
                class="report-form-shell"
                [attr.aria-busy]="generating()"
              >
                @if (generating()) {
                  <div
                    class="report-form-shell__overlay"
                    role="status"
                    aria-live="polite"
                  >
                    <ui-loader message="Generando informe…"></ui-loader>
                  </div>
                }
                <form
                  class="report-form"
                  [class.report-form--blocked]="generating()"
                  (ngSubmit)="generateReport()"
                >
                  <div class="form-grid">
                    <ui-input
                      label="Fecha Desde"
                      type="date"
                      [(ngModel)]="filters.dateFrom"
                      name="dateFrom"
                      required
                    />

                    <ui-input
                      label="Fecha Hasta"
                      type="date"
                      [(ngModel)]="filters.dateTo"
                      name="dateTo"
                      required
                    />

                    @if (
                      selectedReportType()?.category === 'events' ||
                      selectedReportType()?.category === 'projects'
                    ) {
                      <ui-select
                        label="Estado"
                        [(ngModel)]="filters.status"
                        name="status"
                        [options]="statusOptions"
                      />
                    }

                    @if (selectedReportType()?.category === 'events') {
                      <ui-input
                        label="ID Cliente (opcional)"
                        [(ngModel)]="filters.clientId"
                        name="clientId"
                        placeholder="Buscar por cliente específico"
                      />
                    }
                  </div>

                  <div class="form-actions">
                    <ui-button
                      type="button"
                      variant="secondary"
                      icon="sliders-horizontal"
                      [disabled]="generating()"
                      (click)="clearFilters()"
                    >
                      Limpiar Filtros
                    </ui-button>
                    <ui-button
                      type="submit"
                      variant="primary"
                      icon="download"
                      [disabled]="generating()"
                    >
                      Generar Reporte
                    </ui-button>
                  </div>
                </form>
              </div>
            </ui-card>
          </div>
        }

        <!-- Generated Reports List -->
        @if (filteredGeneratedReports().length > 0) {
          <div class="reports-list-section">
            <ui-card>
              <div class="section-header">
                <h2>Reportes Generados</h2>
              </div>
              <ui-feature-filter-bar
                [framed]="false"
                [appearance]="'feature'"
                [searchVariant]="'glass'"
                placeholder="Buscar reportes por título o tipo..."
                (searchChange)="onSearchChange($event)"
              />
              <div class="reports-list">
                @for (report of filteredGeneratedReports(); track report.id) {
                  <div class="report-item">
                    <div class="report-item-content">
                      <div class="report-icon">
                        <lucide-icon
                          [img]="getReportTypeIcon(report.type)"
                          size="20"
                          aria-hidden="true"
                        ></lucide-icon>
                      </div>
                      <div class="report-details">
                        <h4 class="report-title">{{ report.title }}</h4>
                        <p class="report-meta text-friendly">
                          Generado: {{ report.generatedAt }} | Filtros:
                          {{ report.dateRange }}
                        </p>
                      </div>
                    </div>
                    <div class="report-actions">
                      <ui-button
                        variant="ghost"
                        size="sm"
                        (clicked)="downloadReportJson(report)"
                      >
                        <lucide-icon
                          [name]="'download'"
                          size="16"
                          aria-hidden="true"
                        ></lucide-icon>
                        JSON
                      </ui-button>
                      <ui-button
                        variant="ghost"
                        size="sm"
                        (clicked)="downloadReportCsv(report)"
                      >
                        Excel (CSV)
                      </ui-button>
                      <ui-button
                        variant="ghost"
                        size="sm"
                        (clicked)="downloadReportPdf(report)"
                      >
                        PDF
                      </ui-button>
                      <ui-button
                        variant="ghost"
                        size="sm"
                        [disabled]="serverExportBusy()"
                        (clicked)="downloadServerXlsx(report, $event)"
                      >
                        Excel (API)
                      </ui-button>
                      <ui-button
                        variant="ghost"
                        size="sm"
                        [disabled]="serverExportBusy()"
                        (clicked)="downloadServerPdf(report, $event)"
                      >
                        PDF (API)
                      </ui-button>
                    </div>
                  </div>
                }
              </div>
            </ui-card>
          </div>
        }
      </div>
      }
    </ui-feature-page-shell>
  `,
  styles: [
    `
      .reports-content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .report-types-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 1.5rem;
      }

      .report-type-card {
        cursor: pointer;
        transition: all 0.2s;
        border: 2px solid transparent;
      }

      .report-type-card:hover {
        border-color: var(--primary);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .report-type-content {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1.5rem;
      }

      .report-icon {
        padding: 0.75rem;
        background: rgba(var(--primary-rgb), 0.1);
        border-radius: 0.5rem;
        color: var(--primary);
        flex-shrink: 0;
      }

      .report-info h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .report-description {
        margin: 0 0 0.75rem 0;
        color: var(--text-secondary);
        font-size: 0.875rem;
        line-height: 1.4;
      }

      .report-category {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background: rgba(var(--primary-rgb), 0.1);
        color: var(--primary);
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
      }

      .report-form-section {
        margin-top: 1rem;
      }

      .form-header {
        margin-bottom: 1.5rem;
      }

      .form-header h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .form-header p {
        margin: 0;
        color: var(--text-secondary);
      }

      .report-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .report-form-shell {
        position: relative;
        min-height: 6rem;
      }

      .report-form-shell__overlay {
        position: absolute;
        inset: 0;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-md, 0.5rem);
        background: color-mix(
          in srgb,
          var(--surface, #0c1016) 58%,
          transparent
        );
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
      }

      .report-form--blocked {
        pointer-events: none;
        user-select: none;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .reports-list-section {
        margin-top: 1rem;
      }

      .section-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .reports-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .report-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.05);
      }

      .report-item-content {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .report-details h4 {
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
        font-weight: 500;
        color: var(--text-primary);
      }

      .report-meta {
        margin: 0;
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .report-actions {
        flex-shrink: 0;
      }

      @media (max-width: 768px) {
        .report-types-grid {
          grid-template-columns: 1fr;
        }

        .report-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .report-actions {
          align-self: stretch;
        }

        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent implements OnInit {
  public readonly pluginStore = inject(PluginStore);
  private readonly authStore = inject(GlobalAuthStore);
  readonly canAccess = rbacAllows(this.authStore, 'reports.view');
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly ngZone = inject(NgZone);

  private readonly FileText = FileText;
  private readonly Calendar = Calendar;
  private readonly Users = Users;
  private readonly TrendingUp = TrendingUp;

  selectedReportType = signal<ReportType | null>(null);
  generating = signal(false);
  /** Error al generar el informe (además del toast). */
  generationError = signal<string | null>(null);
  /** Fallo de exportación Excel/PDF por API (además del toast). */
  serverExportError = signal<string | null>(null);

  filters: ReportFilter = {
    dateFrom: '',
    dateTo: '',
    status: '',
    clientId: '',
  };

  /** Evita clics repetidos en exportes API (blob + Zone). */
  serverExportBusy = signal(false);

  statusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Activo', value: 'ACTIVE' },
    { label: 'Completado', value: 'COMPLETED' },
    { label: 'Cancelado', value: 'CANCELLED' },
  ];

  reportTypes = signal<ReportType[]>([
    {
      id: 'events-summary',
      name: 'Resumen de Eventos',
      description: 'Listado completo de eventos con estadísticas generales',
      icon: this.Calendar,
      category: 'events',
    },
    {
      id: 'equipment-damage',
      name: 'Daños en Equipos',
      description: 'Reportes de daños y estado de equipos',
      icon: this.FileText,
      category: 'equipment',
    },
    {
      id: 'projects-material',
      name: 'Material en Proyectos',
      description: 'Uso de material por proyecto y trazabilidad',
      icon: this.TrendingUp,
      category: 'projects',
    },
    {
      id: 'sales-invoices',
      name: 'Ventas y Facturas',
      description: 'Resumen de ventas y estado de facturas',
      icon: this.TrendingUp,
      category: 'sales',
    },
    {
      id: 'inventory-status',
      name: 'Estado de Inventario',
      description: 'Niveles de stock y movimientos de inventario',
      icon: this.FileText,
      category: 'inventory',
    },
    {
      id: 'fleet-utilization',
      name: 'Utilización de Flota',
      description: 'Uso de vehículos y conductores',
      icon: this.Users,
      category: 'fleet',
    },
  ]);

  generatedReports = signal<Report[]>([]);
  searchTerm = signal('');

  filteredGeneratedReports = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.generatedReports();
    return this.generatedReports().filter(
      (report) =>
        report.title.toLowerCase().includes(term) ||
        report.type.toLowerCase().includes(term),
    );
  });

  ngOnInit() {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.filters.dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
    this.filters.dateTo = today.toISOString().split('T')[0];
  }

  selectReportType(reportType: ReportType) {
    this.selectedReportType.set(reportType);
  }

  getCategoryName(category: string): string {
    const names: Record<string, string> = {
      events: 'Eventos',
      equipment: 'Equipos',
      projects: 'Proyectos',
      sales: 'Ventas',
      inventory: 'Inventario',
      fleet: 'Flota',
    };
    return names[category] || category;
  }

  clearFilters() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.filters = {
      dateFrom: thirtyDaysAgo.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0],
      status: '',
      clientId: '',
    };
  }

  private normalizeFilters(): ReportFilter {
    const f = this.filters;
    const client = f.clientId?.trim();
    const status = f.status?.trim();
    return {
      dateFrom: f.dateFrom,
      dateTo: f.dateTo,
      ...(status ? { status } : {}),
      ...(client ? { clientId: client } : {}),
      ...(f.type?.trim() ? { type: f.type.trim() } : {}),
    };
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
  }

  onSearchChange(event: string) {
    this.searchTerm.set(event);
  }

  clearServerExportError(): void {
    this.serverExportError.set(null);
  }

  async generateReport() {
    if (!this.selectedReportType()) return;

    this.generationError.set(null);
    this.generating.set(true);

    try {
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newReport = {
        id: Date.now().toString(),
        type: this.selectedReportType()?.id || 'unknown',
        title: `${this.selectedReportType()?.name} - ${this.filters.dateFrom} a ${this.filters.dateTo}`,
        generatedAt: new Date().toLocaleString('es-ES'),
        dateRange: `${this.filters.dateFrom} - ${this.filters.dateTo}`,
        filters: this.normalizeFilters(),
      };

      this.generatedReports.update((reports) => [newReport, ...reports]);
      this.toast.show('Informe generado correctamente.', 'success');
    } catch {
      const msg =
        'No se pudo generar el informe. Comprueba la conexión e inténtalo de nuevo.';
      this.generationError.set(msg);
      this.toast.show(msg, 'error');
    } finally {
      this.generating.set(false);
    }
  }

  getReportTypeIcon(type: string) {
    const reportType = this.reportTypes().find((rt) => rt.id === type);
    return reportType?.icon || this.FileText;
  }

  downloadReportJson(report: Report) {
    const body = {
      id: report.id,
      tipo: report.type,
      titulo: report.title,
      generadoEn: report.generatedAt,
      rangoFechas: report.dateRange,
      filtros: report.filters,
    };
    const json = JSON.stringify(body, null, 2);
    const blob = new Blob([json], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `josanz-reporte-${report.id}.json`;
    a.rel = 'noopener';
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadReportCsv(report: Report) {
    const rows = [
      ['id', 'tipo', 'titulo', 'generadoEn', 'rangoFechas'],
      [
        report.id,
        report.type,
        report.title,
        report.generatedAt,
        report.dateRange,
      ],
    ];
    const esc = (c: string) => `"${String(c).replace(/"/g, '""')}"`;
    const csv = '\uFEFF' + rows.map((r) => r.map(esc).join(';')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `josanz-reporte-${report.id}.csv`;
    a.rel = 'noopener';
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadReportPdf(report: Report) {
    const f = report.filters;
    const filtrosHtml = escapeHtml(JSON.stringify(f, null, 2));
    const body = `
      <h1>Informe ejecutivo</h1>
      <p><strong>Título:</strong> ${escapeHtml(report.title)}</p>
      <p><strong>Tipo:</strong> ${escapeHtml(report.type)}</p>
      <p><strong>Generado:</strong> ${escapeHtml(report.generatedAt)}</p>
      <p><strong>Rango:</strong> ${escapeHtml(report.dateRange)}</p>
      <h2>Filtros</h2>
      <pre>${filtrosHtml}</pre>
    `;
    openPrintableDocument(`Reporte ${report.id}`, body);
  }

  private triggerBlobDownload(blob: Blob, filename: string) {
    this.ngZone.runOutsideAngular(() => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.rel = 'noopener';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 2500);
    });
  }

  async downloadServerXlsx(report: Report, ev?: Event) {
    ev?.stopPropagation?.();
    if (this.serverExportBusy()) {
      return;
    }
    this.serverExportBusy.set(true);
    const f = report.filters;
    const headers = ['Campo', 'Valor'];
    const rows: (string | number | null)[][] = [
      ['id', report.id],
      ['tipo', report.type],
      ['titulo', report.title],
      ['generadoEn', report.generatedAt],
      ['rango', report.dateRange],
      ['fechaDesde', f.dateFrom],
      ['fechaHasta', f.dateTo],
      ['estado', f.status ?? ''],
      ['clienteId', f.clientId ?? ''],
    ];
    try {
      const blob = await firstValueFrom(
        this.http.post(
          '/api/reports/export/xlsx',
          { title: report.title.slice(0, 200), headers, rows },
          { responseType: 'blob' },
        ),
      );
      this.triggerBlobDownload(blob, `josanz-informe-${report.id}.xlsx`);
      this.serverExportError.set(null);
      this.toast.show('Excel descargado.', 'success');
    } catch {
      const msg =
        'No se pudo generar el Excel en el servidor (red o API). Comprueba sesión e inténtalo de nuevo.';
      this.serverExportError.set(msg);
      this.toast.show(msg, 'error');
    } finally {
      this.serverExportBusy.set(false);
    }
  }

  async downloadServerPdf(report: Report, ev?: Event) {
    ev?.stopPropagation?.();
    if (this.serverExportBusy()) {
      return;
    }
    this.serverExportBusy.set(true);
    const f = report.filters;
    const lines: string[] = [];
    const sections = [
      {
        heading: 'Metadatos',
        lines: [
          `ID informe: ${report.id}`,
          `Tipo: ${report.type}`,
          `Rango: ${report.dateRange}`,
        ],
      },
      {
        heading: 'Filtros',
        lines: [
          `Desde ${f.dateFrom} · Hasta ${f.dateTo}`,
          f.status ? `Estado: ${f.status}` : 'Estado: (todos)',
          f.clientId ? `Cliente: ${f.clientId}` : 'Cliente: (no filtrado)',
        ],
      },
    ];
    const table = {
      headers: ['Campo', 'Valor'],
      rows: [
        ['id', report.id],
        ['tipo', report.type],
        ['titulo', report.title],
        ['generadoEn', report.generatedAt],
        ['rango', report.dateRange],
        ['fechaDesde', f.dateFrom],
        ['fechaHasta', f.dateTo],
        ['estado', f.status ?? '—'],
        ['clienteId', f.clientId ?? '—'],
      ],
    };
    try {
      const blob = await firstValueFrom(
        this.http.post(
          '/api/reports/export/pdf',
          {
            title: report.title.slice(0, 200),
            subtitle: `Generado el ${report.generatedAt}`,
            lines,
            sections,
            table,
          },
          { responseType: 'blob' },
        ),
      );
      this.triggerBlobDownload(blob, `josanz-informe-${report.id}.pdf`);
      this.serverExportError.set(null);
      this.toast.show('PDF descargado.', 'success');
    } catch {
      const msg =
        'No se pudo generar el PDF en el servidor (red o API). Comprueba sesión e inténtalo de nuevo.';
      this.serverExportError.set(msg);
      this.toast.show(msg, 'error');
    } finally {
      this.serverExportBusy.set(false);
    }
  }
}
