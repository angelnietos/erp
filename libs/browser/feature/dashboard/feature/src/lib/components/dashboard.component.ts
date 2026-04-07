import {
  Component,
  OnInit,
  signal,
  inject,
  computed,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, switchMap, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Activity,
  Plus,
  FileText,
  Settings,
} from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UiBadgeComponent,
  UiStatCardComponent,
  UIAIChatComponent
} from '@josanz-erp/shared-ui-kit';
import {
  DashboardAnalyticsService,
  DashboardSummaryDto,
  NotificationFeedStore,
  ThemeService,
} from '@josanz-erp/shared-data-access';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string; // Lucide icon reference
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
  icon: string; // Lucide icon reference
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
    UiBadgeComponent,
    UiStatCardComponent,
    LucideAngularModule,
    UIAIChatComponent,
  ],
  template: `
    <div class="page-container animate-fade-in">
      <div class="dashboard-hero">
        <div class="hero-bg-pattern"></div>
        <div class="hero-particles"></div>
        <header
          class="page-header"
          [style.border-bottom-color]="currentTheme().primary + '33'"
        >
          <div class="header-breadcrumb">
            <div class="hero-glow-effect"></div>
            <h1 class="page-title text-uppercase">
              <span class="title-icon">🎮</span>
              Dashboard
            </h1>
            <div class="breadcrumb">
              <span class="active" [style.color]="currentTheme().primary"
                ><span class="breadcrumb-icon">⚡</span>PANEL DE CONTROL</span
              >
              <span class="separator">/</span>
              <span
                ><span class="breadcrumb-icon">📊</span>RESUMEN GENERAL</span
              >
            </div>
          </div>
          <div class="header-actions">
            <div class="live-indicator">
              <div class="indicator-dot"></div>
              <span class="indicator-text">EN VIVO</span>
            </div>
            <span
              class="header-date gaming-date"
              [style.color]="currentTheme().primary"
              >{{ currentDate() }}</span
            >
          </div>
        </header>
      </div>

      <!-- Metrics Cards -->
      <div class="metrics-grid">
        @for (metric of metrics(); track metric.title) {
          <ui-josanz-stat-card
            [label]="metric.title"
            [value]="metric.value"
            [icon]="metric.icon"
            [trend]="parsePercentage(metric.change)"
            [accent]="metric.changeType === 'positive'"
            (click)="onMetricNavigate(metric)"
          ></ui-josanz-stat-card>
        }
      </div>

      @if (
        charts().revenueByClient.length > 0 ||
        charts().revenueByProject.length > 0
      ) {
        <div class="charts-section">
          @if (charts().revenueByClient.length > 0) {
            <ui-josanz-card class="chart-card">
              <h3 class="chart-title">Facturación por cliente (top 10)</h3>
              @for (row of charts().revenueByClient; track row.clientId) {
                <div class="bar-line">
                  <span class="bar-name">{{ row.name }}</span>
                  <div class="bar-track">
                    <div
                      class="bar-fill"
                      [style.width.%]="
                        barWidth(row.revenue, maxClientRevenue())
                      "
                    ></div>
                  </div>
                  <span class="bar-eur">{{ formatEuro(row.revenue) }}</span>
                </div>
              }
            </ui-josanz-card>
          }
          @if (charts().revenueByProject.length > 0) {
            <ui-josanz-card class="chart-card">
              <h3 class="chart-title">
                Ingresos por proyecto (vía eventos vinculados)
              </h3>
              @for (row of charts().revenueByProject; track row.projectId) {
                <div class="bar-line">
                  <span class="bar-name">{{ row.name }}</span>
                  <div class="bar-track">
                    <div
                      class="bar-fill bar-fill-accent"
                      [style.width.%]="
                        barWidth(row.revenue, maxProjectRevenue())
                      "
                    ></div>
                  </div>
                  <span class="bar-eur">{{ formatEuro(row.revenue) }}</span>
                </div>
              }
            </ui-josanz-card>
          }
        </div>
      }

      <div class="dashboard-content">
        <!-- Recent Activities -->
        <div class="activities-section">
          <ui-josanz-card class="gaming-card activities-card">
            <div class="section-header">
              <div class="section-title-section">
                <span class="section-icon">📈</span>
                <h2 class="section-title">Actividad Reciente</h2>
              </div>
              <ui-josanz-button
                variant="ghost"
                size="sm"
                class="view-all-btn"
                (clicked)="goToAuditTrail()"
              >
                <span class="btn-icon">👁️</span>
                Ver todo
              </ui-josanz-button>
            </div>
            <div class="activities-list">
              @for (activity of recentActivities(); track activity.id) {
                <div
                  class="activity-item gaming-activity-item activity-item--clickable"
                  [class]="getActivityTypeClass(activity.type)"
                  role="button"
                  tabindex="0"
                  (click)="goToActivity(activity.type)"
                  (keydown.enter)="goToActivity(activity.type)"
                  [attr.aria-label]="'Abrir ' + activity.title"
                >
                  <div class="activity-icon gaming-activity-icon">
                    <lucide-icon
                      [img]="getActivityIcon(activity.type)"
                      size="18"
                    ></lucide-icon>
                    <div class="activity-glow"></div>
                  </div>
                  <div class="activity-content">
                    <h4 class="activity-title">{{ activity.title }}</h4>
                    <p class="activity-description text-friendly">
                      {{ activity.description }}
                    </p>
                    <span class="activity-timestamp gaming-timestamp">{{
                      activity.timestamp
                    }}</span>
                  </div>
                  @if (activity.status) {
                    <div class="activity-status">
                      <ui-josanz-badge
                        [variant]="getStatusVariant(activity.status)"
                        class="gaming-badge"
                      >
                        <span class="badge-icon">{{
                          getStatusIcon(activity.status)
                        }}</span>
                        {{ activity.status }}
                      </ui-josanz-badge>
                    </div>
                  }
                  <div class="activity-hover-effect"></div>
                </div>
              }
            </div>
          </ui-josanz-card>
        </div>

        <!-- Quick Actions -->
        <div class="actions-section">
          <ui-josanz-card class="gaming-card actions-card">
            <div class="section-header">
              <div class="section-title-section">
                <span class="section-icon">🚀</span>
                <h2 class="section-title">Acciones Rápidas</h2>
              </div>
            </div>
            <div class="actions-grid gaming-actions-grid">
              @for (action of quickActions(); track action.title) {
                <ui-josanz-button
                  [variant]="action.color"
                  class="action-button gaming-action-btn"
                  [class]="getActionClass(action.color)"
                  (clicked)="goToRoute($event, action.route)"
                >
                  <div class="action-content">
                    <div class="action-icon-wrapper">
                      <lucide-icon [name]="action.icon" size="24"></lucide-icon>
                      <div class="action-glow"></div>
                    </div>
                    <div class="action-text">
                      <span class="action-title">{{ action.title }}</span>
                      <span class="action-description text-friendly">{{
                        action.description
                      }}</span>
                    </div>
                  </div>
                  <div class="action-bg-effect"></div>
                </ui-josanz-button>
              }
            </div>
          </ui-josanz-card>
        </div>
      </div>
    </div>
    <ui-josanz-ai-assistant feature="dashboard"></ui-josanz-ai-assistant>
  `,
  styles: [
    `
      .page-container {
        padding: 0;
        max-width: 100%;
        margin: 0 auto;
      }

      /* Hero Section */
      .dashboard-hero {
        position: relative;
        overflow: hidden;
        margin-bottom: 3rem;
      }

      .hero-bg-pattern {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background:
          radial-gradient(
            circle at 30% 70%,
            rgba(var(--primary-rgb), 0.08) 0%,
            transparent 50%
          ),
          radial-gradient(
            circle at 70% 30%,
            rgba(var(--accent-rgb), 0.06) 0%,
            transparent 50%
          ),
          linear-gradient(
            135deg,
            rgba(var(--primary-rgb), 0.03) 0%,
            transparent 100%
          );
        animation: float-pattern 25s ease-in-out infinite;
      }

      .hero-particles {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
      }

      .hero-particles::before,
      .hero-particles::after {
        content: '';
        position: absolute;
        width: 4px;
        height: 4px;
        background: var(--primary);
        border-radius: 50%;
        animation: particle-float 8s ease-in-out infinite;
      }

      .hero-particles::before {
        top: 20%;
        left: 20%;
        animation-delay: 0s;
      }

      .hero-particles::after {
        top: 60%;
        right: 25%;
        animation-delay: 4s;
      }

      .hero-glow-effect {
        position: absolute;
        top: -30%;
        left: -30%;
        right: -30%;
        bottom: -30%;
        background: radial-gradient(
          circle,
          rgba(var(--primary-rgb), 0.08) 0%,
          transparent 70%
        );
        animation: rotate-glow 20s linear infinite;
        pointer-events: none;
      }

      .page-header {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 2rem;
        padding: 3rem 0 2rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        z-index: 2;
      }

      .header-breadcrumb {
        flex: 1;
        position: relative;
      }

      .title-icon {
        display: inline-block;
        margin-right: 0.5rem;
        animation: bounce-in 1s ease-out;
      }

      .page-title {
        position: relative;
        z-index: 1;
        margin: 0 0 0.5rem 0;
        font-size: clamp(1.75rem, 4vw, 3rem);
        font-weight: 800;
        font-family: var(--font-display);
        letter-spacing: 0.04em;
        line-height: 1.15;
        text-shadow: none;
        -webkit-font-smoothing: antialiased;
        background: linear-gradient(
          135deg,
          var(--text-primary) 0%,
          color-mix(in srgb, var(--primary) 88%, #fff) 100%
        );
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: slide-up 0.8s ease-out;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .live-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(var(--success-rgb), 0.1);
        padding: 0.5rem 1rem;
        border-radius: 2rem;
        border: 1px solid rgba(var(--success-rgb), 0.3);
      }

      .indicator-dot {
        width: 8px;
        height: 8px;
        background: var(--success);
        border-radius: 50%;
        animation: pulse-live 1.5s ease-in-out infinite;
      }

      .indicator-text {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--success);
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .gaming-date {
        font-weight: 700;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 0.5rem 1rem;
        background: rgba(var(--primary-rgb), 0.1);
        border-radius: 1rem;
        border: 1px solid rgba(var(--primary-rgb), 0.2);
      }

      .breadcrumb {
        display: flex;
        gap: 12px;
        font-size: 0.75rem;
        font-weight: 800;
        letter-spacing: 0.15em;
        color: var(--text-muted);
        margin-top: 0.75rem;
        text-transform: uppercase;
        animation: fade-in-up 1.2s ease-out;
      }

      .breadcrumb-icon {
        margin-right: 0.25rem;
      }

      .breadcrumb .active {
        color: var(--primary);
      }

      .breadcrumb .separator {
        opacity: 0.6;
        font-weight: 400;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
        position: relative;
      }

      .charts-section {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 2rem;
        margin-bottom: 3rem;
      }

      .chart-card {
        padding: 1.5rem 1.75rem;
      }

      .chart-title {
        margin: 0 0 1rem 0;
        font-size: 0.9rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-muted);
      }

      .bar-line {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(0, 2fr) auto;
        gap: 0.75rem;
        align-items: center;
        margin-bottom: 0.65rem;
      }

      .bar-name {
        font-size: 0.75rem;
        color: var(--text-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .bar-track {
        height: 10px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.06);
        overflow: hidden;
      }

      .bar-fill {
        height: 100%;
        border-radius: 6px;
        background: linear-gradient(
          90deg,
          var(--primary),
          var(--accent, var(--primary))
        );
        transition: width 0.4s ease;
      }

      .bar-fill-accent {
        background: linear-gradient(90deg, #3b82f6, var(--primary));
      }

      .bar-eur {
        font-size: 0.72rem;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        color: var(--text-primary);
      }

      .gaming-metrics {
        position: relative;
      }

      .gaming-metrics::before {
        content: '';
        position: absolute;
        top: -20px;
        left: -20px;
        right: -20px;
        bottom: -20px;
        background: linear-gradient(
          135deg,
          rgba(var(--primary-rgb), 0.05),
          rgba(var(--accent-rgb), 0.03),
          transparent
        );
        border-radius: 2rem;
        z-index: -1;
        animation: metrics-bg-float 15s ease-in-out infinite;
      }

      .metric-card {
        padding: 2rem;
        position: relative;
        overflow: hidden;
        animation: metric-enter 0.8s ease-out both;
      }

      .metric-card--clickable {
        cursor: pointer;
      }

      .metric-card--clickable:focus-visible {
        outline: 2px solid var(--ring-focus, var(--brand));
        outline-offset: 3px;
      }

      .activity-item--clickable {
        cursor: pointer;
      }

      .activity-item--clickable:focus-visible {
        outline: 2px solid var(--ring-focus, var(--brand));
        outline-offset: 2px;
      }

      .gaming-metric-card {
        backdrop-filter: blur(20px);
        border: 1px solid rgba(var(--primary-rgb), 0.2);
        box-shadow:
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .gaming-metric-card:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow:
          0 20px 60px rgba(0, 0, 0, 0.4),
          0 0 40px rgba(var(--primary-rgb), 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.15);
        border-color: rgba(var(--primary-rgb), 0.4);
      }

      .metric-bg-effect {
        position: absolute;
        top: 0;
        right: 0;
        width: 100px;
        height: 100px;
        background: radial-gradient(
          circle,
          rgba(var(--primary-rgb), 0.1) 0%,
          transparent 70%
        );
        border-radius: 50%;
        animation: metric-bg-pulse 4s ease-in-out infinite;
      }

      .metric-content {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        position: relative;
        z-index: 2;
      }

      .metric-icon {
        position: relative;
        padding: 1rem;
        background: linear-gradient(
          135deg,
          rgba(var(--primary-rgb), 0.2),
          rgba(var(--primary-rgb), 0.1)
        );
        border-radius: 1rem;
        color: var(--primary);
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
      }

      .gaming-icon {
        position: relative;
        overflow: hidden;
      }

      .gaming-icon:hover {
        transform: scale(1.1) rotate(5deg);
        box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.4);
      }

      .icon-glow {
        position: absolute;
        top: -50%;
        left: -50%;
        right: -50%;
        bottom: -50%;
        background: radial-gradient(
          circle,
          rgba(var(--primary-rgb), 0.4) 0%,
          transparent 70%
        );
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }

      .gaming-icon:hover .icon-glow {
        opacity: 1;
        animation: pulse-glow 1s ease-in-out infinite alternate;
      }

      .metric-info h3 {
        margin: 0 0 0.25rem 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .metric-value {
        margin: 0 0 0.5rem 0;
        font-size: 2.5rem;
        font-weight: 900;
        color: #fff;
        text-shadow: 0 0 20px rgba(var(--primary-rgb), 0.5);
      }

      .gaming-value {
        background: linear-gradient(
          135deg,
          var(--text-primary),
          var(--primary, var(--brand))
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: value-shimmer 3s ease-in-out infinite;
      }

      .metric-change {
        font-size: 0.875rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .gaming-change {
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        backdrop-filter: blur(10px);
      }

      .metric-change.positive {
        color: #10b981;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.2);
      }

      .metric-change.negative {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
      }

      .metric-change.neutral {
        color: var(--text-muted);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .change-icon {
        font-size: 0.75rem;
      }

      .dashboard-content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 3rem;
      }

      .gaming-card {
        position: relative;
        overflow: hidden;
        background: linear-gradient(
          135deg,
          rgba(var(--surface), 0.95) 0%,
          rgba(var(--surface), 0.9) 100%
        );
        backdrop-filter: blur(20px);
        border: 1px solid rgba(var(--primary-rgb), 0.2);
        box-shadow:
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      .gaming-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(
          90deg,
          var(--primary),
          var(--accent),
          var(--primary)
        );
        animation: gradient-shift 3s ease-in-out infinite;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .section-title-section {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .section-icon {
        font-size: 1.5rem;
        animation: bounce-in 1s ease-out;
      }

      .section-title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .view-all-btn {
        transition: all 0.3s ease;
      }

      .view-all-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.3);
      }

      .btn-icon {
        margin-right: 0.25rem;
      }

      .activities-list {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .activity-item {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 1.25rem;
        padding: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 1rem;
        background: rgba(255, 255, 255, 0.02);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        animation: activity-enter 0.6s ease-out both;
        overflow: hidden;
      }

      .gaming-activity-item {
        backdrop-filter: blur(10px);
        box-shadow:
          0 4px 20px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      .gaming-activity-item:hover {
        transform: translateX(8px);
        background: linear-gradient(
          135deg,
          rgba(var(--primary-rgb), 0.1) 0%,
          rgba(var(--primary-rgb), 0.05) 100%
        );
        border-color: rgba(var(--primary-rgb), 0.3);
        box-shadow:
          0 12px 40px rgba(0, 0, 0, 0.3),
          0 0 30px rgba(var(--primary-rgb), 0.1);
      }

      .activity-hover-effect {
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(var(--primary-rgb), 0.1),
          transparent
        );
        transition: left 0.6s ease;
      }

      .gaming-activity-item:hover .activity-hover-effect {
        left: 100%;
      }

      .activity-icon {
        position: relative;
        padding: 0.75rem;
        background: rgba(var(--primary-rgb), 0.1);
        border-radius: 0.75rem;
        color: var(--primary);
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
      }

      .gaming-activity-icon {
        position: relative;
        overflow: hidden;
      }

      .gaming-activity-icon:hover {
        transform: scale(1.1) rotate(5deg);
        box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.4);
      }

      .activity-glow {
        position: absolute;
        top: -50%;
        left: -50%;
        right: -50%;
        bottom: -50%;
        background: radial-gradient(
          circle,
          rgba(var(--primary-rgb), 0.3) 0%,
          transparent 70%
        );
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }

      .gaming-activity-icon:hover .activity-glow {
        opacity: 1;
        animation: pulse-glow 1s ease-in-out infinite alternate;
      }

      .activity-content {
        flex: 1;
        position: relative;
        z-index: 2;
      }

      .activity-title {
        margin: 0 0 0.25rem 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-primary);
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }

      .activity-description {
        margin: 0 0 0.5rem 0;
        font-size: 0.84rem;
      }

      .activity-timestamp {
        font-size: 0.75rem;
        color: var(--text-muted);
        font-weight: 500;
      }

      .gaming-timestamp {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 0.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .gaming-timestamp::before {
        content: '🕒';
        font-size: 0.6rem;
      }

      .gaming-badge {
        position: relative;
        z-index: 2;
      }

      .badge-icon {
        margin-right: 0.25rem;
      }

      .actions-grid {
        display: grid;
        gap: 1.5rem;
      }

      .gaming-actions-grid {
        position: relative;
      }

      .action-button {
        width: 100%;
        justify-content: flex-start;
        padding: 1.5rem;
        height: auto;
        position: relative;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        animation: action-enter 0.6s ease-out both;
      }

      .gaming-action-btn {
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow:
          0 4px 20px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      .gaming-action-btn:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow:
          0 12px 40px rgba(0, 0, 0, 0.3),
          0 0 30px rgba(var(--primary-rgb), 0.2);
      }

      .action-primary:hover {
        box-shadow: 0 12px 40px rgba(59, 130, 246, 0.3);
      }

      .action-secondary:hover {
        box-shadow: 0 12px 40px rgba(107, 114, 128, 0.3);
      }

      .action-success:hover {
        box-shadow: 0 12px 40px rgba(34, 197, 94, 0.3);
      }

      .action-warning:hover {
        box-shadow: 0 12px 40px rgba(245, 158, 11, 0.3);
      }

      .action-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        width: 100%;
        position: relative;
        z-index: 2;
      }

      .action-icon-wrapper {
        position: relative;
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 0.75rem;
        transition: all 0.3s ease;
      }

      .action-glow {
        position: absolute;
        top: -50%;
        left: -50%;
        right: -50%;
        bottom: -50%;
        background: radial-gradient(
          circle,
          rgba(255, 255, 255, 0.2) 0%,
          transparent 70%
        );
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }

      .gaming-action-btn:hover .action-glow {
        opacity: 1;
        animation: pulse-glow 1s ease-in-out infinite alternate;
      }

      .action-text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.125rem;
        flex: 1;
      }

      .action-title {
        font-weight: 600;
        font-size: 0.95rem;
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }

      .action-description {
        font-size: 0.8rem;
        opacity: 0.92;
        max-width: 36ch;
      }

      .action-bg-effect {
        position: absolute;
        top: 0;
        right: 0;
        width: 80px;
        height: 80px;
        background: radial-gradient(
          circle,
          rgba(255, 255, 255, 0.05) 0%,
          transparent 70%
        );
        border-radius: 50%;
        animation: action-bg-float 6s ease-in-out infinite;
      }

      /* Animations */
      @keyframes float-pattern {
        0%,
        100% {
          transform: translateY(0px) rotate(0deg) scale(1);
        }
        33% {
          transform: translateY(-5px) rotate(0.5deg) scale(1.01);
        }
        66% {
          transform: translateY(5px) rotate(-0.5deg) scale(0.99);
        }
      }

      @keyframes rotate-glow {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes particle-float {
        0%,
        100% {
          transform: translateY(0px) translateX(0px);
          opacity: 0.7;
        }
        25% {
          transform: translateY(-20px) translateX(10px);
          opacity: 1;
        }
        50% {
          transform: translateY(-10px) translateX(-15px);
          opacity: 0.8;
        }
        75% {
          transform: translateY(-25px) translateX(5px);
          opacity: 0.9;
        }
      }

      @keyframes pulse-live {
        0%,
        100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.7;
          transform: scale(1.2);
        }
      }

      @keyframes metrics-bg-float {
        0%,
        100% {
          transform: translateY(0px) rotate(0deg);
        }
        50% {
          transform: translateY(-10px) rotate(1deg);
        }
      }

      @keyframes metric-enter {
        0% {
          transform: translateY(20px) scale(0.95);
          opacity: 0;
        }
        100% {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }

      @keyframes metric-bg-pulse {
        0%,
        100% {
          opacity: 0.3;
          transform: scale(1);
        }
        50% {
          opacity: 0.7;
          transform: scale(1.1);
        }
      }

      @keyframes value-shimmer {
        0%,
        100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
      }

      @keyframes gradient-shift {
        0%,
        100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
      }

      @keyframes activity-enter {
        0% {
          transform: translateX(-20px);
          opacity: 0;
        }
        100% {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes action-enter {
        0% {
          transform: translateY(15px) scale(0.95);
          opacity: 0;
        }
        100% {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }

      @keyframes action-bg-float {
        0%,
        100% {
          transform: translateY(0px) rotate(0deg) scale(1);
        }
        50% {
          transform: translateY(-5px) rotate(5deg) scale(1.05);
        }
      }

      @keyframes pulse-glow {
        0% {
          opacity: 0.3;
          transform: scale(1);
        }
        100% {
          opacity: 0.8;
          transform: scale(1.1);
        }
      }

      @keyframes bounce-in {
        0% {
          transform: scale(0.3);
          opacity: 0;
        }
        50% {
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes slide-up {
        0% {
          transform: translateY(30px);
          opacity: 0;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes fade-in-up {
        0% {
          transform: translateY(20px);
          opacity: 0;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @media (max-width: 1024px) {
        .dashboard-content {
          grid-template-columns: 1fr;
        }

        .metrics-grid {
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }

        .page-title {
          font-size: 2.5rem;
        }

        .gaming-date {
          display: none;
        }

        .live-indicator {
          padding: 0.25rem 0.75rem;
        }

        .indicator-text {
          font-size: 0.6rem;
        }
      }

      @media (max-width: 768px) {
        .hero-section {
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 2rem;
        }

        .metrics-grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .dashboard-content {
          gap: 2rem;
        }

        .section-title {
          font-size: 1.25rem;
        }

        .action-content {
          flex-direction: column;
          text-align: center;
          gap: 0.75rem;
        }

        .action-text {
          align-items: center;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  public readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly analyticsApi = inject(DashboardAnalyticsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationFeed = inject(NotificationFeedStore);
  private firstDashboardPoll = true;

  charts = signal<DashboardSummaryDto['charts']>({
    revenueByClient: [],
    revenueByProject: [],
  });

  maxClientRevenue = computed(() =>
    Math.max(1, ...this.charts().revenueByClient.map((r: { revenue: number }) => r.revenue)),
  );

  maxProjectRevenue = computed(() =>
    Math.max(1, ...this.charts().revenueByProject.map((r: { revenue: number }) => r.revenue)),
  );

  currentTheme = this.themeService.currentThemeData;
  private readonly TrendingUp = TrendingUp;
  private readonly Users = Users;
  private readonly Calendar = Calendar;
  private readonly DollarSign = DollarSign;
  private readonly Activity = Activity;
  private readonly Plus = Plus;
  private readonly FileText = FileText;
  private readonly Settings = Settings;

  currentDate = signal(
    new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  );

  metrics = signal<MetricCard[]>([
    {
      title: 'Ingresos Totales',
      value: '€45,231.89',
      change: '+20.1% vs mes anterior',
      changeType: 'positive',
      icon: 'dollar-sign',
    },
    {
      title: 'Proyectos Activos',
      value: '12',
      change: '+2 este mes',
      changeType: 'positive',
      icon: 'calendar',
    },
    {
      title: 'Clientes Totales',
      value: '573',
      change: '+5 esta semana',
      changeType: 'positive',
      icon: 'users',
    },
    {
      title: 'Eventos Completados',
      value: '89',
      change: 'Sin cambios',
      changeType: 'neutral',
      icon: 'activity',
    },
  ]);

  recentActivities = signal<RecentActivity[]>([
    {
      id: '1',
      type: 'project',
      title: 'Proyecto Demo 1',
      description: 'Proyecto completado exitosamente',
      timestamp: 'Hace 2 horas',
      status: 'Completado',
    },
    {
      id: '2',
      type: 'invoice',
      title: 'Factura #00123',
      description: 'Factura generada para Cliente Demo',
      timestamp: 'Hace 4 horas',
      status: 'Pendiente',
    },
    {
      id: '3',
      type: 'event',
      title: 'Evento Corporativo ABC',
      description: 'Nuevo evento programado',
      timestamp: 'Hace 6 horas',
      status: 'Activo',
    },
    {
      id: '4',
      type: 'client',
      title: 'Nuevo Cliente Registrado',
      description: 'Empresa XYZ se registró en el sistema',
      timestamp: 'Hace 1 día',
    },
  ]);

  quickActions = signal<QuickAction[]>([
    {
      title: 'Nuevo Proyecto',
      description: 'Crear un proyecto nuevo',
      icon: 'plus',
      route: '/projects/new',
      color: 'primary',
    },
    {
      title: 'Nuevo Evento',
      description: 'Programar un evento',
      icon: 'calendar',
      route: '/events/new',
      color: 'secondary',
    },
    {
      title: 'Generar Factura',
      description: 'Crear factura nueva',
      icon: 'file-text',
      route: '/billing',
      color: 'success',
    },
    {
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: 'settings',
      route: '/settings',
      color: 'warning',
    },
  ]);

  ngOnInit() {
    interval(45_000)
      .pipe(
        startWith(0),
        switchMap(() => this.analyticsApi.getSummary()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((dto) => this.applyDashboardDto(dto));
  }

  barWidth(value: number, max: number): number {
    return Math.min(100, Math.round((value / max) * 100));
  }

  formatEuro(n: number): string {
    return `€${n.toLocaleString('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  getActivityIcon(type: string) {
    switch (type) {
      case 'project':
        return this.Calendar;
      case 'event':
        return this.Activity;
      case 'invoice':
        return this.DollarSign;
      case 'client':
        return this.Users;
      default:
        return this.Activity;
    }
  }

  getStatusVariant(status: string) {
    switch (status.toLowerCase()) {
      case 'completado':
        return 'success';
      case 'activo':
        return 'primary';
      case 'pendiente':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  getChangeIcon(changeType: string): string {
    switch (changeType) {
      case 'positive':
        return '📈';
      case 'negative':
        return '📉';
      default:
        return '➡️';
    }
  }

  getActivityTypeClass(type: string): string {
    return `activity-${type}`;
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'completado':
        return '✅';
      case 'activo':
        return '🔥';
      case 'pendiente':
        return '⏳';
      default:
        return '📝';
    }
  }

  getActionClass(color: string): string {
    return `action-${color}`;
  }

  goToAuditTrail(): void {
    void this.router.navigateByUrl('/audit');
  }

  goToActivity(
    type: RecentActivity['type'],
  ): void {
    const routes: Record<RecentActivity['type'], string> = {
      project: '/projects',
      event: '/events',
      invoice: '/billing',
      client: '/clients',
    };
    void this.router.navigateByUrl(routes[type] ?? '/dashboard');
  }

  goToRoute(ev: Event, path: string): void {
    ev.preventDefault();
    ev.stopPropagation();
    void this.router.navigateByUrl(path);
  }

  onMetricNavigate(metric: MetricCard): void {
    const t = metric.title.toLowerCase();
    if (t.includes('ingreso')) {
      void this.router.navigateByUrl('/billing');
      return;
    }
    if (t.includes('proyecto')) {
      void this.router.navigateByUrl('/projects');
      return;
    }
    if (t.includes('cliente')) {
      void this.router.navigateByUrl('/clients');
      return;
    }
    if (t.includes('evento')) {
      void this.router.navigateByUrl('/events');
      return;
    }
    void this.router.navigateByUrl('/dashboard');
  }

  parsePercentage(change: string): number {
    const matched = change.match(/([+-]?\d+(\.\d+)?)/);
    return matched ? parseFloat(matched[1]) : 0;
  }

  private applyDashboardDto(dto: DashboardSummaryDto | null) {
    if (!dto) {
      return;
    }
    if (!this.firstDashboardPoll) {
      this.notificationFeed.pushDashboardKpiSync(dto.generatedAt);
    }
    this.firstDashboardPoll = false;

    if (dto.charts) {
      this.charts.set(dto.charts);
    }

    const m = dto.metrics;
    const t = dto.trends;
    const fmtMoney = (n: number) =>
      '€' +
      n.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    this.metrics.set([
      {
        title: 'Ingresos Totales',
        value: fmtMoney(m.totalRevenue),
        change: `+${t.revenueChangePercent}% vs mes anterior`,
        changeType: 'positive',
        icon: 'dollar-sign',
      },
      {
        title: 'Proyectos Activos',
        value: String(m.activeProjects),
        change: `+${t.projectsDelta} este mes`,
        changeType: 'positive',
        icon: 'calendar',
      },
      {
        title: 'Clientes Totales',
        value: String(m.totalClients),
        change: `+${t.clientsDelta} esta semana`,
        changeType: 'positive',
        icon: 'users',
      },
      {
        title: 'Eventos Completados',
        value: String(m.completedEvents),
        change:
          t.eventsNote === 'stable'
            ? 'Sin cambios'
            : `Tendencia: ${t.eventsNote}`,
        changeType: 'neutral',
        icon: 'activity',
      },
    ]);
  }
}
