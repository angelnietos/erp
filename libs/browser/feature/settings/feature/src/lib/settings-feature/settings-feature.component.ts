import { signal, effect, computed, inject, Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UIMascotComponent,
  UiBadgeComponent,
  UiInputComponent,
  UiSelectComponent,
  UiModalComponent,
  UiLoaderComponent,
  UiFeaturePageShellComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  PluginStore,
  AIBotStore,
  type AIBot,
  type MascotMouthType,
  ThemeService,
  ToastService,
  mascotMouthToUi,
} from '@josanz-erp/shared-data-access';
import {
  RolesService,
  type Role,
  PERMISSIONS_CATALOG,
  AuthStore,
  TenantModulesApiService,
} from '@josanz-erp/identity-data-access';
import { isPermissionAllowedForModules } from '@josanz-erp/identity-api';
import { RoleType } from '@josanz-erp/identity-core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

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
    UiCardComponent,
    UiButtonComponent,
    UIMascotComponent,
    UiBadgeComponent,
    UiInputComponent,
    UiSelectComponent,
    UiModalComponent,
    UiLoaderComponent,
    UiFeaturePageShellComponent,
  ],
  template: `
    <ui-feature-page-shell [fadeIn]="true" [fillHost]="true">
      <div class="settings-layout">
        <!-- Sidebar Navigation -->
        <aside class="settings-sidebar">
          <div class="sidebar-header">
            <h1 class="glow-text">Sistema</h1>
            <p class="subtitle">Panel de Control</p>
          </div>

          <nav class="settings-nav">
            <div class="nav-section-label">Personal</div>
            <button
              type="button"
              class="nav-item"
              [class.active]="activeTab() === 'profile'"
              (click)="activeTab.set('profile')"
            >
              <lucide-icon name="user" size="16" aria-hidden="true"></lucide-icon>
              <span>Mi Perfil</span>
            </button>
            <button
              type="button"
              class="nav-item"
              [class.active]="activeTab() === 'notifications'"
              (click)="activeTab.set('notifications')"
            >
              <lucide-icon name="bell" size="16" aria-hidden="true"></lucide-icon>
              <span>Notificaciones</span>
            </button>

            <div class="nav-section-label">Motor Visual</div>
            <button
              type="button"
              class="nav-item luxe-nav-item"
              [class.active]="activeTab() === 'appearance'"
              (click)="activeTab.set('appearance')"
            >
              <lucide-icon name="sparkles" size="16" aria-hidden="true"></lucide-icon>
              <span>Atmósfera</span>
            </button>
            <button
              type="button"
              class="nav-item"
              [class.active]="activeTab() === 'general'"
              (click)="activeTab.set('general')"
            >
              <lucide-icon name="sliders" size="16" aria-hidden="true"></lucide-icon>
              <span>General</span>
            </button>

            <div class="nav-section-label">Inteligencia</div>
            <button
              type="button"
              class="nav-item"
              [class.active]="activeTab() === 'ai'"
              (click)="activeTab.set('ai')"
            >
              <lucide-icon name="bot" size="16" aria-hidden="true"></lucide-icon>
              <span>Agentes (API)</span>
            </button>
            <button
              type="button"
              class="nav-item"
              [class.active]="activeTab() === 'buddy'"
              (click)="activeTab.set('buddy')"
            >
              <lucide-icon name="smile" size="16" aria-hidden="true"></lucide-icon>
              <span>Compañeros</span>
            </button>

            <div class="nav-section-label">Organización</div>
            <button
              type="button"
              class="nav-item"
              [class.active]="activeTab() === 'security'"
              (click)="activeTab.set('security')"
            >
              <lucide-icon name="lock" size="16" aria-hidden="true"></lucide-icon>
              <span>Seguridad</span>
            </button>
            @if (canSeeRolesAdmin()) {
              <button
                type="button"
                class="nav-item"
                [class.active]="activeTab() === 'roles'"
                (click)="activeTab.set('roles')"
              >
                <lucide-icon name="shield-check" size="16" aria-hidden="true"></lucide-icon>
                <span>Roles</span>
              </button>
            }
            <button
              type="button"
              class="nav-item"
              [class.active]="activeTab() === 'plugins'"
              (click)="activeTab.set('plugins')"
            >
              <lucide-icon name="puzzle" size="16" aria-hidden="true"></lucide-icon>
              <span>Módulos</span>
            </button>
            <button
              type="button"
              class="nav-item"
              [class.active]="activeTab() === 'labs'"
              (click)="activeTab.set('labs')"
            >
              <lucide-icon name="flask-conical" size="16" aria-hidden="true"></lucide-icon>
              <span>Labs</span>
            </button>
          </nav>

          <div class="sidebar-footer">
            <div class="status-indicator">
              <lucide-icon name="shield" size="14" aria-hidden="true"></lucide-icon>
              <span>Núcleo Seguro v3.2</span>
            </div>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="settings-content">
          @if (activeTab() === 'profile') {
            <section class="content-section animate-slide-up profile-hub">
              <div class="section-breadcrumb">
                <span>Cuenta</span>
                <lucide-icon name="chevron-right" size="12"></lucide-icon>
                <span class="current">Identidad Digital</span>
              </div>
              
              <div class="profile-hero">
                <div class="hero-left">
                  <h2 class="hero-title">Ajustes de <span>Perfil</span></h2>
                  <p class="hero-subtitle">Gestión de identidad soberana y presencia en la plataforma</p>
                </div>
                <div class="hero-right">
                  <div class="security-badge">
                    <lucide-icon name="shield-check" size="16"></lucide-icon>
                    <span>Seguridad Bio-Digital: OK</span>
                  </div>
                </div>
              </div>

              <div class="identity-grid">
                <!-- Avatar & Core Identity -->
                <div class="identity-main-card">
                  <div class="avatar-projection-area">
                    <div class="hologram-ring"></div>
                    <div class="hologram-glow"></div>
                    @if (aiBotStore.getBotByFeature(aiBotStore.activeBotFeature()); as profileBot) {
                      <ui-mascot
                        [type]="profileBot.mascotType"
                        [color]="profileBot.color"
                        [personality]="profileBot.personality"
                        [bodyShape]="profileBot.bodyShape"
                        class="identity-mascot"
                      />
                    } @else {
                      <ui-mascot
                        type="universal"
                        color="#8b5cf6"
                        personality="happy"
                        class="identity-mascot"
                      />
                    }
                    <button class="edit-avatar-btn" title="Actualizar Visualización">
                      <lucide-icon name="camera" size="18"></lucide-icon>
                    </button>
                  </div>

                  <div class="identity-form">
                    <div class="luxe-input-group">
                      <label>Identificador Nominal</label>
                      <input type="text" [value]="_authStore.user()?.firstName + ' ' + _authStore.user()?.lastName" class="luxe-underlined-input" readonly>
                    </div>
                    <div class="luxe-input-group">
                      <label>Canal de Comunicación</label>
                      <input type="email" [value]="_authStore.user()?.email" class="luxe-underlined-input" readonly>
                    </div>
                    <div class="luxe-input-group">
                      <label>Descriptor de Rol</label>
                      <input type="text" [value]="_authStore.user()?.roles?.[0] || 'Miembro Plataforma'" class="luxe-underlined-input" readonly>
                    </div>
                    
                    <div class="form-footer mt-8">
                      <ui-button variant="filled" size="lg" (clicked)="onSaveProfileClick()">Sincronizar Cambios</ui-button>
                    </div>
                  </div>
                </div>

                <!-- Secondary Info & Security -->
                <div class="identity-sidebar-cards">
                  <ui-card variant="glass" class="id-badge-card">
                    <div class="badge-header">
                      <span class="category-tag">PLATFORM CORE ID</span>
                      <lucide-icon name="fingerprint" size="20" class="text-brand"></lucide-icon>
                    </div>
                    <div class="id-code">{{ _authStore.user()?.id }}</div>
                    <div class="last-access-row">
                      <span class="label">ÚLTIMO ACCESO REGISTRADO</span>
                      <span class="value">Hace instantes • Sesión Encriptada</span>
                    </div>
                  </ui-card>

                  <ui-card variant="glass" class="role-status-card">
                    <div class="role-info">
                      <div class="role-icon">
                        <lucide-icon name="crown" size="28" *ngIf="canSeeRolesAdmin()"></lucide-icon>
                        <lucide-icon name="user" size="28" *ngIf="!canSeeRolesAdmin()"></lucide-icon>
                      </div>
                      <div class="role-text">
                        <h3>{{ _authStore.user()?.roles?.[0] }}</h3>
                        <p>Nivel de acceso autorizado</p>
                      </div>
                    </div>
                    <div class="active-pulse mt-6">
                      <div class="pulse-dot"></div>
                      <span>CONEXIÓN SEGURA ACTIVA</span>
                    </div>
                  </ui-card>
                </div>
              </div>
            </section>
          }


          @if (activeTab() === 'plugins') {
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
                <div
                  class="feature-load-error-banner"
                  role="status"
                  aria-live="polite"
                >
                  <lucide-icon
                    name="alert-circle"
                    size="20"
                    class="feature-load-error-banner__icon"
                    aria-hidden="true"
                  ></lucide-icon>
                  <span class="feature-load-error-banner__text">{{
                    pluginsTabError()
                  }}</span>
                  <ui-button
                    variant="ghost"
                    size="sm"
                    icon="rotate-cw"
                    (clicked)="reloadTenantModulesFromApi()"
                  >
                    Reintentar
                  </ui-button>
                </div>
              }

              <div class="plugin-grid">
                @for (plugin of plugins; track plugin.id) {
                  <ui-card
                    variant="glass"
                    class="plugin-card"
                    [class.disabled]="!isPluginEnabled(plugin.id)"
                  >
                    <div class="plugin-header">
                      <div
                        class="plugin-icon"
                        [style.color]="
                          isPluginEnabled(plugin.id)
                            ? 'var(--brand)'
                            : '#64748b'
                        "
                      >
                        <lucide-icon
                          [name]="plugin.icon"
                          size="24"
                          aria-hidden="true"
                        ></lucide-icon>
                      </div>
                      <div class="header-text">
                        <h3>{{ plugin.name }}</h3>
                        <span class="category-tag">{{ plugin.category }}</span>
                      </div>
                    </div>

                    <p class="plugin-desc">{{ plugin.description }}</p>

                    <div class="plugin-footer">
                      <ui-badge
                        [variant]="
                          isPluginEnabled(plugin.id) ? 'success' : 'neutral'
                        "
                      >
                        {{ isPluginEnabled(plugin.id) ? 'Activo' : 'Inactivo' }}
                      </ui-badge>
                      @if (isPluginEnabled(plugin.id)) {
                        <ui-button
                          variant="outline"
                          size="sm"
                          (click)="onRequestDeactivateModule(plugin.id)"
                        >
                          Desactivar
                        </ui-button>
                      } @else {
                        @if (canActivateTenantModules()) {
                          <ui-button
                            variant="filled"
                            size="sm"
                            (click)="onRequestActivateModule(plugin.id)"
                          >
                            Activar
                          </ui-button>
                        } @else {
                          <ui-button
                            variant="filled"
                            size="sm"
                            [disabled]="true"
                            title="No tienes permiso para activar módulos"
                          >
                            Activar
                          </ui-button>
                        }
                      }
                    </div>
                  </ui-card>
                }
              </div>
            </section>
          }

          @if (activeTab() === 'ai') {
            <section class="content-section animate-slide-up">
              <div class="section-breadcrumb">
                <span>Inteligencia</span>
                <lucide-icon name="chevron-right" size="12"></lucide-icon>
                <span class="current">Núcleo de Inferencia</span>
              </div>
              
              <div class="profile-hero">
                <div class="hero-left">
                  <h2 class="hero-title">Motor de <span>IA</span></h2>
                  <p class="hero-subtitle">Configura el núcleo de pensamiento y la orquestación de agentes</p>
                </div>
                <div class="hero-right">
                  <div class="security-badge" [class.online]="aiBotStore.providerApiKey()">
                    <lucide-icon name="cpu" size="16"></lucide-icon>
                    <span>{{ aiBotStore.providerApiKey() ? 'NÚCLEO CONECTADO' : 'SIN CREDENCIALES' }}</span>
                  </div>
                </div>
              </div>

              <div class="identity-main-card mb-12">
                <div class="identity-form pr-12">
                  <div class="grid grid-cols-2 gap-6">
                    <div class="luxe-input-group">
                      <label>Proveedor Base</label>
                      <ui-select
                        [options]="aiBotStore.aiModelOptions()"
                        [ngModel]="aiBotStore.selectedModelId()"
                        (ngModelChange)="aiBotStore.setAIModel($event)"
                      ></ui-select>
                    </div>
                    <div class="luxe-input-group">
                      <label>Agente Principal</label>
                      <ui-select
                        [options]="botOptions()"
                        [ngModel]="aiBotStore.activeBotFeature()"
                        (ngModelChange)="aiBotStore.activeBotFeature.set($event)"
                      ></ui-select>
                    </div>
                  </div>

                  @if (aiBotStore.needsApiKey()) {
                    <div class="luxe-input-group mt-8">
                      <label>Token de Acceso Seguro (API KEY)</label>
                      <input type="password" [ngModel]="aiBotStore.providerApiKey()" (ngModelChange)="aiBotStore.providerApiKey.set($event)" class="luxe-underlined-input" placeholder="AIzaSy... •••••">
                    </div>
                  }
                  
                  <div class="form-footer mt-8 flex flex-wrap gap-4">
                    <ui-button variant="outline" size="sm" (click)="aiBotStore.checkOllamaAvailability(true)">
                      <lucide-icon name="refresh-cw" size="14" class="mr-2"></lucide-icon>
                      Sincronizar Modelos Locales
                    </ui-button>
                  </div>
                </div>
                
                <div class="avatar-projection-area">
                  <div class="hologram-ring"></div>
                  <div class="hologram-glow"></div>
                  @if (aiBotStore.getBotByFeature(aiBotStore.activeBotFeature()); as activeBot) {
                    <ui-mascot 
                      [type]="activeBot.mascotType" 
                      [color]="activeBot.color" 
                      class="identity-mascot"
                    />
                  }
                </div>
              </div>

              <div class="grid-config">
                @for (bot of aiBotStore.bots(); track bot.id) {
                  <ui-card variant="glass" class="bot-crystal-card">
                    <div class="badge-header">
                      <span class="category-tag">{{ bot.feature }}</span>
                      @if (aiBotStore.activeBotFeature() === bot.feature) {
                        <ui-badge variant="success">CORE</ui-badge>
                      }
                    </div>

                    <div class="bot-view-area py-6 flex items-center justify-center">
                      <ui-mascot [type]="bot.mascotType" [color]="bot.color" />
                    </div>

                    <h3 class="text-lg font-bold mb-1">{{ bot.name }}</h3>
                    <p class="text-xs text-slate-500 mb-6 line-clamp-2 h-8">{{ bot.description }}</p>

                    <div class="pref-row">
                      <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado SaaS</span>
                      <div class="toggle-wrapper" [class.active]="bot.status === 'active'" (click)="aiBotStore.toggleBotStatus(bot.feature)">
                        <div class="toggle-handle"></div>
                      </div>
                    </div>
                    
                    <div class="flex gap-2 mt-4">
                      <ui-button variant="outline" size="sm" class="flex-1" (click)="managingBotId.set(managingBotId() === bot.feature ? null : bot.feature)">
                        {{ managingBotId() === bot.feature ? 'Cerrar' : 'Personalizar' }}
                      </ui-button>
                    </div>
                  </ui-card>
                }
              </div>
            </section>
          }

          @if (activeTab() === 'buddy') {
            <section class="content-section animate-slide-up">
              <div class="section-breadcrumb">
                <span>Inteligencia</span>
                <lucide-icon name="chevron-right" size="12"></lucide-icon>
                <span class="current">Compañeros</span>
              </div>
              <div class="section-title">
                <h2>Compañeros IA</h2>
                <p>
                  Personaliza la apariencia y las habilidades de Buddy y del
                  agente del panel (JAIME). Es independiente del agente
                  principal del hub.
                </p>
              </div>

              <div class="companion-toolbar">
                <div
                  class="companion-subtabs"
                  role="tablist"
                  aria-label="Compañero a personalizar"
                >
                  <button
                    type="button"
                    role="tab"
                    class="companion-subtab"
                    [class.active]="companionEditorFeature() === 'buddy'"
                    (click)="companionEditorFeature.set('buddy')"
                  >
                    Buddy
                  </button>
                  <button
                    type="button"
                    role="tab"
                    class="companion-subtab"
                    [class.active]="companionEditorFeature() === 'dashboard'"
                    (click)="companionEditorFeature.set('dashboard')"
                  >
                    JAIME · panel
                  </button>
                </div>
                <div class="companion-context-block">
                  <span class="primary-agent-pill">
                    Agente principal:
                    {{
                      aiBotStore.getBotDisplayName(
                        aiBotStore.activeBotFeature()
                      )
                    }}
                  </span>
                  <p class="companion-context-hint">
                    Cambiar de pestaña solo elige qué compañero editas aquí; el
                    agente principal se define en «Asistentes de IA».
                  </p>
                </div>
              </div>

              @if (
                aiBotStore.getBotByFeature(companionEditorFeature());
                as pal
              ) {
                <div class="buddy-customizer">
                  <div class="buddy-visual-col">
                    <ui-card
                      variant="glass"
                      class="buddy-preview-card"
                      [class.is-rage-preview]="aiBotStore.rageMode()"
                    >
                      <div class="preview-glow"></div>
                      <ui-mascot
                        [type]="pal.mascotType"
                        [color]="pal.color"
                        [secondaryColor]="pal.secondaryColor"
                        [personality]="pal.personality"
                        [bodyShape]="pal.bodyShape"
                        [eyesType]="pal.eyesType"
                        [mouthType]="mascotMouthFor(pal)"
                        [rageMode]="aiBotStore.rageMode()"
                        [rageStyle]="aiBotStore.rageStyle()"
                      >
                      </ui-mascot>
                    </ui-card>
                  </div>

                  <div class="buddy-config-col">
                    <ui-card variant="glass" class="buddy-options-card">
                      <div class="card-header-with-toggle">
                        <div class="buddy-name-edit flex-1">
                          <ui-input
                            label="Nombre del compañero"
                            [ngModel]="
                              aiBotStore.getBotDisplayName(pal.feature)
                            "
                            (ngModelChange)="
                              aiBotStore.updateBotName(pal.feature, $event)
                            "
                            placeholder="Ej: Buddy, JAIME, Pato…"
                          ></ui-input>
                        </div>
                        <div
                          class="rage-toggle"
                          [class.active]="aiBotStore.rageMode()"
                          (click)="
                            aiBotStore.setRageMode(!aiBotStore.rageMode())
                          "
                          (keydown.enter)="aiBotStore.setRageMode(!aiBotStore.rageMode())"
                          (keydown.space)="aiBotStore.setRageMode(!aiBotStore.rageMode())"
                          tabindex="0"
                          role="switch"
                          [attr.aria-checked]="aiBotStore.rageMode()"
                          aria-label="Modo rage"
                        >
                          <div class="toggle-label">
                            <lucide-icon name="zap" size="14" aria-hidden="true"></lucide-icon>
                            <span>MODO RAGE</span>
                          </div>
                          <div class="switch-pill">
                            <div class="switch-handle"></div>
                          </div>
                        </div>
                      </div>

                      <div
                        class="standard-options"
                        [class.dimmed]="aiBotStore.rageMode()"
                      >
                        <div class="companion-form-grid">
                          <div class="form-group mb-4">
                            <ui-select
                              label="Mascota (accesorio)"
                              [options]="[
                                {
                                  value: 'inventory',
                                  label: 'Cubo Invernadero',
                                },
                                {
                                  value: 'projects',
                                  label: 'Hexágono Proyectos',
                                },
                                { value: 'budget', label: 'Cápsula Fiscal' },
                                { value: 'clients', label: 'Esfera Social' },
                                { value: 'fleet', label: 'Vehículo Drive' },
                                { value: 'rentals', label: 'Cubo Alquiler' },
                                { value: 'audit', label: 'Domo Auditor' },
                                {
                                  value: 'dashboard',
                                  label: 'Panel de Control',
                                },
                                {
                                  value: 'universal',
                                  label: 'Droide Universal',
                                },
                              ]"
                              [ngModel]="pal.mascotType"
                              (ngModelChange)="
                                aiBotStore.updateBotSkin(pal.feature, {
                                  mascotType: $event,
                                })
                              "
                            ></ui-select>
                          </div>

                          <div class="form-group mb-4">
                            <ui-select
                              label="Personalidad"
                              [options]="[
                                { value: 'tech', label: 'Tecnocrático' },
                                { value: 'worker', label: 'Productor' },
                                { value: 'happy', label: 'Optimista' },
                                { value: 'mystic', label: 'Místico / oculto' },
                                {
                                  value: 'explorer',
                                  label: 'Explorador',
                                },
                                { value: 'ninja', label: 'Sigiloso / ninja' },
                                { value: 'queen', label: 'Regio / reina' },
                              ]"
                              [ngModel]="pal.personality"
                              (ngModelChange)="
                                aiBotStore.updateBotSkin(pal.feature, {
                                  personality: $event,
                                })
                              "
                            ></ui-select>
                          </div>
                        </div>

                        <div class="form-group mb-4">
                          <span class="form-label">Color principal</span>
                          <div class="color-picker-grid">
                            @for (
                              c of [
                                {
                                  m: '#facc15',
                                  s: '#ca8a04',
                                  n: 'Pato Clásico',
                                },
                                { m: '#f43f5e', s: '#9f1239', n: 'Cereza' },
                                { m: '#10b981', s: '#059669', n: 'Hulk' },
                                { m: '#8b5cf6', s: '#6d28d9', n: 'Místico' },
                                { m: '#3b82f6', s: '#1d4ed8', n: 'Aqua' },
                                { m: '#1e293b', s: '#0f172a', n: 'Stealth' },
                              ];
                              track c.n
                            ) {
                              <div
                                class="color-swatch-item"
                                [class.active]="pal.color === c.m"
                                (click)="
                                  aiBotStore.updateBotSkin(pal.feature, {
                                    color: c.m,
                                    secondaryColor: c.s,
                                  })
                                "
                                (keydown.enter)="aiBotStore.updateBotSkin(pal.feature, { color: c.m, secondaryColor: c.s })"
                                (keydown.space)="aiBotStore.updateBotSkin(pal.feature, { color: c.m, secondaryColor: c.s })"
                                tabindex="0"
                                role="button"
                                [attr.aria-label]="'Seleccionar color ' + c.n"
                              >
                                <div
                                  class="color-swatch"
                                  [style.background]="c.m"
                                ></div>
                              </div>
                            }
                          </div>
                          <div class="companion-custom-primary">
                            <label class="form-label form-label-sub" [attr.for]="'custom-color-' + pal.feature"
                              >Cualquier color</label
                            >
                            <input
                              [id]="'custom-color-' + pal.feature"
                              type="color"
                              class="color-input color-input-primary"
                              [value]="pal.color"
                              (input)="
                                setCompanionPrimaryFromPicker(
                                  pal.feature,
                                  colorHexFromInput($event)
                                )
                              "
                              title="Elegir color principal personalizado"
                            />
                            <span class="color-hex-hint">{{ pal.color }}</span>
                          </div>
                        </div>

                        <div class="form-group mb-4 companion-secondary-row">
                          <label class="form-label" [attr.for]="'secondary-color-companion-' + pal.feature">Color secundario (sombra)</label>
                          <input
                            [id]="'secondary-color-companion-' + pal.feature"
                            type="color"
                            class="color-input"
                            [value]="pal.secondaryColor"
                            (input)="
                              aiBotStore.updateBotSkin(pal.feature, {
                                secondaryColor: colorHexFromInput($event),
                              })
                            "
                            title="Color secundario"
                          />
                        </div>

                        <div class="form-group mb-4">
                          <ui-select
                            label="Forma del cuerpo"
                            [options]="[
                              { value: 'round', label: 'Esfera gordita' },
                              { value: 'square', label: 'Cubo bloque' },
                              { value: 'capsule', label: 'Cápsula' },
                              { value: 'tri', label: 'Triángulo' },
                              { value: 'star', label: 'Estrella' },
                              {
                                value: 'mushroom-cap',
                                label: 'Seta (Sombrero clásico)',
                              },
                              {
                                value: 'mushroom-full',
                                label: 'Seta completa',
                              },
                              {
                                value: 'mushroom-luminescent',
                                label: 'Seta Bioluminiscente',
                              },
                              {
                                value: 'mushroom-morel',
                                label: 'Seta Colmenilla (Morel)',
                              },
                              { value: 'bonsai', label: 'Bonsái Zen (Pino)' },
                              { value: 'bonsai-sakura', label: 'Bonsái Sakura (Cerezo)' },
                              { value: 'bonsai-maple', label: 'Bonsái Arce' },
                            ]"
                            [ngModel]="pal.bodyShape"
                            (ngModelChange)="
                              aiBotStore.updateBotSkin(pal.feature, {
                                bodyShape: $event,
                              })
                            "
                          ></ui-select>
                        </div>

                        <div class="form-group mb-4">
                          <ui-select
                            label="Ojos"
                            [options]="[
                              { value: 'joy', label: 'Feliz / kawaii' },
                              { value: 'dots', label: 'Puntos simples' },
                              { value: 'shades', label: 'Gafas de sol' },
                              { value: 'glow', label: 'Brillo neón' },
                              { value: 'angry', label: 'Cejudo / serio' },
                            ]"
                            [ngModel]="pal.eyesType"
                            (ngModelChange)="
                              aiBotStore.updateBotSkin(pal.feature, {
                                eyesType: $event,
                              })
                            "
                          ></ui-select>
                        </div>

                        <div class="form-group mb-4">
                          <ui-select
                            label="Boca"
                            [options]="[
                              { value: 'smile', label: 'Sonrisa' },
                              { value: 'line', label: 'Neutra (línea)' },
                              { value: 'o', label: 'Boca en O' },
                              { value: 'grin', label: 'Sonrisa ancha' },
                              {
                                value: 'none',
                                label: 'Discreta / mínima',
                              },
                            ]"
                            [ngModel]="pal.mouthType"
                            (ngModelChange)="
                              aiBotStore.updateBotSkin(pal.feature, {
                                mouthType: $event,
                              })
                            "
                          ></ui-select>
                        </div>
                      </div>

                      @if (aiBotStore.rageMode()) {
                        <div class="rage-options animate-slide-up">
                          <h3 class="rage-text">🔥 Configuración Tóxica</h3>
                          <div class="form-group">
                            <ui-select
                              label="Nivel de Psicopatía"
                              [options]="[
                                { value: 'angry', label: 'Enfadado (Rojo)' },
                                {
                                  value: 'terror',
                                  label: 'Terror Psicológico',
                                },
                                { value: 'dark', label: 'Vacío Oscuro' },
                              ]"
                              [ngModel]="aiBotStore.rageStyle()"
                              (ngModelChange)="aiBotStore.setRageStyle($event)"
                            ></ui-select>
                          </div>
                          <p class="rage-hint">
                            Cuidado: con este modo activo,
                            {{
                              aiBotStore.getBotDisplayName(
                                companionEditorFeature()
                              )
                            }}
                            no tendrá filtros y puede ser grosero contigo.
                          </p>
                        </div>
                      }
                    </ui-card>

                    <ui-card variant="glass" class="buddy-skills-card mt-6">
                      <h3>
                        Habilidades de confianza ·
                        {{ aiBotStore.getBotDisplayName(pal.feature) }}
                      </h3>
                      @if (pal.feature === 'dashboard') {
                        <p class="buddy-skills-lead">
                          Estas activaciones son solo para tu usuario en este
                          navegador. El catálogo global del bot sigue en
                          «Asistentes de IA».
                        </p>
                      }
                      <div class="skills-config-list mt-4">
                        @for (skill of pal.skills; track skill) {
                          <div class="skill-config-item">
                            <span class="skill-name">{{ skill }}</span>
                            <div
                              class="toggle-wrapper"
                              [class.active]="
                                companionSkillActive(pal.feature, skill)
                              "
                              (click)="
                                companionToggleSkill(pal.feature, skill)
                              "
                              (keydown.enter)="companionToggleSkill(pal.feature, skill)"
                              (keydown.space)="companionToggleSkill(pal.feature, skill)"
                              tabindex="0"
                              role="switch"
                              [attr.aria-checked]="companionSkillActive(pal.feature, skill)"
                              [attr.aria-label]="'Alternar habilidad ' + skill"
                            >
                              <div class="toggle-handle"></div>
                            </div>
                          </div>
                        }
                      </div>
                    </ui-card>

                    @if (pal.feature === 'dashboard') {
                      <ui-card
                        variant="glass"
                        class="jaime-user-layer-card mt-6"
                      >
                        <h3>Tu JAIME (cuenta actual)</h3>
                        <p class="user-layer-lead">
                          Reglas, instrucciones extra y comportamientos con
                          nombre. Se guardan para tu usuario y se inyectan en
                          el contexto del asistente del panel.
                        </p>

                        <div class="form-group mb-4">
                          <label class="form-label" for="rules-textarea">Reglas (texto libre)</label>
                          <textarea
                            id="rules-textarea"
                            class="user-agent-textarea"
                            rows="4"
                            [ngModel]="aiBotStore.dashboardUserLayer().rules"
                            (ngModelChange)="
                              aiBotStore.updateUserAgentConfig('dashboard', {
                                rules: $event,
                              })
                            "
                            placeholder="Ej.: Prioriza KPIs de facturación; nunca inventes datos de clientes."
                          ></textarea>
                        </div>

                        <div class="form-group mb-4">
                          <label class="form-label" for="instructions-textarea"
                            >Instrucciones de sistema adicionales</label
                          >
                          <textarea
                            id="instructions-textarea"
                            class="user-agent-textarea"
                            rows="4"
                            [ngModel]="
                              aiBotStore.dashboardUserLayer().systemInstructions
                            "
                            (ngModelChange)="
                              aiBotStore.updateUserAgentConfig('dashboard', {
                                systemInstructions: $event,
                              })
                            "
                            placeholder="Tono, formato de respuestas, tablas cuando haya números…"
                          ></textarea>
                        </div>

                        <div class="form-group mb-4">
                          <div class="preset-header">
                            <span class="form-label mb-0" id="presets-label"
                              >Prompts por comportamiento</span
                            >
                            <ui-button
                              variant="outline"
                              size="sm"
                              (click)="
                                aiBotStore.addUserAgentPromptPreset(
                                  'dashboard'
                                )
                              "
                              aria-labelledby="presets-label"
                            >
                              Añadir
                            </ui-button>
                          </div>
                          <p class="preset-hint">
                            Úsalos para escenarios concretos (informes, saludo
                            formal, checklist de revisión…).
                          </p>
                          @for (
                            preset of aiBotStore.dashboardUserLayer()
                              .promptPresets;
                            track preset.id
                          ) {
                            <div class="prompt-preset-block">
                              <div class="preset-row-head">
                                <input
                                  class="preset-title-input"
                                  type="text"
                                  [ngModel]="preset.title"
                                  (ngModelChange)="
                                    aiBotStore.updateUserAgentPromptPreset(
                                      'dashboard',
                                      preset.id,
                                      { title: $event }
                                    )
                                  "
                                />
                                <button
                                  type="button"
                                  class="preset-remove"
                                  (click)="
                                    aiBotStore.removeUserAgentPromptPreset(
                                      'dashboard',
                                      preset.id
                                    )
                                  "
                                  aria-label="Quitar comportamiento"
                                >
                                  <lucide-icon
                                    name="trash-2"
                                    size="16"
                                    aria-hidden="true"
                                  ></lucide-icon>
                                </button>
                              </div>
                              <textarea
                                class="user-agent-textarea preset-body"
                                rows="3"
                                [ngModel]="preset.content"
                                (ngModelChange)="
                                  aiBotStore.updateUserAgentPromptPreset(
                                    'dashboard',
                                    preset.id,
                                    { content: $event }
                                  )
                                "
                              ></textarea>
                            </div>
                          }
                        </div>
                      </ui-card>
                    }
                  </div>
                </div>
              }
            </section>
          }

          @if (activeTab() === 'general') {
            <section class="content-section animate-slide-up">
              <div class="section-breadcrumb">
                <span>Plataforma</span>
                <lucide-icon name="chevron-right" size="12"></lucide-icon>
                <span class="current">Motor de Experiencia</span>
              </div>
              
              <div class="profile-hero">
                <div class="hero-left">
                  <h2 class="hero-title">Ajustes <span>Núcleo</span></h2>
                  <p class="hero-subtitle">Parámetros operativos y preferencias globales de interacción</p>
                </div>
              </div>

              <div class="grid-config">
                <ui-card variant="glass">
                  <div class="pref-header">
                    <lucide-icon name="languages" size="20" class="text-brand"></lucide-icon>
                    <h3>Idioma y Localización</h3>
                  </div>
                  <div class="form-group mt-6">
                    <ui-select
                      label="Idioma Global del Sistema"
                      [options]="[
                        { value: 'es', label: 'Español (Castellano)' },
                        { value: 'en', label: 'English (US)' },
                        { value: 'fr', label: 'Français (Beta)' }
                      ]"
                      [ngModel]="aiBotStore.language()"
                      (ngModelChange)="aiBotStore.language.set($event)"
                    ></ui-select>
                  </div>
                  <p class="config-desc mt-4">Afecta tanto a la interfaz como al razonamiento de los agentes de IA.</p>
                </ui-card>

                <ui-card variant="glass">
                  <div class="pref-header">
                    <lucide-icon name="zap" size="20" class="text-brand"></lucide-icon>
                    <h3>Optimización de Interfaz</h3>
                  </div>
                  <div class="pref-row mt-6">
                    <div class="pref-text">
                      <h4>Modo Compacto</h4>
                      <p>Priorizar densidad de datos en lugar de aire visual</p>
                    </div>
                    <div class="toggle-wrapper" 
                         [class.active]="aiBotStore.compactMode()"
                         (click)="aiBotStore.compactMode.set(!aiBotStore.compactMode())">
                      <div class="toggle-handle"></div>
                    </div>
                  </div>
                  <div class="pref-row">
                    <div class="pref-text">
                      <h4 class="premium-text">Luxe Engine V2</h4>
                      <p>Habilitar renderizado de alta fidelidad para cristales</p>
                    </div>
                    <div class="toggle-wrapper premium" 
                         [class.active]="premiumExperience()"
                         (click)="togglePremium()">
                      <div class="toggle-handle"></div>
                    </div>
                  </div>
                </ui-card>
              </div>
            </section>
          }

          @if (activeTab() === 'notifications') {
            <section class="content-section animate-slide-up">
              <div class="section-breadcrumb">
                <span>Cuenta</span>
                <lucide-icon name="chevron-right" size="12"></lucide-icon>
                <span class="current">Comunicaciones</span>
              </div>
              
              <div class="profile-hero">
                <div class="hero-left">
                  <h2 class="hero-title">Alertas & <span>Flujos</span></h2>
                  <p class="hero-subtitle">Define tus canales de recepción y la intensidad de los avisos</p>
                </div>
              </div>

              <div class="grid-config">
                <ui-card variant="glass">
                  <div class="pref-header">
                    <lucide-icon name="bell-ring" size="20" class="text-brand"></lucide-icon>
                    <h3>Centro de Alertas</h3>
                  </div>
                  <div class="pref-row mt-6">
                    <div class="pref-text">
                      <h4>Notificaciones Globales</h4>
                      <p>Push en tiempo real y alertas de escritorio</p>
                    </div>
                    <div class="toggle-wrapper" 
                         [class.active]="aiBotStore.notificationsEnabled()"
                         (click)="aiBotStore.notificationsEnabled.set(!aiBotStore.notificationsEnabled())">
                      <div class="toggle-handle"></div>
                    </div>
                  </div>
                </ui-card>

                <ui-card variant="glass">
                  <div class="pref-header">
                    <lucide-icon name="volume-2" size="20" class="text-brand"></lucide-icon>
                    <h3>Feedback Auditivo</h3>
                  </div>
                  <div class="pref-row mt-6">
                    <div class="pref-text">
                      <h4>Efectos de Sonido</h4>
                      <p>Confirmaciones acústicas para acciones clave</p>
                    </div>
                    <div class="toggle-wrapper" 
                         [class.active]="aiBotStore.soundEffects()"
                         (click)="aiBotStore.soundEffects.set(!aiBotStore.soundEffects())">
                      <div class="toggle-handle"></div>
                    </div>
                  </div>
                </ui-card>
              </div>
            </section>
          }

          @if (activeTab() === 'security') {
            <section class="content-section animate-slide-up">
              <div class="section-breadcrumb">
                <span>Cuenta</span>
                <lucide-icon name="chevron-right" size="12"></lucide-icon>
                <span class="current">Seguridad</span>
              </div>
              <div class="section-title">
                <h2>Seguridad de Acceso</h2>
                <p>Gestiona tu contraseña y sesiones activas</p>
              </div>

              <div class="grid-config">
                <ui-card variant="glass" class="prefs-card">
                  <h3 class="config-subtitle">
                    <lucide-icon name="clock" size="16" aria-hidden="true"></lucide-icon> Sesión
                  </h3>
                  <div class="form-group">
                    <ui-select
                      label="Tiempo de espera de sesión"
                      [options]="[
                        { value: 15, label: '15 Minutos' },
                        { value: 30, label: '30 Minutos' },
                        { value: 60, label: '1 Hora' },
                        { value: 0, label: 'Nunca (No recomendado)' },
                      ]"
                      [ngModel]="aiBotStore.sessionTimeout()"
                      (ngModelChange)="aiBotStore.sessionTimeout.set($event)"
                    ></ui-select>
                  </div>
                </ui-card>

                <ui-card variant="glass" class="prefs-card">
                  <h3 class="config-subtitle">
                    <lucide-icon name="trash2" size="16" aria-hidden="true"></lucide-icon> Gestión
                    de Datos
                  </h3>
                  <div class="pref-row">
                    <div class="pref-text">
                      <h4>Auto-archivo de chats</h4>
                      <p>
                        Mueve conversaciones antiguas al historial
                        automáticamente
                      </p>
                    </div>
                    <div
                      class="toggle-wrapper"
                      (click)="
                        aiBotStore.autoArchive.set(!aiBotStore.autoArchive())
                      "
                      (keydown.enter)="aiBotStore.autoArchive.set(!aiBotStore.autoArchive())"
                      (keydown.space)="aiBotStore.autoArchive.set(!aiBotStore.autoArchive())"
                      [class.active]="aiBotStore.autoArchive()"
                      tabindex="0"
                      role="switch"
                      [attr.aria-checked]="aiBotStore.autoArchive()"
                      aria-label="Auto-archivo de chats"
                    >
                      <div class="toggle-handle"></div>
                    </div>
                  </div>
                </ui-card>
              </div>
            </section>
          }

          @if (activeTab() === 'roles' && canSeeRolesAdmin()) {
            <section class="content-section roles-management animate-fade-in">
              <div class="roles-header-main">
                <div class="section-title">
                  <h2>Gestión de Roles y Permisos</h2>
                  <p>Define quién puede hacer qué en cada módulo del sistema</p>
                </div>
                <ui-button variant="filled" size="sm" (click)="createNewRole()">
                  <lucide-icon name="plus" size="16" aria-hidden="true"></lucide-icon> Nuevo Rol
                </ui-button>
              </div>

              @if (rolesLoadError()) {
                <div
                  class="feature-load-error-banner"
                  role="status"
                  aria-live="polite"
                >
                  <lucide-icon
                    name="alert-circle"
                    size="20"
                    class="feature-load-error-banner__icon"
                    aria-hidden="true"
                  ></lucide-icon>
                  <span class="feature-load-error-banner__text">{{
                    rolesLoadError()
                  }}</span>
                  <ui-button
                    variant="ghost"
                    size="sm"
                    icon="rotate-cw"
                    (clicked)="loadRoles()"
                  >
                    Reintentar
                  </ui-button>
                </div>
              }

              @if (isLoadingRoles() && roles().length === 0 && !rolesLoadError()) {
                <div class="feature-loader-wrap">
                  <ui-loader message="Cargando roles…"></ui-loader>
                </div>
              }

              <div class="roles-layout-grid">
                <!-- Roles List (Sidebar-like) -->
                <div class="roles-selector-card">
                  <div class="selector-header">Roles Disponibles</div>
                  <div class="roles-list-scroll">
                    @for (role of roles(); track role.id) {
                      <div 
                        class="role-item-btn" 
                        [class.active]="selectedRoleId() === role.id"
                        (click)="selectedRoleId.set(role.id)"
                        (keydown.enter)="selectedRoleId.set(role.id)"
                        (keydown.space)="selectedRoleId.set(role.id)"
                        tabindex="0"
                        role="button"
                        [attr.aria-label]="'Seleccionar rol ' + role.name"
                      >
                        <div class="role-icon-indicator" [class]="role.type"></div>
                        <div class="role-label-content">
                          <span class="role-name-text">{{ role.name }}</span>
                          <span class="role-type-pill">{{ role.type }}</span>
                        </div>
                        <lucide-icon name="chevron-right" size="14" class="chevron" aria-hidden="true"></lucide-icon>
                      </div>
                    }
                  </div>
                </div>

                <!-- Role Details & Matrix -->
                <div class="role-matrix-detail">
                  @if (selectedRole(); as role) {
                    <ui-card
                      variant="glass"
                      class="role-config-card"
                      [class.readonly-role]="isSelectedRoleSuperAdmin()"
                    >
                      <div class="role-config-header">
                        <div class="role-main-info">
                          <ui-input
                            label="Nombre del Rol"
                            [(ngModel)]="role.name"
                            [disabled]="isSelectedRoleSuperAdmin()"
                          ></ui-input>
                          <div class="role-actions-btns">
                            @if (!isSelectedRoleSuperAdmin()) {
                              <ui-button variant="outline" size="sm" (click)="deleteRole(role.id)">
                                <lucide-icon name="trash-2" size="14" aria-hidden="true"></lucide-icon> Eliminar Rol
                              </ui-button>
                            }
                          </div>
                        </div>
                        @if (isSelectedRoleSuperAdmin()) {
                          <p class="role-locked-notice">
                            El rol <strong>SuperAdmin</strong> está protegido: el acceso total no se modifica desde aquí.
                          </p>
                        }
                        <p class="role-description-hint">
                          @if (!isSelectedRoleSuperAdmin()) {
                            Configura los permisos para el rol <strong>{{ role.name }}</strong>
                          } @else {
                            Vista de solo lectura de los permisos del rol <strong>{{ role.name }}</strong>
                          }
                        </p>
                      </div>

                      <div class="permissions-matrix-container">
                        @for (category of permissionCategoryOrder; track category) {
                          @if (categoryHasVisiblePerms(category)) {
                            <div class="permission-group">
                              <h4 class="category-title">{{ category }}</h4>
                              <div class="permission-items-grid">
                                @for (perm of permissionsCatalogForUi(); track perm.id) {
                                  @if (perm.category === category) {
                                    <div
                                      class="permission-toggle-box"
                                      [class.active]="isPermissionActive(role.id, perm.id)"
                                      [class.readonly-perm]="isSelectedRoleSuperAdmin()"
                                      (click)="togglePermission(role.id, perm.id)"
                                      (keydown.enter)="togglePermission(role.id, perm.id)"
                                      (keydown.space)="togglePermission(role.id, perm.id)"
                                      [tabindex]="isSelectedRoleSuperAdmin() ? -1 : 0"
                                      role="switch"
                                      [attr.aria-disabled]="isSelectedRoleSuperAdmin()"
                                      [attr.aria-checked]="isPermissionActive(role.id, perm.id)"
                                      [attr.aria-label]="'Alternar permiso ' + perm.label"
                                    >
                                      <div class="toggle-info">
                                        <span class="perm-label">{{ perm.label }}</span>
                                        <span class="perm-id">{{ perm.id }}</span>
                                      </div>
                                      <div class="toggle-ui">
                                        <div class="toggle-pill"></div>
                                      </div>
                                    </div>
                                  }
                                }
                              </div>
                            </div>
                          }
                        }
                      </div>
                    </ui-card>
                  } @else {
                    <div class="no-role-selected">
                      <lucide-icon name="shield-alert" size="48" class="mb-4 opacity-20" aria-hidden="true"></lucide-icon>
                      <p>Selecciona un rol para ver y editar sus permisos</p>
                    </div>
                  }
                </div>
              </div>
            </section>
          }

          @if (activeTab() === 'labs') {
            <section class="content-section animate-slide-up">
              <div class="section-breadcrumb">
                <span>Organización</span>
                <lucide-icon name="chevron-right" size="12"></lucide-icon>
                <span class="current">Laboratorio</span>
              </div>

              <div class="profile-hero">
                <div class="hero-left">
                  <h2 class="hero-title">Genesis <span>Engine</span></h2>
                  <p class="hero-subtitle">Features experimentales de próxima generación bajo protocolo de acceso controlado</p>
                </div>
                <div class="hero-right">
                  <div class="security-badge">
                    <lucide-icon name="flask-conical" size="16"></lucide-icon>
                    <span>ACCESO EARLY ADOPTER</span>
                  </div>
                </div>
              </div>

              <div class="grid-config">
                <ui-card variant="glass">
                  <div class="badge-header mb-6">
                    <span class="category-tag">MOTOR NÚCLEO</span>
                    <lucide-icon name="cpu" size="18" class="text-brand"></lucide-icon>
                  </div>
                  <div class="pref-row">
                    <div class="pref-text">
                      <h4>Josanz Genesis Engine</h4>
                      <p>Motor de razonamiento autónomo profundo con inferencia multi-paso</p>
                    </div>
                    <div
                      class="toggle-wrapper"
                      (click)="aiBotStore.experimentalFeatures.set(!aiBotStore.experimentalFeatures())"
                      [class.active]="aiBotStore.experimentalFeatures()"
                      tabindex="0" role="switch"
                      [attr.aria-checked]="aiBotStore.experimentalFeatures()"
                      aria-label="Habilitar funciones beta"
                    >
                      <div class="toggle-handle"></div>
                    </div>
                  </div>
                </ui-card>

                <ui-card variant="glass">
                  <div class="badge-header mb-6">
                    <span class="category-tag">PROTOCOLO</span>
                    <lucide-icon name="shield-check" size="18" class="text-brand"></lucide-icon>
                  </div>
                  <p class="text-sm text-slate-500 leading-relaxed">
                    Las funciones Beta son inestables por definición. Actívalas sólo si aceptas que el comportamiento puede diferir de la versión estable y que los datos generados pueden no persistir entre versiones.
                  </p>
                </ui-card>
              </div>
            </section>
          }

          @if (activeTab() === 'appearance') {
            <section class="content-section animate-slide-up">
              <div class="section-breadcrumb">
                <span>Motor Visual</span>
                <lucide-icon name="chevron-right" size="12"></lucide-icon>
                <span class="current">Atmósfera</span>
              </div>

              <div class="profile-hero">
                <div class="hero-left">
                  <h2 class="hero-title">Diseño <span>Luxe</span></h2>
                  <p class="hero-subtitle">Renderizado de alta fidelidad, identidad cromática y feedback sensorial inmersivo</p>
                </div>
              </div>

              <div class="grid-config">
                <ui-card variant="glass">
                  <div class="pref-header mb-6">
                    <lucide-icon name="sparkles" size="20" class="text-brand" aria-hidden="true"></lucide-icon>
                    <h3>Motor Crystal</h3>
                  </div>

                  <div class="pref-row">
                    <div class="pref-text">
                      <h4 class="text-brand">Luxe Mode V2</h4>
                      <p>Glassmorphism, reflejos dinámicos y sombras de alta fidelidad</p>
                    </div>
                    <div class="toggle-wrapper premium" [class.active]="premiumExperience()" (click)="togglePremium()">
                      <div class="toggle-handle"></div>
                    </div>
                  </div>

                  <div class="pref-row">
                    <div class="pref-text">
                      <h4>Modo Compacto</h4>
                      <p>Mayor densidad de datos, menos espacio en blanco</p>
                    </div>
                    <div class="toggle-wrapper" [class.active]="aiBotStore.compactMode()" (click)="aiBotStore.compactMode.set(!aiBotStore.compactMode())">
                      <div class="toggle-handle"></div>
                    </div>
                  </div>

                  <div class="mt-6">
                    <div class="luxe-input-group mb-4">
                      <label>Intensidad Crystal Blur</label>
                      <input type="range" class="luxe-range" min="0" max="40" value="14">
                    </div>
                    <div class="luxe-input-group">
                      <label>Ambient Glow Intensity</label>
                      <input type="range" class="luxe-range" min="0" max="30" value="8">
                    </div>
                  </div>
                </ui-card>

                <ui-card variant="glass">
                  <div class="pref-header mb-6">
                    <lucide-icon name="palette" size="20" class="text-brand" aria-hidden="true"></lucide-icon>
                    <h3>Identidad Cromática</h3>
                  </div>
                  
                  <div class="form-group mb-6">
                    <span class="form-label">Color de Marca Institucional</span>
                    <div class="color-picker-grid mt-3">
                       @for (c of [{m: '#facc15', n: 'Gold'}, {m: '#e60012', n: 'Royal Red'}, {m: '#10b981', n: 'Emerald'}, {m: '#8b5cf6', n: 'Violet'}, {m: '#0ea5e9', n: 'Sky'}]; track c.n) {
                         <button type="button" class="color-swatch-item" 
                              [class.active]="themeService.currentThemeData().primary === c.m"
                              (click)="themeService.updatePrimaryColor(c.m)">
                           <div class="color-swatch" [style.background]="c.m"></div>
                         </button>
                       }
                    </div>
                  </div>

                  <div class="pref-row">
                    <div class="pref-text">
                      <h4>Modo Oscuro Profundo</h4>
                      <p>Negros OLED puros para máximo contraste</p>
                    </div>
                    <div class="toggle-wrapper active">
                      <div class="toggle-handle"></div>
                    </div>
                  </div>
                </ui-card>

                <ui-card variant="glass">
                  <div class="pref-header mb-6">
                    <lucide-icon name="volume-2" size="20" class="text-brand" aria-hidden="true"></lucide-icon>
                    <h3>Feedback Sensorial</h3>
                  </div>
                  <div class="pref-row">
                    <div class="pref-text">
                      <h4>Efectos de Sonido Espacial</h4>
                      <p>Feedback acústico al interactuar con superficies cristal</p>
                    </div>
                    <div class="toggle-wrapper active"><div class="toggle-handle"></div></div>
                  </div>
                  <div class="pref-row">
                    <div class="pref-text">
                      <h4>Voz del Asistente</h4>
                      <p>Síntesis de voz premium para respuestas de IA</p>
                    </div>
                    <div class="toggle-wrapper"><div class="toggle-handle"></div></div>
                  </div>
                </ui-card>
              </div>
            </section>
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
            Vas a solicitar la desactivación de
            <strong>{{ pendingPluginDeactivateLabel() }}</strong>.
          </p>
          <p class="settings-module-disable-warning">
            La baja surtirá efecto a <strong>final del mes en curso</strong>
            ({{ moduleDeactivateEffectiveDate() }}). La cuota de suscripción se
            ajustará en la siguiente renovación según las condiciones contratadas.
          </p>
          <label class="settings-module-disable-terms">
            <input
              type="checkbox"
              [checked]="moduleDisableTermsAccepted()"
              (change)="onModuleDisableTermsCheckboxChange($event)"
            />
            <span>
              Acepto esta condición y confirmo que entiendo que el módulo dejará
              de estar disponible según el calendario indicado y la suscripción.
            </span>
          </label>
        } @else {
          <p class="settings-module-disable-lead">
            Solo el rol <strong>SuperAdmin</strong> puede desactivar módulos
            para la organización.
          </p>
          <p class="settings-module-disable-warning">
            Si necesitas una baja, contacta con un SuperAdmin de tu empresa.
          </p>
        }
        <div modal-footer>
          @if (deactivateModalMode() === 'terms') {
            <ui-button variant="outline" (click)="closeDeactivatePluginModal()">
              Cancelar
            </ui-button>
            <ui-button
              variant="filled"
              [disabled]="!moduleDisableTermsAccepted()"
              (click)="confirmPluginDisable()"
            >
              Aceptar y desactivar
            </ui-button>
          } @else {
            <ui-button variant="filled" (click)="closeDeactivatePluginModal()">
              Entendido
            </ui-button>
          }
        </div>
      </ui-modal>
    </ui-feature-page-shell>
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

      /* Navigation Sidebar */
      .settings-sidebar {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(60px) saturate(1.5);
        border-right: 1px solid rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        padding: 3.5rem 1.75rem;
        box-shadow: 15px 0 60px rgba(0, 0, 0, 0.02);
      }

      .sidebar-header {
        margin-bottom: 3rem;
        padding-left: 1rem;
      }

      .sidebar-header h1 {
        font-size: 1.25rem;
        font-weight: 900;
        letter-spacing: -0.02em;
        color: #0f172a;
        margin: 0;
      }

      .sidebar-header .subtitle {
        font-size: 0.65rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #94a3b8;
        margin-top: 0.25rem;
      }

      .nav-section-label {
        font-size: 0.65rem;
        font-weight: 800;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin: 1.5rem 0 0.5rem 1rem;
        opacity: 0.8;
      }

      .settings-nav {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        color: #475569;
        font-size: 0.88rem;
        font-weight: 600;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: pointer;
        border: none;
        background: transparent;
        text-align: left;
      }

      .nav-item:hover {
        background: rgba(255, 255, 255, 0.6);
        color: var(--brand);
        transform: translateX(4px);
      }

      .nav-item.active {
        background: #ffffff;
        color: var(--brand);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        transform: translateX(6px);
      }

      .sidebar-footer {
        margin-top: auto;
        padding: 1rem;
        opacity: 0.4;
      }

      .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.6rem;
        font-weight: 800;
        text-transform: uppercase;
        color: #64748b;
      }

      /* Main Content Area */
      .settings-content {
        padding: 3rem 4rem;
        overflow-y: auto;
        background: rgba(255, 255, 255, 0.05);
        scrollbar-width: thin;
        scrollbar-color: var(--brand) transparent;
        min-width: 0;
      }

      .content-section {
        width: 100%;
        margin-bottom: 5rem;
      }

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

      /* Profile Hub & Identity */
      .profile-hero {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 4rem;
      }

      .hero-title {
        font-size: 2.75rem;
        font-weight: 950;
        letter-spacing: -0.05em;
        color: #0f172a;
        margin: 0;
        line-height: 0.9;
      }

      .hero-title span {
        color: var(--brand);
        opacity: 0.8;
      }

      .hero-subtitle {
        font-size: 1rem;
        font-weight: 500;
        color: #64748b;
        margin-top: 1rem;
        max-width: 480px;
      }

      .security-badge {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1.5rem;
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        border-radius: 99px;
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        border: 1px solid rgba(16, 185, 129, 0.2);
      }

      .identity-grid {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: 2.5rem;
      }

      .identity-main-card {
        background: rgba(255, 255, 255, 0.35) !important;
        backdrop-filter: blur(50px);
        border: 1px solid rgba(255, 255, 255, 0.5) !important;
        border-radius: 32px !important;
        padding: 2.5rem 3rem;
        display: flex;
        gap: 3rem;
        box-shadow: 0 40px 120px -30px rgba(0, 0, 0, 0.04) !important;
        align-items: center;
        flex-wrap: wrap;
      }

      .avatar-projection-area {
        width: 180px;
        height: 180px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .hologram-ring {
        position: absolute;
        inset: -15px;
        border: 1.5px solid var(--brand);
        border-radius: 50%;
        opacity: 0.12;
        animation: spin-slow 30s linear infinite;
      }

      .hologram-glow {
        position: absolute;
        width: 160px;
        height: 160px;
        background: var(--brand);
        filter: blur(60px);
        opacity: 0.18;
        border-radius: 50%;
      }

      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .identity-mascot {
        z-index: 2;
        filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.25));
        transform: scale(1.05) translateY(-8px);
        animation: mascotAppear 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      @keyframes mascotAppear {
        from { opacity: 0; transform: scale(0.85) translateY(10px); }
        to { opacity: 1; transform: scale(1.05) translateY(-8px); }
      }

      .edit-avatar-btn {
        position: absolute;
        bottom: 15px;
        right: 15px;
        width: 44px;
        height: 44px;
        background: #fff;
        border: none;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
        cursor: pointer;
        z-index: 5;
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .edit-avatar-btn:hover {
        transform: scale(1.15) rotate(15deg);
        background: var(--brand);
        color: #fff;
      }

      .identity-form {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
      }

      .luxe-input-group {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        position: relative;
      }

      .luxe-input-group label {
        font-size: 0.65rem;
        font-weight: 800;
        color: #94a3b8;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        opacity: 0.8;
      }

      .luxe-underlined-input {
        background: transparent;
        border: none;
        border-bottom: 2px solid rgba(0, 0, 0, 0.06);
        padding: 0.75rem 0;
        font-size: 1.35rem;
        font-weight: 700;
        color: #0f172a;
        transition: all 0.4s ease;
      }

      .luxe-underlined-input:focus {
        outline: none;
        border-color: var(--brand);
        padding-left: 0.5rem;
        background: linear-gradient(90deg, rgba(var(--brand-rgb), 0.02), transparent);
      }

      .identity-sidebar-cards {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .id-badge-card {
        padding: 2.5rem !important;
        background: rgba(255, 255, 255, 0.2) !important;
      }

      .badge-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .category-tag {
        font-size: 0.6rem;
        font-weight: 900;
        color: #94a3b8;
        letter-spacing: 0.15em;
        text-transform: uppercase;
      }

      .id-code {
        font-family: 'Share Tech Mono', monospace;
        font-size: 0.9rem;
        color: #475569;
        background: rgba(15, 23, 42, 0.04);
        padding: 1.25rem;
        border-radius: 16px;
        margin-bottom: 1.5rem;
        word-break: break-all;
        border: 1px solid rgba(0, 0, 0, 0.03);
      }

      .last-access-row {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .last-access-row .label {
        font-size: 0.6rem;
        font-weight: 800;
        color: #94a3b8;
      }

      .last-access-row .value {
        font-size: 0.8rem;
        font-weight: 600;
        color: #1e293b;
      }

      .role-status-card {
        background: linear-gradient(135deg, var(--brand), color-mix(in srgb, var(--brand) 85%, black 15%)) !important;
        color: #fff !important;
        border: none !important;
        box-shadow: 0 20px 40px rgba(var(--brand-rgb), 0.2) !important;
      }

      .role-info {
        display: flex;
        align-items: center;
        gap: 1.5rem;
      }

      .role-icon {
        width: 54px;
        height: 54px;
        background: rgba(255, 255, 255, 0.25);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }

      .role-text h3 {
        color: #fff !important;
        font-size: 1.25rem;
        font-weight: 800;
        margin: 0 0 0.25rem 0;
        letter-spacing: -0.02em;
      }

      .role-text p {
        color: rgba(255, 255, 255, 0.85);
        font-size: 0.85rem;
        margin: 0;
        font-weight: 500;
      }

      .active-pulse {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.65rem;
        font-weight: 900;
        background: rgba(0, 0, 0, 0.25);
        width: fit-content;
        padding: 0.5rem 1rem;
        border-radius: 99px;
        letter-spacing: 0.05em;
      }

      .pulse-dot {
        width: 8px;
        height: 8px;
        background: #4ade80;
        border-radius: 50%;
        box-shadow: 0 0 12px #4ade80;
        animation: pulse-ring 2s infinite cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes pulse-ring {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.6); opacity: 0.6; }
        100% { transform: scale(1); opacity: 1; }
      }

      /* Toggles & Swatches */
      .toggle-wrapper {
        width: 48px;
        height: 24px;
        background: rgba(15, 23, 42, 0.15);
        border-radius: 99px;
        position: relative;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid rgba(0, 0, 0, 0.05);
        flex-shrink: 0;
      }

      .toggle-handle {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 18px;
        height: 18px;
        background: #fff;
        border-radius: 50%;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }

      .toggle-wrapper.active {
        background: var(--brand);
        border-color: rgba(0, 0, 0, 0.1);
      }

      .toggle-wrapper.active .toggle-handle {
        left: 26px;
      }

      /* Grid Controls */
      .grid-config {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
        gap: 1.5rem;
        width: 100%;
        overflow: hidden;
      }

      /* Bot Crystal Cards (AI Grid) */
      .bot-crystal-card {
        display: flex;
        flex-direction: column;
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
      }

      .bot-crystal-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.1) !important;
      }

      .pref-text {
        flex: 1;
        padding-right: 2rem;
      }

      .pref-text h4 {
        font-size: 0.95rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 0.35rem;
        line-height: 1.3;
      }

      .pref-text p {
        font-size: 0.8rem;
        color: #64748b;
        margin: 0;
        line-height: 1.5;
      }

      .pref-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: #0f172a;
      }

      .pref-header h3 {
        font-size: 1rem;
        font-weight: 800;
        margin: 0;
        color: #0f172a;
      }

      .companion-selector {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .security-badge.online {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        border-color: rgba(16, 185, 129, 0.2);
      }

      .security-badge:not(.online) {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
        border-color: rgba(245, 158, 11, 0.2);
      }

      .inline-config-panel {
        animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .text-brand {
        color: var(--brand);
      }

      ui-card[variant="glass"] {
        background: rgba(255, 255, 255, 0.4) !important;
        backdrop-filter: blur(40px);
        border: 1px solid rgba(255, 255, 255, 0.6) !important;
        border-radius: 20px !important;
        box-shadow: 0 20px 60px -15px rgba(0, 0, 0, 0.04) !important;
        padding: 2rem !important;
        transition: transform 0.3s ease;
      }

      .pref-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem 0;
        border-top: 1px solid rgba(0, 0, 0, 0.05);
      }

      /* Buddy Customizer */
      .buddy-customizer {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 2rem;
        align-items: start;
      }

      .buddy-preview-card {
        position: relative;
        min-height: 420px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--brand) 15%, transparent), transparent 75%);
        border-radius: 40px;
        border: 1px solid rgba(255,255,255,0.1);
        overflow: hidden;
      }

      /* Animations */
      .animate-slide-up {
        animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }

      :host-context(html[data-erp-tenant='babooni']) {
        --brand-rgb: 0, 100, 255;
      }
    `,
    `
      .form-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        margin-bottom: 0.5rem;
      }

      .color-input {
        width: 72px;
        height: 48px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        background: color-mix(in srgb, var(--surface) 90%, black 10%);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        padding: 4px;
      }

      .color-input:hover {
        border-color: color-mix(in srgb, var(--brand) 40%, white 20%);
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 10px 20px rgba(0,0,0,0.3);
      }

      .color-input:focus {
        outline: none;
        border-color: var(--brand);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 25%, transparent);
      }

      .color-picker-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .companion-custom-primary {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.75rem 1rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px dashed rgba(255, 255, 255, 0.1);
      }

      .form-label-sub {
        margin-bottom: 0;
        font-size: 0.7rem;
        opacity: 0.9;
      }

      .color-input-primary {
        width: 52px;
        height: 44px;
        padding: 2px;
      }

      .color-hex-hint {
        font-size: 0.75rem;
        font-weight: 600;
        font-family: ui-monospace, monospace;
        color: var(--text-muted);
        letter-spacing: 0.04em;
      }

      .color-swatch-item {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        padding: 4px;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.02);
      }

      .color-swatch-item:hover {
        transform: translateY(-5px) rotate(8deg) scale(1.1);
        background: rgba(255,255,255,0.06);
        border-color: rgba(255,255,255,0.15);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
      }

      .color-swatch-item.active {
        border-color: #fff;
        background: rgba(255,255,255,0.08);
        transform: scale(1.15);
        box-shadow: 0 0 20px 2px color-mix(in srgb, currentColor 40%, transparent);
      }

      .color-swatch {
        width: 100%;
        height: 100%;
        border-radius: 10px;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
        position: relative;
        overflow: hidden;
      }

      .color-swatch::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.1) 100%);
      }

      /* Rage Mode Config Styles */
      .card-header-with-toggle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
      }

      .rage-toggle {
        background: rgba(15, 23, 42, 0.6);
        border: 1.5px solid rgba(220, 38, 38, 0.3);
        padding: 0.6rem 1.2rem;
        border-radius: 99px;
        display: flex;
        align-items: center;
        gap: 1rem;
        cursor: pointer;
        transition: 0.4s ease;
        user-select: none;
        min-width: 160px;
        justify-content: space-between;
      }

      .rage-toggle:hover {
        border-color: rgba(220, 38, 38, 0.6);
        background: rgba(220, 38, 38, 0.05);
        transform: translateY(-2px);
      }

      .rage-toggle.active {
        background: #dc2626;
        border-color: #f87171;
      }

      .rage-toggle .toggle-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .rage-toggle span {
        font-size: 0.75rem;
        font-weight: 800;
        color: #ef4444;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .rage-toggle.active span {
        color: #fff;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .rage-toggle .switch-pill {
        width: 32px;
        height: 16px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 99px;
        position: relative;
      }
      .rage-toggle.active .switch-pill {
        background: rgba(0, 0, 0, 0.3);
      }

      .rage-toggle .switch-handle {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 10px;
        height: 10px;
        background: #fff;
        border-radius: 50%;
        transition: all 0.3s ease;
      }
      .rage-toggle.active .switch-handle {
        left: 19px;
        background: #fff;
      }

      .standard-options {
        transition: all 0.5s ease;
      }
      .standard-options.dimmed {
        opacity: 0.25;
        pointer-events: none;
        filter: grayscale(1) blur(2px);
        transform: scale(0.97);
      }

      .section-title h2 {
        font-size: 1.5rem;
        font-weight: 900;
        color: #fff;
        margin: 0;
        letter-spacing: -0.02em;
      }

      /* Profile */
      .profile-layout {
        display: grid;
        grid-template-columns: 1fr 340px;
        gap: 1.5rem;
      }

      .user-id-header {
        display: flex;
        align-items: center;
        gap: 2rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .avatar-manager {
        position: relative;
        padding: 10px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 24px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }

      .edit-avatar-btn {
        position: absolute;
        bottom: 0;
        right: 0;
        background: var(--brand);
        color: #000;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
        transition: all 0.3s ease;
      }
      .edit-avatar-btn:hover {
        transform: scale(1.1) rotate(15deg);
        filter: brightness(1.2);
      }

      .user-names h3 {
        font-size: 1.75rem;
        font-weight: 900;
        color: #fff;
        margin: 0;
        letter-spacing: -0.01em;
      }

      .user-names p {
        color: var(--text-muted);
        margin: 0.25rem 0 1rem;
        font-size: 0.95rem;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .small-title {
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        color: var(--brand);
        margin-bottom: 1rem;
        letter-spacing: 0.15em;
        opacity: 0.8;
      }

      code {
        background: rgba(0, 0, 0, 0.3);
        padding: 1rem;
        border-radius: 12px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.85rem;
        display: block;
        color: var(--brand);
        border: 1px solid rgba(255, 255, 255, 0.05);
        word-break: break-all;
      }

      .meta-info {
        background: rgba(255, 255, 255, 0.02);
        padding: 1rem;
        border-radius: 12px;
      }
      .meta-item {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
      }
      .meta-item .label { color: var(--text-muted); }
      .meta-item .val { color: #fff; font-weight: 700; }

      .config-desc {
        font-size: 0.8rem;
        color: var(--text-muted);
        line-height: 1.5;
      }

      .pref-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: #fff;
      }
      .pref-header h3 {
        font-size: 1rem;
        font-weight: 800;
        margin: 0;
      }

      .divider {
        border: 0;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        margin: 2rem 0;
      }

      .custom-color-picker {
        width: 44px;
        height: 44px;
        overflow: hidden;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .custom-color-picker:hover {
        transform: scale(1.05);
        border-color: #fff;
      }
      .custom-color-picker input {
        width: 150%;
        height: 150%;
        margin: -25%;
        cursor: pointer;
        border: none;
      }

      /* Removed redundant .nav-divider */

      .rage-text {
        color: #ef4444 !important;
        text-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
        margin: 1.5rem 0 1rem 0 !important;
        font-family: 'Outfit', sans-serif;
      }
      .rage-hint {
        font-size: 0.75rem;
        color: #94a3b8;
        margin-top: 1.5rem;
        padding: 0.75rem;
        background: rgba(0, 0, 0, 0.2);
        border-left: 3px solid #dc2626;
        font-style: italic;
      }

      .is-rage-preview {
        border: 2px solid #dc2626;
        box-shadow: 0 0 40px rgba(220, 38, 38, 0.2);
        background: radial-gradient(circle, rgba(220, 38, 38, 0.2), transparent);
      }

      .buddy-skills-card {
        padding: 1.5rem;
      }

      .buddy-skills-lead {
        font-size: 0.75rem;
        color: var(--text-muted);
        line-height: 1.45;
        margin: -0.25rem 0 0.75rem 0;
      }

      .jaime-user-layer-card {
        padding: 1.5rem;
      }

      .jaime-user-layer-card h3 {
        font-size: 1.05rem;
        font-weight: 800;
        margin: 0 0 0.35rem 0;
        color: #fff;
      }

      .user-layer-lead {
        font-size: 0.78rem;
        color: var(--text-muted);
        line-height: 1.45;
        margin: 0 0 1.25rem 0;
      }

      .user-agent-textarea {
        width: 100%;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(15, 23, 42, 0.55);
        color: #e2e8f0;
        font-size: 0.85rem;
        line-height: 1.5;
        resize: vertical;
        min-height: 88px;
        font-family: inherit;
      }

      .user-agent-textarea:focus {
        outline: none;
        border-color: rgba(var(--brand-rgb, 16, 185, 129), 0.45);
        box-shadow: 0 0 0 2px rgba(var(--brand-rgb, 16, 185, 129), 0.15);
      }

      .preset-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 0.35rem;
      }

      .preset-hint {
        font-size: 0.72rem;
        color: var(--text-muted);
        margin: 0 0 0.75rem 0;
      }

      .prompt-preset-block {
        padding: 0.85rem 1rem;
        margin-bottom: 0.75rem;
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.18);
        border: 1px solid rgba(255, 255, 255, 0.06);
      }

      .preset-row-head {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .preset-title-input {
        flex: 1;
        min-width: 0;
        padding: 0.45rem 0.65rem;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(15, 23, 42, 0.5);
        color: #fff;
        font-size: 0.8rem;
        font-weight: 700;
      }

      .preset-remove {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 8px;
        background: rgba(220, 38, 38, 0.12);
        color: #f87171;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .preset-remove:hover {
        background: rgba(220, 38, 38, 0.22);
      }

      .user-agent-textarea.preset-body {
        min-height: 72px;
        margin: 0;
      }

      @media (max-width: 1200px) {
        .ai-bot-card {
          grid-template-columns: 1fr;
        }
        .bot-visual {
          height: 160px;
        }
        .buddy-customizer {
          grid-template-columns: 1fr;
        }
        .buddy-preview-card {
          height: 250px;
        }
        .companion-context-block {
          align-items: flex-start;
          text-align: left;
          max-width: 100%;
        }
      }

      /* Roles Management - Cyber Luxe Matrix */
      .roles-header-main {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 2.5rem;
      }

      .roles-layout-grid {
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 1.5rem;
        align-items: flex-start;
        width: 100%;
        min-width: 0;
        overflow: hidden;
      }

      .roles-selector-card {
        background: color-mix(in srgb, var(--surface) 88%, var(--brand) 2%);
        backdrop-filter: blur(40px) saturate(2);
        border: 1px solid color-mix(in srgb, var(--border-soft) 40%, white 5%);
        border-radius: 28px;
        display: flex;
        flex-direction: column;
        max-height: 800px;
        box-shadow: 0 25px 60px -15px rgba(0,0,0,.5);
        overflow: hidden;
        min-width: 0;
      }

      .selector-header {
        padding: 1.75rem;
        font-weight: 900;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.25em;
        color: var(--brand);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        background: linear-gradient(to right, color-mix(in srgb, var(--brand) 10%, transparent), transparent);
      }

      .roles-list-scroll {
        flex: 1;
        overflow-y: auto;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .role-item-btn {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.15rem;
        border-radius: 18px;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid transparent;
        background: rgba(255, 255, 255, 0.03);
        position: relative;
        overflow: hidden;
      }

      .role-item-btn:hover {
        background: rgba(255, 255, 255, 0.06);
        transform: translateX(6px);
        border-color: rgba(255, 255, 255, 0.08);
      }

      .role-item-btn.active {
        background: color-mix(in srgb, var(--brand) 12%, var(--surface));
        border-color: color-mix(in srgb, var(--brand) 45%, transparent);
        box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.4);
      }

      .role-item-btn.active::after {
        content: '';
        position: absolute;
        left: 0;
        top: 25%;
        height: 50%;
        width: 3px;
        background: var(--brand);
        border-radius: 0 4px 4px 0;
        box-shadow: 0 0 15px var(--brand);
      }

      .role-icon-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
        position: relative;
        z-index: 1;
        background: currentColor;
      }

      .role-icon-indicator::after {
        content: '';
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        background: currentColor;
        opacity: 0.3;
        filter: blur(8px);
      }

      .role-icon-indicator.SUPERADMIN { color: #facc15; }
      .role-icon-indicator.ADMIN { color: #3b82f6; }
      .role-icon-indicator.RESPONSIBLE { color: #10b981; }
      .role-icon-indicator.USER { color: #94a3b8; }

      .role-label-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .role-name-text {
        font-weight: 800;
        font-size: 0.9rem;
        color: var(--text-primary);
        letter-spacing: -0.01em;
      }

      .role-type-pill {
        font-size: 0.6rem;
        font-weight: 900;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.15em;
        opacity: 0.6;
      }

      .role-item-btn .chevron {
        opacity: 0.2;
        transition: all 0.3s ease;
        color: #fff;
      }
      .role-item-btn.active .chevron {
        opacity: 0.8;
        transform: translateX(4px) scale(1.2);
        color: var(--brand);
      }

      .role-matrix-detail {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2rem;
        overflow: hidden;
      }

      .role-config-card {
        padding: 0;
        background: color-mix(in srgb, var(--surface) 85%, var(--brand) 2%) !important;
        border: 1px solid var(--border-soft) !important;
        border-radius: 32px;
        overflow: hidden;
      }

      .role-config-header {
        padding: 3rem;
        background: color-mix(in srgb, var(--surface) 60%, transparent);
        border-bottom: 1px solid var(--border-soft);
      }

      .role-main-info {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 3rem;
        margin-bottom: 1rem;
      }

      .role-description-hint {
        font-size: 0.95rem;
        color: var(--text-secondary) !important;
        margin-top: 0.75rem;
        max-width: 600px;
        line-height: 1.6;
      }

      .role-locked-notice {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--brand);
        margin-bottom: 1.5rem;
        padding: 1.25rem 1.5rem;
        background: color-mix(in srgb, var(--brand) 12%, transparent);
        border-radius: 16px;
        border-left: 4px solid var(--brand);
        backdrop-filter: blur(10px);
      }

      .permissions-matrix-container {
        padding: 3rem;
        display: flex;
        flex-direction: column;
        gap: 4rem;
      }

      .category-title {
        font-size: 1rem;
        font-weight: 900;
        color: var(--text-primary) !important;
        margin-bottom: 2rem;
        display: flex;
        align-items: center;
        gap: 1.25rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
      }

      .category-title::before {
        content: '';
        width: 4px;
        height: 24px;
        background: var(--brand);
        border-radius: 2px;
        box-shadow: 0 0 15px var(--brand);
      }

      .permission-items-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        width: 100%;
      }

      .permission-toggle-box {
        background: color-mix(in srgb, var(--surface) 70%, transparent);
        border: 1px solid var(--border-soft);
        border-radius: 20px;
        padding: 1.75rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        overflow: hidden;
      }

      .permission-toggle-box:hover {
        background: rgba(255, 255, 255, 0.04);
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
        border-color: color-mix(in srgb, var(--brand) 25%, var(--border-soft));
      }

      .permission-toggle-box.active {
        background: color-mix(in srgb, var(--brand) 12%, var(--surface));
        border-color: var(--brand);
      }

      .permission-toggle-box.active::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--brand) 15%, transparent), transparent 70%);
        pointer-events: none;
      }

      .perm-label {
        font-weight: 800;
        font-size: 0.95rem;
        color: var(--text-primary) !important;
        letter-spacing: -0.01em;
      }

      .perm-id {
        font-size: 0.65rem;
        font-family: 'JetBrains Mono', monospace;
        color: var(--brand);
        opacity: 0.7;
        margin-top: 0.25rem;
        font-weight: 600;
        letter-spacing: 0.05em;
      }

      .toggle-ui {
        width: 52px;
        height: 28px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 99px;
        position: relative;
        border: 1px solid rgba(255, 255, 255, 0.05);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .toggle-pill {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 20px;
        height: 20px;
        background: #fff;
        border-radius: 50%;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 2px 5px rgba(0,0,0,0.4);
      }

      .permission-toggle-box.active .toggle-ui {
        background: var(--brand);
        border-color: rgba(255,255,255,0.2);
        box-shadow: 0 0 15px color-mix(in srgb, var(--brand) 40%, transparent);
      }

      .permission-toggle-box.active .toggle-pill {
        left: 27px;
        background: var(--text-on-brand, #fff);
      }

      .toggle-pill {
        position: absolute;
        top: 4px;
        left: 4px;
        width: 18px;
        height: 18px;
        background: #fff;
        border-radius: 50%;
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
      }

      .permission-toggle-box.active .toggle-pill {
        left: 28px;
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
      }

      .no-role-selected {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--text-muted);
        text-align: center;
      }

      @media (max-width: 1200px) {
        .roles-layout-grid { grid-template-columns: 1fr; }
        .roles-selector-card { height: 400px; }
      }

      /* BABOONI / BIOSSTEL LUXE SETTINGS OVERRIDES */
      :host-context(html[data-erp-tenant='babooni']) .settings-layout {
        background: transparent;
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 0;
        min-height: 100%;
        overflow-x: hidden;
      }

      :host-context(html[data-erp-tenant='babooni']) .settings-sidebar {
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(60px);
        border-right: 1px solid rgba(0, 0, 0, 0.04);
        padding: 3.5rem 1.75rem;
        border-radius: 0;
        box-shadow: 15px 0 60px rgba(0, 0, 0, 0.02);
      }

      :host-context(html[data-erp-tenant='babooni']) .nav-section-label {
        font-size: 0.65rem;
        font-weight: 800;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin: 1.5rem 0 0.5rem 1rem;
        opacity: 0.8;
      }

      :host-context(html[data-erp-tenant='babooni']) .sidebar-header h1 {
        font-size: 1.5rem;
        font-weight: 900;
        color: #0f172a;
        letter-spacing: -0.04em;
        margin-bottom: 2rem;
        padding-left: 1rem;
      }

      :host-context(html[data-erp-tenant='babooni']) .nav-item {
        border-radius: 12px;
        margin-bottom: 0.15rem;
        padding: 0.75rem 1rem;
        background: transparent;
        color: #475569;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        font-weight: 600;
        font-size: 0.88rem;
        border: none !important;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      :host-context(html[data-erp-tenant='babooni']) .nav-item:hover {
        background: rgba(255, 255, 255, 0.6);
        color: var(--brand);
        transform: translateX(4px);
      }

      :host-context(html[data-erp-tenant='babooni']) .nav-item.active {
        background: #ffffff;
        color: var(--brand);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        transform: translateX(6px);
      }

      :host-context(html[data-erp-tenant='babooni']) .nav-item.active::after {
        display: none;
      }

      :host-context(html[data-erp-tenant='babooni']) .section-breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
        font-size: 0.75rem;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      :host-context(html[data-erp-tenant='babooni']) .section-breadcrumb .current {
        color: var(--brand);
      }

      :host-context(html[data-erp-tenant='babooni']) .settings-content {
        padding: 3rem 2.5rem;
        background: rgba(255, 255, 255, 0.15);
        overflow-x: hidden;
        min-width: 0;
      }

      :host-context(html[data-erp-tenant='babooni']) .content-section h2 {
        font-size: 2.5rem;
        font-weight: 950;
        letter-spacing: -0.04em;
        color: #0f172a;
      }

      :host-context(html[data-erp-tenant='babooni']) .id-card,
      :host-context(html[data-erp-tenant='babooni']) .prefs-card,
      :host-context(html[data-erp-tenant='babooni']) .plugin-card,
      :host-context(html[data-erp-tenant='babooni']) .ai-bot-card,
      :host-context(html[data-erp-tenant='babooni']) .ai-global-config-card {
        background: rgba(255, 255, 255, 0.35) !important;
        backdrop-filter: blur(30px);
        border: 1px solid rgba(255, 255, 255, 0.5) !important;
        border-radius: 24px !important;
        box-shadow: 0 20px 60px -15px rgba(0, 0, 0, 0.05) !important;
        padding: 2rem !important;
      }

      :host-context(html[data-erp-tenant='babooni']) .luxe-range {
        width: 100%;
        height: 6px;
        -webkit-appearance: none;
        background: #e2e8f0;
        border-radius: 99px;
        margin-top: 1rem;
      }

      :host-context(html[data-erp-tenant='babooni']) .luxe-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        background: var(--brand);
        border: 4px solid #fff;
        border-radius: 50%;
        box-shadow: 0 4px 10px rgba(var(--brand-rgb), 0.3);
        cursor: pointer;
      }

      :host-context(html[data-erp-tenant='babooni']) .val-badge {
        font-size: 0.7rem;
        font-weight: 900;
        background: rgba(var(--brand-rgb), 0.1);
        color: var(--brand);
        padding: 0.25rem 0.6rem;
        border-radius: 6px;
      }

      :host-context(html[data-erp-tenant='babooni']) .control-label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsFeatureComponent {
  private readonly _pluginStore = inject(PluginStore);
  private readonly _tenantModulesApi = inject(TenantModulesApiService);
  private readonly _toast = inject(ToastService);
  private _pluginsTabModulesSub?: Subscription;
  public readonly aiBotStore = inject(AIBotStore);
  public readonly themeService = inject(ThemeService);
  private readonly _rolesService = inject(RolesService);
  public readonly _authStore = inject(AuthStore);

  /** Los usuarios con permiso '*' o 'roles.manage' pueden ver y editar la matriz de roles y permisos. */
  readonly canSeeRolesAdmin = computed(() => {
    const p = this._authStore.user()?.permissions ?? [];
    return p.includes('*') || p.includes('roles.manage');
  });

  readonly activeTab = signal<
    | 'general'
    | 'ai'
    | 'buddy'
    | 'plugins'
    | 'notifications'
    | 'security'
    | 'roles'
    | 'labs'
    | 'profile'
    | 'appearance'
  >('profile');
  readonly managingBotId = signal<string | null>(null);

  private static readonly COMPANION_EDITOR_STORAGE_KEY =
    'settings_companion_editor_feature';

  /** Qué compañero se edita en la pestaña «Compañeros IA» (Buddy vs panel). */
  readonly companionEditorFeature = signal<'buddy' | 'dashboard'>(
    SettingsFeatureComponent.readStoredCompanionEditor(),
  );

  private static readStoredCompanionEditor(): 'buddy' | 'dashboard' {
    if (typeof localStorage === 'undefined') {
      return 'buddy';
    }
    try {
      const v = localStorage.getItem(
        SettingsFeatureComponent.COMPANION_EDITOR_STORAGE_KEY,
      );
      if (v === 'buddy' || v === 'dashboard') {
        return v;
      }
    } catch {
      /* ignore */
    }
    return 'buddy';
  }

  // Expose signals explicitly for better template inference
  public readonly realtimeSync = this._pluginStore.realtimeSync;
  public readonly highPerformanceMode = this._pluginStore.highPerformanceMode;
  public readonly premiumExperience = computed(() => !this._pluginStore.highPerformanceMode());
  public readonly enabledPlugins = this._pluginStore.enabledPlugins;

  // Roles Management
  readonly roles = signal<Role[]>([]);
  readonly selectedRoleId = signal<string | null>(null);
  readonly selectedRole = computed(() => 
    this.roles().find(r => r.id === this.selectedRoleId()) || null
  );

  /** Orden de grupos en la matriz (coincide con categorías del catálogo). */
  readonly permissionCategoryOrder = [
    'Sistema',
    'General',
    'Identidad',
    'CRM/Clientes',
    'Inventario',
    'Finanzas',
    'Operaciones',
    'Analítica',
    'Cumplimiento',
    'Logística',
  ] as const;

  /** Permisos visibles según módulos activos del tenant (PluginStore ↔ API). */
  readonly permissionsCatalogForUi = computed(() => {
    const enabled = this._pluginStore.enabledPlugins();
    return PERMISSIONS_CATALOG.filter((p) =>
      isPermissionAllowedForModules(p.id, enabled),
    );
  });

  readonly isSelectedRoleSuperAdmin = computed(() => {
    const r = this.selectedRole();
    return r?.type === RoleType.SUPERADMIN;
  });

  readonly isLoadingRoles = signal(false);
  /** Error al cargar roles (red / API). */
  readonly rolesLoadError = signal<string | null>(null);
  /** Error al sincronizar o guardar módulos del tenant. */
  readonly pluginsTabError = signal<string | null>(null);

  categoryHasVisiblePerms(category: string): boolean {
    return this.permissionsCatalogForUi().some((p) => p.category === category);
  }

  constructor() {
    effect(() => {
      if (this.activeTab() === 'roles' && !this.canSeeRolesAdmin()) {
        this.activeTab.set('profile');
      }
    });
    effect(() => {
      if (this.activeTab() === 'roles' && this.canSeeRolesAdmin()) {
        this.loadRoles();
      }
    });
    /** Al abrir Módulos & Plugins, alinear PluginStore con el backend (p. ej. cambios desde panel SaaS). */
    effect(() => {
      if (this.activeTab() !== 'plugins') {
        return;
      }
      this._pluginsTabModulesSub?.unsubscribe();
      this._pluginsTabModulesSub = this._tenantModulesApi
        .fetchEnabledModules()
        .subscribe({
          next: (r) => {
            this.pluginsTabError.set(null);
            this._pluginStore.setPlugins(r.enabledModuleIds);
          },
          error: () => {
            this.pluginsTabError.set(
              'No se pudo sincronizar los módulos con el servidor. Se muestran los últimos datos conocidos.',
            );
          },
        });
    });

    // Save stored companion choice
    effect(() => {
      localStorage.setItem(
        SettingsFeatureComponent.COMPANION_EDITOR_STORAGE_KEY,
        this.companionEditorFeature()
      );
    });
  }

  loadRoles(): void {
    this.rolesLoadError.set(null);
    this.isLoadingRoles.set(true);
    this._rolesService.findAll().subscribe({
      next: (roles: Role[]) => {
        this.roles.set(roles);
        if (roles.length > 0 && !this.selectedRoleId()) {
          this.selectedRoleId.set(roles[0].id);
        }
        this.isLoadingRoles.set(false);
      },
      error: () => {
        this.isLoadingRoles.set(false);
        this.rolesLoadError.set(
          'No se pudieron cargar los roles. Comprueba la conexión e inténtalo de nuevo.',
        );
      },
    });
  }

  /** Reintento manual desde el banner de módulos (misma petición que al abrir la pestaña). */
  reloadTenantModulesFromApi(): void {
    this.pluginsTabError.set(null);
    this._tenantModulesApi.fetchEnabledModules().subscribe({
      next: (r) => {
        this.pluginsTabError.set(null);
        this._pluginStore.setPlugins(r.enabledModuleIds);
      },
      error: () => {
        this.pluginsTabError.set(
          'No se pudo sincronizar los módulos con el servidor. Se muestran los últimos datos conocidos.',
        );
        this._toast.show('No se pudieron cargar los módulos.', 'error');
      },
    });
  }

  onSaveProfileClick(): void {
    this._toast.show(
      'El guardado del perfil en el servidor estará disponible próximamente.',
      'info',
    );
  }

  togglePermission(roleId: string, permissionId: string) {
    const role = this.roles().find((r: Role) => r.id === roleId);
    if (!role) return;
    if (role.type === RoleType.SUPERADMIN) return;

    let permissions = [...role.permissions];

    if (permissionId === '*') {
      if (permissions.includes('*')) {
        permissions = []; // Turn off wildcard -> zero access
      } else {
        permissions = ['*']; // Turn on wildcard -> wipe granular rules
      }
    } else {
      if (permissions.includes('*')) {
        // User is trying to disable a specific permission while having wildcard.
        // We must explode the wildcard into explicit permissions, excluding the one clicked.
        const allPerms = this.permissionsCatalogForUi()
          .map((p) => p.id)
          .filter((id) => id !== '*' && id !== permissionId);
        permissions = allPerms;
      } else {
        if (permissions.includes(permissionId)) {
          permissions = permissions.filter((p: string) => p !== permissionId);
        } else {
          permissions.push(permissionId);
        }
      }
    }

    this._rolesService.update(roleId, { permissions }).subscribe({
      next: (updated: Role) => {
        this.roles.update((list) =>
          list.map((r) => (r.id === roleId ? updated : r)),
        );
        this._authStore.refreshSession();
      },
      error: () => {
        this._toast.show(
          'No se pudieron guardar los permisos. Inténtalo de nuevo.',
          'error',
        );
      },
    });
  }

  isPermissionActive(roleId: string, permissionId: string): boolean {
    const role = this.roles().find((r: Role) => r.id === roleId);
    if (!role) return false;
    return role.permissions.includes('*') || role.permissions.includes(permissionId);
  }

  async createNewRole() {
    const name = prompt('Nombre del nuevo rol:');
    if (!name) return;
    
    this._rolesService
      .create({
        name,
        type: RoleType.USER,
        permissions: [],
      })
      .subscribe({
        next: (newRole: Role) => {
          this.roles.update((list) => [...list, newRole]);
          this.selectedRoleId.set(newRole.id);
          this._toast.show('Rol creado correctamente.', 'success');
        },
        error: () => {
          this._toast.show('No se pudo crear el rol. Inténtalo de nuevo.', 'error');
        },
      });
  }

  async deleteRole(id: string) {
    const r = this.roles().find((x) => x.id === id);
    if (r?.type === RoleType.SUPERADMIN) return;
    if (!confirm('¿Estás seguro de que deseas eliminar este rol?')) return;

    this._rolesService.delete(id).subscribe({
      next: () => {
        this.roles.update((list) => list.filter((r) => r.id !== id));
        if (this.selectedRoleId() === id) {
          this.selectedRoleId.set(this.roles()[0]?.id || null);
        }
        this._toast.show('Rol eliminado.', 'success');
      },
      error: () => {
        this._toast.show('No se pudo eliminar el rol. Inténtalo de nuevo.', 'error');
      },
    });
  }

  readonly plugins: PluginDescriptor[] = [
    {
      id: 'clients',
      name: 'Gestión de Clientes',
      description: 'Módulo CRM para seguimiento de clientes y leads.',
      icon: 'users',
      category: 'core',
    },
    {
      id: 'projects',
      name: 'Proyectos y Tareas',
      description: 'Planificación de producciones y asignación de recursos.',
      icon: 'file-text',
      category: 'core',
    },
    {
      id: 'events',
      name: 'Calendario de Eventos',
      description: 'Gestión de fechas críticas y rodajes.',
      icon: 'calendar',
      category: 'core',
    },
    {
      id: 'identity',
      name: 'Identidad y Usuarios',
      description: 'Control de acceso, roles y seguridad.',
      icon: 'id-card',
      category: 'core',
    },
    {
      id: 'availability',
      name: 'Disponibilidad',
      description: 'Control horario y cuadrante de vacaciones.',
      icon: 'clock',
      category: 'vertical',
    },
    {
      id: 'services',
      name: 'Catálogo de Servicios',
      description: 'Definición de tarifas y servicios prestados.',
      icon: 'wrench',
      category: 'vertical',
    },
    {
      id: 'reports',
      name: 'Análisis y Reportes',
      description: 'KPIs, métricas y exportación de datos.',
      icon: 'pie-chart',
      category: 'vertical',
    },
    {
      id: 'audit',
      name: 'Auditoría de Sistema',
      description: 'Registro de actividad y trazabilidad de cambios.',
      icon: 'shield-check',
      category: 'vertical',
    },
    {
      id: 'inventory',
      name: 'Inventario Pro',
      description: 'Control de stock y trazabilidad de material.',
      icon: 'package',
      category: 'core',
    },
    {
      id: 'budgets',
      name: 'Presupuestos',
      description: 'Gestor de cotizaciones cinematográficas.',
      icon: 'receipt',
      category: 'core',
    },
    {
      id: 'delivery',
      name: 'Logística y Albaranes',
      description: 'Gestión de entregas y salidas de material.',
      icon: 'truck',
      category: 'vertical',
    },
    {
      id: 'fleet',
      name: 'Gestión de Flota',
      icon: 'car',
      description: 'Control de vehículos y transportes de producción.',
      category: 'vertical',
    },
    {
      id: 'rentals',
      name: 'Alquileres',
      icon: 'key',
      description: 'Sistema de reservas y devoluciones.',
      category: 'vertical',
    },
    {
      id: 'billing',
      name: 'Facturación',
      description: 'Gestión de facturas y cobros.',
      icon: 'history',
      category: 'core',
    },
    {
      id: 'verifactu',
      name: 'VeriFactu Compliance',
      icon: 'file-check',
      description: 'Integración mandatoria con la AEAT.',
      category: 'vertical',
    },
  ];

  readonly deactivateModuleModalOpen = signal(false);
  /** `terms`: SuperAdmin + checkbox; `forbidden`: resto de usuarios. */
  readonly deactivateModalMode = signal<'terms' | 'forbidden'>('terms');
  readonly pendingPluginDisableId = signal<string | null>(null);
  readonly moduleDisableTermsAccepted = signal(false);

  readonly deactivateModalTitle = computed(() =>
    this.deactivateModalMode() === 'terms'
      ? 'BAJA DE MÓDULO'
      : 'NO PUEDES DESACTIVAR ESTE MÓDULO',
  );

  /** Activar módulos: administradores con gestión de usuarios/roles. */
  readonly canActivateTenantModules = computed(() => {
    const p = this._authStore.user()?.permissions ?? [];
    return (
      p.includes('*') ||
      p.includes('users.manage') ||
      p.includes('roles.manage')
    );
  });

  /** Desactivar módulos: solo rol SuperAdmin (coincide con matriz de roles). */
  readonly canDeactivateTenantModules = this.canSeeRolesAdmin;

  readonly moduleDeactivateEffectiveDate = computed(() => {
    const last = new Date();
    last.setMonth(last.getMonth() + 1, 0);
    return last.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });

  readonly pendingPluginDeactivateLabel = computed(() => {
    const id = this.pendingPluginDisableId();
    if (!id) return '';
    return this.plugins.find((p) => p.id === id)?.name ?? id;
  });

  readonly botOptions = computed(() =>
    this.aiBotStore
      .bots()
      .map((bot) => ({
        value: bot.feature,
        label: `${this.aiBotStore.getBotDisplayName(bot.feature)} (${bot.feature})`,
      }))
      .sort((a, b) => {
        // Priorizar Buddy y Dashboard (JAIME) en la parte superior
        if (a.value === 'buddy') return -1;
        if (b.value === 'buddy') return 1;
        if (a.value === 'dashboard') return -1;
        if (b.value === 'dashboard') return 1;
        return a.label.localeCompare(b.label);
      }),
  );

  isSkillActive(botId: string, skill: string) {
    const bot = this.aiBotStore.getBotByFeature(botId);
    return bot?.activeSkills.includes(skill) || false;
  }

  /** JAIME (`dashboard`) usa capa por usuario; el resto sigue el bot global. */
  companionSkillActive(feature: string, skill: string): boolean {
    if (feature === 'dashboard') {
      return this.aiBotStore.isUserAgentSkillActive('dashboard', skill);
    }
    return this.isSkillActive(feature, skill);
  }

  companionToggleSkill(feature: string, skill: string): void {
    if (feature === 'dashboard') {
      this.aiBotStore.toggleUserAgentSkill('dashboard', skill);
    } else {
      this.aiBotStore.toggleSkill(feature, skill);
    }
  }

  /**
   * Color principal libre: actualiza el secundario con un tono más oscuro
   * (misma idea que los presets).
   */
  setCompanionPrimaryFromPicker(feature: string, primaryHex: string): void {
    const secondary = SettingsFeatureComponent.darkenHex(primaryHex, 0.38);
    this.aiBotStore.updateBotSkin(feature, {
      color: primaryHex,
      secondaryColor: secondary,
    });
  }

  private static darkenHex(hex: string, factor: number): string {
    const normalized = hex.trim().replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
      return '#0f172a';
    }
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    const mix = (c: number) =>
      Math.max(0, Math.min(255, Math.round(c * (1 - factor))));
    return `#${mix(r).toString(16).padStart(2, '0')}${mix(g).toString(16).padStart(2, '0')}${mix(b).toString(16).padStart(2, '0')}`;
  }

  /** Tipos de boca del modelo → entradas soportadas por `ui-mascot`. */
  mascotMouthFor(bot: AIBot): MascotMouthType {
    return mascotMouthToUi(bot.mouthType);
  }

  colorHexFromInput(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  onThemePrimaryFreeInput(event: Event): void {
    this.themeService.updatePrimaryColor(this.colorHexFromInput(event));
  }

  onModuleDisableTermsCheckboxChange(event: Event): void {
    this.moduleDisableTermsAccepted.set(
      (event.target as HTMLInputElement).checked,
    );
  }

  isPluginEnabled(id: string) {
    return this.enabledPlugins().includes(id);
  }

  /** Activa un módulo inactivo (permisos de administración). */
  onRequestActivateModule(pluginId: string): void {
    if (pluginId === 'dashboard') return;
    if (!this.canActivateTenantModules()) return;
    this.applyTenantPluginToggle(pluginId);
  }

  /**
   * Desactivar: siempre abre modal (advertencia + términos si es SuperAdmin;
   * si no, mensaje informativo).
   */
  onRequestDeactivateModule(pluginId: string): void {
    if (pluginId === 'dashboard') return;
    if (!this.isPluginEnabled(pluginId)) return;
    this.pendingPluginDisableId.set(pluginId);
    if (this.canDeactivateTenantModules()) {
      this.deactivateModalMode.set('terms');
      this.moduleDisableTermsAccepted.set(false);
    } else {
      this.deactivateModalMode.set('forbidden');
    }
    this.deactivateModuleModalOpen.set(true);
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

  /** Persiste módulos en el tenant (API) y sincroniza PluginStore. */
  private applyTenantPluginToggle(pluginId: string): void {
    if (pluginId === 'dashboard') return;
    const current = this._pluginStore.enabledPlugins();
    const next = current.includes(pluginId)
      ? current.filter((i) => i !== pluginId)
      : [...current, pluginId];
    const ensured = next.includes('dashboard') ? next : ['dashboard', ...next];
    this._tenantModulesApi.updateEnabledModules(ensured).subscribe({
      next: (r) => {
        this.pluginsTabError.set(null);
        this._pluginStore.setPlugins(r.enabledModuleIds);
        this._toast.show('Módulos actualizados correctamente.', 'success');
      },
      error: () => {
        this.pluginsTabError.set(
          'No se pudieron guardar los cambios. Comprueba la conexión e inténtalo de nuevo.',
        );
        this._toast.show(
          'No se pudieron guardar los cambios de módulos.',
          'error',
        );
      },
    });
  }

  toggleRealtime() {
    this._pluginStore.toggleRealtime();
  }

  togglePremium() {
    this._pluginStore.togglePerformance();
  }

}
