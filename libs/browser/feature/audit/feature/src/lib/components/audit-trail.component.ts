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
  UiButtonComponent,
  UiStatCardComponent,
  UiFeatureFilterBarComponent,
  UiFeatureHeaderComponent,
  UiFeatureStatsComponent,
  UiFeatureGridComponent,
  UiFeatureCardComponent,
  UiPaginationComponent,
  UiFeatureAccessDeniedComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  DomainEventsApiService,
  ThemeService,
  PluginStore,
  MasterFilterService,
  FilterableService,
  GlobalAuthStore,
  rbacAllows,
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
    UiButtonComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    UiPaginationComponent,
    UiStatCardComponent,
    UiFeatureFilterBarComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    LucideAngularModule,
    UiFeatureAccessDeniedComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container animate-fade-in" [class.perf-optimized]="pluginStore.highPerformanceMode()">
      @if (!canAccess()) {
        <ui-feature-access-denied
          message="No tienes permiso para ver el registro de auditoría."
          permissionHint="audit.view"
        />
      } @else {
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

      <ui-feature-filter-bar
        [appearance]="'feature'"
        [searchVariant]="'glass'"
        placeholder="BUSCAR EN EL LOG POR USUARIO, ACCIÓN O ENTIDAD..."
        (searchChange)="onSearch($event)"
      >
        <ui-button
          variant="ghost"
          size="sm"
          [icon]="sortDirection() === 1 ? 'ChevronUp' : 'ChevronDown'"
          (clicked)="toggleSort()"
        >
          ORDENAR:
          {{
            sortField() === 'timestamp'
              ? 'FECHA'
              : sortField() === 'userName'
                ? 'USUARIO'
                : 'ACCIÓN'
          }}
        </ui-button>
      </ui-feature-filter-bar>

      <div class="audit-content">
        <ui-feature-grid>
          @for (log of paginatedLogs(); track log.id) {
            <ui-feature-card
              [name]="log.userName | uppercase"
              [subtitle]="getEntityText(log.entity) | uppercase"
              [avatarInitials]="log.userName.slice(0, 2).toUpperCase()"
              [avatarBackground]="getActionOrbColor(log.action)"
              status="active"
              [badgeLabel]="getActionText(log.action) | uppercase"
              [badgeVariant]="getActionVariant(log.action)"
              [showEdit]="false"
              [showDuplicate]="false"
              [showDelete]="false"
              (cardClicked)="toggleLogExpansion(log.id)"
              [footerItems]="[
                { icon: 'clock', label: formatTimestamp(log.timestamp) },
                { icon: 'shield', label: log.action }
              ]"
            >
              @if (log.entityName) {
                <div class="log-entity-target" style="margin-top: 0.5rem; font-size: 0.8rem; font-weight: 700; color: var(--brand);">
                  OBJETIVO: {{ log.entityName }}
                </div>
              }
              
              @if (expandedLog() === log.id) {
                <div class="log-details-block" style="margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid var(--border-soft);">
                  @if (log.details) {
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">{{ log.details }}</p>
                  }
                  @if (hasChanges(log.changes || {})) {
                    <div class="changes-list" style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem;">
                      @for (change of getChangesArray(log.changes || {}); track change.field) {
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">
                          <strong style="color: var(--text-primary);">{{ change.field }}:</strong> 
                          <span style="opacity: 0.6; text-decoration: line-through;">{{ change.old | json }}</span> &rarr; 
                          <span style="color: var(--success);">{{ change.new | json }}</span>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </ui-feature-card>
          } @empty {
            <div class="empty-state">
              <lucide-icon name="history" size="64" class="empty-icon"></lucide-icon>
              <h3>No hay registros</h3>
              <p>El registro de auditoría está vacío para los filtros seleccionados.</p>
            </div>
          }
        </ui-feature-grid>

        <footer class="pagination-footer">
          <ui-pagination 
            [currentPage]="currentPage()" 
            [totalPages]="totalPages()"
            (pageChange)="goToPage($any($event))"
          ></ui-pagination>
        </footer>
      </div>
      }
    </div>
  `,
  styles: [`
    .audit-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .pagination-footer { margin-top: 3rem; display: flex; justify-content: center; }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 5rem;
      text-align: center;
      background: var(--surface);
      border-radius: 20px;
      border: 2px dashed var(--border-soft);
    }
    .empty-icon { color: var(--text-muted); opacity: 0.3; margin-bottom: 1.5rem; }

    .logs-count {
      color: var(--brand);
      font-size: 0.75rem;
      font-weight: 900;
      font-family: var(--font-gaming);
    }

    .log-toggle {
      color: var(--text-muted);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .log-toggle .rotated {
      transform: rotate(180deg);
      color: var(--brand);
    }

    @media (max-width: 768px) {
      .log-meta { gap: 1rem; flex-wrap: wrap; }
    }
  `],
})
export class AuditTrailComponent implements OnInit, OnDestroy, FilterableService<AuditLog> {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly domainEventsApi = inject(DomainEventsApiService);
  private readonly masterFilter = inject(MasterFilterService);
  private readonly authStore = inject(GlobalAuthStore);
  readonly canAccess = rbacAllows(this.authStore, 'audit.view');

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

  sortField = signal<'timestamp' | 'userName' | 'action'>('timestamp');
  sortDirection = signal<1 | -1>(-1);

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

    const field = this.sortField();
    const dir = this.sortDirection();
    filtered.sort((a, b) => {
      let cmp = 0;
      if (field === 'timestamp') {
        cmp =
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (field === 'userName') {
        cmp = a.userName.localeCompare(b.userName, 'es', {
          sensitivity: 'base',
        });
      } else {
        cmp = a.action.localeCompare(b.action, 'es');
      }
      return cmp * dir;
    });
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
        const entityName = payload?.name || payload?.email || `${e.aggregateType} - ${e.aggregateId.slice(0, 8)}`;

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

  toggleSort() {
    if (this.sortField() === 'timestamp') {
      this.sortField.set('userName');
      this.sortDirection.set(1);
    } else if (this.sortField() === 'userName') {
      this.sortField.set('action');
      this.sortDirection.set(1);
    } else {
      this.sortField.set('timestamp');
      this.sortDirection.set(-1);
    }
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
      case 'CREATE': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'UPDATE': return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'DELETE': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default: return 'linear-gradient(135deg, #6b7280, #374151)';
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

  getActionVariant(action: string): 'warning' | 'danger' | 'primary' | 'secondary' | 'success' | 'info' {
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
