import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Download,
  Filter,
} from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UiSelectComponent,
  UiInputComponent,
} from '@josanz-erp/shared-ui-kit';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: any;
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
    <div class="reports-container">
      <header class="reports-header">
        <div class="header-content">
          <h1 class="reports-title">Reportes</h1>
          <p class="reports-subtitle">
            Genera informes y estadísticas del sistema
          </p>
        </div>
      </header>

      <div class="reports-content">
        <!-- Report Types Grid -->
        <div class="report-types-grid">
          <lib-ui-card
            *ngFor="let reportType of reportTypes()"
            class="report-type-card"
            (click)="selectReportType(reportType)"
          >
            <div class="report-type-content">
              <div class="report-icon">
                <lucide-icon [img]="reportType.icon" size="32"></lucide-icon>
              </div>
              <div class="report-info">
                <h3 class="report-name">{{ reportType.name }}</h3>
                <p class="report-description">{{ reportType.description }}</p>
                <span class="report-category">{{
                  getCategoryName(reportType.category)
                }}</span>
              </div>
            </div>
          </lib-ui-card>
        </div>

        <!-- Report Generation Form -->
        <div *ngIf="selectedReportType()" class="report-form-section">
          <lib-ui-card>
            <div class="form-header">
              <h2>Generar Reporte: {{ selectedReportType()?.name }}</h2>
              <p>Configura los filtros y genera tu reporte</p>
            </div>

            <form class="report-form" (ngSubmit)="generateReport()">
              <div class="form-grid">
                <lib-ui-input
                  label="Fecha Desde"
                  type="date"
                  [(ngModel)]="filters.dateFrom"
                  name="dateFrom"
                  required
                />

                <lib-ui-input
                  label="Fecha Hasta"
                  type="date"
                  [(ngModel)]="filters.dateTo"
                  name="dateTo"
                  required
                />

                <lib-ui-select
                  *ngIf="
                    selectedReportType()?.category === 'events' ||
                    selectedReportType()?.category === 'projects'
                  "
                  label="Estado"
                  [(ngModel)]="filters.status"
                  name="status"
                  [options]="statusOptions"
                />

                <lib-ui-input
                  *ngIf="selectedReportType()?.category === 'events'"
                  label="ID Cliente (opcional)"
                  [(ngModel)]="filters.clientId"
                  name="clientId"
                  placeholder="Buscar por cliente específico"
                />
              </div>

              <div class="form-actions">
                <lib-ui-button
                  type="button"
                  variant="secondary"
                  [icon]="Filter"
                  (click)="clearFilters()"
                >
                  Limpiar Filtros
                </lib-ui-button>
                <lib-ui-button
                  type="submit"
                  variant="primary"
                  [icon]="Download"
                  [disabled]="generating()"
                >
                  {{ generating() ? 'Generando...' : 'Generar Reporte' }}
                </lib-ui-button>
              </div>
            </form>
          </lib-ui-card>
        </div>

        <!-- Generated Reports List -->
        <div *ngIf="generatedReports().length > 0" class="reports-list-section">
          <lib-ui-card>
            <div class="section-header">
              <h2>Reportes Generados</h2>
            </div>
            <div class="reports-list">
              <div
                *ngFor="let report of generatedReports()"
                class="report-item"
              >
                <div class="report-item-content">
                  <div class="report-icon">
                    <lucide-icon
                      [img]="getReportTypeIcon(report.type)"
                      size="20"
                    ></lucide-icon>
                  </div>
                  <div class="report-details">
                    <h4 class="report-title">{{ report.title }}</h4>
                    <p class="report-meta">
                      Generado: {{ report.generatedAt }} | Filtros:
                      {{ report.dateRange }}
                    </p>
                  </div>
                </div>
                <div class="report-actions">
                  <lib-ui-button
                    variant="ghost"
                    size="sm"
                    (click)="downloadReport(report)"
                  >
                    <lucide-icon [img]="Download" size="16"></lucide-icon>
                    Descargar
                  </lib-ui-button>
                </div>
              </div>
            </div>
          </lib-ui-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .reports-container {
        padding: 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .reports-header {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .reports-title {
        margin: 0;
        font-size: 2.5rem;
        font-weight: 700;
        color: #111827;
      }

      .reports-subtitle {
        margin: 0.5rem 0 0 0;
        color: #6b7280;
        font-size: 1.125rem;
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
        border-color: #3b82f6;
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
        background: #f3f4f6;
        border-radius: 0.5rem;
        color: #374151;
        flex-shrink: 0;
      }

      .report-info h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #111827;
      }

      .report-description {
        margin: 0 0 0.75rem 0;
        color: #6b7280;
        font-size: 0.875rem;
        line-height: 1.4;
      }

      .report-category {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background: #eff6ff;
        color: #1d4ed8;
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
        color: #111827;
      }

      .form-header p {
        margin: 0;
        color: #6b7280;
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
        border-top: 1px solid #e5e7eb;
      }

      .reports-list-section {
        margin-top: 1rem;
      }

      .section-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #111827;
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
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        background: #f9fafb;
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
        color: #111827;
      }

      .report-meta {
        margin: 0;
        font-size: 0.875rem;
        color: #6b7280;
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
})
export class ReportsComponent implements OnInit {
  private readonly FileText = FileText;
  private readonly Calendar = Calendar;
  private readonly Users = Users;
  private readonly TrendingUp = TrendingUp;
  private readonly Download = Download;
  private readonly Filter = Filter;

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

  generatedReports = signal<any[]>([]);

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
        type: this.selectedReportType()?.id,
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

  downloadReport(report: any) {
    // Simulate download
    console.log('Downloading report:', report);
    // In a real implementation, this would trigger a file download
  }
}
