import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import { 
  UiCardComponent, UiButtonComponent, UiBadgeComponent, 
  UiStatCardComponent, UiResourceMonitorComponent, ResourceItem 
} from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'josanz-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, LucideAngularModule, 
    UiCardComponent, UiButtonComponent, UiBadgeComponent,
    UiStatCardComponent, UiResourceMonitorComponent
  ],
  template: `
    <div class="dashboard-container animate-fade-in" [class.perf-optimized]="pluginStore.highPerformanceMode()">
      <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
        <div class="header-breadcrumb">
          <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'">
            Centro de Mando / Operaciones
          </h1>
          <div class="breadcrumb">
            <span class="active" [style.color]="currentTheme().primary">VISIÓN GLOBAL</span>
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
            EXPEDIENTE RNT
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
        <ui-josanz-card 
          variant="glass" 
          title="Registro de Actividad" 
          class="recent-card"
          [class.neon-glow]="!pluginStore.highPerformanceMode()">
          
          <div slot="header-actions">
            <ui-josanz-button variant="ghost" size="sm" [style.color]="currentTheme().primary">VER HISTORIAL</ui-josanz-button>
          </div>
          
          <div class="activity-list">
            @for (act of activities; track act.id) {
              <div class="activity-item" [style.border-left-color]="act.type === 'billing' ? currentTheme().success : currentTheme().primary">
                <div class="activity-time font-mono">{{ act.time }}</div>
                <div class="activity-content">
                  <span class="activity-user" [style.color]="currentTheme().primary">{{ act.user }}</span>
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

          <ui-josanz-card variant="glass" title="Rendimiento Global" [class.neon-glow]="!pluginStore.highPerformanceMode()">
            <div class="performance-summary">
              <div class="perf-stat">
                <span class="p-lbl text-uppercase">UPTIME GARANTIZADO</span>
                <span class="p-val font-mono" [style.color]="currentTheme().success">99.98%</span>
              </div>
              <div class="perf-stat">
                <span class="p-lbl text-uppercase">LATENCIA API</span>
                <span class="p-val font-mono" [style.color]="currentTheme().primary">14MS</span>
              </div>
            </div>
            <div class="perf-footer" [style.color]="currentTheme().primary">
              <lucide-icon name="shield-check" size="14" class="mr-2"></lucide-icon>
              CONEXIÓN SEGURA ACTIVA
            </div>
          </ui-josanz-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 0; max-width: 1600px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
    
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-end;
      padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .glow-text { 
      font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0; 
      letter-spacing: 0.05em; font-family: var(--font-main);
    }
    
    .breadcrumb {
      display: flex; gap: 8px; font-size: 0.6rem; font-weight: 700;
      letter-spacing: 0.1em; color: var(--text-muted); margin-top: 0.5rem;
    }
    
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }

    .main-content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; min-height: 400px; }
    .sidebar-grid { display: flex; flex-direction: column; gap: 1.5rem; }

    .activity-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .activity-item { 
      background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px;
      display: flex; align-items: center; gap: 1rem; border-left: 2px solid transparent;
      transition: all 0.3s ease;
    }
    .activity-item:hover { background: rgba(255, 255, 255, 0.05); transform: translateX(4px); }
    
    .activity-time { font-size: 0.7rem; color: var(--text-muted); width: 60px; }
    .activity-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .activity-user { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
    .activity-msg { font-size: 0.7rem; color: var(--text-secondary); }

    .performance-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    .perf-stat { display: flex; flex-direction: column; gap: 4px; }
    .p-lbl { font-size: 0.55rem; font-weight: 700; color: var(--text-muted); }
    .p-val { font-size: 1.25rem; font-weight: 900; }

    .perf-footer { 
      display: flex; align-items: center; font-size: 0.6rem; font-weight: 800; letter-spacing: 0.1em;
      padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 6px;
    }

    .neon-glow { box-shadow: 0 0 40px rgba(0, 0, 0, 0.4), inset 0 0 1px rgba(255, 255, 255, 0.1); }
    .mr-2 { margin-right: 8px; }

    @media (max-width: 1200px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .main-content-grid { grid-template-columns: 1fr; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  currentTheme = this.themeService.currentThemeData;
  readonly isSyncing = signal(false);

  syncDashboard(): void {
    if (this.isSyncing()) return;
    this.isSyncing.set(true);
    this.http.get<unknown[]>('/api/vehicles')
      .pipe(finalize(() => this.isSyncing.set(false)))
      .subscribe({
        error: (err) => console.error('Sincronización fallida', err),
      });
  }

  goNewRental(): void {
    void this.router.navigate(['/rentals'], { queryParams: { openCreate: '1' } });
  }

  activities = [
    { id: '1', time: '14:20', user: 'Antonio Munias', msg: 'Ha validado la factura fiscal #FAC-2026-004', type: 'billing' },
    { id: '2', time: '13:15', user: 'Sistema', msg: 'Nuevo presupuesto recibido: Producciones Madrid S.L.', type: 'budget' },
    { id: '3', time: '12:05', user: 'Juan Perez', msg: 'Entrega completada: Expediente #RNT-005', type: 'rental' },
    { id: '4', time: '10:45', user: 'Sistema', msg: 'Aviso de stock crítico: Opticas Canon L-Series', type: 'inventory' },
  ];

  resourceItems: ResourceItem[] = [
    { id: '1', name: 'Cámaras & Ópticas', status: 'ok', value: 85, label: '85%', icon: 'camera' },
    { id: '2', name: 'Iluminación LED', status: 'warning', value: 42, label: 'BAJO STOCK', icon: 'sun' },
    { id: '3', name: 'Puestos Logística', status: 'ok', value: 100, label: 'ACTIVO', icon: 'truck' },
  ];
}
