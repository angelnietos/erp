import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { UiButtonComponent, UiCardComponent } from '@josanz-erp/shared-ui-kit';

@Component({
  selector: 'ui-josanz-detail-placeholder',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, UiButtonComponent, UiCardComponent],
  template: `
    <div class="placeholder-container animate-fade-in">
      <header class="page-header">
        <div class="header-main">
          <h1 class="page-title text-uppercase">VISTA DE DETALLE</h1>
          <div class="breadcrumb">
            <span class="active">EXPEDIENTE CENTRAL</span>
            <span class="separator">/</span>
            <span>MODO CONSULTA</span>
          </div>
        </div>
        <ui-josanz-button variant="ghost" size="md" (clicked)="goBack()" icon="arrow-left">
          VOLVER AL LISTADO
        </ui-josanz-button>
      </header>

      <div class="feature-msg">
        <div class="glow-box">
          <lucide-icon name="construction" size="64" class="text-brand"></lucide-icon>
          <h2 class="text-uppercase">Módulo en Construcción</h2>
          <p class="intel-text text-uppercase">El sistema de detalle para el registro #{{ id() }} se encuentra actualmente en fase de implementación.</p>
          <div class="terminal-text">
            <span>> SYS: BINDING_DATA_SOURCE...</span>
            <span class="blink">_</span>
          </div>
          <ui-josanz-button variant="primary" (clicked)="goBack()">
            RETORNAR A LA CENTRAL
          </ui-josanz-button>
        </div>
      </div>

      <div class="stats-preview">
        <ui-josanz-card variant="glass">
          <div class="stat-lbl text-uppercase">Trazabilidad</div>
          <div class="stat-val font-mono">OP-{{ id()?.slice(0, 8) | uppercase }}</div>
        </ui-josanz-card>
        <ui-josanz-card variant="glass">
          <div class="stat-lbl text-uppercase">Estado Servidor</div>
          <div class="stat-val text-success text-uppercase">Sincronizado</div>
        </ui-josanz-card>
        <ui-josanz-card variant="glass">
          <div class="stat-lbl text-uppercase">Permisos</div>
          <div class="stat-val text-uppercase">Administrador</div>
        </ui-josanz-card>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-container { padding: 2.5rem; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 3rem; }
    
    .page-header {
      display: flex; 
      justify-content: space-between; 
      align-items: flex-end;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-soft);
    }
    
    .page-title { 
      font-size: 2.25rem; 
      font-weight: 900; 
      color: #fff; 
      margin: 0 0 0.5rem 0; 
      letter-spacing: -0.02em;
    }
    
    .breadcrumb {
      display: flex;
      gap: 8px;
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: var(--text-muted);
    }
    .breadcrumb .active { color: var(--brand); }
    
    .feature-msg {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }
    
    .glow-box {
      background: var(--bg-secondary);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md);
      padding: 4rem;
      max-width: 600px;
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
      position: relative;
    }
    
    .glow-box::after {
      content: '';
      position: absolute;
      top: -1px; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--brand), transparent);
    }
    
    h2 { font-size: 1.5rem; font-weight: 900; color: #fff; letter-spacing: 0.1em; }
    .intel-text { font-size: 0.75rem; color: var(--text-muted); line-height: 1.6; }
    
    .terminal-text {
      background: #000;
      width: 100%;
      padding: 1rem;
      border-radius: 4px;
      color: var(--success);
      font-family: var(--font-mono);
      font-size: 0.7rem;
      text-align: left;
      border: 1px solid rgba(52, 211, 153, 0.2);
    }
    
    .blink { animation: blink 1s infinite; }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    
    .stats-preview {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    
    .stat-lbl { font-size: 0.6rem; font-weight: 800; color: var(--text-muted); margin-bottom: 8px; letter-spacing: 0.1em; }
    .stat-val { font-size: 1.1rem; font-weight: 900; color: #fff; }

    .text-brand { color: var(--brand); }
    .text-success { color: var(--success); }
  `]
})
export class DetailPlaceholderComponent {
  private route = inject(ActivatedRoute);
  id = signal<string | null>(null);

  constructor() {
    this.route.params.subscribe(params => {
      this.id.set(params['id']);
    });
  }

  goBack() {
    window.history.back();
  }
}
