import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  effect,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Puzzle,
  Sliders,
  Bot,
  Shield,
  CheckCircle2,
  X,
  Cpu,
  Smile,
  Zap,
  Bell,
  Lock,
  FlaskConical,
  Globe,
  Volume2,
  Layout,
  Clock,
  Trash2,
  RefreshCw,
} from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UIMascotComponent,
  UiBadgeComponent,
  UiInputComponent,
  UiSelectComponent,
} from '@josanz-erp/shared-ui-kit';
import { PluginStore, AIBotStore, type AIBot } from '@josanz-erp/shared-data-access';
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
              [class.active]="activeTab() === 'general'"
              (click)="activeTab.set('general')"
            >
              <lucide-icon name="sliders-horizontal" size="18"></lucide-icon>
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

              <!-- NUEVO: Panel global de configuración del LLM -->
              <ui-card variant="glass" class="ai-global-config-card mb-6">
                <div class="config-header">
                  <div class="config-title">
                    <lucide-icon name="cpu" size="20"></lucide-icon>
                    <h3>Motor de Inferencia (LLM)</h3>
                  </div>
                  <ui-badge
                    [variant]="
                      aiBotStore.providerApiKey() ? 'success' : 'warning'
                    "
                  >
                    {{
                      aiBotStore.providerApiKey()
                        ? 'Conectado a la Nube'
                        : 'Falta API Key'
                    }}
                  </ui-badge>
                </div>

                <div class="config-body">
                  <div class="form-group mb-4">
                    <ui-select
                      label="Proveedor de IA Base"
                      [options]="aiBotStore.aiModelOptions()"
                      [ngModel]="aiBotStore.selectedModelId()"
                      (ngModelChange)="aiBotStore.setAIModel($event)"
                    ></ui-select>
                    <button
                      class="mt-2 text-xs text-muted hover:text-brand transition-colors flex items-center gap-1"
                      (click)="aiBotStore.checkOllamaAvailability(true)"
                      style="background: none; border: none; cursor: pointer; padding: 0;"
                    >
                      <lucide-icon name="refresh-cw" size="12"></lucide-icon>
                      ACTUALIZAR MODELOS OLLAMA
                    </button>
                  </div>

                  <div class="form-group mb-4">
                    <ui-select
                      label="Agente Principal Activo"
                      [options]="botOptions()"
                      [ngModel]="aiBotStore.activeBotFeature()"
                      (ngModelChange)="aiBotStore.activeBotFeature.set($event)"
                    ></ui-select>
                  </div>

                  @if (aiBotStore.needsApiKey()) {
                    <div class="form-group">
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
                            { value: 'mushroom-cap', label: 'Seta (Sombrero)' },
                            { value: 'mushroom-full', label: 'Seta Completa' },
                          ]"
                          [ngModel]="bot.bodyShape"
                          (ngModelChange)="
                            aiBotStore.updateBotSkin(bot.feature, {
                              bodyShape: $event,
                            })
                          "
                        ></ui-select>

                        <div class="form-group">
                          <label class="form-label">Color Principal</label>
                          <input
                            type="color"
                            class="color-input"
                            [value]="bot.color"
                            (input)="
                              aiBotStore.updateBotSkin(bot.feature, {
                                color: $event.target.value,
                              })
                            "
                          />
                        </div>

                        <div class="form-group">
                          <label class="form-label">Color Secundario</label>
                          <input
                            type="color"
                            class="color-input"
                            [value]="bot.secondaryColor"
                            (input)="
                              aiBotStore.updateBotSkin(bot.feature, {
                                secondaryColor: $event.target.value,
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
                          <label class="form-label">Color principal</label>
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
                              >
                                <div
                                  class="color-swatch"
                                  [style.background]="c.m"
                                ></div>
                              </div>
                            }
                          </div>
                        </div>

                        <div class="form-group mb-4 companion-secondary-row">
                          <label class="form-label">Color secundario (sombra)</label>
                          <input
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
                                label: 'Seta (sombrero)',
                              },
                              {
                                value: 'mushroom-full',
                                label: 'Seta completa',
                              },
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
                          <label class="form-label">Reglas (texto libre)</label>
                          <textarea
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
                          <label class="form-label"
                            >Instrucciones de sistema adicionales</label
                          >
                          <textarea
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
                            <label class="form-label mb-0"
                              >Prompts por comportamiento</label
                            >
                            <ui-button
                              variant="outline"
                              size="sm"
                              (click)="
                                aiBotStore.addUserAgentPromptPreset(
                                  'dashboard'
                                )
                              "
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
                      [class.active]="aiBotStore.compactMode()"
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
                      [class.active]="premiumExperience()"
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
                    [class.active]="aiBotStore.notificationsEnabled()"
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
                    [class.active]="aiBotStore.soundEffects()"
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
                      [class.active]="aiBotStore.autoArchive()"
                    >
                      <div class="toggle-handle"></div>
                    </div>
                  </div>
                </ui-card>
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
                    [class.active]="aiBotStore.experimentalFeatures()"
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

      /* Sidebar */
      .settings-sidebar {
        background: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(40px) saturate(180%);
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 32px;
        display: flex;
        flex-direction: column;
        padding: 2.5rem 1.25rem;
        box-shadow: 10px 0 50px rgba(0, 0, 0, 0.2);
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
        padding: 1rem 1.25rem;
        border-radius: 16px;
        color: var(--text-muted);
        font-size: 0.9rem;
        font-weight: 600;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        margin-bottom: 0.25rem;
        border: 1px solid transparent;
      }

      .nav-item:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.05);
      }

      .nav-item.active {
        color: #fff;
        background: linear-gradient(
          135deg,
          rgba(var(--brand-rgb, 16, 185, 129), 0.2) 0%,
          rgba(var(--brand-rgb, 16, 185, 129), 0.05) 100%
        );
        border-color: rgba(var(--brand-rgb, 16, 185, 129), 0.3);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      }

      .nav-item.buddy-nav-item {
        margin-top: 1rem;
        border-top: 1px solid var(--border-soft);
        padding-top: 1.5rem;
        border-radius: 0 0 16px 16px;
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
        font-size: 0.65rem;
        font-weight: 800;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.15em;
        opacity: 0.5;
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
        background: linear-gradient(
          135deg,
          rgba(139, 92, 246, 0.1) 0%,
          rgba(217, 70, 239, 0.05) 100%
        );
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
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--brand);
        font-weight: 800;
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
        flex-direction: row;
        gap: 2rem;
        padding: 2.25rem;
        align-items: stretch;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: 1px solid rgba(255, 255, 255, 0.05);
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.02) 0%,
          rgba(255, 255, 255, 0.01) 100%
        );
        min-height: 620px; /* Increased and fixed to accommodate standard management panel */
      }

      .ai-bot-card:hover {
        transform: translateY(-8px) scale(1.01);
        border-color: rgba(var(--brand-rgb, 16, 185, 129), 0.3);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
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
        background: radial-gradient(
          circle at 50% 50%,
          rgba(var(--brand-rgb), 0.1),
          transparent
        );
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
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
        background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%);
        box-shadow:
          0 0 25px rgba(220, 38, 38, 0.5),
          inset 0 0 10px rgba(255, 255, 255, 0.2);
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
        border: 2px solid #dc2626 !important;
        box-shadow:
          0 0 40px rgba(220, 38, 38, 0.2),
          inset 0 0 20px rgba(220, 38, 38, 0.1) !important;
        background: radial-gradient(
          circle at 50% 50%,
          rgba(220, 38, 38, 0.2),
          transparent
        ) !important;
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsFeatureComponent implements OnInit {
  private readonly _pluginStore = inject(PluginStore);
  public readonly aiBotStore = inject(AIBotStore);

  readonly activeTab = signal<
    | 'general'
    | 'ai'
    | 'buddy'
    | 'plugins'
    | 'notifications'
    | 'security'
    | 'labs'
  >('general');
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
  public readonly premiumExperience = this._pluginStore.premiumExperience;
  public readonly enabledPlugins = this._pluginStore.enabledPlugins;

  readonly plugins: PluginDescriptor[] = [
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
      id: 'verifactu',
      name: 'VeriFactu Compliance',
      icon: 'file-check',
      description: 'Integración mandatoria con la AEAT.',
      category: 'vertical',
    },
  ];

  readonly botOptions = computed(() =>
    this.aiBotStore.bots().map((bot) => ({
      value: bot.feature,
      label: `${bot.name} (${bot.feature})`,
    })),
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
  ngOnInit() {
    // No realizamos auto-detección al inicio para evitar ruidos en consola si Ollama no está activo.
    // El usuario puede usar el botón de 'Actualizar' si desea escanear modelos locales.
  }

  constructor() {
    effect(() => {
      localStorage.setItem(
        SettingsFeatureComponent.COMPANION_EDITOR_STORAGE_KEY,
        this.companionEditorFeature(),
      );
    });
  }
}
