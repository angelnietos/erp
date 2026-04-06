import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  UiBadgeComponent,
} from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';

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
    LucideAngularModule,
  ],
  template: `
    <div class="page-container animate-fade-in" [class.perf-optimized]="pluginStore.highPerformanceMode()">
      <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
        <div class="header-breadcrumb">
          <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'">
            Sistema de Reportes
          </h1>
          <div class="breadcrumb">
            <span class="active" [style.color]="currentTheme().primary">ANÁLISIS Y REPORTING</span>
            <span class="separator">/</span>
            <span>INFORMES EJECUTIVOS</span>
          </div>
        </div>
      </header>

      <div class="reports-content">
        <!-- Report Types Grid -->
        <div class="report-types-grid">
          @for (reportType of reportTypes(); track reportType.id) {
            <ui-josanz-card
              class="report-type-card"
              (click)="selectReportType(reportType)"
            >
              <div class="report-type-content">
                <div class="report-icon">
                  <lucide-icon [img]="reportType.icon" size="32"></lucide-icon>
                </div>
                <div class="report-info">
                  <h3 class="report-name">{{ reportType.name }}</h3>
                  <p class="report-description text-friendly">{{ reportType.description }}</p>
                  <span class="report-category">{{
                    getCategoryName(reportType.category)
                  }}</span>
                </div>
              </div>
            </ui-josanz-card>
          }
        </div>

        <!-- Report Generation Form -->
        @if (selectedReportType()) {
          <div class="report-form-section">
            <ui-josanz-card>
              <div class="form-header">
                <h2>Generar Reporte: {{ selectedReportType()?.name }}</h2>
                <p class="text-friendly">Configura los filtros y genera tu reporte</p>
              </div>

              <form class="report-form" (ngSubmit)="generateReport()">
                <div class="form-grid">
                  <ui-josanz-input
                    label="Fecha Desde"
                    type="date"
                    [(ngModel)]="filters.dateFrom"
                    name="dateFrom"
                    required
                  />

                  <ui-josanz-input
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
                    <ui-josanz-select
                      label="Estado"
                      [(ngModel)]="filters.status"
                      name="status"
                      [options]="statusOptions"
                    />
                  }

                  @if (selectedReportType()?.category === 'events') {
                    <ui-josanz-input
                      label="ID Cliente (opcional)"
                      [(ngModel)]="filters.clientId"
                      name="clientId"
                      placeholder="Buscar por cliente específico"
                    />
                  }
                </div>

                <div class="form-actions">
                  <ui-josanz-button
                    type="button"
                    variant="secondary"
                    icon="sliders-horizontal"
                    (click)="clearFilters()"
                  >
                    Limpiar Filtros
                  </ui-josanz-button>
                  <ui-josanz-button
                    type="submit"
                    variant="primary"
                    icon="download"
                    [disabled]="generating()"
                  >
                    {{ generating() ? 'Generando...' : 'Generar Reporte' }}
                  </ui-josanz-button>
                </div>
              </form>
            </ui-josanz-card>
          </div>
        }

        <!-- Generated Reports List -->
        @if (generatedReports().length > 0) {
          <div class="reports-list-section">
            <ui-josanz-card>
              <div class="section-header">
                <h2>Reportes Generados</h2>
              </div>
              <div class="reports-list">
                @for (report of generatedReports(); track report.id) {
                  <div class="report-item">
                    <div class="report-item-content">
                      <div class="report-icon">
                        <lucide-icon
                          [img]="getReportTypeIcon(report.type)"
                          size="20"
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
                      <ui-josanz-button
                        variant="ghost"
                        size="sm"
                        (click)="downloadReport(report)"
                      >
                        <lucide-icon [name]="'download'" size="16"></lucide-icon>
                        Descargar
                      </ui-josanz-button>
                    </div>
                  </div>
                }
              </div>
            </ui-josanz-card>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
    .page-container {
      padding: 0;
      max-width: 100%;
      margin: 0 auto;
    }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-end;
      margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .header-breadcrumb {
      flex: 1;
    }

    .page-title {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: 0.025em;
    }

    .breadcrumb {
      display: flex; gap: 8px; font-size: 0.6rem; font-weight: 700;
      letter-spacing: 0.1em; color: var(--text-muted); margin-top: 0.5rem;
    }

    .separator {
      opacity: 0.5;
    }

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
      border-top: 1px solid rgba(255,255,255,0.1);
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
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 0.5rem;
      background: rgba(255,255,255,0.05);
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

    .text-uppercase {
      text-transform: uppercase;
    }

    .glow-text {
      font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0;
      letter-spacing: 0.05em; font-family: var(--font-main);
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
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);

  currentTheme = this.themeService.currentThemeData;
  private readonly FileText = FileText;
  private readonly Calendar = Calendar;
  private readonly Users = Users;
  private readonly TrendingUp = TrendingUp;

  selectedReportType = signal<ReportType | null>(null);
  generating = signal(false);

  filters: ReportFilter = {
    dateFrom: '',
    dateTo: '',
  };

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
    };
  }

  async generateReport() {
    if (!this.selectedReportType()) return;

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
        filters: { ...this.filters },
      };

      this.generatedReports.update((reports) => [newReport, ...reports]);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      this.generating.set(false);
    }
  }

  getReportTypeIcon(type: string) {
    const reportType = this.reportTypes().find((rt) => rt.id === type);
    return reportType?.icon || this.FileText;
  }

  downloadReport(report: Report) {
    // Simulate download
    console.log('Downloading report:', report);
    // In a real implementation, this would trigger a file download
  }
}
