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
import { Router, RouterModule } from '@angular/router';
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
  AIBotStore,
  ToastService,
  TechnicianApiService,
} from '@josanz-erp/shared-data-access';
import {
  DEMO_WORKFLOWS,
  DemoWorkflowDefinition,
  createDemoWorkflowContext,
} from './demo-workflows';

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
    RouterModule,
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
    <ui-feature-page-shell [variant]="'widthOnly'" [fadeIn]="false" [extraClass]="'ai-insights-shell'">
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
          @if (refreshing()) {
            <span class="refresh-hint" aria-live="polite">
              <lucide-icon name="loader-circle" size="14" class="spin"></lucide-icon>
              Actualizando…
            </span>
          }
          <div class="live-pill" [class.live-pill--on]="liveRefresh()">
            <span class="pulse-dot"></span>
            {{ liveRefresh() ? 'En vivo' : 'Pausado' }}
          </div>
          <ui-button variant="outline" size="sm" (clicked)="toggleLiveRefresh()">
            {{ liveRefresh() ? 'Pausar' : 'Activar' }} auto-refresh
          </ui-button>
          <ui-button variant="solid" size="sm" icon="refresh-cw" (clicked)="refreshAll(true)" [disabled]="initialLoading()">
            Actualizar
          </ui-button>
        </div>
      </header>

      @if (initialLoading()) {
        <section class="skeleton-zone" aria-busy="true" aria-label="Cargando telemetría AI">
          <div class="stats-skeleton-row">
            @for (i of skeletonSlots; track i) {
              <div class="sk-stat"></div>
            }
          </div>
          <div class="sk-toolbar"></div>
          @for (i of skeletonFeedSlots; track i) {
            <div class="sk-feed-card"></div>
          }
        </section>
      } @else {
        <section class="demo-workflows-section">
          <div class="demo-workflows-head">
            <div>
              <h2>Workflows demo</h2>
              <p>Ejecuta escenarios predefinidos con un clic. Buddy orquestará navegación, bots especialistas y notificaciones — ideal para demos y para generar telemetría aquí.</p>
            </div>
          </div>
          <div class="demo-workflows-grid">
            @for (w of demoWorkflows; track w.id) {
              <article class="demo-workflow-card">
                <div class="demo-workflow-card__top">
                  <span class="demo-badge">{{ w.badge }}</span>
                  <lucide-icon [name]="w.icon" size="20"></lucide-icon>
                </div>
                <h3>{{ w.title }}</h3>
                <p>{{ w.description }}</p>
                <ui-button
                  variant="solid"
                  size="sm"
                  icon="play"
                  [disabled]="!!runningWorkflow()"
                  (clicked)="runDemoWorkflow(w)"
                >
                  @if (runningWorkflow() === w.id) {
                    Ejecutando…
                  } @else {
                    Ejecutar demo
                  }
                </ui-button>
              </article>
            }
          </div>
        </section>

        @if (showOnboarding()) {
        <section class="onboarding-panel onboarding-panel--compact">
          <p class="onboarding-lead">
            Tras ejecutar un demo, vuelve a esta pantalla (o espera el auto-refresh) para ver el evento registrado con tu usuario.
            También puedes hablar con <strong>Buddy</strong> manualmente en cualquier módulo.
          </p>
        </section>
        } @else {
        @if (hasData()) {
          <ui-feature-stats>
            <ui-stat-card label="Total eventos" [value]="statTotal()" icon="database" />
            <ui-stat-card label="Hoy" [value]="statToday()" icon="sun" [accent]="true" />
            <ui-stat-card label="Últimos 7 días" [value]="statWeek()" icon="calendar-range" />
            <ui-stat-card label="Usuarios activos" [value]="statUsers()" icon="users" />
          </ui-feature-stats>
        }

        <div class="insights-toolbar">
          <div class="tab-row" role="tablist">
            @for (t of tabs; track t.id) {
              <button
                type="button"
                class="tab-btn"
                [class.active]="activeTab() === t.id"
                (click)="selectTab(t.id)"
              >
                <lucide-icon [name]="t.icon" size="16"></lucide-icon>
                {{ t.label }}
              </button>
            }
          </div>
          @if (activeTab() === 'feed') {
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
              @if (hasActiveFilters()) {
                <button type="button" class="filter-clear" (click)="clearFilters()">Limpiar filtros</button>
              }
            </div>
          }
        </div>

        @if (activeTab() === 'feed') {
          @if (filteredInsights().length === 0) {
            <div class="empty-state empty-state--filters">
              <lucide-icon name="search-x" size="40"></lucide-icon>
              <h3>Sin resultados</h3>
              <p>No hay eventos que coincidan con los filtros actuales.</p>
              <ui-button variant="outline" size="sm" (clicked)="clearFilters()">Limpiar filtros</ui-button>
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
          @if (tabLoading() === 'training') {
            <div class="tab-loading"><ui-loader message="Preparando dataset…"></ui-loader></div>
          } @else {
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
        }

        @if (activeTab() === 'users') {
          @if (tabLoading() === 'users') {
            <div class="tab-loading"><ui-loader message="Cargando actividad por usuario…"></ui-loader></div>
          } @else {
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

      .refresh-hint {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
      }

      .spin {
        animation: spin 0.9s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .skeleton-zone {
        padding: 0 1.5rem 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .stats-skeleton-row {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.75rem;
        margin-bottom: 1.25rem;
      }

      .sk-stat,
      .sk-toolbar,
      .sk-feed-card {
        border-radius: 12px;
        background: linear-gradient(
          90deg,
          color-mix(in srgb, var(--text-muted) 8%, transparent) 0%,
          color-mix(in srgb, var(--text-muted) 14%, transparent) 50%,
          color-mix(in srgb, var(--text-muted) 8%, transparent) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.2s ease-in-out infinite;
      }

      .sk-stat {
        height: 88px;
      }

      .sk-toolbar {
        height: 44px;
        margin-bottom: 1rem;
        max-width: 720px;
      }

      .sk-feed-card {
        height: 120px;
        margin-bottom: 0.65rem;
      }

      @keyframes shimmer {
        0% { background-position: 100% 0; }
        100% { background-position: -100% 0; }
      }

      .onboarding-panel--compact {
        max-width: 900px;
        padding: 1rem 1.25rem;
        margin-top: 0;
      }

      .onboarding-panel--compact .onboarding-lead {
        margin: 0;
      }

      .demo-workflows-section {
        padding: 0 1.5rem 1.25rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .demo-workflows-head h2 {
        margin: 0 0 0.35rem;
        font-size: 1.05rem;
        font-weight: 700;
      }

      .demo-workflows-head p {
        margin: 0 0 1rem;
        font-size: 0.85rem;
        line-height: 1.5;
        color: var(--text-muted);
        max-width: 52rem;
      }

      .demo-workflows-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 0.75rem;
      }

      .demo-workflow-card {
        padding: 1rem;
        border-radius: 14px;
        border: 1px solid var(--border-soft);
        background: color-mix(in srgb, var(--surface) 94%, var(--brand) 3%);
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        min-height: 100%;
      }

      .demo-workflow-card__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }

      .demo-badge {
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--brand);
        padding: 0.15rem 0.45rem;
        border-radius: 6px;
        background: color-mix(in srgb, var(--brand) 12%, transparent);
      }

      .demo-workflow-card h3 {
        margin: 0;
        font-size: 0.92rem;
        font-weight: 700;
        line-height: 1.3;
      }

      .demo-workflow-card p {
        margin: 0;
        flex: 1;
        font-size: 0.78rem;
        line-height: 1.45;
        color: var(--text-muted);
      }

      .demo-workflow-card ui-button {
        margin-top: 0.35rem;
        align-self: flex-start;
      }

      .onboarding-panel {
        max-width: 640px;
        margin: 0.5rem auto 3rem;
        padding: 2rem 1.75rem;
        text-align: center;
        border-radius: 20px;
        border: 1px solid color-mix(in srgb, var(--brand) 22%, var(--border-soft));
        background: color-mix(in srgb, var(--surface) 92%, var(--brand) 4%);
        box-shadow: 0 12px 40px -24px color-mix(in srgb, var(--brand) 35%, transparent);
      }

      .onboarding-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 1rem;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--brand) 14%, transparent);
        color: var(--brand);
      }

      .onboarding-panel h2 {
        margin: 0 0 0.5rem;
        font-size: 1.35rem;
        font-weight: 700;
        letter-spacing: -0.02em;
      }

      .onboarding-lead {
        margin: 0 0 1.25rem;
        font-size: 0.9rem;
        line-height: 1.55;
        color: var(--text-muted);
      }

      .onboarding-steps {
        list-style: none;
        margin: 0 0 1.5rem;
        padding: 0;
        text-align: left;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .onboarding-steps li {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        padding: 0.75rem 0.85rem;
        border-radius: 12px;
        background: color-mix(in srgb, var(--bg-secondary) 80%, transparent);
        border: 1px solid var(--border-soft);
        font-size: 0.85rem;
        line-height: 1.45;
        color: var(--text-secondary);
      }

      .step-num {
        flex-shrink: 0;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.72rem;
        font-weight: 800;
        background: color-mix(in srgb, var(--brand) 18%, transparent);
        color: var(--brand);
      }

      .onboarding-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
        justify-content: center;
      }

      .onboarding-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.55rem 1rem;
        border-radius: 10px;
        border: 1px solid var(--border-soft);
        background: var(--surface);
        color: var(--text-primary);
        font-size: 0.8125rem;
        font-weight: 700;
        text-decoration: none;
        transition: border-color 0.2s, background 0.2s;
      }

      .onboarding-btn--primary {
        background: var(--brand);
        border-color: color-mix(in srgb, var(--brand) 80%, #000);
        color: var(--text-on-brand, #fff);
      }

      .onboarding-btn:hover {
        border-color: color-mix(in srgb, var(--brand) 40%, var(--border-soft));
      }

      .filter-clear {
        padding: 0.4rem 0.65rem;
        border-radius: 8px;
        border: 1px solid var(--border-soft);
        background: transparent;
        color: var(--brand);
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
      }

      .empty-state--filters {
        padding: 2.5rem 1.5rem;
      }

      .tab-loading {
        display: flex;
        justify-content: center;
        padding: 3rem 1rem;
      }

      @media (max-width: 900px) {
        .stats-skeleton-row {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    `,
  ],
})
export class AiInsightsComponent implements OnInit, OnDestroy {
  private readonly insightsApi = inject(AiInsightsApiService);
  private readonly authStore = inject(GlobalAuthStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly aiBotStore = inject(AIBotStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly technicianApi = inject(TechnicianApiService);

  readonly canAccess = rbacAllows(this.authStore, 'ai.view');
  readonly demoWorkflows = DEMO_WORKFLOWS;

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

  runningWorkflow = signal<string | null>(null);
  loading = signal(true);
  initialLoading = signal(true);
  refreshing = signal(false);
  tabLoading = signal<InsightsTab | null>(null);
  liveRefresh = signal(true);
  searchTerm = signal('');
  activeTab = signal<InsightsTab>('feed');
  eventFilter = signal('');
  featureFilter = signal('');
  userFilter = signal('');

  readonly skeletonSlots = [1, 2, 3, 4] as const;
  readonly skeletonFeedSlots = [1, 2, 3] as const;

  hasData = computed(
    () =>
      this.insights().length > 0 || (this.summary()?.total ?? 0) > 0,
  );

  hasActiveFilters = computed(
    () =>
      !!this.searchTerm().trim() ||
      !!this.eventFilter() ||
      !!this.featureFilter() ||
      !!this.userFilter(),
  );

  showOnboarding = computed(
    () =>
      !this.initialLoading() && !this.hasData() && !this.hasActiveFilters(),
  );

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
    void this.refreshAll(false);
    this.unsubscribeBc = this.insightsApi.subscribeToLiveUpdates(() => {
      void this.refreshAll(true);
    });
    interval(15_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.liveRefresh()) void this.refreshAll(true);
      });
  }

  ngOnDestroy() {
    this.unsubscribeBc?.();
  }

  async refreshAll(silent = false) {
    if (!silent) {
      if (this.insights().length === 0 && !this.summary()) {
        this.initialLoading.set(true);
      } else {
        this.refreshing.set(true);
      }
    }
    this.loading.set(true);

    const eventType = this.eventFilter() || undefined;
    const feature = this.featureFilter() || undefined;

    try {
      const list = await firstValueFrom(
        this.insightsApi.list({
          limit: 80,
          eventType,
          feature,
          userId: this.userFilter() || undefined,
        }),
      );
      this.insights.set(list ?? []);
      this.initialLoading.set(false);

      void firstValueFrom(this.insightsApi.getSummary()).then((sum) => {
        this.summary.set(sum);
      });

      if (this.activeTab() === 'training') {
        void this.loadTrainingData();
      } else if (this.activeTab() === 'users') {
        void this.loadUserActivity();
      }
    } catch (e) {
      console.error('[AiInsights]', e);
      this.initialLoading.set(false);
    } finally {
      this.loading.set(false);
      this.refreshing.set(false);
    }
  }

  selectTab(tab: InsightsTab) {
    this.activeTab.set(tab);
    if (tab === 'training' && this.trainingRows().length === 0) {
      void this.loadTrainingData();
    }
    if (tab === 'users' && this.userActivity().length === 0) {
      void this.loadUserActivity();
    }
  }

  async loadTrainingData() {
    this.tabLoading.set('training');
    try {
      const dataset = await firstValueFrom(
        this.insightsApi.getTrainingDataset({
          limit: 300,
          eventType: this.eventFilter() || undefined,
        }),
      );
      this.trainingRows.set(dataset?.rows ?? []);
      this.trainingGeneratedAt.set(dataset?.generatedAt ?? null);
    } finally {
      this.tabLoading.set(null);
    }
  }

  async loadUserActivity() {
    this.tabLoading.set('users');
    try {
      const users = await firstValueFrom(this.insightsApi.getUserActivity());
      this.userActivity.set(users ?? []);
    } finally {
      this.tabLoading.set(null);
    }
  }

  clearFilters() {
    this.searchTerm.set('');
    this.eventFilter.set('');
    this.featureFilter.set('');
    this.userFilter.set('');
    void this.refreshAll(true);
  }

  async runDemoWorkflow(workflow: DemoWorkflowDefinition) {
    if (this.runningWorkflow()) return;
    this.runningWorkflow.set(workflow.id);
    this.toast.show(`Iniciando demo «${workflow.title}»…`, 'info', 3500);
    try {
      let daniTechId: string | undefined;
      try {
        const techs = await firstValueFrom(this.technicianApi.getTechnicians());
        daniTechId = techs.find((t) => t.user?.email === 'dani@josanz.com')?.id;
      } catch {
        /* demo sigue sin baja médica si no hay API */
      }

      const ctx = createDemoWorkflowContext(daniTechId);
      const actions = workflow.buildActions(ctx);
      const actionJson = JSON.stringify(actions);

      this.aiBotStore.activeBotFeature.set('buddy');
      await this.router.navigateByUrl(workflow.startRoute);
      await new Promise((r) => setTimeout(r, 450));

      const steps = await this.aiBotStore.executeAction(actionJson, {
        sourceFeature: 'buddy',
        summary: workflow.summary,
        progressFeedback: true,
        progressTitle: workflow.title,
      });

      const hadError = steps.some((s) => s.includes('❌'));
      this.toast.show(
        hadError
          ? `Demo «${workflow.title}» terminada con avisos (${steps.length} pasos)`
          : `Demo «${workflow.title}» completada (${steps.length} pasos)`,
        hadError ? 'error' : 'success',
      );
      window.setTimeout(() => void this.refreshAll(true), 1200);
    } catch (e) {
      console.error('[AiInsights] demo workflow failed', e);
      this.toast.show('No se pudo ejecutar el workflow demo', 'error');
    } finally {
      this.runningWorkflow.set(null);
    }
  }

  toggleLiveRefresh() {
    this.liveRefresh.update((v) => !v);
  }

  onEventFilter(ev: Event) {
    this.eventFilter.set((ev.target as HTMLSelectElement).value);
    void this.refreshAll(true);
    if (this.activeTab() === 'training') void this.loadTrainingData();
  }

  onFeatureFilter(ev: Event) {
    this.featureFilter.set((ev.target as HTMLSelectElement).value);
    void this.refreshAll(true);
  }

  filterByUser(userId: string) {
    this.userFilter.set(userId);
    this.activeTab.set('feed');
    void this.refreshAll(true);
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
