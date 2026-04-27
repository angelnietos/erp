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
} from '@josanz-erp/shared-data-access';

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
            <div class="hero-badge">SISTEMA OPERATIVO v2.1</div>
            <h1 class="display-xl glow-text">Panel Central</h1>
            <p class="body-lg hero-subtitle">Gestión ejecutiva y monitoreo de operaciones en tiempo real</p>
          </div>
          <div class="hero-meta">
            <div class="live-status">
               <div class="pulse-ring"></div>
               <span class="pulse-dot"></span>
               <span class="status-label">EN LÍNEA</span>
            </div>
            <div class="system-date">{{ currentDate() }}</div>
          </div>
        </div>
        <div class="hero-glow-layer layer-1"></div>
        <div class="hero-glow-layer layer-2"></div>
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
               <h3>Acciones Flash</h3>
            </div>
            <div class="actions-list" role="list">
              @for (action of quickActions(); track action.title) {
                <ui-button
                  [color]="action.color"
                  variant="glass"
                  size="md"
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

          <!-- AI Insight -->
          <div class="info-teaser ui-glass">
             <div class="teaser-content">
                <span class="badge">AI INSIGHT</span>
                <p>Tu flujo de caja proyectado para el próximo mes es óptimo. Considera cerrar las facturas pendientes de Fleet.</p>
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
      padding-bottom: 4rem;
    }

    /* Hero Styling — Rockstar Cinematic + Nintendo Launch */
    .dashboard-hero {
      position: relative;
      padding: 6rem 2rem 4rem;
      margin-bottom: 3rem;
      border-radius: 0 0 60px 60px;
      overflow: hidden;
      background: linear-gradient(180deg, rgba(230,0,18,0.12) 0%, transparent 100%);
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .hero-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 2;
      max-width: 1400px;
      margin: 0 auto;
    }

    .hero-text h1 {
      font-size: clamp(3.5rem, 10vw, 6rem);
      line-height: 0.9;
      margin-bottom: 0.5rem;
    }

    .hero-text p {
      font-size: 1.1rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      opacity: 0.8;
      color: var(--text-secondary);
    }

    .live-status {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(0, 255, 170, 0.08);
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
      border: 1px solid rgba(0, 255, 170, 0.2);
      backdrop-filter: blur(10px);
    }

    .pulse-dot {
      width: 10px; height: 10px; background: #00ffaa; border-radius: 50%;
      box-shadow: 0 0 15px #00ffaa;
      animation: pulse 1s infinite;
    }

    .status-label { font-size: 0.7rem; font-weight: 900; color: #00ffaa; letter-spacing: 0.2em; }
    .system-date { font-family: var(--font-gaming); font-size: 1rem; color: var(--brand); font-weight: 900; letter-spacing: 0.1em; margin-top: 1rem; }

    /* Grid Layout */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 3rem;
      padding: 0 3rem;
      max-width: 1600px;
      margin: 0 auto;
    }

    .dashboard-hero {
      position: relative;
      padding: 3.5rem 2.5rem 3rem;
      margin-bottom: 2rem;
      border-radius: 24px;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), transparent);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .hero-content {
      position: relative;
      z-index: 2;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .hero-badge {
      font-size: 0.58rem;
      font-weight: 900;
      color: var(--brand);
      letter-spacing: 0.15em;
      margin-bottom: 0.75rem;
      opacity: 0.8;
    }

    .hero-subtitle {
      color: var(--text-secondary);
      font-weight: 500;
      max-width: 500px;
      margin-top: 0.5rem;
    }

    .live-status {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 6px 12px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 100px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      margin-bottom: 1rem;
    }

    .pulse-ring {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      opacity: 0.4;
      animation: ringPulse 2s infinite ease-out;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background: var(--success);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--success);
    }

    .status-label {
      font-size: 0.58rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: var(--success);
    }

    .system-date {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-align: right;
    }

    .hero-glow-layer {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
    }

    .hero-glow-layer.layer-1 {
      top: -100px;
      right: -50px;
      width: 300px;
      height: 300px;
      background: color-mix(in srgb, var(--brand) 25%, transparent);
      opacity: 0.4;
    }

    .hero-glow-layer.layer-2 {
      bottom: -150px;
      left: -50px;
      width: 400px;
      height: 400px;
      background: color-mix(in srgb, var(--brand) 15%, transparent);
      opacity: 0.2;
    }

    @keyframes ringPulse {
      0% { transform: scale(1); opacity: 0.4; }
      100% { transform: scale(3); opacity: 0; }
    }

    .glass-panel {
      margin-bottom: 2rem;
      background: rgba(255, 255, 255, 0.015) !important;
      border: 1px solid rgba(255, 255, 255, 0.06) !important;
      backdrop-filter: blur(35px);
      border-radius: 20px !important;
      box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .glass-panel:hover {
      background: rgba(255, 255, 255, 0.025) !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 20px 60px -15px rgba(0, 0, 0, 0.4);
      transform: translateY(-2px);
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }

    .panel-header h3 {
      flex: 1;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--text-secondary);
    }

    .panel-header > ui-button {
      margin-left: auto;
      flex: 0 0 auto;
    }

    /* Analytics Bars */
    .analytics-content { padding: 2rem; gap: 3rem; }
    
    .data-row { display: grid; grid-template-columns: 160px 1fr 120px; gap: 2rem; margin-bottom: 1.5rem; }
    .row-name { font-size: 0.85rem; font-weight: 700; }
    .row-value { font-family: var(--font-gaming); font-size: 0.9rem; color: #fff; }
    
    .progress-track {
      height: 10px;
      background: color-mix(in srgb, var(--text-muted) 12%, rgba(255, 255, 255, 0.06));
      border-radius: 20px;
      overflow: hidden;
    }
    .progress-fill {
      min-width: 2%;
      height: 100%;
      border-radius: 20px;
      background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--brand) 80%, #fff 20%),
        var(--brand)
      );
      box-shadow: 0 0 20px var(--brand-glow);
    }
    .progress-fill.primary {
      background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--success) 70%, var(--brand) 30%),
        var(--success)
      );
      box-shadow: 0 0 16px color-mix(in srgb, var(--success) 50%, transparent);
    }

    /* Activity Feed */
    .feed-item {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid rgba(255,255,255,0.02);
    }
    .feed-item:hover { background: rgba(255,255,255,0.02); transform: translateX(10px); }

    .item-icon {
      width: 44px; height: 44px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.05);
    }

    /* Acciones flash — mismo ancho, altura fija, lectura clara */
    .actions-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1.5rem 1.5rem 1.75rem;
    }
    .action-btn {
      display: block;
      width: 100%;
    }
    .action-btn ::ng-deep .btn {
      width: 100%;
      min-height: 4.25rem;
      align-items: center;
      justify-content: flex-start;
      text-align: left;
      border-radius: 16px;
      padding: 0.8rem 1rem;
      line-height: 1.2;
      text-transform: none;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .flash-action__inner {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      width: 100%;
      min-width: 0;
    }
    .flash-action__icon-wrap {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.6rem;
      height: 2.6rem;
      border-radius: 14px;
      background: color-mix(in srgb, #fff 14%, transparent);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }
    .flash-action__icon {
      color: currentColor;
    }
    .flash-action__copy {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
      gap: 0.2rem;
      min-width: 0;
      flex: 1;
    }
    .a-title {
      font-size: 0.81rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .a-desc {
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      text-transform: none;
      opacity: 0.86;
    }

    .info-teaser {
       margin-top: 1.5rem; padding: 2rem; border-radius: var(--radius-lg);
       background: linear-gradient(135deg, rgba(255,255,255,0.03), transparent);
       border: 1px solid rgba(255,255,255,0.05);
    }

    @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }

    @media (max-width: 1100px) {
      .dashboard-grid { grid-template-columns: 1fr; }
      .sidebar-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    }
    @media (max-width: 768px) {
      .sidebar-col { grid-template-columns: 1fr; }
      .hero-content { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
    }

    :host-context(html[data-theme-is-light='true']) .glass-panel {
      background: color-mix(in srgb, var(--theme-surface, #fff) 94%, var(--brand) 4%) !important;
      border-color: var(--border-soft, rgba(8, 8, 8, 0.08)) !important;
      backdrop-filter: blur(12px);
    }
    :host-context(html[data-theme-is-light='true']) .panel-header {
      border-bottom-color: var(--border-soft, rgba(8, 8, 8, 0.08));
    }
    :host-context(html[data-theme-is-light='true']) .row-value {
      color: var(--text-primary);
    }
    :host-context(html[data-theme-is-light='true']) .item-title {
      color: var(--text-primary);
    }

    /* BABOONI LUXE DASHBOARD OVERRIDES */
    :host-context(html[data-erp-tenant='babooni']) .dashboard-hero {
      background: linear-gradient(180deg, rgba(var(--brand-rgb), 0.08) 0%, transparent 100%);
      padding: 6rem 3rem 4rem;
    }

    :host-context(html[data-erp-tenant='babooni']) .display-xl {
      font-size: 3.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }

    :host-context(html[data-erp-tenant='babooni']) .glass-panel {
      background: rgba(255, 255, 255, 0.7) !important;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.4) !important;
      border-radius: 24px;
      box-shadow: 0 20px 50px -20px rgba(0,0,0,0.06);
    }

    :host-context(html[data-erp-tenant='babooni']) .panel-header h3 {
      font-weight: 700;
      color: var(--text-primary);
      opacity: 0.9;
    }

    :host-context(html[data-erp-tenant='babooni']) .progress-track {
      height: 8px;
      background: rgba(0,0,0,0.04);
      border-radius: 99px;
    }

    :host-context(html[data-erp-tenant='babooni']) .progress-fill {
      box-shadow: 0 0 15px rgba(var(--brand-rgb), 0.3);
    }

    :host-context(html[data-erp-tenant='babooni']) .actions-list {
      gap: 0.65rem;
    }

    :host-context(html[data-erp-tenant='babooni']) .flash-action__icon-wrap {
      background: color-mix(in srgb, #fff 22%, rgba(0, 0, 0, 0.12));
    }

    :host-context(html[data-erp-tenant='babooni']) .a-desc {
      color: color-mix(in srgb, currentColor 50%, #1a1a1a 50%);
      opacity: 0.92;
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
  readonly canAccess = rbacAllows(this.authStore, 'dashboard.view');

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
    interval(300000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshData());
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
