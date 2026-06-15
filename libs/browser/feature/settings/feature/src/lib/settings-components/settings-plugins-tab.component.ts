import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UiBadgeComponent,
} from '@josanz-erp/shared-ui-kit';
import { PluginStore, ToastService } from '@josanz-erp/shared-data-access';
import { AuthStore } from '@josanz-erp/identity-data-access';

interface PluginDescriptor {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'core' | 'vertical' | 'experimental';
}

@Component({
  selector: 'lib-settings-plugins-tab',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCardComponent, UiButtonComponent, UiBadgeComponent],
  template: `
    <section class="content-section animate-slide-up">
      <div class="section-breadcrumb">
        <span>Organización</span>
        <lucide-icon name="chevron-right" size="12"></lucide-icon>
        <span class="current">Módulos</span>
      </div>
      <div class="section-title">
        <h2>Gestión de Módulos</h2>
        <p>Activa funcionalidades adicionales para tu organización</p>
      </div>

      @if (pluginsTabError()) {
        <div class="feature-load-error-banner" role="status" aria-live="polite">
          <lucide-icon name="alert-circle" size="20" class="feature-load-error-banner__icon" aria-hidden="true"></lucide-icon>
          <span class="feature-load-error-banner__text">{{ pluginsTabError() }}</span>
          <ui-button variant="ghost" size="sm" icon="rotate-cw" (clicked)="reloadTenantModulesFromApi()">
            Reintentar
          </ui-button>
        </div>
      }

      <div class="plugin-grid">
        @for (plugin of plugins; track plugin.id) {
          <ui-card variant="glass" class="plugin-card" [class.disabled]="!isPluginEnabled(plugin.id)">
            <div class="plugin-header">
              <div class="plugin-icon" [style.color]="isPluginEnabled(plugin.id) ? 'var(--brand)' : '#64748b'">
                <lucide-icon [name]="plugin.icon" size="24" aria-hidden="true"></lucide-icon>
              </div>
              <div class="header-text">
                <h3>{{ plugin.name }}</h3>
                <span class="category-tag">{{ plugin.category }}</span>
              </div>
            </div>

            <p class="plugin-desc">{{ plugin.description }}</p>

            <div class="plugin-footer">
              <ui-badge [variant]="isPluginEnabled(plugin.id) ? 'success' : 'neutral'">
                {{ isPluginEnabled(plugin.id) ? 'Activo' : 'Inactivo' }}
              </ui-badge>
              @if (isPluginEnabled(plugin.id)) {
                <ui-button variant="outline" size="sm" (clicked)="onRequestDeactivateModule(plugin.id)">
                  Desactivar
                </ui-button>
              } @else {
                @if (canActivateTenantModules()) {
                  <ui-button variant="filled" size="sm" (clicked)="onRequestActivateModule(plugin.id)">
                    Activar
                  </ui-button>
                } @else {
                  <ui-button variant="filled" size="sm" [disabled]="true" title="No tienes permiso para activar módulos">
                    Activar
                  </ui-button>
                }
              }
            </div>
          </ui-card>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .section-breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .section-breadcrumb .current {
        color: var(--brand);
      }

      .section-title h2 {
        font-size: 1.5rem;
        font-weight: 900;
        color: #fff;
        margin: 0;
        letter-spacing: -0.02em;
      }

      .section-title p {
        font-size: 0.9rem;
        color: #64748b;
        margin: 0.5rem 0 0 0;
      }

      .feature-load-error-banner {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 12px;
        margin-bottom: 1.5rem;
      }

      .feature-load-error-banner__icon {
        color: #f87171;
      }

      .feature-load-error-banner__text {
        flex: 1;
        color: #e2e8f0;
        font-size: 0.85rem;
      }

      .plugin-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .plugin-card {
        display: flex;
        flex-direction: column;
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
      }

      .plugin-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.1) !important;
      }

      .plugin-card.disabled {
        opacity: 0.6;
      }

      .plugin-header {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-bottom: 1rem;
      }

      .plugin-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
      }

      .header-text h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
        font-weight: 700;
        color: #0f172a;
      }

      .plugin-desc {
        font-size: 0.85rem;
        color: #64748b;
        margin: 0 0 1.5rem 0;
        flex: 1;
      }

      .plugin-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .category-tag {
        font-size: 0.65rem;
        font-weight: 800;
        text-transform: uppercase;
        color: #94a3b8;
        letter-spacing: 0.1em;
      }
    `,
  ],
})
export class SettingsPluginsTabComponent {
  protected readonly _pluginStore = inject(PluginStore);
  protected readonly _toast = inject(ToastService);
  protected readonly _authStore = inject(AuthStore);

  readonly pluginsTabError = signal<string | null>(null);

  readonly plugins: PluginDescriptor[] = [
    { id: 'dashboard', name: 'Dashboard', description: 'Panel principal con KPIs y resumen operativo del tenant.', icon: 'layout-dashboard', category: 'core' },
    { id: 'ai-insights', name: 'AI Insights', description: 'Módulo de inteligencia artificial con análisis predictivo.', icon: 'cpu', category: 'experimental' },
    { id: 'clients', name: 'Gestión de Clientes', description: 'Módulo CRM para seguimiento de clientes y leads.', icon: 'users', category: 'core' },
    { id: 'projects', name: 'Proyectos y Tareas', description: 'Planificación de producciones y asignación de recursos.', icon: 'file-text', category: 'core' },
    { id: 'events', name: 'Calendario de Eventos', description: 'Gestión de fechas críticas y rodajes.', icon: 'calendar', category: 'core' },
    { id: 'identity', name: 'Identidad y Usuarios', description: 'Control de acceso, roles y seguridad.', icon: 'id-card', category: 'core' },
    { id: 'availability', name: 'Disponibilidad', description: 'Control horario y cuadrante de vacaciones.', icon: 'clock', category: 'vertical' },
    { id: 'services', name: 'Catálogo de Servicios', description: 'Definición de tarifas y servicios prestados.', icon: 'wrench', category: 'vertical' },
    { id: 'reports', name: 'Análisis y Reportes', description: 'KPIs, métricas y exportación de datos.', icon: 'pie-chart', category: 'vertical' },
    { id: 'audit', name: 'Auditoría de Sistema', description: 'Registro de actividad y trazabilidad de cambios.', icon: 'shield-check', category: 'vertical' },
    { id: 'inventory', name: 'Inventario Pro', description: 'Control de stock y trazabilidad de material.', icon: 'package', category: 'core' },
    { id: 'budgets', name: 'Presupuestos', description: 'Gestor de cotizaciones cinematográficas.', icon: 'receipt', category: 'core' },
    { id: 'delivery', name: 'Logística y Albaranes', description: 'Gestión de entregas y salidas de material.', icon: 'truck', category: 'vertical' },
    { id: 'fleet', name: 'Gestión de Flota', icon: 'car', description: 'Control de vehículos y transportes de producción.', category: 'vertical' },
    { id: 'rentals', name: 'Alquileres', icon: 'key', description: 'Sistema de reservas y devoluciones.', category: 'vertical' },
    { id: 'billing', name: 'Facturación', description: 'Gestión de facturas y cobros.', icon: 'history', category: 'core' },
    { id: 'verifactu', name: 'VeriFactu Compliance', icon: 'file-check', description: 'Integración mandatoria con la AEAT.', category: 'vertical' },
  ];

  readonly canActivateTenantModules = computed(() => {
    const p = this._authStore.user()?.permissions ?? [];
    return p.includes('platform.tenants.manage');
  });

  isPluginEnabled(id: string) {
    return this._pluginStore.enabledPlugins().includes(id);
  }

  onRequestActivateModule(pluginId: string): void {
    if (!this.canActivateTenantModules()) return;
    this._pluginStore.togglePlugin(pluginId);
  }

  onRequestDeactivateModule(pluginId: string): void {
    if (!this.isPluginEnabled(pluginId)) return;
  }

  reloadTenantModulesFromApi(): void {
    // TODO: Implement API reload for tenant modules
  }
}