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
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent
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

/** Shape of a domain event payload as stored in the backend. */
interface DomainEventPayload {
  name?: string;
  userName?: string;
  email?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  [key: string]: unknown;
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
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    LucideAngularModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container animate-fade-in" [class.perf-optimized]="pluginStore.highPerformanceMode()">
      <ui-feature-header
        title="Auditoría de Sistema"
        subtitle="Trazabilidad completa de operaciones y seguridad"
        icon="shield-check"
      ></ui-feature-header>

      <ui-feature-stats>
        <ui-stat-card 
          label="Registros Totales" 
          [value]="auditLogs().length.toString()" 
          icon="history" 
          [accent]="true">
        </ui-stat-card>
        <ui-stat-card 
          label="Acciones Hoy" 
          [value]="todayActionsCount().toString()" 
          icon="activity" 
          [trend]="8">
        </ui-stat-card>
        <ui-stat-card 
          label="Usuarios Activos" 
          [value]="activeUsersCount().toString()" 
          icon="users">
        </ui-stat-card>
      </ui-feature-stats>

      <div class="feature-controls">
        <div class="search-container">
          <ui-search 
            variant="glass"
            placeholder="BUSCAR EN EL LOG POR USUARIO, ACCIÓN O ENTIDAD..." 
            (searchChange)="onSearch($event)"
          ></ui-search>
        </div>
      </div>

      <div class="audit-content">
        <ui-card class="logs-card">
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
                    <div class="icon-orb" [style.background]="getActionOrbColor(log.action)">
                      <lucide-icon
                        [img]="getActionIcon(log.action)"
                        size="18"
                      ></lucide-icon>
                    </div>
                  </div>

                  <div class="log-info">
                    <div class="log-primary">
                      <span class="log-user">{{ log.userName }}</span>
                      <span class="log-action">{{ getActionText(log.action) }}</span>
                      <span class="log-entity">{{ getEntityText(log.entity) }}</span>
                      @if (log.entityName) {
                        <span class="log-entity-name"
                          >"{{ log.entityName }}"</span
                        >
                      }
                    </div>
                    <div class="log-meta">
                      <span class="log-timestamp">
                        <lucide-icon [img]="Clock" size="12"></lucide-icon>
                        {{ formatTimestamp(log.timestamp) }}
                      </span>
                      <span class="tag-status" [attr.data-variant]="getActionVariant(log.action)">
                        {{ log.action }}
                      </span>
                    </div>
                  </div>

                  <div class="log-toggle">
                    <lucide-icon
                      [img]="History"
                      size="14"
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
        </ui-card>
      </div>
    </div>
  `,
  styles: [`
    .audit-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .logs-card {
      padding: 0 !important;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.05) !important;
    }

    .logs-header {
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255,255,255,0.02);
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .logs-header h2 {
      margin: 0;
      font-size: 1rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
    }

    .logs-count {
      color: var(--brand);
      font-size: 0.75rem;
      font-weight: 900;
      font-family: var(--font-gaming);
    }

    .logs-list {
      display: flex;
      flex-direction: column;
    }

    .log-item {
      border-bottom: 1px solid rgba(255,255,255,0.03);
      transition: all 0.3s ease;
    }
    .log-item:last-child { border-bottom: none; }

    .log-summary {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.25rem 2rem;
      cursor: pointer;
    }

    .log-summary:hover {
      background: rgba(255,255,255,0.02);
      transform: translateX(4px);
    }

    .log-icon {
      flex-shrink: 0;
    }

    .icon-orb {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: inset 0 0 10px rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.05);
    }

    .log-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .log-primary {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .log-user {
      font-weight: 700;
      color: var(--text-primary);
      font-size: 0.95rem;
    }

    .log-action {
      color: var(--text-muted);
      font-size: 0.85rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .log-entity {
      color: var(--text-primary);
      font-weight: 700;
      font-size: 0.9rem;
    }

    .log-entity-name {
      color: var(--success);
      font-family: var(--font-gaming);
      font-size: 0.85rem;
    }

    .log-meta {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .log-timestamp {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: 600;
    }

    .tag-status {
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.6rem;
      font-weight: 900;
      font-family: var(--font-gaming);
      letter-spacing: 0.05em;
      background: rgba(255,255,255,0.05);
      color: var(--text-muted);
      border: 1px solid rgba(255,255,255,0.1);
    }

    .tag-status[data-variant="success"] { color: var(--success); background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.2); }
    .tag-status[data-variant="primary"] { color: var(--info); background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.2); }
    .tag-status[data-variant="danger"] { color: var(--brand); background: rgba(230,0,18,0.1); border-color: rgba(230,0,18,0.2); }

    .log-toggle {
      color: var(--text-muted);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .log-toggle .rotated {
      transform: rotate(180deg);
      color: var(--brand);
    }

    .log-details {
      padding: 1.5rem 2rem;
      background: color-mix(in srgb, var(--bg-primary) 98%, black);
      border-top: 1px solid var(--border-soft);
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .details-section h4 {
      margin: 0 0 0.75rem 0;
      font-size: 0.75rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
    }

    .details-section p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
      line-height: 1.6;
    }

    .no-logs {
      text-align: center;
      padding: 5rem 2rem;
      color: var(--text-muted);
    }

    .no-logs p {
      margin: 1.5rem 0 0 0;
      font-size: 1rem;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .log-summary { padding: 1.25rem 1rem; gap: 1rem; }
      .log-primary { gap: 0.4rem; }
      .log-meta { gap: 1rem; flex-wrap: wrap; }
      .icon-orb { width: 36px; height: 36px; }
    }
  `],
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
  filteredLogs = computed(() => {
    let filtered = [...this.auditLogs()];
    const term = this.masterFilter.query().toLowerCase().trim();

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
        const payload = e.payload as DomainEventPayload;
        const userName = payload?.name || payload?.userName || payload?.email || 'Sistema';
        const entityName = payload?.name || payload?.email || `${e.aggregateType} · ${e.aggregateId.slice(0, 8)}`;

        const validActions: AuditLog['action'][] = ['CREATE', 'UPDATE', 'DELETE', 'COPY', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT'];
        const validEntities: AuditLog['entity'][] = ['USER', 'PROJECT', 'SERVICE', 'EVENT', 'CLIENT', 'INVOICE', 'RECEIPT', 'EQUIPMENT'];

        const action = validActions.includes(e.eventType as AuditLog['action'])
          ? (e.eventType as AuditLog['action'])
          : 'UPDATE';
        const entity = validEntities.includes(e.aggregateType as AuditLog['entity'])
          ? (e.aggregateType as AuditLog['entity'])
          : 'PROJECT';
        
        return {
          id: `de-${e.id}`,
          userName,
          action,
          entity,
          entityName,
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

  getActionOrbColor(action: string): string {
    switch (action) {
      case 'CREATE': return 'rgba(16, 185, 129, 0.15)';
      case 'UPDATE': return 'rgba(59, 130, 246, 0.15)';
      case 'DELETE': return 'rgba(239, 68, 68, 0.15)';
      default: return 'rgba(255, 255, 255, 0.08)';
    }
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
