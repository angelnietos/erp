import { signal, effect, computed, inject, Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiButtonComponent,
  UiModalComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  PluginStore,
  ToastService,
} from '@josanz-erp/shared-data-access';
import {
  RolesService,
  AuthStore,
  TenantModulesApiService,
} from '@josanz-erp/identity-data-access';

import {
  SettingsSidebarComponent,
  SettingsProfileTabComponent,
  SettingsPluginsTabComponent,
  SettingsAiTabComponent,
  SettingsBuddyTabComponent,
  SettingsGeneralTabComponent,
  SettingsNotificationsTabComponent,
  SettingsSecurityTabComponent,
  SettingsRolesTabComponent,
  SettingsLabsTabComponent,
  SettingsAppearanceTabComponent,
  SettingsTab,
} from '../settings-components';

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
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    UiButtonComponent,
    UiModalComponent,
    SettingsSidebarComponent,
    SettingsProfileTabComponent,
    SettingsPluginsTabComponent,
    SettingsAiTabComponent,
    SettingsBuddyTabComponent,
    SettingsGeneralTabComponent,
    SettingsNotificationsTabComponent,
    SettingsSecurityTabComponent,
    SettingsRolesTabComponent,
    SettingsLabsTabComponent,
    SettingsAppearanceTabComponent,
  ],
  template: `
    <div class="settings-layout">
      <lib-settings-sidebar [(activeTab)]="activeTab" />

      <main class="settings-content">
        @switch (activeTab()) {
          @case ('profile') {
            <lib-settings-profile-tab />
          }
          @case ('plugins') {
            <lib-settings-plugins-tab />
          }
          @case ('ai') {
            <lib-settings-ai-tab />
          }
          @case ('buddy') {
            <lib-settings-buddy-tab />
          }
          @case ('general') {
            <lib-settings-general-tab />
          }
          @case ('notifications') {
            <lib-settings-notifications-tab />
          }
          @case ('security') {
            <lib-settings-security-tab />
          }
          @case ('roles') {
            <lib-settings-roles-tab />
          }
          @case ('labs') {
            <lib-settings-labs-tab />
          }
          @case ('appearance') {
            <lib-settings-appearance-tab />
          }
        }
      </main>
    </div>

    <ui-modal
      [isOpen]="deactivateModuleModalOpen()"
      [title]="deactivateModalTitle()"
      [color]="deactivateModalMode() === 'terms' ? 'danger' : 'warning'"
      shape="glass"
      (closed)="closeDeactivatePluginModal()"
    >
      @if (deactivateModalMode() === 'terms') {
        <p class="settings-module-disable-lead">
          Vas a solicitar la desactivación de <strong>{{ pendingPluginDeactivateLabel() }}</strong>.
        </p>
        <p class="settings-module-disable-warning">
          La baja surtirá efecto a <strong>final del mes en curso</strong> ({{ moduleDeactivateEffectiveDate() }}). La cuota de suscripción se ajustará en la siguiente renovación según las condiciones contratadas.
        </p>
        <label class="settings-module-disable-terms">
          <input type="checkbox" [checked]="moduleDisableTermsAccepted()" (change)="onModuleDisableTermsCheckboxChange($event)" />
          <span>Acepto esta condición y confirmo que entiendo que el módulo dejará de estar disponible según el calendario indicado y la suscripción.</span>
        </label>
      } @else {
        <p class="settings-module-disable-lead">Solo el rol <strong>SuperAdmin</strong> puede desactivar módulos para la organización.</p>
        <p class="settings-module-disable-warning">Si necesitas una baja, contacta con un SuperAdmin de tu empresa.</p>
      }
      <div modal-footer>
        @if (deactivateModalMode() === 'terms') {
          <ui-button variant="outline" (clicked)="closeDeactivatePluginModal()">Cancelar</ui-button>
          <ui-button variant="filled" [disabled]="!moduleDisableTermsAccepted()" (clicked)="confirmPluginDisable()">
            Aceptar y desactivar
          </ui-button>
        } @else {
          <ui-button variant="filled" (clicked)="closeDeactivatePluginModal()">Entendido</ui-button>
        }
      </div>
    </ui-modal>
  `,
  styles: [
    `
      .settings-layout {
        display: grid;
        grid-template-columns: 280px 1fr;
        min-height: calc(100vh - 64px);
        background: transparent;
        min-width: 0;
        box-sizing: border-box;
      }

      * { box-sizing: border-box; }

      .settings-content {
        padding: 3rem 4rem;
        overflow-y: auto;
        background: rgba(255, 255, 255, 0.05);
        scrollbar-width: thin;
        scrollbar-color: var(--brand) transparent;
        min-width: 0;
      }

      .content-section { width: 100%; margin-bottom: 5rem; }

      .animate-slide-up { animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
      @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

      .settings-module-disable-lead { margin-bottom: 1rem; }
      .settings-module-disable-warning { font-size: 0.85rem; color: #94a3b8; margin-bottom: 1rem; }
      .settings-module-disable-terms { display: flex; gap: 0.5rem; align-items: flex-start; font-size: 0.85rem; }
      .settings-module-disable-terms input { margin-top: 0.25rem; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsFeatureComponent {
  private readonly _pluginStore = inject(PluginStore);
  private readonly _tenantModulesApi = inject(TenantModulesApiService);
  private readonly _toast = inject(ToastService);
  private readonly _rolesService = inject(RolesService);
  public readonly _authStore = inject(AuthStore);

  readonly activeTab = signal<SettingsTab>('profile');

  // Expose signals from stores
  public readonly realtimeSync = this._pluginStore.realtimeSync;
  public readonly highPerformanceMode = this._pluginStore.highPerformanceMode;
  public readonly premiumExperience = computed(() => !this._pluginStore.highPerformanceMode());
  public readonly enabledPlugins = this._pluginStore.enabledPlugins;

  // Permission computed
  readonly canSeeRolesAdmin = computed(() => {
    const p = this._authStore.user()?.permissions ?? [];
    return p.includes('*') || p.includes('roles.manage');
  });

  // Modal state
  readonly deactivateModuleModalOpen = signal(false);
  readonly deactivateModalMode = signal<'terms' | 'forbidden'>('terms');
  readonly pendingPluginDisableId = signal<string | null>(null);
  readonly moduleDisableTermsAccepted = signal(false);

  readonly deactivateModalTitle = computed(() =>
    this.deactivateModalMode() === 'terms' ? 'BAJA DE MÓDULO' : 'NO PUEDES DESACTIVAR ESTE MÓDULO'
  );

  readonly canDeactivateTenantModules = this.canSeeRolesAdmin;

  readonly moduleDeactivateEffectiveDate = computed(() => {
    const last = new Date();
    last.setMonth(last.getMonth() + 1, 0);
    return last.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  });

  readonly pendingPluginDeactivateLabel = computed(() => {
    const id = this.pendingPluginDisableId();
    if (!id) return '';
    return this.plugins.find(p => p.id === id)?.name ?? id;
  });

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

  constructor() {
    effect(() => {
      if (this.activeTab() === 'roles' && !this.canSeeRolesAdmin()) {
        this.activeTab.set('profile');
      }
    });
  }

  onModuleDisableTermsCheckboxChange(event: Event): void {
    this.moduleDisableTermsAccepted.set(
      (event.target as HTMLInputElement).checked,
    );
  }

  closeDeactivatePluginModal(): void {
    this.deactivateModuleModalOpen.set(false);
    this.deactivateModalMode.set('terms');
    this.pendingPluginDisableId.set(null);
    this.moduleDisableTermsAccepted.set(false);
  }

  confirmPluginDisable(): void {
    if (!this.moduleDisableTermsAccepted()) return;
    const id = this.pendingPluginDisableId();
    if (!id) return;
    this.applyTenantPluginToggle(id);
    this.closeDeactivatePluginModal();
  }

  private applyTenantPluginToggle(_pluginId: string): void {
    // TODO: Implement tenant plugin toggle persistence
  }

  togglePremium() {
    this._pluginStore.togglePerformance();
  }
}