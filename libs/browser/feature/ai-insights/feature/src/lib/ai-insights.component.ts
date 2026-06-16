import {
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
  computed,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { firstValueFrom, interval } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiFeatureFilterBarComponent,
  UiFeatureAccessDeniedComponent,
  UiFeaturePageShellComponent,
  UiFeatureStatsComponent,
  UiStatCardComponent,
  UiCardComponent,
  UiButtonComponent,
  UiLoaderComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  GlobalAuthStore,
  rbacAllows,
  AiInsightsApiService,
  AiInsightDto,
  AiInsightsSummaryDto,
  AiTrainingRowDto,
  AiInsightUserActivityDto,
} from '@josanz-erp/shared-data-access';

type InsightsTab = 'feed' | 'training' | 'users';

const EVENT_LABELS: Record<string, string> = {
  workflow: 'Workflow',
  chat: 'Chat',
  feedback: 'Feedback',
  delegation: 'Delegación',
  prediction: 'Predicción',
  system: 'Sistema',
};

@Component({
  selector: 'josanz-ai-insights',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    UiFeatureFilterBarComponent,
    UiFeatureAccessDeniedComponent,
    UiFeaturePageShellComponent,
    UiFeatureStatsComponent,
    UiStatCardComponent,
    UiCardComponent,
    UiButtonComponent,
    UiLoaderComponent,
  ],
  template: `
    @if (!canAccess()) {
      <ui-feature-access-denied
        message="No tienes permiso para ver AI Insights."
        permissionHint="ai.view"
      />
    } @else {
    <ui-feature-page-shell [variant]="'widthOnly'" [fadeIn]="true" [extraClass]="'ai-insights-shell'">
      <header class="insights-hero">
        <div class="hero-main">
          <nav class="breadcrumb">Sistema / AI Insights</nav>
          <div class="hero-title-row">
            <div class="hero-icon"><lucide-icon name="sparkles" size="22"></lucide-icon></div>
            <div>
              <h1>Centro de Inteligencia AI</h1>
              <p>
                Telemetría en tiempo real de bots, workflows y conversaciones — dataset listo para entrenar modelos por usuario y sesión.
              </p>
            </div>
          </div>
        </div>
        <div class="hero-actions">
          <div class="live-pill" [class.live-pill--on]="liveRefresh()">
            <span class="pulse-dot"></span>
            {{ liveRefresh() ? 'En vivo' : 'Pausado' }}
          </div>
          <ui-button variant="outline" size="sm" (clicked)="toggleLiveRefresh()">
            {{ liveRefresh() ? 'Pausar' : 'Activar' }} auto-refresh
          </ui-button>
          <ui-button variant="solid" size="sm" icon="refresh-cw" (clicked)="refreshAll()" [disabled]="loading()">
            Actualizar
          </ui-button>
        </div>
      </header>

      @if (loading() && !summary()) {
        <div class="loading-wrap"><ui-loader message="Cargando telemetría AI…"></ui-loader></div>
      } @else {
        <ui-feature-stats>
          <ui-stat-card label="Total eventos" [value]="statTotal()" icon="database" />
          <ui-stat-card label="Hoy" [value]="statToday()" icon="sun" [accent]="true" />
          <ui-stat-card label="Últimos 7 días" [value]="statWeek()" icon="calendar-range" />
          <ui-stat-card label="Usuarios activos" [value]="statUsers()" icon="users" />
        </ui-feature-stats>

        <div class="insights-toolbar">
          <div class="tab-row" role="tablist">
            @for (t of tabs; track t.id) {
              <button
                type="button"
                class="tab-btn"
                [class.active]="activeTab() === t.id"
                (click)="activeTab.set(t.id)"
              >
                <lucide-icon [name]="t.icon" size="16"></lucide-icon>
                {{ t.label }}
              </button>
            }
          </div>
          <ui-feature-filter-bar
            [appearance]="'feature'"
            [searchVariant]="'glass'"
            placeholder="Buscar por título, resumen, usuario, bot…"
            (searchChange)="searchTerm.set($event)"
          />
          <div class="filter-chips">
            <select class="filter-select" [value]="eventFilter()" (change)="onEventFilter($event)">
              <option value="">Todos los tipos</option>
              @for (ev of eventTypes; track ev) {
                <option [value]="ev">{{ eventLabel(ev) }}</option>
              }
            </select>
            <select class="filter-select" [value]="featureFilter()" (change)="onFeatureFilter($event)">
              <option value="">Todos los módulos</option>
              @for (f of featureOptions(); track f) {
                <option [value]="f">{{ f }}</option>
              }
            </select>
          </div>
        </div>

        @if (activeTab() === 'feed') {
          @if (filteredInsights().length === 0) {
            <div class="empty-state">
              <lucide-icon name="brain-circuit" size="48"></lucide-icon>
              <h3>Sin eventos todavía</h3>
              <p>
                Usa <strong>Buddy</strong> en cualquier módulo: cada chat, workflow, delegación y feedback se registra aquí automáticamente.
              </p>
              @if (summary()?.lastInsightAt) {
                <p class="empty-hint">Último evento: {{ summary()!.lastInsightAt | date: 'short' }}</p>
              }
            </div>
          } @else {
            <div class="feed-list">
              @for (insight of filteredInsights(); track insight.id) {
                <article class="feed-card" [attr.data-priority]="insight.priority">
                  <div class="feed-card__head">
                    <span class="event-badge" [attr.data-type]="insight.eventType">
                      {{ eventLabel(insight.eventType) }}
                    </span>
                    <span class="priority-badge" [attr.data-priority]="insight.priority">
                      {{ insight.priority }}
                    </span>
                    <span class="feature-tag">{{ insight.feature }}</span>
                    <time>{{ insight.createdAt | date: 'medium' }}</time>
                  </div>
                  <h3>{{ insight.title }}</h3>
                  <p class="feed-summary">{{ insight.summary }}</p>
                  @if (insight.metrics && metricKeys(insight.metrics).length) {
                    <div class="metrics-row">
                      @for (k of metricKeys(insight.metrics); track k) {
                        <span class="metric-chip"><strong>{{ k }}</strong> {{ insight.metrics![k] }}</span>
                      }
                    </div>
                  }
                  @if (insight.metadata && traceText(insight.metadata)) {
                    <details class="trace-details">
                      <summary>Trazabilidad / metadata</summary>
                      <pre>{{ traceText(insight.metadata) }}</pre>
                    </details>
                  }
                  <footer class="feed-card__foot">
                    <span><lucide-icon name="bot" size="14"></lucide-icon> {{ insight.botId }}</span>
                    @if (insight.userEmail) {
                      <span><lucide-icon name="user" size="14"></lucide-icon> {{ insight.userEmail }}</span>
                    }
                    @if (insight.sessionId) {
                      <span class="session-id" title="Sesión SPA">Sesión {{ insight.sessionId.slice(0, 8) }}…</span>
                    }
                  </footer>
                </article>
              }
            </div>
          }
        }

        @if (activeTab() === 'training') {
          <ui-card class="training-panel">
            <div class="panel-head">
              <div>
                <h2>Dataset de entrenamiento</h2>
                <p>Filas exportables con contexto de usuario, sesión, etiqueta sugerida y texto para fine-tuning.</p>
              </div>
              <ui-button variant="solid" size="sm" icon="download" (clicked)="exportTrainingJson()">
                Exportar JSON
              </ui-button>
            </div>
            @if (trainingRows().length === 0) {
              <p class="panel-empty">No hay filas. Interactúa con los bots para generar datos.</p>
            } @else {
              <div class="table-wrap">
                <table class="training-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Usuario</th>
                      <th>Tipo</th>
                      <th>Módulo</th>
                      <th>Etiqueta</th>
                      <th>Texto (muestra)</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of trainingRows(); track row.id) {
                      <tr>
                        <td>{{ row.createdAt | date: 'short' }}</td>
                        <td>{{ row.userEmail || '—' }}</td>
                        <td><span class="event-badge sm" [attr.data-type]="row.eventType">{{ eventLabel(row.eventType) }}</span></td>
                        <td>{{ row.feature }}</td>
                        <td><code>{{ row.label || '—' }}</code></td>
                        <td class="text-cell">{{ row.title }} — {{ row.summary | slice: 0 : 80 }}…</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <p class="dataset-meta">Generado: {{ trainingGeneratedAt() | date: 'medium' }} · {{ trainingRows().length }} filas</p>
            }
          </ui-card>
        }

        @if (activeTab() === 'users') {
          <div class="users-grid">
            @if (userActivity().length === 0) {
              <div class="empty-state compact">
                <p>Aún no hay actividad agrupada por usuario.</p>
              </div>
            } @else {
              @for (u of userActivity(); track u.userId) {
                <ui-card class="user-card">
                  <div class="user-card__head">
                    <lucide-icon name="user-circle" size="28"></lucide-icon>
                    <div>
                      <strong>{{ u.userEmail }}</strong>
                      <span>{{ u.count }} evento{{ u.count === 1 ? '' : 's' }}</span>
                    </div>
                  </div>
                  <p class="user-last">Última actividad: {{ u.lastActivityAt | date: 'short' }}</p>
                  <ui-button variant="ghost" size="sm" (clicked)="filterByUser(u.userId)">
                    Ver eventos de este usuario
                  </ui-button>
                </ui-card>
              }
            }
          </div>

          @if (summary()?.byEventType && objectKeys(summary()!.byEventType).length) {
            <ui-card class="breakdown-panel">
              <h3>Desglose por tipo de evento</h3>
              <div class="breakdown-bars">
                @for (k of objectKeys(summary()!.byEventType); track k) {
                  <div class="bar-row">
                    <span>{{ eventLabel(k) }}</span>
                    <div class="bar-track">
                      <div class="bar-fill" [style.width.%]="barPct(summary()!.byEventType[k], summary()!.total)"></div>
                    </div>
                    <span class="bar-val">{{ summary()!.byEventType[k] }}</span>
                  </div>
                }
              </div>
            </ui-card>
          }
        }
      }
    </ui-feature-page-shell>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .insights-hero {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1.25rem;
        flex-wrap: wrap;
        padding: 0 1.5rem 1.25rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .breadcrumb {
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 0.5rem;
      }

      .hero-title-row {
        display: flex;
        gap: 0.85rem;
        align-items: flex-start;
      }

      .hero-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--brand) 12%, transparent);
        border: 1px solid color-mix(in srgb, var(--brand) 25%, transparent);
        color: var(--brand);
        flex-shrink: 0;
      }

      .insights-hero h1 {
        margin: 0 0 0.35rem;
        font-size: clamp(1.4rem, 2vw, 1.85rem);
        font-weight: 700;
        letter-spacing: -0.02em;
      }

      .insights-hero p {
        margin: 0;
        font-size: 0.88rem;
        color: var(--text-muted);
        max-width: 36rem;
        line-height: 1.5;
      }

      .hero-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .live-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
        border: 1px solid var(--border-soft);
        color: var(--text-muted);
      }

      .live-pill--on {
        border-color: color-mix(in srgb, var(--success, #10b981) 30%, transparent);
        color: color-mix(in srgb, var(--success, #10b981) 85%, var(--text-primary));
        background: color-mix(in srgb, var(--success, #10b981) 8%, transparent);
      }

      .pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--text-muted);
      }

      .live-pill--on .pulse-dot {
        background: var(--success, #10b981);
        animation: pulse 1.5s ease infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.85); }
      }

      .loading-wrap {
        display: flex;
        justify-content: center;
        padding: 4rem 1rem;
      }

      .insights-toolbar {
        padding: 0 1.5rem 1rem;
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .tab-row {
        display: flex;
        gap: 0.35rem;
        flex-wrap: wrap;
      }

      .tab-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.45rem 0.85rem;
        border-radius: 10px;
        border: 1px solid var(--border-soft);
        background: var(--surface);
        color: var(--text-secondary);
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
        transition: border-color 0.2s, color 0.2s;
      }

      .tab-btn.active {
        border-color: color-mix(in srgb, var(--brand) 40%, transparent);
        color: var(--brand);
        background: color-mix(in srgb, var(--brand) 8%, var(--surface));
      }

      .filter-chips {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .filter-select {
        padding: 0.4rem 0.65rem;
        border-radius: 8px;
        border: 1px solid var(--border-soft);
        background: var(--surface);
        color: var(--text-primary);
        font-size: 0.8125rem;
      }

      .empty-state {
        text-align: center;
        padding: 3rem 1.5rem;
        margin: 0 1.5rem;
        border: 1px dashed var(--border-soft);
        border-radius: 16px;
        color: var(--text-muted);
      }

      .empty-state.compact {
        padding: 2rem;
        margin: 0 1.5rem 1rem;
      }

      .empty-state h3 {
        color: var(--text-primary);
        margin: 0.75rem 0 0.35rem;
      }

      .empty-hint {
        font-size: 0.78rem;
        margin-top: 0.75rem;
      }

      .feed-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 0 1.5rem 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .feed-card {
        padding: 1rem 1.15rem;
        border-radius: 14px;
        border: 1px solid var(--border-soft);
        background: var(--surface);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      }

      .feed-card[data-priority='HIGH'] {
        border-left: 3px solid #ef4444;
      }

      .feed-card__head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.4rem;
        margin-bottom: 0.5rem;
        font-size: 0.72rem;
      }

      .feed-card__head time {
        margin-left: auto;
        color: var(--text-muted);
      }

      .event-badge {
        padding: 0.15rem 0.45rem;
        border-radius: 6px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        background: var(--bg-secondary);
      }

      .event-badge[data-type='workflow'] { color: #8b5cf6; }
      .event-badge[data-type='chat'] { color: #3b82f6; }
      .event-badge[data-type='feedback'] { color: #f59e0b; }
      .event-badge[data-type='delegation'] { color: #10b981; }

      .event-badge.sm {
        font-size: 0.65rem;
      }

      .priority-badge {
        padding: 0.12rem 0.4rem;
        border-radius: 6px;
        font-weight: 600;
      }

      .priority-badge[data-priority='HIGH'] {
        background: rgba(239, 68, 68, 0.12);
        color: #ef4444;
      }

      .feature-tag {
        padding: 0.12rem 0.45rem;
        border-radius: 6px;
        background: color-mix(in srgb, var(--brand) 10%, transparent);
        color: var(--brand);
        font-weight: 600;
      }

      .feed-card h3 {
        margin: 0 0 0.35rem;
        font-size: 1rem;
        font-weight: 600;
      }

      .feed-summary {
        margin: 0;
        font-size: 0.875rem;
        line-height: 1.45;
        color: var(--text-secondary);
      }

      .metrics-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        margin-top: 0.65rem;
      }

      .metric-chip {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        border-radius: 8px;
        background: var(--bg-secondary);
      }

      .trace-details {
        margin-top: 0.65rem;
        font-size: 0.78rem;
      }

      .trace-details pre {
        margin: 0.35rem 0 0;
        padding: 0.5rem;
        border-radius: 8px;
        background: var(--bg-secondary);
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .feed-card__foot {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 0.75rem;
        padding-top: 0.65rem;
        border-top: 1px solid var(--border-soft);
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      .feed-card__foot span {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
      }

      .session-id {
        font-family: monospace;
      }

      .training-panel {
        margin: 0 1.5rem 2rem;
        max-width: 1400px;
      }

      .panel-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem 1.15rem;
        border-bottom: 1px solid var(--border-soft);
        flex-wrap: wrap;
      }

      .panel-head h2 {
        margin: 0 0 0.25rem;
        font-size: 1rem;
      }

      .panel-head p {
        margin: 0;
        font-size: 0.8125rem;
        color: var(--text-muted);
      }

      .panel-empty {
        padding: 2rem 1.15rem;
        color: var(--text-muted);
        text-align: center;
      }

      .table-wrap {
        overflow-x: auto;
        padding: 0 1rem 1rem;
      }

      .training-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.8125rem;
      }

      .training-table th,
      .training-table td {
        padding: 0.55rem 0.65rem;
        text-align: left;
        border-bottom: 1px solid var(--border-soft);
      }

      .training-table th {
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-muted);
      }

      .text-cell {
        max-width: 280px;
        color: var(--text-secondary);
      }

      .dataset-meta {
        padding: 0 1.15rem 1rem;
        font-size: 0.75rem;
        color: var(--text-muted);
        margin: 0;
      }

      .users-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 0.75rem;
        padding: 0 1.5rem 1rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .user-card {
        padding: 1rem !important;
      }

      .user-card__head {
        display: flex;
        gap: 0.65rem;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .user-card__head strong {
        display: block;
        font-size: 0.9rem;
      }

      .user-card__head span {
        font-size: 0.78rem;
        color: var(--text-muted);
      }

      .user-last {
        font-size: 0.78rem;
        color: var(--text-muted);
        margin: 0 0 0.65rem;
      }

      .breakdown-panel {
        margin: 0 1.5rem 2rem;
        max-width: 900px;
        padding: 1rem 1.15rem !important;
      }

      .breakdown-panel h3 {
        margin: 0 0 0.75rem;
        font-size: 0.9rem;
      }

      .bar-row {
        display: grid;
        grid-template-columns: 100px 1fr 40px;
        gap: 0.65rem;
        align-items: center;
        margin-bottom: 0.45rem;
        font-size: 0.8125rem;
      }

      .bar-track {
        height: 8px;
        border-radius: 999px;
        background: var(--bg-secondary);
        overflow: hidden;
      }

      .bar-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--brand), color-mix(in srgb, var(--brand) 70%, #fff));
      }

      .bar-val {
        text-align: right;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }
    `,
  ],
})
export class AiInsightsComponent implements OnInit, OnDestroy {
  private readonly insightsApi = inject(AiInsightsApiService);
  private readonly authStore = inject(GlobalAuthStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly canAccess = rbacAllows(this.authStore, 'ai.view');

  readonly tabs: { id: InsightsTab; label: string; icon: string }[] = [
    { id: 'feed', label: 'Actividad en vivo', icon: 'activity' },
    { id: 'training', label: 'Dataset entrenamiento', icon: 'table' },
    { id: 'users', label: 'Por usuario', icon: 'users' },
  ];

  readonly eventTypes = ['workflow', 'chat', 'feedback', 'delegation', 'prediction', 'system'];

  insights = signal<AiInsightDto[]>([]);
  summary = signal<AiInsightsSummaryDto | null>(null);
  trainingRows = signal<AiTrainingRowDto[]>([]);
  trainingGeneratedAt = signal<string | null>(null);
  userActivity = signal<AiInsightUserActivityDto[]>([]);

  loading = signal(true);
  liveRefresh = signal(true);
  searchTerm = signal('');
  activeTab = signal<InsightsTab>('feed');
  eventFilter = signal('');
  featureFilter = signal('');
  userFilter = signal('');

  filteredInsights = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const userId = this.userFilter();
    return this.insights().filter((insight) => {
      if (userId && insight.userId !== userId) return false;
      if (term) {
        const hay = [
          insight.title,
          insight.summary,
          insight.feature,
          insight.botId,
          insight.userEmail ?? '',
          insight.eventType,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  });

  featureOptions = computed(() => {
    const keys = Object.keys(this.summary()?.byFeature ?? {});
    return keys.sort();
  });

  statTotal = computed(() => String(this.summary()?.total ?? 0));
  statToday = computed(() => String(this.summary()?.today ?? 0));
  statWeek = computed(() => String(this.summary()?.last7Days ?? 0));
  statUsers = computed(() => String(this.summary()?.activeUsers ?? 0));

  private unsubscribeBc: (() => void) | null = null;

  ngOnInit() {
    void this.refreshAll();
    this.unsubscribeBc = this.insightsApi.subscribeToLiveUpdates(() => {
      void this.refreshAll(false);
    });
    interval(15_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.liveRefresh()) void this.refreshAll(false);
      });
  }

  ngOnDestroy() {
    this.unsubscribeBc?.();
  }

  async refreshAll(showLoader = true) {
    if (showLoader) this.loading.set(true);
    try {
      const eventType = this.eventFilter() || undefined;
      const feature = this.featureFilter() || undefined;
      const [list, sum, dataset, users] = await Promise.all([
        firstValueFrom(
          this.insightsApi.list({
            limit: 150,
            eventType,
            feature,
            userId: this.userFilter() || undefined,
          }),
        ),
        firstValueFrom(this.insightsApi.getSummary()),
        firstValueFrom(this.insightsApi.getTrainingDataset({ limit: 300, eventType })),
        firstValueFrom(this.insightsApi.getUserActivity()),
      ]);
      this.insights.set(list ?? []);
      this.summary.set(sum);
      this.trainingRows.set(dataset?.rows ?? []);
      this.trainingGeneratedAt.set(dataset?.generatedAt ?? null);
      this.userActivity.set(users ?? []);
    } catch (e) {
      console.error('[AiInsights]', e);
    } finally {
      this.loading.set(false);
    }
  }

  toggleLiveRefresh() {
    this.liveRefresh.update((v) => !v);
  }

  onEventFilter(ev: Event) {
    this.eventFilter.set((ev.target as HTMLSelectElement).value);
    void this.refreshAll(false);
  }

  onFeatureFilter(ev: Event) {
    this.featureFilter.set((ev.target as HTMLSelectElement).value);
    void this.refreshAll(false);
  }

  filterByUser(userId: string) {
    this.userFilter.set(userId);
    this.activeTab.set('feed');
    void this.refreshAll(false);
  }

  exportTrainingJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      tenantUser: this.authStore.user()?.email,
      rows: this.trainingRows(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-training-dataset-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  eventLabel(type: string): string {
    return EVENT_LABELS[type] ?? type;
  }

  metricKeys(obj: Record<string, string | number>): string[] {
    return Object.keys(obj);
  }

  traceText(metadata: Record<string, unknown> | null | undefined): string {
    if (!metadata) return '';
    if (typeof metadata['trace'] === 'string') return metadata['trace'];
    try {
      return JSON.stringify(metadata, null, 2);
    } catch {
      return '';
    }
  }

  objectKeys(obj: Record<string, number>): string[] {
    return Object.keys(obj);
  }

  barPct(value: number, total: number): number {
    if (!total) return 0;
    return Math.max(4, Math.round((value / total) * 100));
  }
}
