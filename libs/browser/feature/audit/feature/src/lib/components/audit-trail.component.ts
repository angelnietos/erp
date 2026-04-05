import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  History,
  User,
  Calendar,
  FileText,
  Users,
  TrendingUp,
  Search,
  Filter,
  Clock,
} from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UiInputComponent,
  UiSelectComponent,
  UiBadgeComponent,
} from '@josanz-erp/shared-ui-kit';

interface AuditLog {
  id: string;
  userName: string;
  action:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'LOGIN'
    | 'LOGOUT'
    | 'EXPORT'
    | 'IMPORT';
  entity:
    | 'USER'
    | 'PROJECT'
    | 'SERVICE'
    | 'EVENT'
    | 'CLIENT'
    | 'INVOICE'
    | 'RECEIPT'
    | 'EQUIPMENT';
  entityName?: string;
  timestamp: string;
  details?: string;
  changes?: Record<string, { old: any; new: any }>;
}

interface AuditFilter {
  userId?: string;
  action?: string;
  entity?: string;
  dateFrom: string;
  dateTo: string;
}

@Component({
  selector: 'lib-audit-trail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiCardComponent,
    UiButtonComponent,
    UiInputComponent,
    UiSelectComponent,
    UiBadgeComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="audit-container">
      <header class="audit-header">
        <div class="header-content">
          <h1 class="audit-title">Trazabilidad y Auditoría</h1>
          <p class="audit-subtitle">
            Historial completo de actividades del sistema
          </p>
        </div>
      </header>

      <div class="audit-content">
        <!-- Filters -->
        <lib-ui-card class="filters-card">
          <div class="filters-header">
            <h2>Filtros de Búsqueda</h2>
            <lib-ui-button
              variant="ghost"
              size="sm"
              [icon]="Filter"
              (click)="clearFilters()"
            >
              Limpiar
            </lib-ui-button>
          </div>

          <div class="filters-grid">
            <lib-ui-input
              label="Usuario"
              [(ngModel)]="filters.userId"
              name="userId"
              placeholder="Buscar por usuario"
              [icon]="User"
            />

            <lib-ui-select
              label="Acción"
              [(ngModel)]="filters.action"
              name="action"
              [options]="actionOptions"
            />

            <lib-ui-select
              label="Entidad"
              [(ngModel)]="filters.entity"
              name="entity"
              [options]="entityOptions"
            />

            <lib-ui-input
              label="Fecha Desde"
              type="date"
              [(ngModel)]="filters.dateFrom"
              name="dateFrom"
            />

            <lib-ui-input
              label="Fecha Hasta"
              type="date"
              [(ngModel)]="filters.dateTo"
              name="dateTo"
            />

            <div class="filter-actions">
              <lib-ui-button
                variant="primary"
                [icon]="Search"
                (click)="applyFilters()"
              >
                Buscar
              </lib-ui-button>
            </div>
          </div>
        </lib-ui-card>

        <!-- Audit Logs -->
        <lib-ui-card class="logs-card">
          <div class="logs-header">
            <h2>Historial de Actividades</h2>
            <span class="logs-count"
              >{{ filteredLogs().length }} registros</span
            >
          </div>

          <div class="logs-list">
            <div
              *ngFor="let log of paginatedLogs()"
              class="log-item"
              [class.expanded]="expandedLog() === log.id"
            >
              <div class="log-summary" (click)="toggleLogExpansion(log.id)">
                <div class="log-icon">
                  <lucide-icon
                    [img]="getActionIcon(log.action)"
                    size="20"
                  ></lucide-icon>
                </div>

                <div class="log-info">
                  <div class="log-primary">
                    <span class="log-user">{{ log.userName }}</span>
                    <span class="log-action">{{
                      getActionText(log.action)
                    }}</span>
                    <span class="log-entity">{{
                      getEntityText(log.entity)
                    }}</span>
                    <span class="log-entity-name" *ngIf="log.entityName"
                      >"{{ log.entityName }}"</span
                    >
                  </div>
                  <div class="log-meta">
                    <span class="log-timestamp">
                      <lucide-icon [img]="Clock" size="14"></lucide-icon>
                      {{ formatTimestamp(log.timestamp) }}
                    </span>
                    <lib-ui-badge [variant]="getActionVariant(log.action)">
                      {{ log.action }}
                    </lib-ui-badge>
                  </div>
                </div>

                <div class="log-toggle">
                  <lucide-icon
                    [img]="History"
                    size="16"
                    [class.rotated]="expandedLog() === log.id"
                  ></lucide-icon>
                </div>
              </div>

              <div class="log-details" *ngIf="expandedLog() === log.id">
                <div class="details-section" *ngIf="log.details">
                  <h4>Detalles</h4>
                  <p>{{ log.details }}</p>
                </div>

                <div
                  class="details-section"
                  *ngIf="log.changes && Object.keys(log.changes).length > 0"
                >
                  <h4>Cambios Realizados</h4>
                  <div class="changes-list">
                    <div
                      *ngFor="let change of getChangesArray(log.changes)"
                      class="change-item"
                    >
                      <span class="change-field">{{ change.field }}:</span>
                      <span class="change-old">{{ change.old }}</span>
                      <span class="change-arrow">→</span>
                      <span class="change-new">{{ change.new }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="paginatedLogs().length === 0" class="no-logs">
              <lucide-icon [img]="History" size="48"></lucide-icon>
              <p>No se encontraron registros de auditoría</p>
            </div>
          </div>

          <!-- Pagination -->
          <div class="pagination" *ngIf="totalPages() > 1">
            <lib-ui-button
              variant="ghost"
              size="sm"
              [disabled]="currentPage() === 1"
              (click)="goToPage(currentPage() - 1)"
            >
              Anterior
            </lib-ui-button>

            <span class="page-info">
              Página {{ currentPage() }} de {{ totalPages() }}
            </span>

            <lib-ui-button
              variant="ghost"
              size="sm"
              [disabled]="currentPage() === totalPages()"
              (click)="goToPage(currentPage() + 1)"
            >
              Siguiente
            </lib-ui-button>
          </div>
        </lib-ui-card>
      </div>
    </div>
  `,
  styles: [
    `
      .audit-container {
        padding: 1.5rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .audit-header {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .audit-title {
        margin: 0;
        font-size: 2.5rem;
        font-weight: 700;
        color: #111827;
      }

      .audit-subtitle {
        margin: 0.5rem 0 0 0;
        color: #6b7280;
        font-size: 1.125rem;
      }

      .audit-content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .filters-card {
        padding: 1.5rem;
      }

      .filters-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .filters-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #111827;
      }

      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        align-items: end;
      }

      .filter-actions {
        display: flex;
        justify-content: flex-end;
      }

      .logs-card {
        padding: 1.5rem;
      }

      .logs-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .logs-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #111827;
      }

      .logs-count {
        color: #6b7280;
        font-size: 0.875rem;
      }

      .logs-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .log-item {
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        background: white;
        overflow: hidden;
      }

      .log-summary {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .log-summary:hover {
        background: #f9fafb;
      }

      .log-icon {
        padding: 0.5rem;
        background: #f3f4f6;
        border-radius: 0.375rem;
        color: #374151;
        flex-shrink: 0;
      }

      .log-info {
        flex: 1;
      }

      .log-primary {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 0.5rem;
      }

      .log-user {
        font-weight: 600;
        color: #111827;
      }

      .log-action {
        color: #6b7280;
      }

      .log-entity {
        color: #374151;
        font-weight: 500;
      }

      .log-entity-name {
        color: #059669;
        font-style: italic;
      }

      .log-meta {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .log-timestamp {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: #6b7280;
        font-size: 0.875rem;
      }

      .log-toggle {
        transition: transform 0.2s;
      }

      .log-toggle .rotated {
        transform: rotate(180deg);
      }

      .log-details {
        padding: 1rem;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
      }

      .details-section {
        margin-bottom: 1rem;
      }

      .details-section h4 {
        margin: 0 0 0.5rem 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: #374151;
      }

      .changes-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .change-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background: white;
        border-radius: 0.25rem;
        font-family: monospace;
        font-size: 0.875rem;
      }

      .change-field {
        font-weight: 600;
        color: #374151;
      }

      .change-old {
        color: #dc2626;
        text-decoration: line-through;
      }

      .change-arrow {
        color: #6b7280;
      }

      .change-new {
        color: #059669;
      }

      .no-logs {
        text-align: center;
        padding: 3rem;
        color: #6b7280;
      }

      .no-logs p {
        margin: 1rem 0 0 0;
        font-size: 1.125rem;
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
      }

      .page-info {
        color: #6b7280;
        font-size: 0.875rem;
      }

      @media (max-width: 768px) {
        .filters-grid {
          grid-template-columns: 1fr;
        }

        .log-primary {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
        }

        .log-meta {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .pagination {
          flex-direction: column;
          gap: 0.5rem;
        }
      }
    `,
  ],
})
export class AuditTrailComponent implements OnInit {
  private readonly History = History;
  private readonly User = User;
  private readonly Calendar = Calendar;
  private readonly FileText = FileText;
  private readonly Users = Users;
  private readonly TrendingUp = TrendingUp;
  private readonly Search = Search;
  private readonly Filter = Filter;
  private readonly Clock = Clock;

  expandedLog = signal<string | null>(null);
  currentPage = signal(1);
  pageSize = 20;

  filters: AuditFilter = {
    dateFrom: '',
    dateTo: '',
  };

  actionOptions = [
    { label: 'Todas las acciones', value: '' },
    { label: 'Crear', value: 'CREATE' },
    { label: 'Actualizar', value: 'UPDATE' },
    { label: 'Eliminar', value: 'DELETE' },
    { label: 'Login', value: 'LOGIN' },
    { label: 'Logout', value: 'LOGOUT' },
    { label: 'Exportar', value: 'EXPORT' },
    { label: 'Importar', value: 'IMPORT' },
  ];

  entityOptions = [
    { label: 'Todas las entidades', value: '' },
    { label: 'Usuario', value: 'USER' },
    { label: 'Proyecto', value: 'PROJECT' },
    { label: 'Servicio', value: 'SERVICE' },
    { label: 'Evento', value: 'EVENT' },
    { label: 'Cliente', value: 'CLIENT' },
    { label: 'Factura', value: 'INVOICE' },
    { label: 'Recibo', value: 'RECEIPT' },
    { label: 'Equipo', value: 'EQUIPMENT' },
  ];

  // Mock data for demonstration
  auditLogs = signal<AuditLog[]>([
    {
      id: '1',
      userName: 'Admin User',
      action: 'CREATE',
      entity: 'PROJECT',
      entityName: 'Proyecto Demo 1',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      details: 'Proyecto creado con configuración básica',
      changes: {
        name: { old: null, new: 'Proyecto Demo 1' },
        status: { old: null, new: 'ACTIVE' },
      },
    },
    {
      id: '2',
      userName: 'John Doe',
      action: 'UPDATE',
      entity: 'SERVICE',
      entityName: 'Servicio de Streaming',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      details: 'Actualización de precio y configuración',
      changes: {
        basePrice: { old: 450, new: 500 },
        hourlyRate: { old: 45, new: 50 },
      },
    },
    {
      id: '3',
      userName: 'Admin User',
      action: 'LOGIN',
      entity: 'USER',
      entityName: 'Admin User',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      details: 'Inicio de sesión exitoso',
    },
    {
      id: '4',
      userName: 'Jane Smith',
      action: 'DELETE',
      entity: 'CLIENT',
      entityName: 'Cliente Antiguo',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      details: 'Cliente eliminado del sistema',
    },
    {
      id: '5',
      userName: 'John Doe',
      action: 'EXPORT',
      entity: 'INVOICE',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      details: 'Exportación de facturas a PDF',
    },
  ]);

  filteredLogs = signal<AuditLog[]>([]);

  ngOnInit() {
    // Set default date range (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    this.filters.dateFrom = sevenDaysAgo.toISOString().split('T')[0];
    this.filters.dateTo = today.toISOString().split('T')[0];

    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.auditLogs()];

    if (this.filters.userId) {
      filtered = filtered.filter((log) =>
        log.userName.toLowerCase().includes(this.filters.userId!.toLowerCase()),
      );
    }

    if (this.filters.action) {
      filtered = filtered.filter((log) => log.action === this.filters.action);
    }

    if (this.filters.entity) {
      filtered = filtered.filter((log) => log.entity === this.filters.entity);
    }

    if (this.filters.dateFrom) {
      const fromDate = new Date(this.filters.dateFrom);
      filtered = filtered.filter((log) => new Date(log.timestamp) >= fromDate);
    }

    if (this.filters.dateTo) {
      const toDate = new Date(this.filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter((log) => new Date(log.timestamp) <= toDate);
    }

    // Sort by timestamp (most recent first)
    filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    this.filteredLogs.set(filtered);
    this.currentPage.set(1);
  }

  clearFilters() {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    this.filters = {
      dateFrom: sevenDaysAgo.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0],
    };

    this.applyFilters();
  }

  toggleLogExpansion(logId: string) {
    this.expandedLog.set(this.expandedLog() === logId ? null : logId);
  }

  getActionIcon(action: string) {
    switch (action) {
      case 'CREATE':
        return this.FileText;
      case 'UPDATE':
        return this.TrendingUp;
      case 'DELETE':
        return this.History;
      case 'LOGIN':
      case 'LOGOUT':
        return this.User;
      case 'EXPORT':
      case 'IMPORT':
        return this.FileText;
      default:
        return this.History;
    }
  }

  getActionText(action: string): string {
    const texts: Record<string, string> = {
      CREATE: 'creó',
      UPDATE: 'actualizó',
      DELETE: 'eliminó',
      LOGIN: 'inició sesión',
      LOGOUT: 'cerró sesión',
      EXPORT: 'exportó',
      IMPORT: 'importó',
    };
    return texts[action] || action.toLowerCase();
  }

  getEntityText(entity: string): string {
    const texts: Record<string, string> = {
      USER: 'usuario',
      PROJECT: 'proyecto',
      SERVICE: 'servicio',
      EVENT: 'evento',
      CLIENT: 'cliente',
      INVOICE: 'factura',
      RECEIPT: 'recibo',
      EQUIPMENT: 'equipo',
    };
    return texts[entity] || entity.toLowerCase();
  }

  getActionVariant(action: string): string {
    switch (action) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'primary';
      case 'DELETE':
        return 'danger';
      case 'LOGIN':
      case 'LOGOUT':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      return 'Hace menos de una hora';
    } else if (diffHours < 24) {
      return `Hace ${Math.floor(diffHours)} hora${Math.floor(diffHours) > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Hace ${Math.floor(diffDays)} día${Math.floor(diffDays) > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  getChangesArray(
    changes: Record<string, { old: any; new: any }>,
  ): Array<{ field: string; old: any; new: any }> {
    return Object.entries(changes).map(([field, values]) => ({
      field,
      old: values.old,
      new: values.new,
    }));
  }

  get paginatedLogs() {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return () => this.filteredLogs().slice(start, end);
  }

  get totalPages() {
    return () => Math.ceil(this.filteredLogs().length / this.pageSize);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
