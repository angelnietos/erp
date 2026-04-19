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
import {
  AuditLogApiDto,
  AuditLogsApiService,
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
          [accent]="true">
        </ui-stat-card>
        <ui-stat-card 
          label="Acciones hoy" 
          [value]="todayActionsCount().toString()" 
          icon="activity">
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
        placeholder="Buscar en el log por usuario, acción o entidad…"
        (searchChange)="onSearch($event)"
      >
        <ui-button
          variant="ghost"
          size="sm"
          [icon]="sortDirection() === 1 ? 'ChevronUp' : 'ChevronDown'"
          (clicked)="toggleSort()"
        >
          Ordenar:
          {{
            sortField() === 'timestamp'
              ? 'fecha'
              : sortField() === 'userName'
                ? 'usuario'
                : 'acción'
          }}
        </ui-button>
      </ui-feature-filter-bar>

      @if (loadError() && auditLogs().length > 0) {
        <div class="feature-load-error-banner" role="status" aria-live="polite">
          <lucide-icon
            name="alert-circle"
            size="20"
            class="feature-load-error-banner__icon"
          ></lucide-icon>
          <span class="feature-load-error-banner__text">{{ loadError() }}</span>
          <ui-button variant="ghost" size="sm" icon="rotate-cw" (clicked)="reloadLogs()">
            Reintentar
          </ui-button>
        </div>
      }

      <div class="audit-content">
        @if (isLoading() && auditLogs().length === 0) {
          <div class="feature-loader-wrap">
            <ui-loader message="Cargando registro de auditoría…"></ui-loader>
          </div>
        } @else if (loadError() && auditLogs().length === 0) {
          <div class="feature-error-screen" role="alert">
            <lucide-icon name="wifi-off" size="48" class="feature-error-screen__icon"></lucide-icon>
            <h3>No se pudo cargar el registro</h3>
            <p>{{ loadError() }}</p>
            <ui-button variant="solid" icon="rotate-cw" (clicked)="reloadLogs()">Reintentar</ui-button>
          </div>
        } @else {
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
            @if (filterProducesNoResults()) {
              <div class="feature-empty feature-empty--wide">
                <lucide-icon name="search-x" size="56" class="feature-empty__icon"></lucide-icon>
                <h3>Sin resultados</h3>
                <p>Ningún registro coincide con la búsqueda o los filtros actuales.</p>
                <ui-button variant="ghost" size="sm" icon="circle-x" (clicked)="clearFiltersAndSearch()">
                  Limpiar búsqueda y filtros
                </ui-button>
              </div>
            } @else {
              <div class="feature-empty feature-empty--wide">
                <lucide-icon name="history" size="56" class="feature-empty__icon"></lucide-icon>
                <h3>No hay registros</h3>
                <p>Aún no hay actividad auditada para este tenant. Los inicios de sesión y las operaciones en proyectos, clientes y servicios aparecerán aquí.</p>
              </div>
            }
          }
        </ui-feature-grid>

        <footer class="pagination-footer">
          <ui-pagination 
            [currentPage]="currentPage()" 
            [totalPages]="totalPages()"
            (pageChange)="goToPage($any($event))"
          ></ui-pagination>
        </footer>
        }
      </div>
      }
    </ui-feature-page-shell>
  `,
  styles: [`
    .audit-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .pagination-footer { margin-top: 3rem; display: flex; justify-content: center; }

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
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    this.filters.dateFrom = sevenDaysAgo.toISOString().split('T')[0];
    this.filters.dateTo = today.toISOString().split('T')[0];

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
    this.auditLogsApi.list(150).subscribe({
      next: (rows) => {
        this.auditLogs.set(rows.map((r) => this.normalizeApiRow(r)));
        this.isLoading.set(false);
        this.loadError.set(null);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set(
          'No se pudo cargar el registro de auditoría. Comprueba la conexión e inténtalo de nuevo.',
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
