import { signal, effect, computed, inject, Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
      <lib-settings-sidebar
        [activeTab]="activeTab()"
        (activeTabChange)="onTabChange($event)"
      />

      <main class="settings-content">
        @if (accessDeniedBanner()) {
          <div class="settings-access-denied" role="alert">
            <p>
              No tienes acceso a la sección que intentabas abrir. Puedes revisar tu perfil aquí
              o volver al panel si tu rol lo permite.
            </p>
            <div class="settings-access-denied__actions">
              <ui-button variant="outline" (clicked)="goToDashboard()">Ir al panel</ui-button>
              <ui-button variant="ghost" (clicked)="dismissAccessDeniedBanner()">Entendido</ui-button>
            </div>
          </div>
        }

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
        grid-template-columns: 248px minmax(0, 1fr);
        min-height: calc(100vh - 64px);
        background:
          radial-gradient(circle at 8% 12%, rgba(245, 158, 11, 0.09), transparent 24rem),
          radial-gradient(circle at 82% 0%, rgba(236, 72, 153, 0.08), transparent 26rem),
          linear-gradient(135deg, #07050a 0%, #0b1120 48%, #101827 100%);
        min-width: 0;
        box-sizing: border-box;
      }

      * { box-sizing: border-box; }

      .settings-content {
        padding: clamp(1.25rem, 2.4vw, 2.5rem);
        overflow-y: auto;
        background:
          radial-gradient(circle at 20% 0%, rgba(148, 163, 184, 0.08), transparent 28rem),
          linear-gradient(180deg, rgba(8, 13, 26, 0.92), rgba(3, 7, 18, 0.98));
        scrollbar-width: thin;
        scrollbar-color: var(--brand) transparent;
        min-width: 0;
      }

      .content-section {
        width: min(100%, 1120px);
        margin: 0 auto 4rem;
        color: #f8fafc;
      }

      :host ::ng-deep .section-breadcrumb {
        display: inline-flex !important;
        align-items: center !important;
        gap: 0.5rem !important;
        margin: 0 0 1rem !important;
        padding: 0.45rem 0.7rem !important;
        border: 1px solid rgba(148, 163, 184, 0.16) !important;
        border-radius: 999px !important;
        background: rgba(15, 23, 42, 0.48) !important;
        color: #94a3b8 !important;
        font-size: 0.68rem !important;
        letter-spacing: 0.08em !important;
      }

      :host ::ng-deep .section-breadcrumb .current {
        color: #fda4af !important;
      }

      :host ::ng-deep .profile-hero,
      :host ::ng-deep .roles-header-main,
      :host ::ng-deep .section-title {
        display: flex !important;
        align-items: flex-end !important;
        justify-content: space-between !important;
        gap: 1.5rem !important;
        margin: 0 0 1.35rem !important;
        padding: 0 !important;
      }

      :host ::ng-deep .section-title h2,
      :host ::ng-deep .hero-title,
      :host ::ng-deep .roles-header-main h2 {
        color: #f8fafc !important;
        font-size: clamp(1.65rem, 3.2vw, 2.55rem) !important;
        line-height: 1.02 !important;
        letter-spacing: -0.055em !important;
        margin: 0 !important;
        text-shadow: none !important;
        -webkit-text-fill-color: initial !important;
      }

      :host ::ng-deep .hero-title span {
        color: #fb7185 !important;
        opacity: 1 !important;
      }

      :host ::ng-deep .section-title p,
      :host ::ng-deep .hero-subtitle,
      :host ::ng-deep .role-description-hint {
        color: #cbd5e1 !important;
        margin: 0.55rem 0 0 !important;
        max-width: 680px !important;
        font-size: 0.9rem !important;
        line-height: 1.55 !important;
      }

      :host ::ng-deep ui-card,
      :host ::ng-deep .identity-main-card,
      :host ::ng-deep .companion-stage,
      :host ::ng-deep .roles-selector-card,
      :host ::ng-deep .role-config-card,
      :host ::ng-deep .plugin-card,
      :host ::ng-deep .bot-crystal-card,
      :host ::ng-deep .prefs-card,
      :host ::ng-deep .companion-pick-btn {
        background:
          linear-gradient(180deg, rgba(18, 27, 52, 0.96), rgba(10, 16, 32, 0.96)) !important;
        border: 1px solid rgba(148, 163, 184, 0.18) !important;
        border-radius: 22px !important;
        box-shadow: 0 18px 52px rgba(0, 0, 0, 0.34) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      :host ::ng-deep ui-card {
        display: block !important;
        min-width: 0 !important;
      }

      :host ::ng-deep .plugin-card,
      :host ::ng-deep .bot-crystal-card,
      :host ::ng-deep .prefs-card,
      :host ::ng-deep ui-card {
        padding: 1.25rem !important;
      }

      :host ::ng-deep .identity-main-card {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) 190px !important;
        align-items: center !important;
        gap: 1.5rem !important;
        padding: 1.5rem !important;
        margin-bottom: 1.5rem !important;
        min-height: 0 !important;
      }

      :host ::ng-deep .profile-hub .identity-main-card {
        grid-template-columns: 190px minmax(0, 1fr) !important;
      }

      :host ::ng-deep .identity-form {
        min-width: 0 !important;
        width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 1rem !important;
        padding-right: 0 !important;
      }

      :host ::ng-deep .identity-form .grid,
      :host ::ng-deep .grid.grid-cols-2 {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 1rem !important;
      }

      :host ::ng-deep .avatar-projection-area,
      :host ::ng-deep .stage-card {
        width: 170px !important;
        height: 170px !important;
        background: rgba(2, 6, 23, 0.5) !important;
        border: 1px solid rgba(148, 163, 184, 0.16) !important;
        border-radius: 26px !important;
        overflow: hidden !important;
      }

      :host ::ng-deep .header-text h3,
      :host ::ng-deep .role-name-text,
      :host ::ng-deep .perm-label,
      :host ::ng-deep .pick-name,
      :host ::ng-deep .pref-header h3,
      :host ::ng-deep .config-subtitle,
      :host ::ng-deep .pref-text h4,
      :host ::ng-deep .role-text h3,
      :host ::ng-deep h3 {
        color: #f8fafc !important;
      }

      :host ::ng-deep .plugin-desc,
      :host ::ng-deep .pick-desc,
      :host ::ng-deep .category-tag,
      :host ::ng-deep .perm-id,
      :host ::ng-deep .pref-text p,
      :host ::ng-deep .config-desc,
      :host ::ng-deep .last-access-row .value {
        color: #94a3b8 !important;
      }

      :host ::ng-deep .luxe-underlined-input {
        width: 100% !important;
        background: rgba(2, 6, 23, 0.52) !important;
        border: 1px solid rgba(148, 163, 184, 0.25) !important;
        border-radius: 14px !important;
        color: #f8fafc !important;
        padding: 0.8rem 0.95rem !important;
        font-size: 0.95rem !important;
        min-height: 46px !important;
      }

      :host ::ng-deep .luxe-label,
      :host ::ng-deep .form-label {
        color: #cbd5e1 !important;
        font-size: 0.68rem !important;
        letter-spacing: 0.11em !important;
      }

      :host ::ng-deep .grid-config,
      :host ::ng-deep .plugin-grid {
        display: grid !important;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 270px), 1fr)) !important;
        gap: 1rem !important;
        align-items: stretch !important;
      }

      :host ::ng-deep .pref-header,
      :host ::ng-deep .badge-header,
      :host ::ng-deep .plugin-header {
        display: flex !important;
        align-items: center !important;
        gap: 0.75rem !important;
        margin-bottom: 1rem !important;
      }

      :host ::ng-deep .plugin-icon,
      :host ::ng-deep .pick-icon,
      :host ::ng-deep .role-icon {
        background: rgba(251, 113, 133, 0.12) !important;
        border: 1px solid rgba(251, 113, 133, 0.2) !important;
        color: #fb7185 !important;
      }

      :host ::ng-deep .pref-row,
      :host ::ng-deep .plugin-footer {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 1rem !important;
        padding: 1rem 0 0 !important;
        margin-top: 1rem !important;
        border-top: 1px solid rgba(148, 163, 184, 0.14) !important;
      }

      :host ::ng-deep .pref-text {
        min-width: 0 !important;
        padding-right: 0 !important;
      }

      :host ::ng-deep .toggle-wrapper,
      :host ::ng-deep .toggle-ui,
      :host ::ng-deep .switch-pill {
        flex: 0 0 auto !important;
        background: rgba(148, 163, 184, 0.18) !important;
        border: 1px solid rgba(148, 163, 184, 0.2) !important;
      }

      :host ::ng-deep .toggle-wrapper.active,
      :host ::ng-deep .permission-toggle-box.active .toggle-ui {
        background: linear-gradient(135deg, #fb7185, #f43f5e) !important;
        border-color: rgba(251, 113, 133, 0.55) !important;
      }

      :host ::ng-deep .security-badge {
        border-radius: 999px !important;
        background: rgba(16, 185, 129, 0.1) !important;
        border: 1px solid rgba(16, 185, 129, 0.25) !important;
        color: #86efac !important;
        padding: 0.65rem 0.9rem !important;
        font-size: 0.68rem !important;
        white-space: nowrap !important;
      }

      :host ::ng-deep .identity-grid,
      :host ::ng-deep .roles-layout-grid,
      :host ::ng-deep .companion-studio {
        min-width: 0;
      }

      :host ::ng-deep .identity-grid {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) 320px !important;
        gap: 1rem !important;
      }

      :host ::ng-deep .identity-sidebar-cards {
        gap: 1rem !important;
      }

      :host ::ng-deep .id-badge-card {
        padding: 1.25rem !important;
      }

      :host ::ng-deep .id-code {
        background: rgba(2, 6, 23, 0.56) !important;
        border: 1px solid rgba(148, 163, 184, 0.16) !important;
        color: #e2e8f0 !important;
        padding: 0.95rem !important;
        border-radius: 14px !important;
      }

      :host ::ng-deep .role-status-card {
        background: linear-gradient(135deg, rgba(190, 18, 60, 0.92), rgba(124, 45, 18, 0.88)) !important;
        border: 1px solid rgba(253, 164, 175, 0.22) !important;
      }

      :host ::ng-deep .role-config-card {
        padding: 0 !important;
        overflow: hidden !important;
      }

      :host ::ng-deep .roles-layout-grid {
        display: grid !important;
        grid-template-columns: 250px minmax(0, 1fr) !important;
        gap: 1rem !important;
        overflow: visible !important;
      }

      :host ::ng-deep .roles-selector-card {
        max-height: none !important;
        border-radius: 22px !important;
      }

      :host ::ng-deep .selector-header,
      :host ::ng-deep .roles-list-scroll,
      :host ::ng-deep .role-config-header,
      :host ::ng-deep .permissions-matrix-container {
        padding: 1.25rem !important;
      }

      :host ::ng-deep .permissions-matrix-container {
        gap: 2rem !important;
      }

      :host ::ng-deep .permission-items-grid {
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr)) !important;
        gap: 0.8rem !important;
      }

      :host ::ng-deep .permission-toggle-box {
        padding: 1rem !important;
        border-radius: 16px !important;
      }

      :host ::ng-deep .role-main-info {
        gap: 1rem !important;
      }

      :host ::ng-deep .companion-pick-row {
        display: grid !important;
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)) !important;
        gap: 0.8rem !important;
        margin-bottom: 1rem !important;
      }

      :host ::ng-deep .companion-pick-btn {
        width: 100% !important;
        min-width: 0 !important;
        padding: 0.9rem !important;
      }

      :host ::ng-deep .companion-studio {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) !important;
        gap: 1rem !important;
      }

      :host ::ng-deep .companion-stage {
        display: grid !important;
        grid-template-columns: 260px minmax(0, 1fr) !important;
        align-items: center !important;
        gap: 1.25rem !important;
        padding: 1.5rem !important;
        border-radius: 24px !important;
      }

      :host ::ng-deep .stage-controls {
        min-width: 0 !important;
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
        :host ::ng-deep .companion-studio,
        :host ::ng-deep .identity-main-card,
        :host ::ng-deep .companion-stage {
          grid-template-columns: 1fr !important;
        }

        :host ::ng-deep .profile-hero,
        :host ::ng-deep .roles-header-main,
        :host ::ng-deep .section-title {
          align-items: flex-start !important;
          flex-direction: column !important;
        }
      }

      .settings-module-disable-lead { margin-bottom: 1rem; }
      .settings-module-disable-warning { font-size: 0.85rem; color: #94a3b8; margin-bottom: 1rem; }
      .settings-module-disable-terms { display: flex; gap: 0.5rem; align-items: flex-start; font-size: 0.85rem; }
      .settings-module-disable-terms input { margin-top: 0.25rem; }

      .settings-access-denied {
        margin: 0 auto 1.5rem;
        width: min(100%, 1180px);
        padding: 1rem 1.25rem;
        border-radius: 14px;
        border: 1px solid rgba(248, 113, 113, 0.45);
        background: rgba(127, 29, 29, 0.35);
        color: #fecaca;
      }

      .settings-access-denied p {
        margin: 0 0 0.75rem;
        font-size: 0.9rem;
        line-height: 1.5;
      }

      .settings-access-denied__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsFeatureComponent implements OnInit {
  private readonly _pluginStore = inject(PluginStore);
  private readonly _tenantModulesApi = inject(TenantModulesApiService);
  private readonly _toast = inject(ToastService);
  private readonly _rolesService = inject(RolesService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  public readonly _authStore = inject(AuthStore);

  readonly activeTab = signal<SettingsTab>('profile');
  readonly accessDeniedBanner = signal(false);

  private static readonly VALID_TABS = new Set<SettingsTab>([
    'general',
    'ai',
    'buddy',
    'plugins',
    'notifications',
    'security',
    'roles',
    'labs',
    'profile',
    'appearance',
  ]);

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

  ngOnInit(): void {
    const access = this._route.snapshot.queryParamMap.get('access');
    if (access === 'denied') {
      this.accessDeniedBanner.set(true);
      this.activeTab.set('profile');
    }

    const tabParam = this._route.snapshot.queryParamMap.get('tab');
    if (tabParam && SettingsFeatureComponent.VALID_TABS.has(tabParam as SettingsTab)) {
      this.activeTab.set(tabParam as SettingsTab);
    }

    this._route.queryParamMap.subscribe((params) => {
      const tab = params.get('tab');
      if (tab && SettingsFeatureComponent.VALID_TABS.has(tab as SettingsTab)) {
        const next = tab as SettingsTab;
        if (this.activeTab() !== next) {
          this.activeTab.set(next);
        }
      }
    });
  }

  onTabChange(tab: SettingsTab): void {
    this.activeTab.set(tab);
    void this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { tab: tab === 'profile' ? null : tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  dismissAccessDeniedBanner(): void {
    this.accessDeniedBanner.set(false);
    void this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { access: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  goToDashboard(): void {
    this.dismissAccessDeniedBanner();
    void this._router.navigateByUrl('/dashboard');
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