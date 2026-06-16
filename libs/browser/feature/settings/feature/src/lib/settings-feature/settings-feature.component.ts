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
        background:
          radial-gradient(circle at 15% 0%, rgba(245, 158, 11, 0.12), transparent 32rem),
          linear-gradient(135deg, #050505 0%, #111827 46%, #1f2937 100%);
        min-width: 0;
        box-sizing: border-box;
      }

      * { box-sizing: border-box; }

      .settings-content {
        padding: clamp(1.5rem, 3vw, 3rem);
        overflow-y: auto;
        background:
          linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(2, 6, 23, 0.96));
        scrollbar-width: thin;
        scrollbar-color: var(--brand) transparent;
        min-width: 0;
      }

      .content-section {
        width: min(100%, 1180px);
        margin: 0 auto 5rem;
        color: #f8fafc;
      }

      :host ::ng-deep .section-breadcrumb {
        color: #94a3b8 !important;
        margin-bottom: 1rem !important;
      }

      :host ::ng-deep .section-title h2,
      :host ::ng-deep .hero-title,
      :host ::ng-deep .roles-header-main h2 {
        color: #f8fafc !important;
        text-shadow: none !important;
        -webkit-text-fill-color: initial !important;
      }

      :host ::ng-deep .section-title p,
      :host ::ng-deep .hero-subtitle,
      :host ::ng-deep .role-description-hint {
        color: #cbd5e1 !important;
      }

      :host ::ng-deep ui-card,
      :host ::ng-deep .identity-main-card,
      :host ::ng-deep .companion-stage,
      :host ::ng-deep .roles-selector-card,
      :host ::ng-deep .role-config-card,
      :host ::ng-deep .plugin-card,
      :host ::ng-deep .bot-crystal-card {
        background: rgba(15, 23, 42, 0.94) !important;
        border: 1px solid rgba(148, 163, 184, 0.24) !important;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      :host ::ng-deep .plugin-card,
      :host ::ng-deep .bot-crystal-card {
        padding: 1.35rem !important;
      }

      :host ::ng-deep .header-text h3,
      :host ::ng-deep .role-name-text,
      :host ::ng-deep .perm-label,
      :host ::ng-deep .pick-name,
      :host ::ng-deep h3 {
        color: #f8fafc !important;
      }

      :host ::ng-deep .plugin-desc,
      :host ::ng-deep .pick-desc,
      :host ::ng-deep .category-tag,
      :host ::ng-deep .perm-id {
        color: #94a3b8 !important;
      }

      :host ::ng-deep .luxe-underlined-input {
        background: rgba(2, 6, 23, 0.5) !important;
        border: 1px solid rgba(148, 163, 184, 0.25) !important;
        border-radius: 14px !important;
        color: #f8fafc !important;
        padding: 0.85rem 1rem !important;
      }

      :host ::ng-deep .identity-grid,
      :host ::ng-deep .roles-layout-grid,
      :host ::ng-deep .companion-studio {
        min-width: 0;
      }

      :host ::ng-deep .profile-hero {
        margin-bottom: 2rem !important;
      }

      :host ::ng-deep .avatar-projection-area,
      :host ::ng-deep .stage-card {
        background: rgba(2, 6, 23, 0.58) !important;
        border: 1px solid rgba(148, 163, 184, 0.2);
      }

      .animate-slide-up { animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
      @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

      @media (max-width: 1100px) {
        .settings-layout {
          grid-template-columns: 1fr;
        }

        .settings-content {
          padding: 1rem;
        }

        :host ::ng-deep .identity-grid,
        :host ::ng-deep .roles-layout-grid,
        :host ::ng-deep .companion-studio {
          grid-template-columns: 1fr !important;
        }
      }

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