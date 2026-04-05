import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
} from '@josanz-erp/shared-ui-kit';
import { ThemeService } from '@josanz-erp/shared-data-access';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: any;
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
  icon: any;
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
    LucideAngularModule,
  ],
  template: `
    <div class="page-container animate-fade-in">
      <header
        class="page-header"
        [style.border-bottom-color]="currentTheme().primary + '33'"
      >
        <div class="header-breadcrumb">
          <h1
            class="page-title text-uppercase glow-text"
            [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'"
          >
            Dashboard
          </h1>
          <div class="breadcrumb">
            <span class="active" [style.color]="currentTheme().primary"
              >PANEL DE CONTROL</span
            >
            <span class="separator">/</span>
            <span>RESUMEN GENERAL</span>
          </div>
        </div>
        <div class="header-actions">
          <span class="header-date" [style.color]="currentTheme().primary">{{
            currentDate()
          }}</span>
        </div>
      </header>

      <!-- Metrics Cards -->
      <div class="metrics-grid">
        @for (metric of metrics(); track metric.title) {
          <ui-josanz-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon">
                <lucide-icon [img]="metric.icon" size="24"></lucide-icon>
              </div>
              <div class="metric-info">
                <h3 class="metric-title">{{ metric.title }}</h3>
                <p class="metric-value">{{ metric.value }}</p>
                <span class="metric-change" [class]="metric.changeType">
                  {{ metric.change }}
                </span>
              </div>
            </div>
          </ui-josanz-card>
        }
      </div>

      <div class="dashboard-content">
        <!-- Recent Activities -->
        <div class="activities-section">
          <ui-josanz-card>
            <div class="section-header">
              <h2 class="section-title">Actividad Reciente</h2>
              <ui-josanz-button variant="ghost" size="sm">
                Ver todo
              </ui-josanz-button>
            </div>
            <div class="activities-list">
              @for (activity of recentActivities(); track activity.id) {
                <div class="activity-item">
                  <div class="activity-icon">
                    <lucide-icon
                      [img]="getActivityIcon(activity.type)"
                      size="16"
                    ></lucide-icon>
                  </div>
                  <div class="activity-content">
                    <h4 class="activity-title">{{ activity.title }}</h4>
                    <p class="activity-description">
                      {{ activity.description }}
                    </p>
                    <span class="activity-timestamp">{{
                      activity.timestamp
                    }}</span>
                  </div>
                  @if (activity.status) {
                    <div class="activity-status">
                      <ui-josanz-badge
                        [variant]="getStatusVariant(activity.status)"
                      >
                        {{ activity.status }}
                      </ui-josanz-badge>
                    </div>
                  }
                </div>
              }
            </div>
          </ui-josanz-card>
        </div>

        <!-- Quick Actions -->
        <div class="actions-section">
          <ui-josanz-card>
            <div class="section-header">
              <h2 class="section-title">Acciones Rápidas</h2>
            </div>
            <div class="actions-grid">
              @for (action of quickActions(); track action.title) {
                <ui-josanz-button
                  [variant]="action.color"
                  [routerLink]="action.route"
                  class="action-button"
                >
                  <div class="action-content">
                    <lucide-icon [img]="action.icon" size="20"></lucide-icon>
                    <div class="action-text">
                      <span class="action-title">{{ action.title }}</span>
                      <span class="action-description">{{
                        action.description
                      }}</span>
                    </div>
                  </div>
                </ui-josanz-button>
              }
            </div>
          </ui-josanz-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 0;
        max-width: 100%;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .header-breadcrumb {
        flex: 1;
      }

      .page-title {
        margin: 0 0 0.5rem 0;
        font-size: 2.5rem;
        font-weight: 700;
        letter-spacing: 0.025em;
      }

      .glow-text {
        font-size: 1.6rem;
        font-weight: 800;
        color: #fff;
        margin: 0;
        letter-spacing: 0.05em;
        font-family: var(--font-main);
      }

      .breadcrumb {
        display: flex;
        gap: 8px;
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: var(--text-muted);
        margin-top: 0.5rem;
      }

      .breadcrumb .active {
        color: var(--primary);
      }

      .breadcrumb .separator {
        opacity: 0.5;
      }

      .header-actions {
        display: flex;
        align-items: center;
      }

      .header-date {
        font-weight: 500;
        font-size: 0.875rem;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .metric-card {
        padding: 1.5rem;
      }

      .metric-content {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .metric-icon {
        padding: 0.75rem;
        background: rgba(var(--primary-rgb), 0.1);
        border-radius: 0.5rem;
        color: var(--primary);
      }

      .metric-info h3 {
        margin: 0 0 0.25rem 0;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-muted);
      }

      .metric-value {
        margin: 0 0 0.5rem 0;
        font-size: 2rem;
        font-weight: 700;
        color: #fff;
      }

      .metric-change {
        font-size: 0.875rem;
        font-weight: 500;
      }

      .metric-change.positive {
        color: #10b981;
      }

      .metric-change.negative {
        color: #ef4444;
      }

      .metric-change.neutral {
        color: var(--text-muted);
      }

      .dashboard-content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .section-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #fff;
      }

      .activities-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .activity-item {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.02);
      }

      .activity-icon {
        padding: 0.5rem;
        background: rgba(var(--primary-rgb), 0.1);
        border-radius: 0.375rem;
        color: var(--primary);
      }

      .activity-content {
        flex: 1;
      }

      .activity-title {
        margin: 0 0 0.25rem 0;
        font-size: 0.875rem;
        font-weight: 500;
        color: #fff;
      }

      .activity-description {
        margin: 0 0 0.5rem 0;
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      .activity-timestamp {
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      .actions-grid {
        display: grid;
        gap: 1rem;
      }

      .action-button {
        width: 100%;
        justify-content: flex-start;
        padding: 1rem;
        height: auto;
      }

      .action-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
      }

      .action-text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.125rem;
      }

      .action-title {
        font-weight: 500;
        font-size: 0.875rem;
      }

      .action-description {
        font-size: 0.75rem;
        opacity: 0.8;
      }

      @media (max-width: 1024px) {
        .dashboard-content {
          grid-template-columns: 1fr;
        }

        .metrics-grid {
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  public readonly themeService = inject(ThemeService);

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
      icon: this.DollarSign,
    },
    {
      title: 'Proyectos Activos',
      value: '12',
      change: '+2 este mes',
      changeType: 'positive',
      icon: this.Calendar,
    },
    {
      title: 'Clientes Totales',
      value: '573',
      change: '+5 esta semana',
      changeType: 'positive',
      icon: this.Users,
    },
    {
      title: 'Eventos Completados',
      value: '89',
      change: 'Sin cambios',
      changeType: 'neutral',
      icon: this.Activity,
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
      icon: this.Plus,
      route: '/projects/new',
      color: 'primary',
    },
    {
      title: 'Nuevo Evento',
      description: 'Programar un evento',
      icon: this.Calendar,
      route: '/events/new',
      color: 'secondary',
    },
    {
      title: 'Generar Factura',
      description: 'Crear factura nueva',
      icon: this.FileText,
      route: '/billing/new',
      color: 'success',
    },
    {
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: this.Settings,
      route: '/settings',
      color: 'warning',
    },
  ]);

  ngOnInit() {
    // Load dashboard data
    this.loadDashboardData();
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

  private loadDashboardData() {
    // TODO: Load real data from services
    console.log('Loading dashboard data...');
  }
}
