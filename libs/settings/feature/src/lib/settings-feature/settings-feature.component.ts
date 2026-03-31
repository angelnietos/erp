import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UiCardComponent, UiButtonComponent } from '@josanz-erp/shared-ui-kit';
import { PluginStore } from '@josanz-erp/shared-data-access';

interface PluginDescriptor {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'core' | 'vertical' | 'experimental';
}

@Component({
  selector: 'lib-settings-feature',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCardComponent, UiButtonComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="glow-text">Configuración del Sistema</h1>
          <p class="subtitle">Gestión de plugins, parámetros fiscales y preferencias de plataforma</p>
        </div>
      </div>

      <div class="settings-grid">
        <!-- Plugin Management Section -->
        <section class="settings-section">
          <div class="section-header">
            <lucide-icon name="puzzle" size="18"></lucide-icon>
            <h2>Gestión de Plugins & Verticales</h2>
          </div>
          
          <div class="plugin-cards">
            @for (plugin of plugins; track plugin.id) {
              <ui-josanz-card variant="glass" class="plugin-card" [class.disabled]="!isPluginEnabled(plugin.id)">
                <div class="plugin-info">
                  <div class="plugin-icon-wrapper" [style.color]="isPluginEnabled(plugin.id) ? 'var(--brand)' : 'var(--text-muted)'">
                    <lucide-icon [name]="plugin.icon" size="24"></lucide-icon>
                  </div>
                  <div class="plugin-text">
                    <h3>{{ plugin.name }}</h3>
                    <p>{{ plugin.description }}</p>
                  </div>
                </div>
                
                <div class="plugin-actions">
                  <div class="status-badge" [class.active]="isPluginEnabled(plugin.id)">
                    {{ isPluginEnabled(plugin.id) ? 'ACTIVO' : 'DESACTIVADO' }}
                  </div>
                  <ui-josanz-button 
                    [variant]="isPluginEnabled(plugin.id) ? 'outline' : 'filled'" 
                    size="sm"
                    (click)="togglePlugin(plugin.id)"
                  >
                    {{ isPluginEnabled(plugin.id) ? 'Desactivar' : 'Activar' }}
                  </ui-josanz-button>
                </div>
              </ui-josanz-card>
            }
          </div>
        </section>

        <!-- System Preferences -->
        <section class="settings-section">
          <div class="section-header">
            <lucide-icon name="sliders" size="18"></lucide-icon>
            <h2>Preferencias Globales</h2>
          </div>
          <ui-josanz-card variant="glass" class="prefs-card">
            <div class="pref-item">
              <div class="pref-info">
                <span>Sincronización en tiempo real</span>
                <p>Habilita la actualización automática de sockets</p>
              </div>
              <div 
                class="pref-toggle" 
                role="switch"
                [attr.aria-checked]="realtimeSync()"
                tabindex="0"
                [class.active]="realtimeSync()"
                (click)="toggleRealtime()"
                (keydown.enter)="toggleRealtime()"
              ></div>
            </div>
            <div class="pref-item">
              <div class="pref-info">
                <span>Modo de alto rendimiento</span>
                <p>Optimiza animaciones para hardware limitado</p>
              </div>
              <div 
                class="pref-toggle" 
                role="switch"
                [attr.aria-checked]="highPerformanceMode()"
                tabindex="0"
                [class.active]="highPerformanceMode()"
                (click)="togglePerformance()"
                (keydown.enter)="togglePerformance()"
              ></div>
            </div>
          </ui-josanz-card>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 0; }
    
    .page-header {
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border-soft);
      padding-bottom: 1rem;
    }
    
    .glow-text { 
      font-size: 1.5rem; 
      font-weight: 800; 
      color: #fff; 
      margin: 0; 
      text-transform: uppercase;
      letter-spacing: 0.08em;
      text-shadow: 0 0 20px var(--brand-glow);
    }
    
    .subtitle { margin: 0.5rem 0 0 0; color: var(--text-secondary); font-size: 0.8rem; }

    .settings-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 2rem;
    }

    .settings-section h2 {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      color: var(--brand);
    }

    /* Plugin Cards */
    .plugin-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    .plugin-card {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1.25rem;
      transition: all 0.3s ease;
    }

    .plugin-card.disabled {
      opacity: 0.6;
      filter: grayscale(0.5);
    }

    .plugin-info {
      display: flex;
      gap: 1rem;
    }

    .plugin-icon-wrapper {
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-soft);
    }

    .plugin-text h3 {
      font-size: 0.95rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
      color: #fff;
    }

    .plugin-text p {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.4;
    }

    .plugin-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-soft);
      padding-top: 1rem;
    }

    .status-badge {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-muted);
    }

    .status-badge.active {
      background: rgba(var(--brand-rgb, 132, 204, 22), 0.1);
      color: var(--brand);
    }

    /* Prefs Card */
    .pref-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 0;
    }

    .pref-item:not(:last-child) {
      border-bottom: 1px solid var(--border-soft);
    }

    .pref-info span {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #fff;
    }

    .pref-info p {
      font-size: 0.7rem;
      color: var(--text-muted);
      margin: 0.2rem 0 0 0;
    }

    .pref-toggle {
      width: 36px;
      height: 18px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 100px;
      position: relative;
      cursor: pointer;
      outline: none;
      transition: var(--transition-base, 0.2s);
    }

    .pref-toggle:focus-visible {
      box-shadow: 0 0 0 2px var(--brand);
    }

    .pref-toggle::after {
      content: '';
      position: absolute;
      left: 2px;
      top: 2px;
      width: 14px;
      height: 14px;
      background: #fff;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .pref-toggle.active {
      background: var(--brand);
    }

    .pref-toggle.active::after {
      left: 20px;
    }

    @media (max-width: 1000px) {
      .settings-grid { grid-template-columns: 1fr; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsFeatureComponent {
  private readonly _pluginStore = inject(PluginStore);

  // Expose signals explicitly for better template inference
  public readonly realtimeSync = this._pluginStore.realtimeSync;
  public readonly highPerformanceMode = this._pluginStore.highPerformanceMode;
  public readonly enabledPlugins = this._pluginStore.enabledPlugins;

  readonly plugins: PluginDescriptor[] = [
    { id: 'inventory', name: 'Inventario Pro', description: 'Control de stock y trazabilidad de material.', icon: 'package', category: 'core' },
    { id: 'budgets', name: 'Presupuestos', description: 'Gestor de cotizaciones cinematográficas.', icon: 'receipt', category: 'core' },
    { id: 'fleet', name: 'Gestión de Flota', icon: 'car', description: 'Control de vehículos y transportes de producción.', category: 'vertical' },
    { id: 'rentals', name: 'Alquileres', icon: 'key', description: 'Sistema de reservas y devoluciones.', category: 'vertical' },
    { id: 'verifactu', name: 'VeriFactu Compliance', icon: 'file-check', description: 'Integración mandatoria con la AEAT.', category: 'vertical' },
  ];

  isPluginEnabled(id: string) {
    return this.enabledPlugins().includes(id);
  }

  togglePlugin(id: string) {
    this._pluginStore.togglePlugin(id);
  }

  toggleRealtime() {
    this._pluginStore.toggleRealtime();
  }

  togglePerformance() {
    this._pluginStore.togglePerformance();
  }
}
