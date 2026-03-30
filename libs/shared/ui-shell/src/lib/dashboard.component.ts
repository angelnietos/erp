import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import { 
  UiCardComponent, UiButtonComponent, UiBadgeComponent, 
  UiStatCardComponent, UiResourceMonitorComponent, ResourceItem 
} from '@josanz-erp/shared-ui-kit';

@Component({
  selector: 'josanz-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, LucideAngularModule, 
    UiCardComponent, UiButtonComponent, UiBadgeComponent,
    UiStatCardComponent, UiResourceMonitorComponent
  ],
  template: `
    <div class="dashboard-container animate-slide-up">
      <header class="page-header">
        <div class="header-breadcrumb">
          <h1 class="page-title text-uppercase">Panel de Control General</h1>
          <div class="breadcrumb">
            <span class="active">VISIÓN GLOBAL</span>
            <span class="separator">/</span>
            <span>MÉTRICAS EN TIEMPO REAL</span>
          </div>
        </div>
        <div class="header-actions">
          <ui-josanz-button
            variant="glass"
            size="md"
            icon="refresh-cw"
            [loading]="isSyncing()"
            (clicked)="syncDashboard()"
          >SINCRONIZAR</ui-josanz-button>
          <ui-josanz-button variant="primary" size="md" icon="plus" (clicked)="goNewRental()">
            NUEVO EXPEDIENTE
          </ui-josanz-button>
        </div>
      </header>

      <div class="stats-grid">
        <ui-josanz-stat-card 
          label="Facturación Mensual" 
          value="€42,850.00" 
          icon="trending-up" 
          [trend]="12.5" 
          [accent]="true">
        </ui-josanz-stat-card>

        <ui-josanz-stat-card 
          label="Alquileres Activos" 
          value="24" 
          icon="key" 
          [trend]="8">
        </ui-josanz-stat-card>

        <ui-josanz-stat-card 
          label="Presupuestos Pendientes" 
          value="15" 
          icon="alert-circle" 
          [trend]="-2">
        </ui-josanz-stat-card>

        <ui-josanz-stat-card 
          label="Disponibilidad Flota" 
          value="92%" 
          icon="truck">
        </ui-josanz-stat-card>
      </div>

      <div class="main-content-grid">
        <ui-josanz-card variant="glass" title="Registro de Actividad" class="recent-card">
          <div slot="header-actions">
            <ui-josanz-button variant="ghost" size="sm">VER TODO</ui-josanz-button>
          </div>
          
          <div class="activity-list">
            @for (act of activities; track act.id) {
              <div class="activity-item">
                <div class="activity-time font-mono">{{ act.time }}</div>
                <div class="activity-content">
                  <span class="activity-user">{{ act.user }}</span>
                  <span class="activity-msg">{{ act.msg }}</span>
                </div>
                <ui-josanz-badge [variant]="act.type === 'billing' ? 'success' : 'info'">{{ act.type | uppercase }}</ui-josanz-badge>
              </div>
            }
          </div>
        </ui-josanz-card>

        <div class="sidebar-grid">
          <ui-josanz-resource-monitor 
            title="Sistemas de Captación" 
            [items]="resourceItems">
          </ui-josanz-resource-monitor>

          <ui-josanz-card variant="glass" title="Rendimiento del Sistema">
            <div class="performance-summary">
              <div class="perf-stat">
                <span class="p-lbl text-uppercase">UPTIME GLOBAL</span>
                <span class="p-val font-mono">99.98%</span>
              </div>
              <div class="perf-stat">
                <span class="p-lbl text-uppercase">LATENCIA API</span>
                <span class="p-val font-mono">14MS</span>
              </div>
            </div>
          </ui-josanz-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 0; display: flex; flex-direction: column; gap: 1.15rem; }
    
    .page-header {
      display: flex; 
      justify-content: space-between; 
      align-items: flex-end;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-soft);
    }
    
    .page-title { font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0 0 0.25rem 0; letter-spacing: -0.02em; font-family: var(--font-main); }
    .breadcrumb { display: flex; gap: 6px; font-size: 0.55rem; font-weight: 700; letter-spacing: 0.08em; color: var(--text-muted); }
    .breadcrumb .active { color: var(--brand); }
    .header-actions { display: flex; gap: 1rem; }

    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.85rem; }

    .main-content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; min-height: 320px; }
    
    .sidebar-grid { display: flex; flex-direction: column; gap: 1rem; }

    .activity-list { display: flex; flex-direction: column; gap: 1px; background: var(--border-soft); border-radius: 4px; overflow: hidden; }
    .activity-item { background: var(--bg-tertiary); padding: 0.65rem 0.85rem; display: flex; align-items: center; gap: 0.85rem; transition: 0.2s; }
    .activity-item:hover { background: rgba(255, 255, 255, 0.03); }
    
    .activity-time { font-size: 0.55rem; color: var(--text-muted); width: 52px; }
    .activity-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .activity-user { font-size: 0.62rem; font-weight: 700; color: #fff; text-transform: uppercase; }
    .activity-msg { font-size: 0.62rem; color: var(--text-secondary); }

    .performance-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .perf-stat { display: flex; flex-direction: column; gap: 4px; }
    .p-lbl { font-size: 0.52rem; font-weight: 700; color: var(--text-muted); }
    .p-val { font-size: 0.95rem; font-weight: 800; color: var(--brand); font-family: var(--font-main); }

    @media (max-width: 1200px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .main-content-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardComponent {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  readonly isSyncing = signal(false);

  /** Comprueba conectividad con la API (misma ruta que usa el resto del ERP). */
  syncDashboard(): void {
    if (this.isSyncing()) return;
    this.isSyncing.set(true);
    this.http
      .get<unknown[]>('/api/vehicles')
      .pipe(finalize(() => this.isSyncing.set(false)))
      .subscribe({
        error: (err) => console.error('Sincronización: error al contactar la API', err),
      });
  }

  goNewRental(): void {
    void this.router.navigate(['/rentals'], { queryParams: { openCreate: '1' } });
  }

  activities = [
    { id: '1', time: '14:20', user: 'Antonio Munias', msg: 'Ha validado la factura #FAC-2026-004', type: 'billing' },
    { id: '2', time: '13:15', user: 'Sistema', msg: 'Nuevo presupuesto recibido: Producciones Madrid S.L.', type: 'budget' },
    { id: '3', time: '12:05', user: 'Juan Perez', msg: 'Entrega completada: Expediente #RNT-005', type: 'rental' },
    { id: '4', time: '10:45', user: 'Sistema', msg: 'Aviso de stock bajo: Opticas Canon L-Series', type: 'inventory' },
  ];

  resourceItems: ResourceItem[] = [
    { id: '1', name: 'Cámaras & Ópticas', status: 'ok', value: 85, label: '85%', icon: 'camera' },
    { id: '2', name: 'Iluminación LED', status: 'warning', value: 42, label: 'BAJO STOCK', icon: 'sun' },
    { id: '3', name: 'Puestos Logística', status: 'ok', value: 100, label: 'ACTIVO', icon: 'truck' },
  ];
}
