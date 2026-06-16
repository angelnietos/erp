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
import { TENANT_MODULE_CATALOG } from '@josanz-erp/identity-api';

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
            <lib-settings-plugins-tab
              (activateModule)="onActivateModule($event)"
              (deactivateModule)="onRequestDeactivateModule($event)"
            />
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
        <p class="settings-module-disable-lead">Solo un usuario con permiso <strong>modules.manage</strong> (o gestión de usuarios/roles) puede desactivar módulos.</p>
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
        background: var(--surface-1, #0f172a);
        min-width: 0;
        box-sizing: border-box;
      }

      * { box-sizing: border-box; }

      .settings-content {
        padding: 3rem 4rem;
        overflow-y: auto;
        background: color-mix(in srgb, var(--surface-2, #1e293b) 92%, #fff 8%);
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

  readonly canManageTenantModules = computed(() => {
    const p = this._authStore.user()?.permissions ?? [];
    return (
      p.includes('*') ||
      p.includes('modules.manage') ||
      p.includes('users.manage') ||
      p.includes('roles.manage')
    );
  });

  readonly canDeactivateTenantModules = this.canManageTenantModules;

  readonly moduleDeactivateEffectiveDate = computed(() => {
    const last = new Date();
    last.setMonth(last.getMonth() + 1, 0);
    return last.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  });

  readonly pendingPluginDeactivateLabel = computed(() => {
    const id = this.pendingPluginDisableId();
    if (!id) return '';
    return TENANT_MODULE_CATALOG.find((p) => p.id === id)?.name ?? id;
  });

  readonly plugins = TENANT_MODULE_CATALOG;

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

  onRequestDeactivateModule(pluginId: string): void {
    if (!this._pluginStore.enabledPlugins().includes(pluginId)) return;
    if (!this.canManageTenantModules()) {
      this.deactivateModalMode.set('forbidden');
      this.pendingPluginDisableId.set(pluginId);
      this.deactivateModuleModalOpen.set(true);
      return;
    }
    this.deactivateModalMode.set('terms');
    this.pendingPluginDisableId.set(pluginId);
    this.deactivateModuleModalOpen.set(true);
  }

  onActivateModule(pluginId: string): void {
    if (!this.canManageTenantModules()) return;
    const current = this._pluginStore.enabledPlugins();
    if (current.includes(pluginId)) return;
    this.persistModuleIds([...current, pluginId], 'Módulo activado correctamente.');
  }

  confirmPluginDisable(): void {
    if (!this.moduleDisableTermsAccepted()) return;
    const id = this.pendingPluginDisableId();
    if (!id) return;
    this.applyTenantPluginToggle(id);
    this.closeDeactivatePluginModal();
  }

  private applyTenantPluginToggle(pluginId: string): void {
    const next = this._pluginStore.enabledPlugins().filter((id) => id !== pluginId);
    this.persistModuleIds(next, 'Solicitud de baja registrada. El módulo se desactivará según el calendario indicado.');
  }

  private persistModuleIds(next: string[], successMessage: string): void {
    this._tenantModulesApi.updateEnabledModules(next).subscribe({
      next: (res) => {
        this._pluginStore.setPlugins(res.enabledModuleIds);
        void this._authStore.refreshSession();
        this._toast.show(successMessage, 'success');
      },
      error: () => {
        this._toast.show('No se pudieron actualizar los módulos. Inténtalo de nuevo.', 'error');
      },
    });
  }

  togglePremium() {
    this._pluginStore.togglePerformance();
  }
}