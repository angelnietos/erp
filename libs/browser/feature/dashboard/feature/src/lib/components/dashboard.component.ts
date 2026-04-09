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
import { interval, switchMap, startWith, Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
} from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UiStatCardComponent,
  UiFeatureStatsComponent
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
  ],
  template: `
    <div class="dashboard-wrapper animate-fade-in">
      <!-- Premium Hero Header -->
      <section class="dashboard-hero">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="display-xl glow-text">Panel Central</h1>
            <p class="body-lg text-secondary">Resumen ejecutivo y control de operaciones en tiempo real</p>
          </div>
          <div class="hero-meta">
            <div class="live-status">
               <span class="pulse-dot"></span>
               <span class="status-label">STREAMING OPERATIVO</span>
            </div>
            <div class="system-date">{{ currentDate() }}</div>
          </div>
        </div>
        <div class="hero-glow"></div>
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
               <lucide-icon name="bar-chart-3" size="18"></lucide-icon>
               <h3>Rendimiento Comercial</h3>
            </div>
            
            <div class="analytics-content">
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
               <lucide-icon name="activity" size="18"></lucide-icon>
               <h3>Flujo de Actividad</h3>
               <ui-button variant="ghost" size="sm" (clicked)="goToAuditTrail()">HISTORIAL</ui-button>
            </div>
            
            <div class="activity-feed">
              @for (activity of recentActivities(); track activity.id) {
                <div class="feed-item" (click)="goToActivity(activity.type)">
                  <div class="item-icon" [attr.data-type]="activity.type">
                     <lucide-icon name="{{ getActivityIconName(activity.type) }}" size="14"></lucide-icon>
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
               <lucide-icon name="zap" size="18"></lucide-icon>
               <h3>Acciones Flash</h3>
            </div>
            <div class="actions-list">
              @for (action of quickActions(); track action.title) {
                <ui-button 
                  [color]="action.color" 
                  variant="glass" 
                  class="action-btn"
                  (clicked)="goToRoute($event, action.route)"
                >
                  <div class="action-btn-content">
                     <lucide-icon [name]="action.icon" size="18"></lucide-icon>
                     <div class="action-btn-text">
                        <span class="a-title">{{ action.title }}</span>
                        <span class="a-desc">{{ action.description }}</span>
                     </div>
                  </div>
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
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      padding: 0 0 4rem 0;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Hero Styling */
    .dashboard-hero {
      position: relative;
      padding: 4rem 2rem 3rem;
      margin-bottom: 2rem;
      border-radius: 0 0 40px 40px;
      overflow: hidden;
      background: linear-gradient(to bottom, rgba(230,0,18,0.05), transparent);
    }

    .hero-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      position: relative;
      z-index: 2;
    }

    .hero-meta {
      text-align: right;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .live-status {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(0, 242, 173, 0.1);
      padding: 0.5rem 1rem;
      border-radius: 50px;
      border: 1px solid rgba(0, 242, 173, 0.2);
    }

    .pulse-dot {
      width: 8px; height: 8px; background: #00f2ad; border-radius: 50%;
      box-shadow: 0 0 10px #00f2ad;
      animation: pulse 1.5s infinite;
    }

    .status-label { font-size: 0.65rem; font-weight: 900; color: #00f2ad; letter-spacing: 0.1em; }
    .system-date { font-family: var(--font-gaming); font-size: 0.8rem; color: var(--brand); font-weight: 700; letter-spacing: 0.05em; }

    .hero-glow {
      position: absolute; top: -50%; left: -20%; width: 60%; height: 150%;
      background: radial-gradient(circle, rgba(230,0,18,0.08) 0%, transparent 70%);
      pointer-events: none;
    }

    /* Grid Layout */


    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 2rem;
      padding: 0 2rem;
    }

    .glass-panel {
      margin-bottom: 2rem;
      background: rgba(255, 255, 255, 0.02) !important;
      border: 1px solid rgba(255, 255, 255, 0.05) !important;
      backdrop-filter: blur(20px);
    }

    .panel-header {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .panel-header h3 { font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); flex: 1; margin: 0; }
    .panel-header lucide-icon { color: var(--brand); }

    /* Analytics Bars */
    .analytics-content { padding: 1.5rem; display: flex; flex-direction: column; gap: 2.5rem; }
    .chart-group { display: flex; flex-direction: column; gap: 1rem; }
    .chart-label { font-size: 0.65rem; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.5rem; }

    .data-row { display: grid; grid-template-columns: 140px 1fr 100px; gap: 1.5rem; align-items: center; }
    .row-name { font-size: 0.8rem; color: var(--text-secondary); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .row-value { font-family: var(--font-gaming); font-size: 0.75rem; color: #fff; text-align: right; }
    
    .progress-track { height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--brand); border-radius: 10px; box-shadow: 0 0 10px var(--brand-glow); transition: width 1s ease-out; }
    .progress-fill.primary { background: var(--info); box-shadow: 0 0 10px rgba(59, 130, 246, 0.4); }

    /* Activity Feed */
    .activity-feed { display: flex; flex-direction: column; padding: 0.5rem 0; }
    .feed-item {
      display: flex; gap: 1.25rem; padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.03);
      cursor: pointer; transition: all 0.3s;
    }
    .feed-item:hover { background: rgba(255,255,255,0.03); transform: translateX(5px); }
    .feed-item:last-child { border: none; }

    .item-icon {
      width: 32px; height: 32px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.05); color: var(--text-muted);
    }
    .item-icon[data-type="project"] { color: var(--brand); background: rgba(230,0,18,0.1); }
    .item-icon[data-type="event"] { color: var(--warning); background: rgba(255,202,58,0.1); }
    .item-icon[data-type="invoice"] { color: var(--success); background: rgba(0,242,173,0.1); }

    .item-info { flex: 1; }
    .item-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem; }
    .item-title { font-size: 0.9rem; font-weight: 700; color: #fff; }
    .item-time { font-size: 0.65rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
    .item-desc { font-size: 0.8rem; color: var(--text-secondary); margin: 0; }

    /* Actions Sidebar */
    .actions-list { display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem; }
    .action-btn { width: 100%; padding: 0.75rem !important; }
    .action-btn-content { display: flex; align-items: center; gap: 1rem; text-align: left; }
    .action-btn-text { display: flex; flex-direction: column; }
    .a-title { font-size: 0.75rem; font-weight: 900; letter-spacing: 0.05em; }
    .a-desc { font-size: 0.65rem; color: rgba(255,255,255,0.5); font-weight: 500; }

    .info-teaser {
       margin-top: 1rem; padding: 1.5rem; border-radius: 20px;
       background: linear-gradient(135deg, rgba(255,255,255,0.05), transparent);
    }
    .teaser-content p { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; margin: 0.75rem 0 0; }
    .info-teaser .badge { font-family: var(--font-gaming); font-size: 0.6rem; background: var(--brand); color: #fff; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 900; }

    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

    @media (max-width: 1100px) {
      .dashboard-grid { grid-template-columns: 1fr; }
      .sidebar-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    }
    @media (max-width: 768px) {
      .sidebar-col { grid-template-columns: 1fr; }
      .hero-content { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
      .hero-meta { text-align: left; }
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
      route: '/billing/create',
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

  refreshData() {
    this.summaryStore.getSummary().subscribe((data) => this.summary.set(data));
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
