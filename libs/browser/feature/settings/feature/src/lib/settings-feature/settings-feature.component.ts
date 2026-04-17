import { signal, effect, computed, inject, Component, ChangeDetectionStrategy, type Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UIMascotComponent,
  UiBadgeComponent,
  UiInputComponent,
  UiSelectComponent,
} from '@josanz-erp/shared-ui-kit';
import { PluginStore, AIBotStore, type AIBot, ThemeService } from '@josanz-erp/shared-data-access';
import { RolesService, type Role, PERMISSIONS_CATALOG, AuthStore } from '@josanz-erp/identity-data-access';
import { RoleType } from '@josanz-erp/identity-core';
import { FormsModule } from '@angular/forms';

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
  ],
  template: `
    <div class="page-container animate-fade-in">
      <div class="settings-layout">
        <!-- Sidebar Navigation -->
        <aside class="settings-sidebar">
          <div class="sidebar-header">
            <h1 class="glow-text">Sistema</h1>
            <p class="subtitle">Panel de Control</p>
          </div>

          <nav class="settings-nav">
            <button
              class="nav-item"
              [class.active]="activeTab() === 'profile'"
              (click)="activeTab.set('profile')"
            >
              <lucide-icon name="user" size="18"></lucide-icon>
              <span>Mi Perfil</span>
            </button>
            <button
              class="nav-item"
              [class.active]="activeTab() === 'general'"
              (click)="activeTab.set('general')"
            >
              <lucide-icon name="sliders" size="18"></lucide-icon>
              <span>General</span>
            </button>
            <button
              class="nav-item"
              [class.active]="activeTab() === 'ai'"
              (click)="activeTab.set('ai')"
            >
              <lucide-icon name="bot" size="18"></lucide-icon>
              <span>Asistentes de IA</span>
            </button>
            <button
              class="nav-item"
              [class.active]="activeTab() === 'notifications'"
              (click)="activeTab.set('notifications')"
            >
              <lucide-icon name="bell" size="18"></lucide-icon>
              <span>Notificaciones</span>
            </button>
            <button
              class="nav-item"
              [class.active]="activeTab() === 'security'"
              (click)="activeTab.set('security')"
            >
              <lucide-icon name="lock" size="18"></lucide-icon>
              <span>Seguridad</span>
            </button>
            <button
              class="nav-item"
              [class.active]="activeTab() === 'roles'"
              (click)="activeTab.set('roles')"
            >
              <lucide-icon name="shield-check" size="18"></lucide-icon>
              <span>Roles y Permisos</span>
            </button>
            <button
              class="nav-item buddy-nav-item"
              [class.active]="activeTab() === 'buddy'"
              (click)="activeTab.set('buddy')"
            >
              <lucide-icon name="smile" size="18"></lucide-icon>
              <span>Compañeros IA</span>
            </button>

            <div class="nav-divider">Otros</div>

            <button
              class="nav-item"
              [class.active]="activeTab() === 'plugins'"
              (click)="activeTab.set('plugins')"
            >
              <lucide-icon name="puzzle" size="18"></lucide-icon>
              <span>Módulos & Plugins</span>
            </button>
            <button
              class="nav-item"
              [class.active]="activeTab() === 'labs'"
              (click)="activeTab.set('labs')"
            >
              <lucide-icon name="flask-conical" size="18"></lucide-icon>
              <span>Laboratorio</span>
            </button>
          </nav>

          <div class="sidebar-footer">
            <div class="status-indicator">
              <lucide-icon name="shield" size="14"></lucide-icon>
              <span>Núcleo Seguro v3.2</span>
            </div>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="settings-content">
          @if (activeTab() === 'profile') {
            <section class="content-section animate-slide-up">
              <div class="section-title">
                <h2>Mi Perfil</h2>
                <p>Gestiona tu identidad y presencia en la plataforma</p>
              </div>

              <div class="profile-layout">
                <div class="profile-main">
                  <ui-card variant="glass" class="id-card">
                    <div class="user-id-header">
                      <div class="avatar-manager">
                         <ui-mascot 
                           [type]="_authStore.user()?.id ? (((_authStore.user()?.id?.length ?? 0) % 2 === 0) ? 'universal' : 'dashboard') : 'universal'" 
                           [color]="themeService.currentThemeData().primary"
                           size="lg">
                         </ui-mascot>
                         <button class="edit-avatar-btn"><lucide-icon name="pencil" size="14"></lucide-icon></button>
                      </div>
                      <div class="user-names">
                        <h3>{{ _authStore.user()?.firstName || 'Usuario' }} {{ _authStore.user()?.lastName || '' }}</h3>
                        <p>{{ _authStore.user()?.email }}</p>
                        <ui-badge variant="success">{{ _authStore.user()?.roles?.[0] || 'Miembro' }}</ui-badge>
                      </div>
                    </div>

                    <div class="profile-fields mt-6">
                      <div class="form-grid">
                        <ui-input label="Nombre" [ngModel]="_authStore.user()?.firstName" placeholder="Nombre"></ui-input>
                        <ui-input label="Apellidos" [ngModel]="_authStore.user()?.lastName" placeholder="Apellidos"></ui-input>
                      </div>
                      <ui-input label="Email de contacto" [ngModel]="_authStore.user()?.email" icon="mail" [disabled]="true"></ui-input>
                    </div>
                    
                    <div class="card-actions mt-4">
                      <ui-button variant="filled">Guardar Cambios</ui-button>
                    </div>
                  </ui-card>
                </div>

                <div class="profile-side">
                  <ui-card variant="glass" class="id-token-card">
                    <h4 class="small-title">Identificador de Usuario</h4>
                    <code>{{ _authStore.user()?.id }}</code>
                    <div class="meta-info mt-4">
                      <div class="meta-item">
                        <span class="label">Último Acceso</span>
                        <span class="val">Hoy, 14:20</span>
                      </div>
                    </div>
                  </ui-card>
                </div>
              </div>
            </section>
          }

          @if (activeTab() === 'general') {
            <section class="content-section animate-slide-up">
              <div class="section-title">
                <h2>Experiencia General</h2>
                <p>Personaliza tu entorno de trabajo y el estilo visual global</p>
              </div>

              <div class="prefs-container grid-config">
                <ui-card variant="glass" class="prefs-card">
                   <div class="pref-header">
                     <lucide-icon name="palette" size="18"></lucide-icon>
                     <h3>Identidad de Marca</h3>
                   </div>
                   
                   <div class="form-group mt-4">
                     <span class="form-label">Color Primario del Sistema</span>
                     <div class="color-picker-grid">
                       @for (c of [{m: '#facc15', n: 'Amber'}, {m: '#f43f5e', n: 'Rose'}, {m: '#10b981', n: 'Emerald'}, {m: '#8b5cf6', n: 'Violet'}, {m: '#3b82f6', n: 'Blue'}, {m: '#0ea5e9', n: 'Sky'}]; track c.n) {
                         <button type="button" class="color-swatch-item" 
                              [class.active]="themeService.currentThemeData().primary === c.m"
                              (click)="themeService.updatePrimaryColor(c.m)"
                              [attr.aria-label]="'Seleccionar color ' + c.n">
                           <div class="color-swatch" [style.background]="c.m"></div>
                         </button>
                       }
                       <div class="custom-color-picker">
                         <input type="color" [value]="themeService.currentThemeData().primary" (input)="themeService.updatePrimaryColor($any($event.target).value)">
                       </div>
                     </div>
                     <p class="config-desc mt-2">Este color define el tono base de botones, estados y efectos de brillo en toda la aplicación.</p>
                   </div>

                   <hr class="divider">

                   <div class="form-group">
                    <ui-select
                      label="Idioma de Interfaz"
                      [options]="[
                        { value: 'es', label: 'Español (Castellano)' },
                        { value: 'en', label: 'English (US)' },
                        { value: 'fr', label: 'Français' }
                      ]"
                      [ngModel]="aiBotStore.language()"
                      (ngModelChange)="aiBotStore.language.set($event)"
                    ></ui-select>
                  </div>
                </ui-card>

                <ui-card variant="glass" class="prefs-card">
                  <div class="pref-header">
                     <lucide-icon name="layout" size="18"></lucide-icon>
                     <h3>Interfaz Despejada</h3>
                   </div>

                  <div class="pref-row mt-4">
                    <div class="pref-text">
                      <h4>Modo Compacto</h4>
                      <p>Reduce márgenes y tamaños de botones para ver más datos</p>
                    </div>
                    <div class="toggle-wrapper" 
                         tabindex="0"
                         role="checkbox"
                         [attr.aria-checked]="aiBotStore.compactMode()"
                         (click)="aiBotStore.compactMode.set(!aiBotStore.compactMode())" 
                         (keydown.enter)="aiBotStore.compactMode.set(!aiBotStore.compactMode())"
                         [class.active]="aiBotStore.compactMode()">
                      <div class="toggle-handle"></div>
                    </div>
                  </div>

                  <div class="pref-row">
                    <div class="pref-text">
                      <h4 class="premium-text">Luxe Experience (Global)</h4>
                      <p>Habilita trazado de rayos simulado y efectos cinematográficos avanzados</p>
                    </div>
                    <div class="toggle-wrapper premium" 
                         tabindex="0"
                         role="checkbox"
                         [attr.aria-checked]="premiumExperience()"
                         (click)="togglePremium()" 
                         (keydown.enter)="togglePremium()"
                         [class.active]="premiumExperience()">
                      <div class="toggle-handle"></div>
                    </div>
                  </div>
                </ui-card>
              </div>
            </section>
          }

          @if (activeTab() === 'plugins') {
            <section class="content-section animate-slide-up">
              <div class="section-title">
                <h2>Gestión de Módulos</h2>
                <p>Activa funcionalidades adicionales para tu organización</p>
              </div>

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
                      <ui-button
                        [variant]="
                          isPluginEnabled(plugin.id) ? 'outline' : 'filled'
                        "
                        size="sm"
                        (click)="togglePlugin(plugin.id)"
                      >
                        {{
                          isPluginEnabled(plugin.id) ? 'Desactivar' : 'Activar'
                        }}
                      </ui-button>
                    </div>
                  </ui-card>
                }
              </div>
            </section>
          }

          @if (activeTab() === 'ai') {
            <section class="content-section animate-slide-up">
              <div class="section-title">
                <h2>AI Assistant Hub</h2>
                <p>
                  Mascotas inteligentes con habilidades especializadas por
                  módulo
                </p>
              </div>

              <!-- NUEVO: Panel global de configuración del LLM - Rediseño Premium -->
              <ui-card variant="glass" class="ai-global-config-card mb-8">
                <div class="config-header">
                  <div class="config-title">
                    <div class="title-icon-wrapper">
                       <lucide-icon name="cpu" size="24"></lucide-icon>
                    </div>
                    <div>
                      <h3>Motor de Inferencia (LLM)</h3>
                      <p class="config-subtitle-text">Configura el núcleo de pensamiento de tus asistentes</p>
                    </div>
                  </div>
                  <ui-badge
                    [variant]="
                      aiBotStore.providerApiKey() ? 'success' : 'warning'
                    "
                    class="status-badge-premium"
                  >
                    <div class="status-dot" [class.online]="aiBotStore.providerApiKey()"></div>
                    {{
                      aiBotStore.providerApiKey()
                        ? 'NÚCLEO CONECTADO'
                        : 'SIN CREDENCIALES'
                    }}
                  </ui-badge>
                </div>

                <div class="config-body-wrapper">
                  <div class="config-body">
                    <div class="form-group">
                      <ui-select
                        label="Proveedor de IA Base"
                        [options]="aiBotStore.aiModelOptions()"
                        [ngModel]="aiBotStore.selectedModelId()"
                        (ngModelChange)="aiBotStore.setAIModel($event)"
                      ></ui-select>
                      <button
                        class="ollama-refresh-btn"
                        (click)="aiBotStore.checkOllamaAvailability(true)"
                      >
                        <lucide-icon name="refresh-cw" size="14"></lucide-icon>
                        ACTUALIZAR MODELOS OLLAMA
                      </button>
                    </div>

                    <div class="form-group">
                      <ui-select
                        label="Agente Principal Activo"
                        [options]="botOptions()"
                        [ngModel]="aiBotStore.activeBotFeature()"
                        (ngModelChange)="aiBotStore.activeBotFeature.set($event)"
                      ></ui-select>
                    </div>

                    @if (aiBotStore.needsApiKey()) {
                      <div class="form-group full-width">
                        <ui-input
                          label="Clave de Autenticación API (Token)"
                          type="password"
                          placeholder="Introduce tu token privado (ej. AIzaSy... o sk-...)"
                          hint="Este token se utiliza de forma segura para orquestar los agentes dentro del ERP."
                          [ngModel]="aiBotStore.providerApiKey()"
                          (ngModelChange)="aiBotStore.providerApiKey.set($event)"
                        ></ui-input>
                      </div>
                    }
                  </div>
                  
                <div class="config-visual-decoration">
                  @if (aiBotStore.getBotByFeature(aiBotStore.activeBotFeature()); as activeBot) {
                    <ui-mascot 
                      [type]="$any(activeBot.mascotType)" 
                      [color]="activeBot.color" 
                      [secondaryColor]="activeBot.secondaryColor"
                      [personality]="$any(activeBot.personality)"
                      [bodyShape]="$any(activeBot.bodyShape)"
                      [mouthType]="mascotMouthFor(activeBot)"
                      [eyesType]="$any(activeBot.eyesType)"
                      [rageMode]="aiBotStore.rageMode()"
                      [rageStyle]="$any(aiBotStore.rageStyle())"
                    ></ui-mascot>
                  }
                </div>
                </div>
              </ui-card>

              <div class="ai-grid">
                @for (bot of aiBotStore.bots(); track bot.id) {
                  <ui-card
                    variant="glass"
                    class="ai-bot-card"
                    [class.inactive]="bot.status === 'inactive'"
                  >
                    <div class="bot-visual">
                      <ui-mascot
                        [type]="$any(bot.mascotType)"
                        [color]="bot.color"
                        [secondaryColor]="bot.secondaryColor"
                        [personality]="$any(bot.personality)"
                        [bodyShape]="$any(bot.bodyShape)"
                        [eyesType]="$any(bot.eyesType)"
                        [mouthType]="$any(bot.mouthType)"
                      ></ui-mascot>
                    </div>

                    <div class="bot-info">
                      <div class="bot-header">
                        <div class="bot-name-edit">
                          <ui-input
                            [ngModel]="bot.name"
                            (ngModelChange)="
                              aiBotStore.updateBotName(bot.feature, $event)
                            "
                            size="sm"
                            placeholder="Nombre del Bot"
                          ></ui-input>
                        </div>
                        <div class="bot-labels">
                          @if (aiBotStore.activeBotFeature() === bot.feature) {
                            <ui-badge variant="success" class="mr-2"
                              >AGENTE PRINCIPAL</ui-badge
                            >
                          }
                          <ui-badge
                            [variant]="
                              bot.status === 'active' ? 'success' : 'neutral'
                            "
                          >
                            {{
                              bot.status === 'active'
                                ? 'SUSCRIPCIÓN ACTIVA'
                                : 'SaaS INACTIVO'
                            }}
                          </ui-badge>
                        </div>
                      </div>
                      <p class="bot-feature">{{ bot.feature }}</p>
                      <p class="bot-desc">{{ bot.description }}</p>

                      <!-- Personalidad y Estética -->
                      <div class="bot-meta-config row mb-4">
                        <ui-select
                          label="Mascota"
                          size="sm"
                          [options]="[
                            { value: 'inventory', label: 'Cubo Invernadero' },
                            { value: 'projects', label: 'Hexágono Proyectos' },
                            { value: 'budget', label: 'Cápsula Fiscal' },
                            { value: 'clients', label: 'Esfera Social' },
                            { value: 'fleet', label: 'Vehículo Drive' },
                            { value: 'rentals', label: 'Cubo Alquiler' },
                            { value: 'audit', label: 'Domo Auditor' },
                            { value: 'dashboard', label: 'Panel de Control' },
                            { value: 'universal', label: 'Droide Universal' },
                          ]"
                          [ngModel]="bot.mascotType"
                          (ngModelChange)="
                            aiBotStore.updateBotSkin(bot.feature, {
                              mascotType: $event,
                            })
                          "
                        ></ui-select>

                        <ui-select
                          label="Personalidad"
                          size="sm"
                          [options]="[
                            { value: 'tech', label: 'Tecnocrático' },
                            { value: 'worker', label: 'Productor' },
                            { value: 'happy', label: 'Optimista' },
                            { value: 'mystic', label: 'Místico/Oculto' },
                            { value: 'explorer', label: 'Explorador' },
                            { value: 'ninja', label: 'Sigiloso/Ninja' },
                          ]"
                          [ngModel]="bot.personality"
                          (ngModelChange)="
                            aiBotStore.updateBotSkin(bot.feature, {
                              personality: $event,
                            })
                          "
                        ></ui-select>

                        <ui-select
                          label="Forma del Cuerpo"
                          size="sm"
                          [options]="[
                            { value: 'round', label: 'Redonda' },
                            { value: 'square', label: 'Cuadrada' },
                            { value: 'capsule', label: 'Cápsula' },
                            { value: 'tri', label: 'Triangular' },
                            { value: 'mushroom-cap', label: 'Seta (Sombrero clásico)' },
                            { value: 'mushroom-full', label: 'Seta Completa' },
                            { value: 'mushroom-luminescent', label: 'Seta Bioluminiscente' },
                            { value: 'mushroom-morel', label: 'Seta Colmenilla (Morel)' },
                            { value: 'bonsai', label: 'Bonsái Zen (Pino)' },
                            { value: 'bonsai-sakura', label: 'Bonsái Sakura (Cerezo)' },
                            { value: 'bonsai-maple', label: 'Bonsái Maple (Arce Rojo)' },
                          ]"
                          [ngModel]="bot.bodyShape"
                          (ngModelChange)="
                            aiBotStore.updateBotSkin(bot.feature, {
                              bodyShape: $event,
                            })
                          "
                        ></ui-select>

                        <div class="form-group">
                          <label class="form-label" [attr.for]="'color-' + bot.feature">Color Principal</label>
                          <input
                            [id]="'color-' + bot.feature"
                            type="color"
                            class="color-input"
                            [value]="bot.color"
                            (input)="
                              aiBotStore.updateBotSkin(bot.feature, {
                                color: $any($event.target).value,
                              })
                            "
                          />
                        </div>

                        <div class="form-group">
                          <label class="form-label" [attr.for]="'secondary-color-' + bot.feature">Color Secundario</label>
                          <input
                            [id]="'secondary-color-' + bot.feature"
                            type="color"
                            class="color-input"
                            [value]="bot.secondaryColor"
                            (input)="
                              aiBotStore.updateBotSkin(bot.feature, {
                                secondaryColor: $any($event.target).value,
                              })
                            "
                          />
                        </div>
                      </div>

                      <div class="skills-list">
                        @for (skill of bot.activeSkills; track skill) {
                          <div class="skill-tag">
                            <lucide-icon
                              name="check-circle-2"
                              size="12"
                            ></lucide-icon>
                            <span>{{ skill }}</span>
                          </div>
                        }
                      </div>

                      <div class="bot-actions-row">
                        <ui-button
                          [variant]="
                            bot.status === 'active' ? 'outline' : 'filled'
                          "
                          size="sm"
                          (click)="aiBotStore.toggleBotStatus(bot.feature)"
                        >
                          {{
                            bot.status === 'active'
                              ? 'CANCELAR SaaS'
                              : 'ACTIVAR (SaaS)'
                          }}
                        </ui-button>

                        @if (bot.status === 'active') {
                          <ui-button
                            [variant]="
                              managingBotId() === bot.feature
                                ? 'filled'
                                : 'outline'
                            "
                            size="sm"
                            (click)="
                              managingBotId.set(
                                managingBotId() === bot.feature
                                  ? null
                                  : bot.feature
                              )
                            "
                          >
                            {{
                              managingBotId() === bot.feature
                                ? 'CERRAR PANEL'
                                : 'GESTIONAR SKILLS'
                            }}
                          </ui-button>

                          @if (aiBotStore.activeBotFeature() !== bot.feature) {
                            <ui-button
                              variant="outline"
                              size="sm"
                              (click)="
                                aiBotStore.activeBotFeature.set(bot.feature)
                              "
                            >
                              USAR COMO PRINCIPAL
                            </ui-button>
                          }
                        }
                      </div>

                      @if (managingBotId() === bot.feature) {
                        <div class="inline-skills-panel animate-slide-down">
                          <h4>Configuración de Habilidades Activas</h4>
                          <div class="skills-config-list">
                            @for (skill of bot.skills; track skill) {
                              <div class="skill-config-item">
                                <div class="skill-info">
                                  <span class="skill-name">{{ skill }}</span>
                                  <p class="skill-desc">
                                    Habilita esta capacidad de IA.
                                  </p>
                                </div>
                                <div
                                  class="toggle-wrapper"
                                  [class.active]="
                                    isSkillActive(bot.feature, skill)
                                  "
                                  (click)="
                                    aiBotStore.toggleSkill(bot.feature, skill)
                                  "
                                  (keydown.enter)="aiBotStore.toggleSkill(bot.feature, skill)"
                                  (keydown.space)="aiBotStore.toggleSkill(bot.feature, skill)"
                                  tabindex="0"
                                  role="switch"
                                  [attr.aria-checked]="isSkillActive(bot.feature, skill)"
                                  [attr.aria-label]="'Alternar ' + skill"
                                >
                                  <div class="toggle-handle"></div>
                                </div>
                              </div>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </ui-card>
                }
              </div>
            </section>
          }

          @if (activeTab() === 'buddy') {
            <section class="content-section animate-slide-up">
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
                        [type]="$any(pal.mascotType)"
                        [color]="pal.color"
                        [secondaryColor]="pal.secondaryColor"
                        [personality]="$any(pal.personality)"
                        [bodyShape]="$any(pal.bodyShape)"
                        [eyesType]="$any(pal.eyesType)"
                        [mouthType]="mascotMouthFor(pal)"
                        [rageMode]="aiBotStore.rageMode()"
                        [rageStyle]="$any(aiBotStore.rageStyle())"
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
                            <lucide-icon name="zap" size="14"></lucide-icon>
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
                                  $any($event.target).value
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
                                secondaryColor: $any($event.target).value,
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
              <div class="section-title">
                <h2>General</h2>
                <p>
                  Personaliza tu experiencia de usuario y el entorno de trabajo
                </p>
              </div>

              <div class="prefs-container grid-config">
                <ui-card variant="glass" class="prefs-card">
                  <h3 class="config-subtitle">
                    <lucide-icon name="globe" size="16"></lucide-icon> Idioma y
                    Localización
                  </h3>
                  <div class="form-group mb-4">
                    <ui-select
                      label="Idioma del Sistema"
                      [options]="[
                        { value: 'es', label: 'Español (Castellano)' },
                        { value: 'en', label: 'English (US)' },
                        { value: 'fr', label: 'Français' },
                      ]"
                      [ngModel]="aiBotStore.language()"
                      (ngModelChange)="aiBotStore.language.set($event)"
                    ></ui-select>
                  </div>
                </ui-card>

                <ui-card variant="glass" class="prefs-card">
                  <h3 class="config-subtitle">
                    <lucide-icon name="layout" size="16"></lucide-icon> Interfaz
                    y Diseño
                  </h3>
                  <div class="pref-row">
                    <div class="pref-text">
                      <h4>Modo Compacto</h4>
                      <p>
                        Reduce márgenes y tamaños de botones para ver más datos
                      </p>
                    </div>
                    <div
                      class="toggle-wrapper"
                      (click)="
                        aiBotStore.compactMode.set(!aiBotStore.compactMode())
                      "
                      (keydown.enter)="aiBotStore.compactMode.set(!aiBotStore.compactMode())"
                      (keydown.space)="aiBotStore.compactMode.set(!aiBotStore.compactMode())"
                      [class.active]="aiBotStore.compactMode()"
                      tabindex="0"
                      role="switch"
                      [attr.aria-checked]="aiBotStore.compactMode()"
                      aria-label="Modo compacto"
                    >
                      <div class="toggle-handle"></div>
                    </div>
                  </div>

                  <div class="pref-row">
                    <div class="pref-text">
                      <h4 class="premium-text">Luxe Experience</h4>
                      <p>
                        Efectos cinematográficos y trazado de rayos simulado
                      </p>
                    </div>
                    <div
                      class="toggle-wrapper premium"
                      (click)="togglePremium()"
                      (keydown.enter)="togglePremium()"
                      (keydown.space)="togglePremium()"
                      [class.active]="premiumExperience()"
                      tabindex="0"
                      role="switch"
                      [attr.aria-checked]="premiumExperience()"
                      aria-label="Experiencia premium"
                    >
                      <div class="toggle-handle"></div>
                    </div>
                  </div>
                </ui-card>
              </div>
            </section>
          }

          @if (activeTab() === 'notifications') {
            <section class="content-section animate-slide-up">
              <div class="section-title">
                <h2>Notificaciones</h2>
                <p>Gestiona cómo y cuándo quieres recibir avisos</p>
              </div>

              <ui-card variant="glass" class="prefs-card">
                <div class="pref-row">
                  <div class="pref-text">
                    <h4>Notificaciones Globales</h4>
                    <p>Habilitar el sistema de alertas de escritorio y push</p>
                  </div>
                  <div
                    class="toggle-wrapper"
                    (click)="
                      aiBotStore.notificationsEnabled.set(
                        !aiBotStore.notificationsEnabled()
                      )
                    "
                    (keydown.enter)="aiBotStore.notificationsEnabled.set(!aiBotStore.notificationsEnabled())"
                    (keydown.space)="aiBotStore.notificationsEnabled.set(!aiBotStore.notificationsEnabled())"
                    [class.active]="aiBotStore.notificationsEnabled()"
                    tabindex="0"
                    role="switch"
                    [attr.aria-checked]="aiBotStore.notificationsEnabled()"
                    aria-label="Notificaciones globales"
                  >
                    <div class="toggle-handle"></div>
                  </div>
                </div>

                <div class="pref-row">
                  <div class="pref-text">
                    <h4>Efectos de Sonido</h4>
                    <p>Alertas sonoras para interacciones de bot y eventos</p>
                  </div>
                  <div
                    class="toggle-wrapper"
                    (click)="
                      aiBotStore.soundEffects.set(!aiBotStore.soundEffects())
                    "
                    (keydown.enter)="aiBotStore.soundEffects.set(!aiBotStore.soundEffects())"
                    (keydown.space)="aiBotStore.soundEffects.set(!aiBotStore.soundEffects())"
                    [class.active]="aiBotStore.soundEffects()"
                    tabindex="0"
                    role="switch"
                    [attr.aria-checked]="aiBotStore.soundEffects()"
                    aria-label="Efectos de sonido"
                  >
                    <div class="toggle-handle"></div>
                  </div>
                </div>
              </ui-card>
            </section>
          }

          @if (activeTab() === 'security') {
            <section class="content-section animate-slide-up">
              <div class="section-title">
                <h2>Seguridad y Privacidad</h2>
                <p>Protege tus datos y configura el acceso seguro</p>
              </div>

              <div class="grid-config">
                <ui-card variant="glass" class="prefs-card">
                  <h3 class="config-subtitle">
                    <lucide-icon name="clock" size="16"></lucide-icon> Sesión
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
                    <lucide-icon name="trash2" size="16"></lucide-icon> Gestión
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

          @if (activeTab() === 'roles') {
            <section class="content-section roles-management animate-fade-in">
              <div class="roles-header-main">
                <div class="section-title">
                  <h2>Gestión de Roles y Permisos</h2>
                  <p>Define quién puede hacer qué en cada módulo del sistema</p>
                </div>
                <ui-button variant="filled" size="sm" (click)="createNewRole()">
                  <lucide-icon name="plus" size="16"></lucide-icon> Nuevo Rol
                </ui-button>
              </div>

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
                        <lucide-icon name="chevron-right" size="14" class="chevron"></lucide-icon>
                      </div>
                    }
                  </div>
                </div>

                <!-- Role Details & Matrix -->
                <div class="role-matrix-detail">
                  @if (selectedRole(); as role) {
                    <ui-card variant="glass" class="role-config-card">
                      <div class="role-config-header">
                        <div class="role-main-info">
                          <ui-input
                            label="Nombre del Rol"
                            [(ngModel)]="role.name"
                            (ngModelChange)="roles()"
                          ></ui-input>
                          <div class="role-actions-btns">
                            <ui-button variant="outline" size="sm" (click)="deleteRole(role.id)">
                              <lucide-icon name="trash-2" size="14"></lucide-icon> Eliminar Rol
                            </ui-button>
                          </div>
                        </div>
                        <p class="role-description-hint">Configura los permisos para el rol <strong>{{ role.name }}</strong></p>
                      </div>

                      <div class="permissions-matrix-container">
                        @for (category of ['Sistema', 'Identidad', 'CRM/Clientes', 'Inventario', 'Finanzas', 'Operaciones']; track category) {
                          <div class="permission-group">
                            <h4 class="category-title">{{ category }}</h4>
                            <div class="permission-items-grid">
                              @for (perm of permissionsCatalog; track perm.id) {
                                @if (perm.category === category) {
                                  <div 
                                    class="permission-toggle-box"
                                    [class.active]="isPermissionActive(role.id, perm.id)"
                                    (click)="togglePermission(role.id, perm.id)"
                                    (keydown.enter)="togglePermission(role.id, perm.id)"
                                    (keydown.space)="togglePermission(role.id, perm.id)"
                                    tabindex="0"
                                    role="switch"
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
                      </div>
                    </ui-card>
                  } @else {
                    <div class="no-role-selected">
                      <lucide-icon name="shield-alert" size="48" class="mb-4 opacity-20"></lucide-icon>
                      <p>Selecciona un rol para ver y editar sus permisos</p>
                    </div>
                  }
                </div>
              </div>
            </section>
          }

          @if (activeTab() === 'labs') {
            <section class="content-section animate-slide-up">
              <div class="section-title">
                <h2>Laboratorio Experimental</h2>
                <p>
                  Prueba funciones en desarrollo antes que nadie. Cuidado:
                  pueden ser inestables.
                </p>
              </div>

              <ui-card variant="glass" class="labs-card">
                <div class="labs-header">
                  <lucide-icon
                    name="flask-conical"
                    size="32"
                    class="labs-icon"
                  ></lucide-icon>
                  <div>
                    <h3 class="experimental-title">Josanz Genesis Engine</h3>
                    <p>Activa el motor de razonamiento autónomo profundo</p>
                  </div>
                </div>
                <div class="pref-row mt-4">
                  <div class="pref-text">
                    <h4>Habilitar Funciones Beta</h4>
                    <p>Permite el acceso a herramientas experimentales de IA</p>
                  </div>
                  <div
                    class="toggle-wrapper labs-toggle"
                    (click)="
                      aiBotStore.experimentalFeatures.set(
                        !aiBotStore.experimentalFeatures()
                      )
                    "
                    (keydown.enter)="aiBotStore.experimentalFeatures.set(!aiBotStore.experimentalFeatures())"
                    (keydown.space)="aiBotStore.experimentalFeatures.set(!aiBotStore.experimentalFeatures())"
                    [class.active]="aiBotStore.experimentalFeatures()"
                    tabindex="0"
                    role="switch"
                    [attr.aria-checked]="aiBotStore.experimentalFeatures()"
                    aria-label="Habilitar funciones beta"
                  >
                    <div class="toggle-handle"></div>
                  </div>
                </div>
              </ui-card>
            </section>
          }
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 0;
        height: 100%;
      }

      .settings-layout {
        display: grid;
        grid-template-columns: 280px 1fr;
        height: calc(100vh - 120px);
        gap: 2rem;
      }

      .settings-sidebar, .roles-selector-card {
        background: rgba(15,23,42,.4);
        backdrop-filter: blur(40px) saturate(180%);
        border: 1px solid rgba(255,255,255,.05);
        border-radius: 32px;
        display: flex;
        flex-direction: column;
        padding: 2.5rem 1.25rem;
        box-shadow: 10px 0 50px rgba(0,0,0,.2);
      }

      .sidebar-header {
        padding: 0 1rem 2rem 1rem;
      }

      .glow-text {
        font-size: 1.4rem;
        font-weight: 900;
        color: #fff;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        text-shadow: 0 0 15px var(--brand-glow);
      }

      .subtitle {
        font-size: 0.75rem;
        color: var(--brand);
        font-weight: 700;
        margin-top: 0.25rem;
        text-transform: uppercase;
        opacity: 0.8;
      }

      .settings-nav {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.85rem 1.25rem;
        border-radius: 12px;
        color: var(--text-muted);
        background: rgba(255, 255, 255, 0.02);
        font-size: 0.82rem;
        font-weight: 600;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        margin-bottom: 0.5rem;
        border: 1px solid rgba(255, 255, 255, 0.03);
        cursor: pointer;
        width: 100%;
        text-align: left;
      }

      .nav-item:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.07);
        border-color: rgba(255, 255, 255, 0.1);
        transform: translateX(4px);
      }

      .nav-item.active {
        color: #fff;
        background: linear-gradient(135deg, rgba(var(--brand-rgb), 0.2), rgba(var(--brand-rgb), 0.05));
        border-color: rgba(var(--brand-rgb), 0.3);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      }

      .nav-item.buddy-nav-item {
        margin-top: 1rem;
        border-top: 1px solid var(--border-soft);
        padding-top: 1.5rem;
      }

      .nav-item lucide-icon {
        opacity: 0.6;
      }

      .nav-item.active lucide-icon {
        opacity: 1;
      }

      .sidebar-footer {
        padding-top: 1rem;
        border-top: 1px solid var(--border-soft);
      }

      .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.7rem;
        color: var(--text-muted);
        padding: 0.5rem 1rem;
      }

      .nav-divider {
        padding: 1.5rem 1rem 0.5rem 1.25rem;
        font: 800 0.65rem/1 sans-serif;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.15em;
        opacity: 0.5;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }

      /* Content Area */
      .settings-content {
        overflow-y: auto;
        padding-right: 0.5rem;
        padding-bottom: 4rem;
      }

      .content-section {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .grid-config {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 1.5rem;
      }

      .config-subtitle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        font-weight: 700;
        color: #fff;
        margin-bottom: 1.5rem;
        opacity: 0.9;
      }

      .labs-card {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(217, 70, 239, 0.05));
        border: 1px solid rgba(139, 92, 246, 0.2);
      }

      .labs-header {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .labs-icon {
        color: #a78bfa;
        filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.4));
      }

      .experimental-title {
        font-weight: 800;
        font-size: 1.1rem;
        color: #fff;
        margin-bottom: 0.25rem;
      }

      .labs-toggle.active {
        background: #8b5cf6 !important;
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
      }

      .section-title h2 {
        font-size: 1.25rem;
        font-weight: 800;
        color: #fff;
        margin: 0;
      }

      .section-title p {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin: 0.4rem 0 0 0;
      }

      .ai-global-config-card {
        position: relative;
        overflow: hidden;
        border-radius: 28px;
        border: 1px solid rgba(255,255,255,.08);
        background: rgba(15,23,42,.7);
        transition: .4s ease;
        box-shadow: 0 20px 40px rgba(0,0,0,.3);
      }

      .ai-global-config-card:hover {
        border-color: rgba(var(--brand-rgb), .25) !important;
      }

      .title-icon-wrapper {
        width: 48px;
        height: 48px;
        background: rgba(var(--brand-rgb), 0.15);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(var(--brand-rgb), 0.25);
        box-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.05);
      }

      .config-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.75rem 2.5rem;
        background: rgba(255, 255, 255, 0.02);
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }

      .config-title {
        display: flex;
        align-items: center;
        gap: 1.25rem;
      }

      .config-title lucide-icon {
        color: var(--brand);
        filter: drop-shadow(0 0 10px rgba(var(--brand-rgb), 0.6));
      }

      .config-title h3 {
        font-size: 1.2rem;
        font-weight: 800;
        color: #fff;
        margin: 0;
        letter-spacing: -0.01em;
      }

      .config-subtitle-text {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin: 0.15rem 0 0 0;
        font-weight: 600;
        letter-spacing: 0.01em;
        opacity: 0.7;
      }

      .status-badge-premium {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.65rem 1.25rem !important;
        border-radius: 99px !important;
        font-weight: 900 !important;
        letter-spacing: 0.08em !important;
        font-size: 0.62rem !important;
        background: rgba(0, 0, 0, 0.3) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ef4444;
        box-shadow: 0 0 12px #ef4444;
      }

      .status-dot.online {
        background: #10b981;
        box-shadow: 0 0 12px #10b981;
        animation: status-pulse-green 2s infinite;
      }

      @keyframes status-pulse-green {
        0%, 100% { opacity: 0.8; }
        50% { opacity: 1; box-shadow: 0 0 15px #10b981; }
      }

      .config-body-wrapper {
        display: flex;
        gap: 2.5rem;
        padding: 2.5rem;
        align-items: flex-start;
      }

      .config-body {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 2rem;
      }

      .config-body .full-width {
        grid-column: 1 / -1;
      }

      .config-visual-decoration {
        flex-shrink: 0;
        width: 180px;
        height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .config-visual-decoration::after {
        content: '';
        position: absolute;
        width: 140px;
        height: 140px;
        background: var(--brand);
        filter: blur(60px);
        opacity: 0.15;
        border-radius: 50%;
        z-index: 0;
      }

      .config-visual-decoration ui-mascot {
        z-index: 1;
        transform: scale(1.6);
        filter: drop-shadow(0 20px 40px rgba(0,0,0,0.6));
        animation: float-mascot-premium 6s ease-in-out infinite;
      }

      @keyframes float-mascot-premium {
        0%, 100% { transform: scale(1.6) translateY(0); }
        50% { transform: scale(1.6) translateY(-15px); }
      }

      .ollama-refresh-btn {
        margin-top: 1rem;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-muted);
        padding: 0.5rem 1rem;
        border-radius: 10px;
        font-size: 0.68rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .ollama-refresh-btn:hover {
        background: rgba(var(--brand-rgb), 0.15);
        color: var(--brand);
        border-color: rgba(var(--brand-rgb), 0.3);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      }

      .companion-toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1.25rem;
        margin-bottom: 0.25rem;
      }

      .companion-subtabs {
        display: inline-flex;
        padding: 4px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.08);
        gap: 4px;
      }

      .companion-subtab {
        border: none;
        background: transparent;
        color: var(--text-muted);
        padding: 0.55rem 1.1rem;
        border-radius: 10px;
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        cursor: pointer;
        transition:
          color 0.2s ease,
          background 0.2s ease,
          box-shadow 0.2s ease;
      }

      .companion-subtab:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.04);
      }

      .companion-subtab.active {
        background: rgba(var(--brand-rgb, 16, 185, 129), 0.28);
        color: #fff;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
      }

      .companion-context-block {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.5rem;
        text-align: right;
        max-width: min(100%, 440px);
      }

      .primary-agent-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.68rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        padding: 0.4rem 0.85rem;
        border-radius: 99px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-muted);
      }

      .companion-context-hint {
        font-size: 0.72rem;
        color: var(--text-muted);
        line-height: 1.45;
        margin: 0;
      }

      .companion-form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 0 1rem;
      }

      .companion-secondary-row {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      /* Plugin Grid */
      .plugin-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.25rem;
      }

      .plugin-card {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        height: 100%;
      }

      .plugin-header {
        display: flex;
        gap: 1.25rem;
        align-items: center;
      }

      .plugin-icon {
        width: 54px;
        height: 54px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-soft);
        box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2);
      }

      .header-text h3 {
        font-size: 1rem;
        font-weight: 700;
        color: #fff;
        margin: 0;
      }

      .category-tag {
        font: 800 0.65rem/1 sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--brand);
        opacity: 0.7;
      }

      .plugin-desc {
        font-size: 0.8rem;
        color: var(--text-muted);
        line-height: 1.5;
        margin: 0;
        flex: 1;
      }

      .bot-actions-row {
        display: flex;
        gap: 1rem;
        margin-top: auto;
      }

      .bot-actions-row ui-button {
        flex: 1;
      }

      /* Inline Skills Panel */
      .inline-skills-panel {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-soft);
      }

      .inline-skills-panel h4 {
        font-size: 0.95rem;
        font-weight: 700;
        color: #fff;
        margin: 0 0 1rem 0;
      }

      .skills-config-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 0.75rem;
        margin-bottom: 2rem;
        min-height: 250px; /* Preserve space for skills config */
        align-content: start;
      }

      .skill-config-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.25rem;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        transition: all 0.3s ease;
      }

      .skill-config-item:hover {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(var(--brand-rgb, 16, 185, 129), 0.2);
      }

      .skill-name {
        font-size: 0.9rem;
        font-weight: 800;
        color: #fff;
        display: block;
        letter-spacing: -0.01em;
      }
      .skill-desc {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin: 0.3rem 0 0 0;
        font-weight: 500;
      }

      .ai-grid {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
        padding-bottom: 2rem;
      }

      .ai-bot-card {
        display: flex;
        gap: 2rem;
        padding: 2rem;
        transition: .4s ease;
        border: 1px solid rgba(255,255,255,.05);
        background: rgba(255,255,255,.01);
      }

      .ai-bot-card:hover {
        transform: translateY(-4px);
        border-color: rgba(var(--brand-rgb), 0.3);
      }

      .bot-visual {
        flex-shrink: 0;
        width: 120px;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 20px;
        position: relative;
      }

      .bot-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }

      .bot-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
        margin-bottom: 0.75rem;
      }

      .bot-info h3 {
        font-size: 1.15rem;
        font-weight: 800;
        color: #fff;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .bot-labels {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .mr-2 {
        margin-right: 0.5rem;
      }
      .mb-6 {
        margin-bottom: 1.5rem;
      }
      .mb-4 {
        margin-bottom: 1rem;
      }
      .flex-1 {
        flex: 1;
      }
      .mt-6 {
        margin-top: 1.5rem;
      }
      .mt-4 {
        margin-top: 1rem;
      }

      .bot-feature {
        font-size: 0.75rem;
        color: var(--brand);
        font-weight: 900;
        margin-bottom: 1.25rem;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        opacity: 0.9;
      }

      .bot-desc {
        font-size: 0.85rem;
        color: var(--text-muted);
        line-height: 1.6;
        margin-bottom: 1.5rem;
      }

      .skills-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-bottom: 2rem;
        height: 110px; /* Fixed height for summary area */
        overflow-y: auto;
        align-content: flex-start;
        padding-right: 0.5rem;
      }

      .skills-list::-webkit-scrollbar {
        width: 4px;
      }
      .skills-list::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
      }

      .skill-tag {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(var(--brand-rgb, 126, 34, 206), 0.1);
        padding: 0.5rem 1rem;
        border-radius: 100px;
        font-size: 0.75rem;
        color: var(--brand);
        border: 1px solid rgba(var(--brand-rgb, 126, 34, 206), 0.2);
        font-weight: 800;
        backdrop-filter: blur(4px);
        transition: all 0.3s ease;
      }

      .skill-tag lucide-icon {
        color: inherit;
        opacity: 1;
      }

      /* Prefs */
      .prefs-card {
        padding: 1rem 2rem;
      }
      .pref-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem 0;
      }
      .pref-row:not(:last-child) {
        border-bottom: 1px solid var(--border-soft);
      }

      .pref-text h4 {
        font-size: 0.95rem;
        font-weight: 700;
        color: #fff;
        margin: 0;
      }
      .pref-text p {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin: 0.25rem 0 0 0;
      }

      /* Enhanced Toggles */
      .toggle-wrapper {
        width: 50px;
        height: 26px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 100px;
        position: relative;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .toggle-handle {
        position: absolute;
        top: 4px;
        left: 4px;
        width: 16px;
        height: 16px;
        background: #fff;
        border-radius: 50%;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .toggle-wrapper.active {
        background: var(--brand);
        border-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 0 15px rgba(var(--brand-rgb, 16, 185, 129), 0.4);
      }
      .toggle-wrapper.active .toggle-handle {
        left: 28px;
        transform: scale(1.1);
      }
      .toggle-wrapper.active.premium {
        background: #facc15;
      }

      .premium-text {
        color: #facc15 !important;
      }

      /* Buddy Customizer */
      .buddy-customizer {
        display: grid;
        grid-template-columns: 350px 1fr;
        gap: 2rem;
        align-items: start;
      }

      .buddy-preview-card {
        position: relative;
        height: 350px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle, rgba(var(--brand-rgb), 0.1), transparent);
        overflow: hidden;
      }

      .preview-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 200px;
        height: 200px;
        background: var(--brand);
        opacity: 0.15;
        filter: blur(40px);
        border-radius: 50%;
      }

      .buddy-preview-card ui-mascot {
        width: 180px;
        height: 180px;
        transform: scale(1.5);
      }

      .buddy-options-card,
      .buddy-skills-card {
        padding: 1.5rem;
        min-height: 320px;
      }

      .buddy-options-card h3,
      .buddy-skills-card h3 {
        font-size: 1.1rem;
        font-weight: 800;
        margin: 0 0 1.5rem 0;
        color: #fff;
      }

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
        width: 60px;
        height: 40px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background: rgba(15, 23, 42, 0.6);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .color-input:hover {
        border-color: rgba(255, 255, 255, 0.3);
        transform: scale(1.05);
      }

      .color-input:focus {
        outline: none;
        border-color: var(--brand);
        box-shadow: 0 0 0 3px rgba(var(--brand-rgb), 0.3);
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
        width: 36px;
        height: 36px;
        border-radius: 50%;
        padding: 3px;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .color-swatch-item.active {
        border-color: #fff;
        transform: scale(1.1);
      }

      .color-swatch {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
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
        margin-bottom: 2rem;
      }

      .roles-layout-grid {
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 2rem;
        height: calc(100vh - 280px);
        min-height: 600px;
      }

      .roles-selector-card {
        background: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(40px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 28px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      }

      .selector-header {
        padding: 1.5rem;
        font-weight: 900;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: var(--brand);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        background: linear-gradient(to right, rgba(var(--brand-rgb), 0.08), transparent);
      }

      .roles-list-scroll {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .role-item-btn {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        padding: 1.25rem;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: 1px solid rgba(255, 255, 255, 0.02);
        background: rgba(255, 255, 255, 0.01);
        position: relative;
        overflow: hidden;
      }

      .role-item-btn::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(var(--brand-rgb), 0.1), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .role-item-btn:hover {
        background: rgba(255, 255, 255, 0.04);
        transform: translateY(-2px) translateX(4px);
        border-color: rgba(255, 255, 255, 0.08);
      }

      .role-item-btn.active {
        background: rgba(var(--brand-rgb), 0.12);
        border-color: rgba(var(--brand-rgb), 0.4);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      }

      .role-item-btn.active::before {
        opacity: 1;
      }

      .role-icon-indicator {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        flex-shrink: 0;
        position: relative;
        z-index: 1;
      }

      .role-icon-indicator::after {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        background: currentColor;
        opacity: 0.2;
        filter: blur(6px);
      }

      .role-icon-indicator.SUPERADMIN { color: #facc15; }
      .role-icon-indicator.ADMIN { color: #3b82f6; }
      .role-icon-indicator.RESPONSIBLE { color: #10b981; }
      .role-icon-indicator.USER { color: #94a3b8; }

      .role-label-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        position: relative;
        z-index: 1;
      }

      .role-name-text {
        font-weight: 800;
        font-size: 0.95rem;
        color: #fff;
        letter-spacing: -0.01em;
      }

      .role-type-pill {
        font-size: 0.62rem;
        font-weight: 900;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.12em;
        opacity: 0.7;
      }

      .role-item-btn .chevron {
        opacity: 0.3;
        transition: all 0.3s ease;
        color: #fff;
        position: relative;
        z-index: 1;
      }
      .role-item-btn.active .chevron {
        opacity: 1;
        transform: translateX(4px);
        color: var(--brand);
      }

      .role-matrix-detail {
        overflow-y: auto;
        padding-right: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .role-config-card {
        padding: 0;
        overflow: visible;
      }

      .role-config-header {
        padding: 2.5rem;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0.02), transparent);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .role-main-info {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 3rem;
        margin-bottom: 0.75rem;
      }

      .role-actions-btns {
        display: flex;
        gap: 1rem;
      }

      .role-description-hint {
        font-size: 0.88rem;
        color: var(--text-muted);
        opacity: 0.8;
      }

      .permissions-matrix-container {
        padding: 2.5rem;
        display: flex;
        flex-direction: column;
        gap: 3.5rem;
      }

      .category-title {
        font-size: 1.25rem;
        font-weight: 900;
        color: #fff;
        margin-bottom: 1.75rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        letter-spacing: -0.02em;
      }

      .category-title::before {
        content: '';
        width: 6px;
        height: 24px;
        background: linear-gradient(to bottom, var(--brand), transparent);
        border-radius: 3px;
        box-shadow: 0 0 15px var(--brand-glow);
      }

      .permission-items-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.25rem;
      }

      .permission-toggle-box {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.04);
        border-radius: 22px;
        padding: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }

      .permission-toggle-box::after {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--brand);
        opacity: 0;
        transition: opacity 0.4s ease;
        z-index: 0;
      }

      .permission-toggle-box:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.1);
        transform: translateY(-4px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }

      .permission-toggle-box.active {
        background: rgba(var(--brand-rgb), 0.04);
        border-color: rgba(var(--brand-rgb), 0.3);
      }

      .permission-toggle-box.active::after {
        opacity: 0.03;
      }

      .toggle-info {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        position: relative;
        z-index: 1;
      }

      .perm-label {
        font-weight: 800;
        font-size: 0.92rem;
        color: #fff;
        letter-spacing: -0.01em;
      }

      .perm-id {
        font-size: 0.65rem;
        font-family: 'JetBrains Mono', monospace;
        color: var(--brand);
        opacity: 0.6;
        letter-spacing: 0.02em;
      }

      .toggle-ui {
        width: 52px;
        height: 28px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 99px;
        position: relative;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: 1px solid rgba(255, 255, 255, 0.05);
        z-index: 1;
      }

      .permission-toggle-box.active {
        background: var(--brand);
        border-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 0 20px rgba(var(--brand-rgb), 0.4);
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsFeatureComponent {
  private readonly _pluginStore = inject(PluginStore);
  public readonly aiBotStore = inject(AIBotStore);
  public readonly themeService = inject(ThemeService);
  private readonly _rolesService = inject(RolesService);
  public readonly _authStore = inject(AuthStore);

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
  readonly permissionsCatalog = PERMISSIONS_CATALOG;
  readonly isLoadingRoles = signal(false);

  constructor() {
    effect(async () => {
      if (this.activeTab() === 'roles') {
        await this.loadRoles();
      }
    });
    
    // Save stored companion choice
    effect(() => {
      localStorage.setItem(
        SettingsFeatureComponent.COMPANION_EDITOR_STORAGE_KEY,
        this.companionEditorFeature()
      );
    });
  }

  async loadRoles() {
    this.isLoadingRoles.set(true);
    try {
      this._rolesService.findAll().subscribe((roles: Role[]) => {
        this.roles.set(roles);
        if (roles.length > 0 && !this.selectedRoleId()) {
          this.selectedRoleId.set(roles[0].id);
        }
        this.isLoadingRoles.set(false);
      });
    } catch (err: unknown) {
      this.isLoadingRoles.set(false);
      console.error('Error loading roles:', err);
    }
  }

  togglePermission(roleId: string, permissionId: string) {
    const role = this.roles().find((r: Role) => r.id === roleId);
    if (!role) return;

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
        const allPerms = this.permissionsCatalog
          .map(p => p.id)
          .filter(id => id !== '*' && id !== permissionId);
        permissions = allPerms;
      } else {
        if (permissions.includes(permissionId)) {
          permissions = permissions.filter((p: string) => p !== permissionId);
        } else {
          permissions.push(permissionId);
        }
      }
    }

    this._rolesService.update(roleId, { permissions }).subscribe((updated: Role) => {
      this.roles.update(list => list.map(r => r.id === roleId ? updated : r));
      // Sincronizar permisos localmente si el rol actualizado afecta al usuario actual
      this._authStore.refreshSession();
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
    
    this._rolesService.create({ 
      name, 
      type: RoleType.USER, 
      permissions: [] 
    }).subscribe((newRole: Role) => {
      this.roles.update(list => [...list, newRole]);
      this.selectedRoleId.set(newRole.id);
    });
  }

  async deleteRole(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este rol?')) return;
    
    this._rolesService.delete(id).subscribe(() => {
      this.roles.update(list => list.filter(r => r.id !== id));
      if (this.selectedRoleId() === id) {
        this.selectedRoleId.set(this.roles()[0]?.id || null);
      }
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
  mascotMouthFor(bot: AIBot): 'smile' | 'line' | 'o' | 'mean' {
    switch (bot.mouthType) {
      case 'smile':
      case 'line':
      case 'o':
        return bot.mouthType;
      case 'grin':
        return 'smile';
      case 'none':
        return 'line';
      default:
        return 'line';
    }
  }

  isPluginEnabled(id: string) {
    return this.enabledPlugins().includes(id);
  }

  togglePlugin(id: string) {
    this._pluginStore.togglePlugin(id);
  }

  toggleRealtime() {
    this._pluginStore.toggleRealtime();
  }

  togglePremium() {
    this._pluginStore.togglePerformance();
  }

}
