import {
  Component,
  OnInit,
  signal,
  inject,
  computed,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, of, catchError, finalize, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
} from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UiStatCardComponent,
  UiFeatureStatsComponent,
  UiFeatureAccessDeniedComponent,
  UiLoaderComponent,
  UiFeaturePageShellComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  DashboardAnalyticsService,
  DashboardSummaryDto,
  NotificationFeedStore,
  ThemeService,
  GlobalAuthStore,
  rbacAllows,
  AiInsightsApiService,
  AiInsightDto,
} from '@josanz-erp/shared-data-access';
import { firstValueFrom } from 'rxjs';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'event' | 'invoice' | 'client';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: 'primary' | 'secondary' | 'success' | 'warning';
}

@Component({
  selector: 'lib-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UiCardComponent,
    UiButtonComponent,
    UiStatCardComponent,
    LucideAngularModule,
    UiFeatureStatsComponent,
    UiFeatureAccessDeniedComponent,
    UiLoaderComponent,
    UiFeaturePageShellComponent,
  ],
  template: `
    @if (!canAccess()) {
      <ui-feature-access-denied
        message="No tienes permiso para ver el panel principal."
        permissionHint="dashboard.view"
      />
    } @else if (isDashboardLoading()) {
      <div class="dashboard-loading" role="status" aria-live="polite">
        <ui-loader message="Cargando panel ejecutivo…"></ui-loader>
      </div>
    } @else if (dashboardLoadError() && !summary()) {
      <div class="dashboard-error-state animate-fade-in">
        <lucide-icon name="cloud-off" size="40" class="dashboard-error-state__icon" aria-hidden="true"></lucide-icon>
        <p class="dashboard-error-state__msg">{{ dashboardLoadError() }}</p>
        <ui-button variant="solid" (clicked)="refreshData()">Reintentar</ui-button>
      </div>
    } @else {
    <ui-feature-page-shell
      [variant]="'widthOnly'"
      [fadeIn]="true"
      [extraClass]="'dashboard-wrapper'"
    >
      <!-- Premium Hero Header -->
      <section class="dashboard-hero animate-fade-in">
        <div class="hero-content">
          <div class="hero-text">
            <div class="hero-badge">Panel ejecutivo</div>
            <h1 class="display-xl">Panel Central</h1>
            <p class="body-lg hero-subtitle">Gestión ejecutiva y monitoreo de operaciones en tiempo real</p>
          </div>
          <div class="hero-meta">
            <div class="live-status">
               <span class="pulse-dot"></span>
               <span class="status-label">En línea</span>
            </div>
            <div class="system-date">{{ currentDate() }}</div>
          </div>
        </div>
      </section>

      <!-- Key Metrics -->
      <ui-feature-stats>
        @for (metric of metrics(); track metric.title) {
          <ui-stat-card
            [label]="metric.title"
            [value]="metric.value"
            [icon]="metric.icon"
            [trend]="parsePercentage(metric.change)"
            [accent]="metric.changeType === 'positive'"
            (click)="onMetricNavigate(metric)"
          ></ui-stat-card>
        }
      </ui-feature-stats>

      <!-- Main Grid Layout -->
      <div class="dashboard-grid">
        <!-- Analytics Column -->
        <div class="analytics-col">
          <ui-card class="glass-panel">
            <div class="panel-header">
               <lucide-icon name="bar-chart-3" size="18" aria-hidden="true"></lucide-icon>
               <h3>Rendimiento Comercial</h3>
            </div>
            
            <div class="analytics-content">
              @if (
                charts().revenueByClient.length === 0 && charts().revenueByProject.length === 0
              ) {
                <div class="panel-empty">
                  <lucide-icon name="bar-chart-2" size="28" aria-hidden="true"></lucide-icon>
                  <p>Aún no hay datos de ingresos para mostrar gráficos.</p>
                  <span class="panel-empty__hint">Cuando haya facturación por cliente o proyecto, aparecerá aquí.</span>
                </div>
              }
              @if (charts().revenueByClient.length > 0) {
                <div class="chart-group">
                  <span class="chart-label">Principales Clientes</span>
                  @for (row of charts().revenueByClient; track row.clientId) {
                    <div class="data-row">
                      <span class="row-name">{{ row.name }}</span>
                      <div class="progress-track">
                         <div class="progress-fill" [style.width.%]="barWidth(row.revenue, maxClientRevenue())"></div>
                      </div>
                      <span class="row-value">{{ formatEuro(row.revenue) }}</span>
                    </div>
                  }
                </div>
              }

              @if (charts().revenueByProject.length > 0) {
                <div class="chart-group">
                  <span class="chart-label">Rentabilidad por Proyecto</span>
                  @for (row of charts().revenueByProject; track row.projectId) {
                    <div class="data-row">
                      <span class="row-name">{{ row.name }}</span>
                      <div class="progress-track">
                         <div class="progress-fill primary" [style.width.%]="barWidth(row.revenue, maxProjectRevenue())"></div>
                      </div>
                      <span class="row-value">{{ formatEuro(row.revenue) }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          </ui-card>

          <!-- Recent Activity -->
          <ui-card class="glass-panel">
            <div class="panel-header">
               <lucide-icon name="activity" size="18" aria-hidden="true"></lucide-icon>
               <h3>Flujo de Actividad</h3>
               <ui-button variant="ghost" size="sm" (clicked)="goToAuditTrail()">HISTORIAL</ui-button>
            </div>
            
            <div class="activity-feed">
              @if (recentActivities().length === 0) {
                <div class="panel-empty panel-empty--compact">
                  <lucide-icon name="inbox" size="24" aria-hidden="true"></lucide-icon>
                  <p>No hay actividad reciente.</p>
                </div>
              }
              @for (activity of recentActivities(); track activity.id) {
                <div
                  class="feed-item"
                  role="button"
                  tabindex="0"
                  [attr.aria-label]="'Abrir: ' + activity.title"
                  (click)="goToActivity(activity.type)"
                  (keydown.enter)="goToActivity(activity.type)"
                  (keydown.space)="$event.preventDefault(); goToActivity(activity.type)"
                >
                  <div class="item-icon" [attr.data-type]="activity.type">
                     <lucide-icon name="{{ getActivityIconName(activity.type) }}" size="14" aria-hidden="true"></lucide-icon>
                  </div>
                  <div class="item-info">
                     <div class="item-top">
                        <span class="item-title">{{ activity.title }}</span>
                        <span class="item-time">{{ activity.timestamp }}</span>
                     </div>
                     <p class="item-desc">{{ activity.description }}</p>
                  </div>
                </div>
              }
            </div>
          </ui-card>
        </div>

        <!-- Sidebar Column -->
        <aside class="sidebar-col">
          <!-- Quick Actions -->
          <ui-card class="actions-panel glass-panel">
            <div class="panel-header">
               <lucide-icon name="zap" size="18" aria-hidden="true"></lucide-icon>
               <h3>Acciones rápidas</h3>
            </div>
            <div class="actions-list" role="list">
              @for (action of quickActions(); track action.title) {
                <ui-button
                  [color]="action.color"
                  variant="outline"
                  size="sm"
                  class="action-btn flash-action"
                  (clicked)="goToRoute($event, action.route)"
                >
                  <span class="flash-action__inner">
                    <span class="flash-action__icon-wrap" aria-hidden="true">
                      <lucide-icon
                        [name]="action.icon"
                        class="flash-action__icon"
                        size="20"
                        aria-hidden="true"
                      ></lucide-icon>
                    </span>
                    <span class="flash-action__copy">
                      <span class="a-title">{{ action.title }}</span>
                      <span class="a-desc">{{ action.description }}</span>
                    </span>
                  </span>
                </ui-button>
              }
            </div>
          </ui-card>

          <!-- AI Insight (último evento del tenant) -->
          <div
            class="info-teaser ui-glass"
            [class.info-teaser--clickable]="!!latestInsight()"
            role="button"
            tabindex="0"
            (click)="goToAiInsights()"
            (keydown.enter)="goToAiInsights()"
            (keydown.space)="$event.preventDefault(); goToAiInsights()"
            [attr.aria-label]="latestInsight() ? 'Ver insight en AI Insights' : 'Abrir AI Insights'"
          >
             <div class="teaser-content">
                <span class="badge">AI INSIGHT</span>
                @if (latestInsight(); as insight) {
                  <p class="insight-headline">{{ insight.title }}</p>
                  <p class="insight-body">{{ insight.summary }}</p>
                  <span class="insight-meta">
                    {{ insightEventLabel(insight.eventType) }}
                    @if (insight.userEmail) {
                      · {{ insight.userEmail }}
                    }
                    · {{ insight.createdAt | date: 'short' }}
                  </span>
                } @else {
                  <p class="insight-body insight-body--empty">
                    Aún no hay insights registrados. Usa Buddy en cualquier módulo y aparecerán aquí en tiempo real.
                  </p>
                }
             </div>
          </div>
        </aside>
      </div>
    </ui-feature-page-shell>
    }
  `,
  styles: [`
    .dashboard-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 42vh;
      padding: 3rem 1.5rem;
    }

    .dashboard-error-state {
      max-width: 440px;
      margin: 4rem auto;
      padding: 2.25rem 1.75rem;
      text-align: center;
      border-radius: 20px;
      border: 1px solid var(--border-soft, rgba(255, 255, 255, 0.08));
      background: color-mix(in srgb, var(--bg-secondary, #14151c) 92%, transparent);
      box-shadow: 0 12px 40px -20px rgba(0, 0, 0, 0.35);
    }
    .dashboard-error-state__icon {
      color: var(--text-muted);
      opacity: 0.75;
      margin-bottom: 1rem;
    }
    .dashboard-error-state__msg {
      margin: 0 0 1.25rem;
      font-size: 0.92rem;
      line-height: 1.5;
      color: var(--text-secondary, #a1a1aa);
    }

    .panel-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem 1.25rem;
      color: var(--text-muted);
      gap: 0.35rem;
    }
    .panel-empty lucide-icon {
      opacity: 0.45;
      color: var(--text-muted);
    }
    .panel-empty p {
      margin: 0.35rem 0 0;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-secondary);
      max-width: 280px;
    }
    .panel-empty__hint {
      font-size: 0.72rem;
      font-weight: 500;
      opacity: 0.85;
      max-width: 300px;
      line-height: 1.4;
    }
    .panel-empty--compact {
      padding: 1.5rem 1rem;
    }

    .dashboard-wrapper {
      padding-bottom: 2.5rem;
    }

    /* Hero — compacto y profesional */
    .dashboard-hero {
      position: relative;
      padding: 1.35rem 1.5rem 1.15rem;
      margin-bottom: 1.25rem;
      border-radius: 14px;
      overflow: hidden;
      background: var(--surface);
      border: 1px solid color-mix(in srgb, var(--border-soft) 80%, transparent);
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px -6px rgba(15, 23, 42, 0.06);
    }

    .hero-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 1.25rem;
      flex-wrap: wrap;
      position: relative;
      z-index: 1;
      max-width: 1400px;
      margin: 0 auto;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.55rem;
      margin-bottom: 0.45rem;
      border-radius: 6px;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--text-muted);
      background: var(--bg-secondary);
      border: 1px solid color-mix(in srgb, var(--border-soft) 75%, transparent);
    }

    .hero-text h1 {
      font-size: clamp(1.65rem, 2.2vw, 2.25rem);
      line-height: 1.15;
      margin: 0 0 0.35rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: var(--text-primary);
    }

    .hero-text p {
      font-size: 0.9rem;
      font-weight: 500;
      letter-spacing: 0;
      text-transform: none;
      color: var(--text-muted);
      margin: 0;
      max-width: 36rem;
      line-height: 1.5;
    }

    .hero-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.45rem;
    }

    .live-status {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: color-mix(in srgb, var(--success, #10b981) 8%, var(--surface));
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--success, #10b981) 22%, var(--border-soft));
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background: var(--success, #10b981);
      border-radius: 50%;
      flex-shrink: 0;
    }

    .status-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: color-mix(in srgb, var(--success, #10b981) 75%, var(--text-primary));
      letter-spacing: 0.01em;
      text-transform: none;
    }

    .system-date {
      font-size: 0.8125rem;
      color: var(--text-muted);
      font-weight: 500;
      letter-spacing: 0;
      margin-top: 0;
      text-transform: capitalize;
    }

    /* Grid Layout */
    .dashboard-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 340px;
      gap: 1.25rem;
      padding: 0 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .glass-panel {
      margin-bottom: 1.25rem;
      background: var(--surface) !important;
      border: 1px solid color-mix(in srgb, var(--border-soft) 80%, transparent) !important;
      backdrop-filter: none;
      border-radius: 14px !important;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 14px -6px rgba(15, 23, 42, 0.06);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .glass-panel:hover {
      background: var(--surface) !important;
      border-color: color-mix(in srgb, var(--brand) 22%, var(--border-soft)) !important;
      box-shadow: 0 4px 16px -6px rgba(15, 23, 42, 0.08);
      transform: none;
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.85rem 1.15rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border-soft) 80%, transparent);
    }

    .panel-header h3 {
      flex: 1;
      font-size: 0.8125rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      text-transform: none;
      color: var(--text-primary);
    }

    .panel-header > ui-button {
      margin-left: auto;
      flex: 0 0 auto;
    }

    /* Analytics Bars */
    .analytics-content { padding: 1.15rem; gap: 1.5rem; }
    
    .data-row { display: grid; grid-template-columns: minmax(100px, 140px) 1fr minmax(72px, 100px); gap: 0.85rem; margin-bottom: 1rem; align-items: center; }
    .row-name { font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); }
    .row-value { font-size: 0.8125rem; font-weight: 700; color: var(--text-primary); text-align: right; }
    
    .progress-track {
      height: 8px;
      background: color-mix(in srgb, var(--text-muted) 10%, var(--bg-secondary));
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-fill {
      min-width: 2%;
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, color-mix(in srgb, var(--brand) 85%, #fff), var(--brand));
      box-shadow: none;
    }
    .progress-fill.primary {
      background: linear-gradient(90deg, color-mix(in srgb, var(--success) 80%, #fff), var(--success));
      box-shadow: none;
    }

    .chart-label {
      display: block;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 0.65rem;
    }

    /* Activity Feed */
    .feed-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.85rem 1.15rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border-soft) 65%, transparent);
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .feed-item:hover { background: color-mix(in srgb, var(--brand) 4%, var(--surface)); transform: none; }

    .item-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      background: var(--bg-secondary);
      border: 1px solid color-mix(in srgb, var(--border-soft) 70%, transparent);
      color: var(--text-secondary);
    }

    .item-title { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
    .item-time { font-size: 0.6875rem; color: var(--text-muted); }
    .item-desc { margin: 0.15rem 0 0; font-size: 0.8125rem; color: var(--text-muted); line-height: 1.4; }

    /* Acciones rápidas */
    .actions-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.85rem 1rem 1rem;
    }
    .action-btn {
      display: block;
      width: 100%;
    }
    .action-btn ::ng-deep .btn {
      width: 100%;
      min-height: 3.25rem;
      align-items: center;
      justify-content: flex-start;
      text-align: left;
      border-radius: 10px;
      padding: 0.65rem 0.85rem;
      line-height: 1.25;
      text-transform: none;
      font-weight: 600;
      letter-spacing: 0;
    }
    .flash-action__inner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      min-width: 0;
    }
    .flash-action__icon-wrap {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.15rem;
      height: 2.15rem;
      border-radius: 8px;
      background: color-mix(in srgb, var(--brand) 8%, var(--bg-secondary));
      box-shadow: none;
    }
    .flash-action__icon {
      color: currentColor;
    }
    .flash-action__copy {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
      gap: 0.1rem;
      min-width: 0;
      flex: 1;
    }
    .a-title {
      font-size: 0.8125rem;
      font-weight: 600;
      letter-spacing: 0;
      text-transform: none;
    }
    .a-desc {
      font-size: 0.6875rem;
      font-weight: 500;
      letter-spacing: 0;
      text-transform: none;
      opacity: 0.9;
      color: var(--text-muted);
    }

    .info-teaser {
       margin-top: 1rem;
       padding: 1rem 1.15rem;
       border-radius: 12px;
       background: var(--bg-secondary);
       border: 1px solid color-mix(in srgb, var(--border-soft) 80%, transparent);
    }

    .info-teaser .badge {
      display: inline-block;
      font-size: 0.625rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 0.35rem;
    }

    .info-teaser p {
      margin: 0;
      font-size: 0.8125rem;
      line-height: 1.45;
      color: var(--text-secondary);
    }

    .info-teaser--clickable {
      cursor: pointer;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .info-teaser--clickable:hover {
      border-color: color-mix(in srgb, var(--brand) 35%, var(--border-soft));
      box-shadow: 0 4px 16px -6px color-mix(in srgb, var(--brand) 18%, transparent);
    }

    .insight-headline {
      font-weight: 700;
      color: var(--text-primary) !important;
      margin: 0.35rem 0 0.25rem !important;
    }

    .insight-body--empty {
      margin-top: 0.35rem !important;
      font-size: 0.78rem !important;
    }

    .insight-meta {
      display: block;
      margin-top: 0.5rem;
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--text-muted);
      letter-spacing: 0.02em;
    }

    @media (max-width: 1100px) {
      .dashboard-grid { grid-template-columns: 1fr; padding: 0 1rem; }
      .sidebar-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    }
    @media (max-width: 768px) {
      .sidebar-col { grid-template-columns: 1fr; }
      .hero-content { flex-direction: column; align-items: flex-start; }
      .hero-meta { align-items: flex-start; }
      .dashboard-hero { padding: 1.15rem 1rem; }
    }

    :host-context(html[data-theme-is-light='true']) .glass-panel {
      background: var(--surface) !important;
      border-color: var(--border-soft) !important;
    }

    :host-context(html[data-erp-tenant='babooni']) .dashboard-hero {
      background: var(--surface);
      border-color: color-mix(in srgb, var(--border-soft) 80%, transparent);
      padding: 1.25rem 1.35rem 1.1rem;
      margin-bottom: 1rem;
    }

    :host-context(html[data-erp-tenant='babooni']) .dashboard-grid {
      padding: 0 clamp(0.75rem, 2vw, 1.25rem);
      gap: 1rem;
    }

    :host-context(html[data-erp-tenant='babooni']) .glass-panel {
      border-radius: 12px !important;
    }

    :host-context(html[data-erp-tenant='babooni']) .panel-header h3 {
      font-size: 0.8125rem;
      font-weight: 600;
    }

    :host-context(html[data-erp-tenant='babooni']) .progress-fill {
      box-shadow: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly summaryStore = inject(DashboardAnalyticsService);
  private readonly notificationStore = inject(NotificationFeedStore);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authStore = inject(GlobalAuthStore);
  private readonly insightsApi = inject(AiInsightsApiService);
  readonly canAccess = rbacAllows(this.authStore, 'dashboard.view');

  latestInsight = signal<AiInsightDto | null>(null);
  private unsubscribeInsightBc: (() => void) | null = null;

  /** Primer fetch o refresco del resumen analítico. */
  isDashboardLoading = signal(true);
  /** Error de API cuando aún no hay resumen en caché. */
  dashboardLoadError = signal<string | null>(null);

  currentTheme = this.themeService.currentThemeData;
  currentDate = signal(
    new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  );

  summary = signal<DashboardSummaryDto | null>(null);
  
  metrics = computed<MetricCard[]>(() => {
    const s = this.summary();
    if (!s) return [];
    return [
      {
        title: 'CLIENTES ACTIVOS',
        value: String(s.metrics.totalClients),
        change: (s.trends.clientsDelta >= 0 ? '+' : '') + s.trends.clientsDelta,
        changeType: s.trends.clientsDelta >= 0 ? 'positive' : 'negative',
        icon: 'users',
      },
      {
        title: 'FACTURACIÓN TOTAL',
        value: this.formatEuro(s.metrics.totalRevenue),
        change: (s.trends.revenueChangePercent >= 0 ? '+' : '') + s.trends.revenueChangePercent + '%',
        changeType: s.trends.revenueChangePercent >= 0 ? 'positive' : 'negative',
        icon: 'dollar-sign',
      },
      {
        title: 'PROYECTOS CURSO',
        value: String(s.metrics.activeProjects),
        change: (s.trends.projectsDelta >= 0 ? '+' : '') + s.trends.projectsDelta,
        changeType: s.trends.projectsDelta >= 0 ? 'positive' : 'negative',
        icon: 'briefcase',
      },
      {
        title: 'EVENTOS HOY',
        value: String(s.metrics.completedEvents),
        change: s.trends.eventsNote || 'Hito alcanzado',
        changeType: 'positive',
        icon: 'calendar',
      },
    ];
  });

  charts = computed(() => {
    const s = this.summary();
    return {
      revenueByClient: s?.charts.revenueByClient || [],
      revenueByProject: s?.charts.revenueByProject || [],
    };
  });

  recentActivities = signal<RecentActivity[]>([
    {
      id: '1',
      type: 'invoice',
      title: 'Factura Emitida #F/2026/089',
      description: 'Factura generada para el cliente Teatro Lírico.',
      timestamp: 'HACE 12 MIN',
      status: 'success',
    },
    {
      id: '2',
      type: 'project',
      title: 'Nuevo Proyecto: Gira Verano',
      description: 'Creado nuevo proyecto logístico para Fleet.',
      timestamp: 'HACE 2 HORAS',
      status: 'info',
    },
    {
      id: '3',
      type: 'client',
      title: 'Cliente Registrado: Apple SL',
      description: 'Nuevo cliente añadido al CRM comercial.',
      timestamp: 'HOY 11:30',
      status: 'warning',
    },
  ]);

  quickActions = signal<QuickAction[]>([
    {
      title: 'Emitir Factura',
      description: 'Generar comprobante AEAT',
      icon: 'file-plus',
      route: '/billing/new',
      color: 'primary',
    },
    {
      title: 'Nuevo Cliente',
      description: 'Registrar en base de datos',
      icon: 'user-plus',
      route: '/clients',
      color: 'success',
    },
    {
      title: 'Crear Evento',
      description: 'Agendar fecha logística',
      icon: 'calendar-plus',
      route: '/events',
      color: 'warning',
    },
    {
      title: 'Estado de Flota',
      description: 'Ver disponibilidad vehículos',
      icon: 'truck',
      route: '/fleet',
      color: 'secondary',
    },
  ]);

  maxClientRevenue = computed(() =>
    Math.max(...(this.summary()?.charts.revenueByClient.map((c: { revenue: number }) => c.revenue) || [1]))
  );
  
  maxProjectRevenue = computed(() =>
    Math.max(...(this.summary()?.charts.revenueByProject.map((c: { revenue: number }) => c.revenue) || [1]))
  );

  ngOnInit() {
    this.refreshData();
    void this.loadLatestInsight();
    this.unsubscribeInsightBc = this.insightsApi.subscribeToLiveUpdates(() => {
      void this.loadLatestInsight();
    });
    this.destroyRef.onDestroy(() => this.unsubscribeInsightBc?.());
    interval(300000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.refreshData();
        void this.loadLatestInsight();
      });
  }

  async loadLatestInsight() {
    try {
      const rows = await firstValueFrom(this.insightsApi.list({ limit: 1 }));
      this.latestInsight.set(rows[0] ?? null);
    } catch {
      this.latestInsight.set(null);
    }
  }

  insightEventLabel(type: string): string {
    const labels: Record<string, string> = {
      workflow: 'Workflow',
      chat: 'Chat',
      feedback: 'Feedback',
      delegation: 'Delegación',
      prediction: 'Predicción',
      system: 'Sistema',
    };
    return labels[type] ?? type;
  }

  goToAiInsights() {
    this.router.navigate(['/ai-insights']);
  }

  refreshData(): void {
    this.isDashboardLoading.set(true);
    this.dashboardLoadError.set(null);
    this.summaryStore
      .getSummary()
      .pipe(
        take(1),
        catchError(() => {
          this.dashboardLoadError.set(
            'No se pudo cargar el resumen. Comprueba la conexión e inténtalo de nuevo.',
          );
          return of(null);
        }),
        finalize(() => this.isDashboardLoading.set(false)),
      )
      .subscribe((data) => {
        if (data) {
          this.summary.set(data);
          this.dashboardLoadError.set(null);
        }
      });
  }

  formatEuro(val: number) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(val);
  }

  parsePercentage(val: string) {
    const num = parseFloat(val.replace(/[+%]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  barWidth(val: number, max: number) {
    if (max <= 0) return 0;
    return (val / max) * 100;
  }

  getActivityIconName(type: RecentActivity['type']) {
    switch (type) {
      case 'project': return 'briefcase';
      case 'event': return 'calendar';
      case 'invoice': return 'file-text';
      case 'client': return 'users';
      default: return 'activity';
    }
  }

  onMetricNavigate(metric: MetricCard) {
    if (metric.title.includes('CLIENTES')) this.router.navigate(['/clients']);
    if (metric.title.includes('FACTURACIÓN')) this.router.navigate(['/billing']);
    if (metric.title.includes('PROYECTOS')) this.router.navigate(['/projects']);
  }

  goToAuditTrail() { this.router.navigate(['/audit']); }
  
  goToActivity(type: RecentActivity['type']) {
     const route = type === 'invoice' ? '/billing' : type === 'client' ? '/clients' : `/${type}s`;
     this.router.navigate([route]);
  }

  goToRoute(event: Event, route: string) {
    event.stopPropagation();
    this.router.navigate([route]);
  }
}
