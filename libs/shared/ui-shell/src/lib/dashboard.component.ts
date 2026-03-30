import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { UiCardComponent, UiButtonComponent, UiBadgeComponent } from '@josanz-erp/shared-ui-kit';

@Component({
  selector: 'josanz-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, UiCardComponent, UiButtonComponent, UiBadgeComponent],
  template: `
    <div class="dashboard-container animate-fade-in">
      <header class="page-header">
        <div class="header-main">
          <h1 class="page-title text-uppercase">Panel de Control General</h1>
          <div class="breadcrumb">
            <span class="active">VISIÓN GLOBAL</span>
            <span class="separator">/</span>
            <span>MÉTRICAS EN TIEMPO REAL</span>
          </div>
        </div>
        <div class="header-actions">
          <ui-josanz-button variant="glass" size="md" icon="refresh-cw">SINCRONIZAR</ui-josanz-button>
          <ui-josanz-button variant="primary" size="md" icon="plus">NUEVO EXPEDIENTE</ui-josanz-button>
        </div>
      </header>

      <div class="stats-grid">
        <ui-josanz-card variant="glass" class="stat-card">
          <div class="stat-icon"><lucide-icon name="trending-up" size="24"></lucide-icon></div>
          <div class="stat-content">
            <span class="stat-lbl text-uppercase">Facturación Mensual</span>
            <span class="stat-val font-mono">€42,850.00</span>
            <span class="stat-delta success">+12.5% vs Mes Ant.</span>
          </div>
        </ui-josanz-card>

        <ui-josanz-card variant="glass" class="stat-card">
          <div class="stat-icon"><lucide-icon name="key" size="24"></lucide-icon></div>
          <div class="stat-content">
            <span class="stat-lbl text-uppercase">Alquileres Activos</span>
            <span class="stat-val font-mono">24</span>
            <span class="stat-delta info">8 Entregas Hoy</span>
          </div>
        </ui-josanz-card>

        <ui-josanz-card variant="glass" class="stat-card">
          <div class="stat-icon"><lucide-icon name="alert-circle" size="24"></lucide-icon></div>
          <div class="stat-content">
            <span class="stat-lbl text-uppercase">Presupuestos Pendientes</span>
            <span class="stat-val font-mono">15</span>
            <span class="stat-delta warning">3 Requieren Acción</span>
          </div>
        </ui-josanz-card>

        <ui-josanz-card variant="glass" class="stat-card">
          <div class="stat-icon"><lucide-icon name="truck" size="24"></lucide-icon></div>
          <div class="stat-content">
            <span class="stat-lbl text-uppercase">Disponibilidad Flota</span>
            <span class="stat-val font-mono">92%</span>
            <span class="stat-delta success">Operativa</span>
          </div>
        </ui-josanz-card>
      </div>

      <div class="main-content-grid">
        <ui-josanz-card variant="glass" class="recent-card">
          <header class="card-header">
            <h3 class="text-uppercase">Registro de Actividad</h3>
            <ui-josanz-button variant="ghost" size="sm">VER TODO</ui-josanz-button>
          </header>
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

        <ui-josanz-card variant="glass" class="performance-card">
          <header class="card-header">
            <h3 class="text-uppercase">Disponibilidad de Recursos</h3>
          </header>
          <div class="resource-stats">
            <div class="res-item">
              <span class="res-name text-uppercase">Cámaras & Ópticas</span>
              <div class="progress-bar"><div class="progress-fill" style="width: 85%"></div></div>
              <span class="res-val">85%</span>
            </div>
            <div class="res-item">
              <span class="res-name text-uppercase">Iluminación</span>
              <div class="progress-bar"><div class="progress-fill" style="width: 42%"></div></div>
              <span class="res-val">42%</span>
            </div>
            <div class="res-item">
              <span class="res-name text-uppercase">Sonido & Microfonía</span>
              <div class="progress-bar"><div class="progress-fill" style="width: 70%"></div></div>
              <span class="res-val">70%</span>
            </div>
          </div>
        </ui-josanz-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 2.5rem; display: flex; flex-direction: column; gap: 2.5rem; }
    
    .page-header {
      display: flex; 
      justify-content: space-between; 
      align-items: flex-end;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--border-soft);
    }
    
    .page-title { font-size: 2rem; font-weight: 900; color: #fff; margin: 0 0 0.5rem 0; letter-spacing: -0.02em; }
    .breadcrumb { display: flex; gap: 8px; font-size: 0.65rem; font-weight: 800; letter-spacing: 0.15em; color: var(--text-muted); }
    .breadcrumb .active { color: var(--brand); }
    .header-actions { display: flex; gap: 1rem; }

    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
    
    .stat-card { display: flex; gap: 1.5rem; align-items: center; padding: 1.5rem !important; }
    .stat-icon { width: 48px; height: 48px; border-radius: 8px; background: rgba(240, 62, 62, 0.1); border: 1px solid var(--brand); color: var(--brand); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px var(--brand-glow); }
    
    .stat-content { display: flex; flex-direction: column; gap: 4px; }
    .stat-lbl { font-size: 0.6rem; font-weight: 800; color: var(--text-muted); letter-spacing: 0.1em; }
    .stat-val { font-size: 1.5rem; font-weight: 900; color: #fff; line-height: 1; margin: 4px 0; }
    .stat-delta { font-size: 0.65rem; font-weight: 800; }
    .stat-delta.success { color: var(--success); }
    .stat-delta.info { color: var(--info); }
    .stat-delta.warning { color: var(--warning); }

    .main-content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; min-height: 400px; }
    
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .card-header h3 { font-size: 0.85rem; font-weight: 900; color: var(--brand); letter-spacing: 0.15em; margin: 0; }

    .activity-list { display: flex; flex-direction: column; gap: 1px; background: var(--border-soft); border-radius: 4px; overflow: hidden; }
    .activity-item { background: var(--bg-tertiary); padding: 1rem; display: flex; align-items: center; gap: 1.5rem; transition: 0.2s; }
    .activity-item:hover { background: rgba(255, 255, 255, 0.03); }
    
    .activity-time { font-size: 0.65rem; color: var(--text-muted); width: 60px; }
    .activity-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .activity-user { font-size: 0.75rem; font-weight: 800; color: #fff; text-transform: uppercase; }
    .activity-msg { font-size: 0.75rem; color: var(--text-secondary); }

    .resource-stats { display: flex; flex-direction: column; gap: 2rem; }
    .res-item { display: flex; flex-direction: column; gap: 10px; }
    .res-name { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); letter-spacing: 0.1em; }
    .progress-bar { height: 6px; background: rgba(255, 255, 255, 0.05); border-radius: 3px; overflow: hidden; position: relative; }
    .progress-fill { position: absolute; top: 0; left: 0; bottom: 0; background: var(--brand); box-shadow: 0 0 10px var(--brand-glow); }
    .res-val { align-self: flex-end; font-size: 0.7rem; font-weight: 900; color: #fff; font-family: var(--font-mono); }

    @media (max-width: 1200px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .main-content-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent {
  activities = [
    { id: '1', time: '14:20', user: 'Antonio Munias', msg: 'Ha validado la factura #FAC-2026-004', type: 'billing' },
    { id: '2', time: '13:15', user: 'Sistema', msg: 'Nuevo presupuesto recibido: Producciones Madrid S.L.', type: 'budget' },
    { id: '3', time: '12:05', user: 'Juan Perez', msg: 'Entrega completada: Expediente #RNT-005', type: 'rental' },
    { id: '4', time: '10:45', user: 'Sistema', msg: 'Aviso de stock bajo: Opticas Canon L-Series', type: 'inventory' },
  ];
}
