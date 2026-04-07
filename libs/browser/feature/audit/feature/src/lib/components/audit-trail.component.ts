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
import {
  LucideAngularModule,
  History,
  User,
  Calendar,
  FileText,
  Users,
  TrendingUp,
  Search,
  Clock,
} from 'lucide-angular';
import {
  UiCardComponent,
  UiBadgeComponent,
  UiStatCardComponent,
  UiSearchComponent,
  UIAIChatComponent
} from '@josanz-erp/shared-ui-kit';
import {
  DomainEventsApiService,
  ThemeService,
  PluginStore,
  MasterFilterService,
  FilterableService,
} from '@josanz-erp/shared-data-access';
import { Observable, of } from 'rxjs';

interface AuditFilter {
  userId?: string;
  action?: string;
  entity?: string;
  dateFrom: string;
  dateTo: string;
}

interface AuditLog {
  id: string;
  userName: string;
  action:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'COPY'
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
  changes?: Record<string, { old: unknown; new: unknown }>;
}

@Component({
  selector: 'lib-audit-trail',
  standalone: true,
  imports: [
    CommonModule,
    UiCardComponent,
    UiBadgeComponent,
    UiStatCardComponent,
    UiSearchComponent,
    LucideAngularModule,
    UIAIChatComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container animate-fade-in" [class.perf-optimized]="pluginStore.highPerformanceMode()">
      <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
        <div class="header-breadcrumb">
          <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'">
            Auditoría de Sistema
          </h1>
          <div class="breadcrumb">
            <span class="active" [style.color]="currentTheme().primary">CONTROL Y SEGURIDAD</span>
            <span class="separator">/</span>
            <span>TRAZABILIDAD DE OPERACIONES</span>
          </div>
        </div>
      </header>

      <div class="navigation-bar ui-glass-panel">
        <ui-josanz-search 
          variant="filled"
          placeholder="BUSCAR EN EL LOG POR USUARIO, ACCIÓN O ENTIDAD..." 
          (searchChange)="onSearch($event)"
          class="flex-1 max-w-md"
        ></ui-josanz-search>
      </div>

      <div class="stats-row">
        <ui-josanz-stat-card 
          label="Total Registros" 
          [value]="auditLogs().length.toString()" 
          icon="history" 
          [accent]="true">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Acciones Hoy" 
          [value]="todayActionsCount().toString()" 
          icon="activity" 
          [trend]="8">
        </ui-josanz-stat-card>
        <ui-josanz-stat-card 
          label="Usuarios Activos" 
          [value]="activeUsersCount().toString()" 
          icon="users">
        </ui-josanz-stat-card>
      </div>

      <div class="audit-content">
        <ui-josanz-card class="logs-card">
          <div class="logs-header">
            <h2>Historial de Actividades</h2>
            <span class="logs-count"
              >{{ filteredLogs().length }} registros</span
            >
          </div>

          <div class="logs-list">
            @for (log of filteredLogs(); track log.id) {
              <div
                class="log-item"
                [class.expanded]="expandedLog() === log.id"
              >
                <div class="log-summary" (click)="toggleLogExpansion(log.id)" (keydown.enter)="toggleLogExpansion(log.id)" (keydown.space)="toggleLogExpansion(log.id); $event.preventDefault()" tabindex="0">
                  <div class="log-icon">
                    <lucide-icon
                      [img]="getActionIcon(log.action)"
                      size="20"
                    ></lucide-icon>
                  </div>

                  <div class="log-info">
                    <div class="log-primary">
                      <span class="log-user">{{ log.userName }}</span>
                      <span class="log-action">{{ log.action }}</span>
                      <span class="log-entity">{{ log.entity }}</span>
                      @if (log.entityName) {
                        <span class="log-entity-name"
                          >"{{ log.entityName }}"</span
                        >
                      }
                    </div>
                    <div class="log-meta">
                      <span class="log-timestamp">
                        <lucide-icon [img]="Clock" size="14"></lucide-icon>
                        {{ log.timestamp | date:'short' }}
                      </span>
                      <ui-josanz-badge [variant]="getActionVariant(log.action)">
                        {{ log.action }}
                      </ui-josanz-badge>
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

                @if (expandedLog() === log.id) {
                  <div class="log-details">
                    @if (log.details) {
                      <div class="details-section">
                        <h4>Detalles</h4>
                        <p>{{ log.details }}</p>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            @if (filteredLogs().length === 0) {
              <div class="no-logs">
                <lucide-icon [img]="History" size="48"></lucide-icon>
                <p>No se encontraron registros de auditoría</p>
              </div>
            }
          </div>
        </ui-josanz-card>
      </div>
    </div>

    <ui-josanz-ai-assistant feature="audit"></ui-josanz-ai-assistant>
  `,
  styles: [`
    .page-container { padding: 0 100px 0 0; max-width: 100%; margin: 0 auto; }

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
      color: var(--text-primary);
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
      color: var(--text-primary);
    }

    .logs-count {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .logs-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .log-item {
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 0.5rem;
      background: rgba(255,255,255,0.05);
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
      background: rgba(255,255,255,0.1);
    }

    .log-icon {
      padding: 0.5rem;
      background: rgba(var(--primary-rgb), 0.1);
      border-radius: 0.375rem;
      color: var(--primary);
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
      color: var(--text-primary);
    }

    .log-action {
      color: var(--text-secondary);
    }

    .log-entity {
      color: var(--accent);
      font-weight: 500;
    }

    .log-entity-name {
      color: var(--success);
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
      color: var(--text-secondary);
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
      border-top: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.05);
    }

    .details-section {
      margin-bottom: 1rem;
    }

    .details-section h4 {
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
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
      background: rgba(255,255,255,0.1);
      border-radius: 0.25rem;
      font-family: monospace;
      font-size: 0.875rem;
    }

    .change-field {
      font-weight: 600;
      color: var(--text-primary);
    }

    .change-old {
      color: var(--danger);
      text-decoration: line-through;
    }

    .change-arrow {
      color: var(--text-secondary);
    }

    .change-new {
      color: var(--success);
    }

    .no-logs {
      text-align: center;
      padding: 3rem;
      color: var(--text-secondary);
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
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .page-info {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .text-uppercase {
      text-transform: uppercase;
    }

    .glow-text {
      font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0;
      letter-spacing: 0.05em; font-family: var(--font-main);
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
export class AuditTrailComponent implements OnInit, OnDestroy, FilterableService<AuditLog> {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly domainEventsApi = inject(DomainEventsApiService);
  private readonly masterFilter = inject(MasterFilterService);

  currentTheme = this.themeService.currentThemeData;

  todayActionsCount = computed(() => {
    const today = new Date().toDateString();
    return this.auditLogs().filter(log => new Date(log.timestamp).toDateString() === today).length;
  });

  activeUsersCount = computed(() => new Set(this.auditLogs().map(log => log.userName)).size);
  readonly History = History;
  readonly User = User;
  readonly Calendar = Calendar;
  readonly FileText = FileText;
  readonly Users = Users;
  readonly TrendingUp = TrendingUp;
  readonly Search = Search;
  readonly Clock = Clock;

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

  private readonly seedAuditLogs: AuditLog[] = [
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
  ];

  auditLogs = signal<AuditLog[]>([]);
  searchTerm = signal('');

  filteredLogs = computed(() => {
    let filtered = [...this.auditLogs()];
    const term = this.searchTerm().toLowerCase().trim();

    if (term) {
      filtered = filtered.filter(log => 
        log.userName.toLowerCase().includes(term) || 
        log.action.toLowerCase().includes(term) || 
        log.entity.toLowerCase().includes(term) ||
        (log.entityName ?? '').toLowerCase().includes(term) ||
        (log.details ?? '').toLowerCase().includes(term)
      );
    }

    if (this.filters.userId) {
      filtered = filtered.filter((log) =>
        log.userName.toLowerCase().includes(this.filters.userId?.toLowerCase() || ''),
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
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((log) => new Date(log.timestamp) <= toDate);
    }

    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return filtered;
  });

  ngOnInit() {
    this.masterFilter.registerProvider(this);
    // Set default date range (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    this.filters.dateFrom = sevenDaysAgo.toISOString().split('T')[0];
    this.filters.dateTo = today.toISOString().split('T')[0];

    this.domainEventsApi.list(150).subscribe((events) => {
      const fromDomain: AuditLog[] = events.map((e) => {
        const payload = e.payload as any;
        const userName = payload?.name || payload?.userName || payload?.email || 'Sistema';
        const entityName = payload?.name || payload?.email || `${e.aggregateType} · ${e.aggregateId.slice(0, 8)}`;
        
        return {
          id: `de-${e.id}`,
          userName: userName,
          action: (e.eventType as any) || 'UPDATE',
          entity: (e.aggregateType as any) || 'PROJECT',
          entityName: entityName,
          timestamp: e.occurredAt,
          details: e.eventType,
          changes: payload?.changes || { payload: { old: null, new: e.payload } },
        };
      });
      
      // Use real data if available, otherwise show seeds to avoid empty screen
      if (fromDomain.length > 0) {
        this.auditLogs.set(fromDomain);
      } else {
        this.auditLogs.set([...this.seedAuditLogs]);
      }
    });
  }

  ngOnDestroy() {
    this.masterFilter.unregisterProvider();
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
    this.masterFilter.search(term);
  }

  filter(query: string): Observable<AuditLog[]> {
    const term = query.toLowerCase();
    const result = this.auditLogs().filter(log => 
      log.userName.toLowerCase().includes(term) || 
      log.action.toLowerCase().includes(term) ||
      log.entity.toLowerCase().includes(term)
    );
    return of(result);
  }

  applyFilters() {
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

  hasChanges(changes: Record<string, { old: unknown; new: unknown }>): boolean {
    return Object.keys(changes).length > 0;
  }

  getChangesArray(
    changes: Record<string, { old: unknown; new: unknown }>,
  ): Array<{ field: string; old: unknown; new: unknown }> {
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
