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
  UiLoaderComponent,
  UiFeatureAccessDeniedComponent,
  UiFeaturePageShellComponent,
} from '@josanz-erp/shared-ui-kit';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AuditLogApiDto,
  AuditLogsApiService,
  ThemeService,
  PluginStore,
  MasterFilterService,
  FilterableService,
  GlobalAuthStore,
  rbacAllows,
  httpErrorMessage,
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
    UiButtonComponent,
    UiFeatureGridComponent,
    UiFeatureCardComponent,
    UiPaginationComponent,
    UiLoaderComponent,
    UiStatCardComponent,
  UiFeatureFilterBarComponent,
    UiFeatureHeaderComponent,
    UiFeatureStatsComponent,
    LucideAngularModule,
    UiFeatureAccessDeniedComponent,
    UiFeaturePageShellComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-feature-page-shell
      [fadeIn]="true"
      [extraClass]="'page-container' + (pluginStore.highPerformanceMode() ? ' perf-optimized' : '')"
    >
      @if (!canAccess()) {
        <ui-feature-access-denied
          message="No tienes permiso para ver el registro de auditoría."
          permissionHint="audit.view"
        />
      } @else {
      <ui-feature-header
        title="Auditoría de Sistema"
        breadcrumbLead="SEGURIDAD Y CUMPLIMIENTO"
        breadcrumbTail="TRAZA DE AUDITORÍA"
        subtitle="Trazabilidad completa de operaciones y seguridad"
        icon="shield-check"
      ></ui-feature-header>

      <ui-feature-stats>
        <ui-stat-card 
          label="Registros Totales" 
          [value]="auditLogs().length.toString()" 
          icon="history" 
          [accent]="true"
          class="stat-standard">
        </ui-stat-card>
        <ui-stat-card 
          label="Acciones hoy" 
          [value]="todayActionsCount().toString()" 
          icon="activity"
          class="stat-standard">
        </ui-stat-card>
        <ui-stat-card 
          label="Usuarios Activos" 
          [value]="activeUsersCount().toString()" 
          icon="users"
          class="stat-standard">
        </ui-stat-card>
      </ui-feature-stats>

      <ui-feature-filter-bar
        [appearance]="'feature'"
        [searchVariant]="'glass'"
        placeholder="Buscar por usuario, acción o entidad..."
        (searchChange)="onSearch($event)"
      >
        <div class="filter-actions">
          <ui-button
            variant="ghost"
            size="sm"
            [icon]="sortDirection() === 1 ? 'ChevronUp' : 'ChevronDown'"
            (clicked)="toggleSort()"
            class="sort-button"
          >
            ORDENAR POR:
            <span class="sort-field-label">
              {{
                sortField() === 'timestamp'
                  ? 'FECHA'
                  : sortField() === 'userName'
                    ? 'USUARIO'
                    : 'ACCIÓN'
              }}
            </span>
          </ui-button>
          
          <ui-button
            variant="solid"
            size="sm"
            icon="rotate-cw"
            (clicked)="reloadLogs()"
            [loading]="isLoading()"
            class="refresh-button"
          >
            ACTUALIZAR
          </ui-button>
        </div>
      </ui-feature-filter-bar>

      <div class="audit-trail-grid-wrap animate-fade-in">
        @if (isLoading() && auditLogs().length === 0) {
          <div class="audit-loading-surface">
            <ui-loader message="Analizando traza de auditoría..."></ui-loader>
          </div>
        } @else if (loadError() && auditLogs().length === 0) {
          <div class="audit-error-surface">
            <lucide-icon name="alert-triangle" size="48"></lucide-icon>
            <h3>Fallo en el servidor</h3>
            <p>{{ loadError() }}</p>
            <ui-button variant="solid" (clicked)="reloadLogs()">Reintentar conexión</ui-button>
          </div>
        } @else {
          <ui-feature-grid>
            @for (log of paginatedLogs(); track log.id) {
              <ui-feature-card
                [name]="log.userName"
                [subtitle]="getEntityText(log.entity)"
                [avatarInitials]="log.userName.slice(0, 2)"
                [avatarBackground]="getActionOrbColor(log.action)"
                [badgeLabel]="getActionText(log.action)"
                [badgeVariant]="getActionVariant(log.action)"
                [showEdit]="false"
                [footerItems]="[
                  { icon: 'clock', label: formatTimestamp(log.timestamp) },
                  { icon: 'info', label: log.id.slice(0,8) }
                ]"
                (cardClicked)="toggleLogExpansion(log.id)"
                class="audit-card"
              >
                @if (log.entityName) {
                  <div class="target-chip">
                    <span class="chip-label">OBJETIVO:</span>
                    <span class="chip-value">{{ log.entityName }}</span>
                  </div>
                }

                @if (expandedLog() === log.id) {
                  <div class="log-expansion-panel animate-slide-down">
                    <div class="detail-row">
                      <lucide-icon name="info" size="14"></lucide-icon>
                      <p>{{ log.details || 'Sin detalles adicionales' }}</p>
                    </div>
                    
                    @if (hasChanges(log.changes || {})) {
                      <div class="changes-timeline">
                        <div class="timeline-header">VALORES MODIFICADOS</div>
                        @for (change of getChangesArray(log.changes || {}); track change.field) {
                          <div class="change-entry">
                            <span class="field">{{ change.field }}</span>
                            <div class="flow">
                              <span class="old">{{ change.old | json }}</span>
                              <lucide-icon name="arrow-right" size="12"></lucide-icon>
                              <span class="new">{{ change.new | json }}</span>
                            </div>
                          </div>
                        }
                      </div>
                    }
                    
                    <div class="technical-meta">
                      <span>ENTITY_ID: {{ log.targetEntity }}</span>
                      <span class="spacer">|</span>
                      <span>TRACE_ID: {{ log.id }}</span>
                    </div>
                  </div>
                }
              </ui-feature-card>
            } @empty {
              <div class="full-empty-state">
                <div class="orb-empty"></div>
                <lucide-icon name="shield" size="64"></lucide-icon>
                <h3>Traza de Auditoría Vacía</h3>
                <p>Aún no se ha registrado actividad para este tenant. Las acciones de usuarios y cambios en el sistema aparecerán aquí en tiempo real.</p>
              </div>
            }
          </ui-feature-grid>
          
          <div class="pagination-footer">
            <ui-pagination 
              [currentPage]="currentPage()" 
              [totalPages]="totalPages()"
              (pageChange)="goToPage($event)"
            ></ui-pagination>
          </div>
        }
      </div>
      }
    </ui-feature-page-shell>
  `,
  styles: [`
    .filter-actions { display: flex; gap: 1rem; align-items: center; }
    .sort-field-label { color: var(--brand); font-weight: 950; margin-left: 0.25rem; }

    .audit-trail-grid-wrap { margin-top: 2rem; position: relative; }
    
    .audit-card {
      background: rgba(255, 255, 255, 0.03) !important;
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.05) !important;
      transition: all 0.4s var(--ease-out-expo);
    }
    .audit-card:hover { transform: translateY(-5px); border-color: rgba(var(--brand-rgb), 0.3) !important; }

    .target-chip {
      margin-top: 1rem; padding: 0.5rem 0.85rem; border-radius: 10px;
      background: rgba(var(--brand-rgb), 0.1); border: 1px solid rgba(var(--brand-rgb), 0.2);
      display: flex; align-items: center; gap: 0.5rem;
    }
    .chip-label { font-size: 0.6rem; font-weight: 950; color: var(--brand); letter-spacing: 0.05em; }
    .chip-value { font-size: 0.75rem; font-weight: 800; color: var(--text-primary); }

    .log-expansion-panel {
      margin-top: 1.5rem; padding: 1.5rem; border-radius: 16px;
      background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08);
      display: flex; flex-direction: column; gap: 1.25rem;
    }

    .detail-row { display: flex; gap: 0.75rem; color: var(--text-muted); }
    .detail-row p { font-size: 0.85rem; margin: 0; line-height: 1.5; font-weight: 500; }

    .changes-timeline { display: flex; flex-direction: column; gap: 0.75rem; }
    .timeline-header { font-size: 0.65rem; font-weight: 950; color: var(--brand); opacity: 0.8; letter-spacing: 0.1em; }
    .change-entry { display: flex; flex-direction: column; gap: 0.35rem; padding: 0.75rem; background: rgba(255,255,255,0.02); border-radius: 8px; }
    .change-entry .field { font-size: 0.7rem; font-weight: 850; color: var(--text-secondary); text-transform: uppercase; }
    .change-entry .flow { display: flex; align-items: center; gap: 0.75rem; font-family: var(--font-mono); font-size: 0.75rem; }
    .change-entry .old { text-decoration: line-through; opacity: 0.5; }
    .change-entry .new { color: #10b981; font-weight: 700; }

    .technical-meta { margin-top: 0.5rem; font-size: 0.55rem; color: var(--text-muted); opacity: 0.4; display: flex; gap: 1rem; font-family: var(--font-mono); }

    .full-empty-state {
      padding: 6rem 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; color: var(--text-muted); background: rgba(0,0,0,0.15); border-radius: 32px;
      border: 2px dashed rgba(255,255,255,0.05); position: relative; overflow: hidden;
      grid-column: 1 / -1;
    }
    .full-empty-state h3 { font-size: 1.5rem; font-weight: 950; color: var(--text-primary); margin: 1.5rem 0 0.5rem; }
    .full-empty-state p { max-width: 400px; font-size: 0.9rem; opacity: 0.6; }

    .orb-empty {
      position: absolute; width: 300px; height: 300px; border-radius: 50%;
      background: radial-gradient(circle, rgba(var(--brand-rgb), 0.1) 0%, transparent 70%);
      top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;
    }

    .pagination-footer { margin-top: 4rem; display: flex; justify-content: center; }
  `],
})
export class AuditTrailComponent implements OnInit, OnDestroy, FilterableService<AuditLog> {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly auditLogsApi = inject(AuditLogsApiService);
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

  isLoading = signal(true);
  loadError = signal<string | null>(null);

  readonly filterProducesNoResults = computed(
    () => this.auditLogs().length > 0 && this.filteredLogs().length === 0,
  );

  ngOnInit() {
    this.masterFilter.registerProvider(this);
    /** Sin rango por defecto: el API ya devuelve los últimos N registros reales; filtrar por 7 días ocultaba historial útil. */
    this.filters.dateFrom = '';
    this.filters.dateTo = '';

    this.fetchAuditLogs();
  }

  private normalizeApiRow(raw: AuditLogApiDto): AuditLog {
    const validActions: AuditLog['action'][] = [
      'CREATE',
      'UPDATE',
      'DELETE',
      'COPY',
      'LOGIN',
      'LOGOUT',
      'EXPORT',
      'IMPORT',
    ];
    const validEntities: AuditLog['entity'][] = [
      'USER',
      'PROJECT',
      'SERVICE',
      'EVENT',
      'CLIENT',
      'INVOICE',
      'RECEIPT',
      'EQUIPMENT',
    ];

    const action = (
      validActions.includes(raw.action as AuditLog['action'])
        ? raw.action
        : 'UPDATE'
    ) as AuditLog['action'];
    const entity = (
      validEntities.includes(raw.entity as AuditLog['entity'])
        ? raw.entity
        : 'PROJECT'
    ) as AuditLog['entity'];

    return {
      id: raw.id,
      userName: raw.userName,
      action,
      entity,
      entityName: raw.entityName,
      timestamp: raw.timestamp,
      details: raw.details,
      changes: raw.changes,
    };
  }

  private fetchAuditLogs(): void {
    this.loadError.set(null);
    this.isLoading.set(true);
    this.auditLogsApi.list(200).subscribe({
      next: (rows) => {
        this.auditLogs.set(rows.map((r) => this.normalizeApiRow(r)));
        this.isLoading.set(false);
        this.loadError.set(null);
      },
      error: (err: unknown) => {
        this.isLoading.set(false);
        const detail =
          err instanceof HttpErrorResponse
            ? httpErrorMessage(err)
            : 'Error desconocido';
        this.loadError.set(
          `No se pudo cargar el registro de auditoría: ${detail}. Comprueba que el backend esté en marcha y que la sesión sea válida.`,
        );
      },
    });
  }

  reloadLogs(): void {
    this.fetchAuditLogs();
  }

  clearFiltersAndSearch(): void {
    this.masterFilter.search('');
    this.clearFilters();
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
    this.filters = {
      dateFrom: '',
      dateTo: '',
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
      case 'COPY': return 'linear-gradient(135deg, #8b5cf6, #6d28d9)';
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
      case 'COPY':
        return this.FileText;
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
      COPY: 'duplicó',
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
      case 'COPY':
        return 'info';
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
