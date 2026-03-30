import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UiLoaderComponent, UiCardComponent } from '@josanz-erp/shared-ui-kit';

@Component({
  selector: 'lib-settings-feature',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiLoaderComponent, UiCardComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="glow-text">Configuración del Sistema</h1>
          <p class="subtitle">Ajustes de infraestructura, parámetros fiscales y preferencias de usuario</p>
        </div>
      </div>

      <ui-josanz-card variant="glass" class="settings-card">
        <div class="maintenance-mode">
          <lucide-icon name="settings-2" class="spin-slow" size="48"></lucide-icon>
          <h3>MÓDULO EN DESARROLLO</h3>
          <p>Los ingenieros del sistema están configurando las interfaces de control.</p>
          <ui-josanz-loader message="Sincronizando consola de administración..."></ui-josanz-loader>
        </div>
      </ui-josanz-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; }
    
    .page-header {
      margin-bottom: 2.5rem;
      border-bottom: 1px solid var(--border-soft);
      padding-bottom: 1.5rem;
    }
    
    .glow-text { 
      font-size: 2.5rem; 
      font-weight: 900; 
      color: #fff; 
      margin: 0; 
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-family: var(--font-display);
      text-shadow: 0 0 20px var(--brand-glow);
    }
    
    .subtitle { margin: 0.5rem 0 0 0; color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; }

    .settings-card { min-height: 400px; display: flex; align-items: center; justify-content: center; }

    .maintenance-mode {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1.5rem;
      padding: 3rem;
    }

    .maintenance-mode h3 {
      font-size: 1.2rem;
      font-weight: 900;
      color: var(--brand);
      margin: 0;
      letter-spacing: 0.2em;
    }

    .maintenance-mode p {
      color: var(--text-muted);
      font-size: 0.9rem;
      max-width: 300px;
      line-height: 1.6;
    }

    .spin-slow {
      color: var(--brand);
      filter: drop-shadow(0 0 10px var(--brand-glow));
      animation: spin 10s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsFeatureComponent {}
