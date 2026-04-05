import { Component, OnInit, signal } from '@angular/core';
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
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <h1 class="dashboard-title">Dashboard</h1>
          <p class="dashboard-subtitle">Resumen general del sistema</p>
        </div>
        <div class="header-date">
          {{ currentDate() }}
        </div>
      </header>

      <!-- Metrics Cards -->
      <div class="metrics-grid">
        <lib-ui-card *ngFor="let metric of metrics()" class="metric-card">
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
        </lib-ui-card>
      </div>

      <div class="dashboard-content">
        <!-- Recent Activities -->
        <div class="activities-section">
          <lib-ui-card>
            <div class="section-header">
              <h2 class="section-title">Actividad Reciente</h2>
              <lib-ui-button variant="ghost" size="sm">
                Ver todo
              </lib-ui-button>
            </div>
            <div class="activities-list">
              <div
                *ngFor="let activity of recentActivities()"
                class="activity-item"
              >
                <div class="activity-icon">
                  <lucide-icon
                    [img]="getActivityIcon(activity.type)"
                    size="16"
                  ></lucide-icon>
                </div>
                <div class="activity-content">
                  <h4 class="activity-title">{{ activity.title }}</h4>
                  <p class="activity-description">{{ activity.description }}</p>
                  <span class="activity-timestamp">{{
                    activity.timestamp
                  }}</span>
                </div>
                <div class="activity-status" *ngIf="activity.status">
                  <lib-ui-badge [variant]="getStatusVariant(activity.status)">
                    {{ activity.status }}
                  </lib-ui-badge>
                </div>
              </div>
            </div>
          </lib-ui-card>
        </div>

        <!-- Quick Actions -->
        <div class="actions-section">
          <lib-ui-card>
            <div class="section-header">
              <h2 class="section-title">Acciones Rápidas</h2>
            </div>
            <div class="actions-grid">
              <lib-ui-button
                *ngFor="let action of quickActions()"
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
              </lib-ui-button>
            </div>
          </lib-ui-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 1.5rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .dashboard-title {
        margin: 0;
        font-size: 2.5rem;
        font-weight: 700;
        color: #111827;
      }

      .dashboard-subtitle {
        margin: 0.5rem 0 0 0;
        color: #6b7280;
        font-size: 1.125rem;
      }

      .header-date {
        color: #6b7280;
        font-weight: 500;
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
        background: #f3f4f6;
        border-radius: 0.5rem;
        color: #374151;
      }

      .metric-info h3 {
        margin: 0 0 0.25rem 0;
        font-size: 0.875rem;
        font-weight: 500;
        color: #6b7280;
      }

      .metric-value {
        margin: 0 0 0.5rem 0;
        font-size: 2rem;
        font-weight: 700;
        color: #111827;
      }

      .metric-change {
        font-size: 0.875rem;
        font-weight: 500;
      }

      .metric-change.positive {
        color: #059669;
      }

      .metric-change.negative {
        color: #dc2626;
      }

      .metric-change.neutral {
        color: #6b7280;
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
        color: #111827;
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
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        background: #f9fafb;
      }

      .activity-icon {
        padding: 0.5rem;
        background: white;
        border-radius: 0.375rem;
        color: #6b7280;
      }

      .activity-content {
        flex: 1;
      }

      .activity-title {
        margin: 0 0 0.25rem 0;
        font-size: 0.875rem;
        font-weight: 500;
        color: #111827;
      }

      .activity-description {
        margin: 0 0 0.5rem 0;
        font-size: 0.75rem;
        color: #6b7280;
      }

      .activity-timestamp {
        font-size: 0.75rem;
        color: #9ca3af;
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
