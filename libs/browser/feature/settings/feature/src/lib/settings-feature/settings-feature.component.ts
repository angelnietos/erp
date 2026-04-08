import { ChangeDetectionStrategy, Component, inject, signal, effect, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Puzzle, Sliders, Bot, Shield, CheckCircle2, X, Cpu, Smile, Zap } from 'lucide-angular';
import { UiCardComponent, UiButtonComponent, UIMascotComponent, UiBadgeComponent, UiInputComponent, UiSelectComponent } from '@josanz-erp/shared-ui-kit';
import { PluginStore, AIBotStore } from '@josanz-erp/shared-data-access';
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
    UiSelectComponent
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
              [class.active]="activeTab() === 'plugins'"
              (click)="activeTab.set('plugins')"
            >
              <lucide-icon name="puzzle" size="18"></lucide-icon>
              <span>Módulos & Plugins</span>
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
              class="nav-item buddy-nav-item" 
              [class.active]="activeTab() === 'buddy'"
              (click)="activeTab.set('buddy')"
            >
              <lucide-icon name="smile" size="18"></lucide-icon>
              <span>{{ aiBotStore.getBotDisplayName(aiBotStore.activeBotFeature()) }}</span>
            </button>
            <button 
              class="nav-item" 
              [class.active]="activeTab() === 'preferences'"
              (click)="activeTab.set('preferences')"
            >
              <lucide-icon name="sliders" size="18"></lucide-icon>
              <span>Preferencias</span>
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
                  <ui-josanz-card variant="glass" class="plugin-card" [class.disabled]="!isPluginEnabled(plugin.id)">
                    <div class="plugin-header">
                      <div class="plugin-icon" [style.color]="isPluginEnabled(plugin.id) ? 'var(--brand)' : '#64748b'">
                        <lucide-icon [name]="plugin.icon" size="24"></lucide-icon>
                      </div>
                      <div class="header-text">
                        <h3>{{ plugin.name }}</h3>
                        <span class="category-tag">{{ plugin.category }}</span>
                      </div>
                    </div>
                    
                    <p class="plugin-desc">{{ plugin.description }}</p>
                    
                    <div class="plugin-footer">
                      <ui-josanz-badge [variant]="isPluginEnabled(plugin.id) ? 'success' : 'neutral'">
                        {{ isPluginEnabled(plugin.id) ? 'Activo' : 'Inactivo' }}
                      </ui-josanz-badge>
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
          }

          @if (activeTab() === 'ai') {
            <section class="content-section animate-slide-up">
              <div class="section-title">
                <h2>AI Assistant Hub</h2>
                <p>Mascotas inteligentes con habilidades especializadas por módulo</p>
              </div>

              <!-- NUEVO: Panel global de configuración del LLM -->
              <ui-josanz-card variant="glass" class="ai-global-config-card mb-6">
                <div class="config-header">
                  <div class="config-title">
                    <lucide-icon name="cpu" size="20"></lucide-icon>
                    <h3>Motor de Inferencia (LLM)</h3>
                  </div>
                  <ui-josanz-badge [variant]="aiBotStore.providerApiKey() ? 'success' : 'warning'">
                    {{ aiBotStore.providerApiKey() ? 'Conectado a la Nube' : 'Falta API Key' }}
                  </ui-josanz-badge>
                </div>
                
                <div class="config-body">
                  <div class="form-group mb-4">
                    <ui-josanz-select
                      label="Proveedor de IA Base"
                      [options]="aiBotStore.aiModelOptions()"
                      [ngModel]="aiBotStore.selectedModelId()"
                      (ngModelChange)="aiBotStore.setAIModel($event)"
                    ></ui-josanz-select>
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
                    <ui-josanz-select
                      label="Agente Principal Activo"
                      [options]="botOptions()"
                      [ngModel]="aiBotStore.activeBotFeature()"
                      (ngModelChange)="aiBotStore.activeBotFeature.set($event)"
                    ></ui-josanz-select>
                  </div>
                  
                  <div class="form-group">
                    <ui-josanz-input
                      label="Clave de Autenticación API (Token)"
                      type="password"
                      placeholder="Introduce tu token privado (ej. AIzaSy... o sk-...)"
                      hint="Este token se utiliza de forma segura para orquestar los agentes dentro del ERP."
                      [ngModel]="aiBotStore.providerApiKey()"
                      (ngModelChange)="aiBotStore.providerApiKey.set($event)"
                    ></ui-josanz-input>
                  </div>
                </div>
              </ui-josanz-card>

              <div class="ai-grid">
                @for (bot of aiBotStore.bots(); track bot.id) {
                  <ui-josanz-card variant="glass" class="ai-bot-card" [class.inactive]="bot.status === 'inactive'">
                    <div class="bot-visual">
                      <ui-josanz-mascot [type]="$any(bot.mascotType)" [color]="bot.color" [personality]="$any(bot.personality)" [bodyShape]="$any(bot.bodyShape)" [eyesType]="$any(bot.eyesType)" [mouthType]="$any(bot.mouthType)"></ui-josanz-mascot>
                    </div>
                    
                    <div class="bot-info">
                      <div class="bot-header">
                        <div class="bot-name-edit">
                          <ui-josanz-input
                            [ngModel]="bot.name"
                            (ngModelChange)="aiBotStore.updateBotName(bot.feature, $event)"
                            size="sm"
                            placeholder="Nombre del Bot"
                          ></ui-josanz-input>
                        </div>
                        <div class="bot-labels">
                          @if (aiBotStore.activeBotFeature() === bot.feature) {
                            <ui-josanz-badge variant="success" class="mr-2">AGENTE PRINCIPAL</ui-josanz-badge>
                          }
                          <ui-josanz-badge [variant]="bot.status === 'active' ? 'success' : 'neutral'">
                            {{ bot.status === 'active' ? 'SUSCRIPCIÓN ACTIVA' : 'SaaS INACTIVO' }}
                          </ui-josanz-badge>
                        </div>
                      </div>
                      <p class="bot-feature">{{ bot.feature }}</p>
                      <p class="bot-desc">{{ bot.description }}</p>
                      
                      <!-- Personalidad y Estética -->
                      <div class="bot-meta-config row mb-4">
                        <ui-josanz-select
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
                            { value: 'universal', label: 'Droide Universal' }
                          ]"
                          [ngModel]="bot.mascotType"
                          (ngModelChange)="aiBotStore.updateBotSkin(bot.feature, { mascotType: $event })"
                        ></ui-josanz-select>

                        <ui-josanz-select
                          label="Personalidad"
                          size="sm"
                          [options]="[
                            { value: 'tech', label: 'Tecnocrático' },
                            { value: 'worker', label: 'Productor' },
                            { value: 'happy', label: 'Optimista' },
                            { value: 'mystic', label: 'Místico/Oculto' },
                            { value: 'explorer', label: 'Explorador' },
                            { value: 'ninja', label: 'Sigiloso/Ninja' }
                          ]"
                          [ngModel]="bot.personality"
                          (ngModelChange)="aiBotStore.updateBotSkin(bot.feature, { personality: $event })"
                        ></ui-josanz-select>
                      </div>
                      
                      <div class="skills-list">
                        @for (skill of bot.activeSkills; track skill) {
                          <div class="skill-tag">
                            <lucide-icon name="check-circle-2" size="12"></lucide-icon>
                            <span>{{ skill }}</span>
                          </div>
                        }
                      </div>

                      <div class="bot-actions-row">
                        <ui-josanz-button 
                          [variant]="bot.status === 'active' ? 'outline' : 'filled'" 
                          size="sm"
                          (click)="aiBotStore.toggleBotStatus(bot.feature)"
                        >
                          {{ bot.status === 'active' ? 'CANCELAR SaaS' : 'ACTIVAR (SaaS)' }}
                        </ui-josanz-button>
                        
                        @if (bot.status === 'active') {
                          <ui-josanz-button 
                            [variant]="managingBotId() === bot.feature ? 'filled' : 'outline'" 
                            size="sm"
                            (click)="managingBotId.set(managingBotId() === bot.feature ? null : bot.feature)"
                          >
                            {{ managingBotId() === bot.feature ? 'CERRAR PANEL' : 'GESTIONAR SKILLS' }}
                          </ui-josanz-button>

                          @if (aiBotStore.activeBotFeature() !== bot.feature) {
                            <ui-josanz-button 
                              variant="outline" 
                              size="sm"
                              (click)="aiBotStore.activeBotFeature.set(bot.feature)"
                            >
                              USAR COMO PRINCIPAL
                            </ui-josanz-button>
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
                                  <p class="skill-desc">Habilita esta capacidad de IA.</p>
                                </div>
                                <div class="toggle-wrapper" [class.active]="isSkillActive(bot.feature, skill)" (click)="aiBotStore.toggleSkill(bot.feature, skill)">
                                  <div class="toggle-handle"></div>
                                </div>
                              </div>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </ui-josanz-card>
                }
              </div>
            </section>
          }

          @if (activeTab() === 'buddy') {
            <section class="content-section animate-slide-up">
              <div class="section-title">
                <h2>Customización de {{ aiBotStore.getBotDisplayName(aiBotStore.activeBotFeature()) }}</h2>
                <p>Configura la estética y habilidades de tu agente principal</p>
              </div>

              @if (aiBotStore.getBotByFeature(aiBotStore.activeBotFeature()); as buddy) {
                <div class="buddy-customizer">
                  <div class="buddy-visual-col">
                    <ui-josanz-card variant="glass" class="buddy-preview-card" [class.is-rage-preview]="aiBotStore.rageMode()">
                      <div class="preview-glow"></div>
                      <ui-josanz-mascot 
                        [type]="$any(buddy.mascotType)" 
                        [color]="buddy.color" 
                        [personality]="$any(buddy.personality)" 
                        [bodyShape]="$any(buddy.bodyShape)" 
                        [eyesType]="$any(buddy.eyesType)" 
                        [mouthType]="$any(buddy.mouthType)"
                        [rageMode]="aiBotStore.rageMode()"
                        [rageStyle]="aiBotStore.rageStyle()">
                      </ui-josanz-mascot>
                    </ui-josanz-card>
                  </div>

                  <div class="buddy-config-col">
                    <ui-josanz-card variant="glass" class="buddy-options-card">
                      <div class="card-header-with-toggle">
                        <div class="buddy-name-edit flex-1">
                           <ui-josanz-input
                            label="Nombre del Compañero"
                            [ngModel]="buddy.name"
                            (ngModelChange)="aiBotStore.updateBotName(buddy.feature, $event)"
                            placeholder="Ej: Buddy, Pato, etc."
                          ></ui-josanz-input>
                        </div>
                        <div class="rage-toggle" [class.active]="aiBotStore.rageMode()" (click)="aiBotStore.setRageMode(!aiBotStore.rageMode())">
                          <div class="toggle-label">
                            <lucide-icon name="zap" size="14"></lucide-icon>
                            <span>MODO RAGE</span>
                          </div>
                          <div class="switch-pill">
                            <div class="switch-handle"></div>
                          </div>
                        </div>
                      </div>

                      <div class="standard-options" [class.dimmed]="aiBotStore.rageMode()">
                        <div class="form-group mb-4">
                          <label class="form-label">Color Principal</label>
                          <div class="color-picker-grid">
                            @for (c of [{m: '#facc15', s: '#ca8a04', n: 'Pato Clásico'}, {m: '#f43f5e', s: '#9f1239', n: 'Cereza'}, {m: '#10b981', s: '#059669', n: 'Hulk'}, {m: '#8b5cf6', s: '#6d28d9', n: 'Místico'}, {m: '#3b82f6', s: '#1d4ed8', n: 'Aqua'}, {m: '#1e293b', s: '#0f172a', n: 'Stealth'}]; track c.n) {
                              <div class="color-swatch-item" 
                                   [class.active]="buddy.color === c.m"
                                   (click)="aiBotStore.updateBotSkin(buddy.feature, { color: c.m, secondaryColor: c.s })">
                                <div class="color-swatch" [style.background]="c.m"></div>
                              </div>
                            }
                          </div>
                        </div>

                        <div class="form-group mb-4">
                          <ui-josanz-select
                            label="Forma del Cuerpo"
                            [options]="[
                              { value: 'capsule', label: 'Cápsula Plana' },
                              { value: 'round', label: 'Esfera Gordita' },
                              { value: 'square', label: 'Cubo Bloque' },
                              { value: 'tri', label: 'Triángulo Puntiagudo' }
                            ]"
                            [ngModel]="buddy.bodyShape"
                            (ngModelChange)="aiBotStore.updateBotSkin(buddy.feature, { bodyShape: $event })"
                          ></ui-josanz-select>
                        </div>

                        <div class="form-group mb-4">
                          <ui-josanz-select
                            label="Ojos"
                            [options]="[
                              { value: 'joy', label: 'Feliz / Kawaii' },
                              { value: 'dots', label: 'Puntos Simples' },
                              { value: 'shades', label: 'Gafas de Sol' }
                            ]"
                            [ngModel]="buddy.eyesType"
                            (ngModelChange)="aiBotStore.updateBotSkin(buddy.feature, { eyesType: $event })"
                          ></ui-josanz-select>
                        </div>
                      </div>

                      @if (aiBotStore.rageMode()) {
                        <div class="rage-options animate-slide-up">
                          <h3 class="rage-text">🔥 Configuración Tóxica</h3>
                          <div class="form-group">
                            <ui-josanz-select
                              label="Nivel de Psicopatía"
                              [options]="[
                                { value: 'angry', label: 'Enfadado (Rojo)' },
                                { value: 'terror', label: 'Terror Psicológico' },
                                { value: 'dark', label: 'Vacío Oscuro' }
                              ]"
                              [ngModel]="aiBotStore.rageStyle()"
                              (ngModelChange)="aiBotStore.setRageStyle($event)"
                            ></ui-josanz-select>
                          </div>
                          <p class="rage-hint">Cuidado: Con este modo activo, Buddy no tendrá filtros y será grosero contigo.</p>
                        </div>
                      }
                    </ui-josanz-card>

                    <ui-josanz-card variant="glass" class="buddy-skills-card mt-6">
                      <h3>Habilidades de Confianza</h3>
                      <div class="skills-config-list mt-4">
                        @for (skill of buddy.skills; track skill) {
                          <div class="skill-config-item">
                            <span class="skill-name">{{ skill }}</span>
                            <div class="toggle-wrapper" [class.active]="isSkillActive(buddy.feature, skill)" (click)="aiBotStore.toggleSkill(buddy.feature, skill)">
                              <div class="toggle-handle"></div>
                            </div>
                          </div>
                        }
                      </div>
                    </ui-josanz-card>
                  </div>
                </div>
              }
            </section>
          }

          @if (activeTab() === 'preferences') {
            <section class="content-section animate-slide-up">
              <div class="section-title">
                <h2>Preferencias de Plataforma</h2>
                <p>Personaliza tu experiencia de usuario y rendimiento</p>
              </div>

              <div class="prefs-container">
                <ui-josanz-card variant="glass" class="prefs-card">
                  <div class="pref-row">
                    <div class="pref-text">
                      <h4>Sincronización en Tiempo Real</h4>
                      <p>Habilita la comunicación vía WebSockets para datos operativos</p>
                    </div>
                    <div class="toggle-wrapper" (click)="toggleRealtime()" [class.active]="realtimeSync()">
                      <div class="toggle-handle"></div>
                    </div>
                  </div>

                  <div class="pref-row">
                    <div class="pref-text">
                      <h4 class="premium-text">Luxe Experience (Global)</h4>
                      <p>Habilita trazado de rayos simulado y efectos cinematográficos avanzados</p>
                    </div>
                    <div class="toggle-wrapper premium" (click)="togglePremium()" [class.active]="premiumExperience()">
                      <div class="toggle-handle"></div>
                    </div>
                  </div>
                </ui-josanz-card>
              </div>
            </section>
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
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
      background: linear-gradient(135deg, rgba(var(--brand-rgb, 16, 185, 129), 0.2) 0%, rgba(var(--brand-rgb, 16, 185, 129), 0.05) 100%);
      border-color: rgba(var(--brand-rgb, 16, 185, 129), 0.3);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .nav-item.buddy-nav-item {
      margin-top: 1rem;
      border-top: 1px solid var(--border-soft);
      padding-top: 1.5rem;
      border-radius: 0 0 16px 16px;
    }

    .nav-item lucide-icon { opacity: 0.6; }

    .nav-item.active lucide-icon { opacity: 1; }

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

    /* Content Area */
    .settings-content {
      overflow-y: auto;
      padding-right: 0.5rem;
    }

    .content-section {
      display: flex;
      flex-direction: column;
      gap: 2rem;
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
      box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);
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

    .bot-actions-row ui-josanz-button { flex: 1; }

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
      background: rgba(255,255,255,0.02);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.3s ease;
    }

    .skill-config-item:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(var(--brand-rgb, 16, 185, 129), 0.2);
    }
 
    .skill-name { font-size: 0.9rem; font-weight: 800; color: #fff; display: block; letter-spacing: -0.01em; }
    .skill-desc { font-size: 0.75rem; color: var(--text-muted); margin: 0.3rem 0 0 0; font-weight: 500; }

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
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%);
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
    
    .mr-2 { margin-right: 0.5rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .flex-1 { flex: 1; }
    .mt-6 { margin-top: 1.5rem; }
    .mt-4 { margin-top: 1rem; }

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
      background: rgba(255,255,255,0.1);
      border-radius: 10px;
    }

    .skill-tag {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(var(--brand-rgb, 16, 185, 129), 0.15);
      padding: 0.5rem 1rem;
      border-radius: 100px;
      font-size: 0.75rem;
      color: #ffffff !important;
      border: 1px solid rgba(var(--brand-rgb, 16, 185, 129), 0.3);
      font-weight: 700;
      backdrop-filter: blur(4px);
    }
 
    .skill-tag lucide-icon { color: #fff; opacity: 0.8; }

    /* Prefs */
    .prefs-card { padding: 1rem 2rem; }
    .pref-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem 0;
    }
    .pref-row:not(:last-child) { border-bottom: 1px solid var(--border-soft); }

    .pref-text h4 { font-size: 0.95rem; font-weight: 700; color: #fff; margin: 0; }
    .pref-text p { font-size: 0.75rem; color: var(--text-muted); margin: 0.25rem 0 0 0; }

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
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .toggle-wrapper.active { 
       background: var(--brand); 
       border-color: rgba(255,255,255,0.2);
       box-shadow: 0 0 15px rgba(var(--brand-rgb, 16, 185, 129), 0.4);
    }
    .toggle-wrapper.active .toggle-handle { 
       left: 28px; 
       transform: scale(1.1);
    }
    .toggle-wrapper.active.premium { background: #facc15; }

    .premium-text { color: #facc15 !important; }

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
      background: radial-gradient(circle at 50% 50%, rgba(var(--brand-rgb), 0.1), transparent);
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

    .buddy-preview-card ui-josanz-mascot {
      width: 180px;
      height: 180px;
      transform: scale(1.5);
    }

    .buddy-options-card, .buddy-skills-card {
      padding: 1.5rem;
      min-height: 320px;
    }

    .buddy-options-card h3, .buddy-skills-card h3 {
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
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
    }

    /* Rage Mode Config Styles */
    .card-header-with-toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px dashed rgba(255,255,255,0.1);
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
      box-shadow: 0 0 25px rgba(220, 38, 38, 0.5), inset 0 0 10px rgba(255,255,255,0.2);
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
    .rage-toggle.active span { color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }

    .rage-toggle .switch-pill {
      width: 32px;
      height: 16px;
      background: rgba(255,255,255,0.1);
      border-radius: 99px;
      position: relative;
    }
    .rage-toggle.active .switch-pill { background: rgba(0,0,0,0.3); }

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
    .rage-toggle.active .switch-handle { left: 19px; background: #fff; }

    .standard-options { transition: all 0.5s ease; }
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
      background: rgba(0,0,0,0.2);
      border-left: 3px solid #dc2626;
      font-style: italic; 
    }

    .is-rage-preview {
      border: 2px solid #dc2626 !important;
      box-shadow: 0 0 40px rgba(220, 38, 38, 0.2), inset 0 0 20px rgba(220, 38, 38, 0.1) !important;
      background: radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.2), transparent) !important;
    }

    .buddy-skills-card {
      padding: 1.5rem;
    }

    @media (max-width: 1200px) {
      .ai-bot-card { grid-template-columns: 1fr; }
      .bot-visual { height: 160px; }
      .buddy-customizer { grid-template-columns: 1fr; }
      .buddy-preview-card { height: 250px; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsFeatureComponent implements OnInit {
  private readonly _pluginStore = inject(PluginStore);
  public readonly aiBotStore = inject(AIBotStore);

  readonly activeTab = signal<'plugins' | 'ai' | 'buddy' | 'preferences'>('buddy');
  readonly managingBotId = signal<string | null>(null);

  // Expose signals explicitly for better template inference
  public readonly realtimeSync = this._pluginStore.realtimeSync;
  public readonly highPerformanceMode = this._pluginStore.highPerformanceMode;
  public readonly premiumExperience = this._pluginStore.premiumExperience;
  public readonly enabledPlugins = this._pluginStore.enabledPlugins;

  readonly plugins: PluginDescriptor[] = [
    { id: 'inventory', name: 'Inventario Pro', description: 'Control de stock y trazabilidad de material.', icon: 'package', category: 'core' },
    { id: 'budgets', name: 'Presupuestos', description: 'Gestor de cotizaciones cinematográficas.', icon: 'receipt', category: 'core' },
    { id: 'fleet', name: 'Gestión de Flota', icon: 'car', description: 'Control de vehículos y transportes de producción.', category: 'vertical' },
    { id: 'rentals', name: 'Alquileres', icon: 'key', description: 'Sistema de reservas y devoluciones.', category: 'vertical' },
    { id: 'verifactu', name: 'VeriFactu Compliance', icon: 'file-check', description: 'Integración mandatoria con la AEAT.', category: 'vertical' },
  ];

  readonly botOptions = computed(() => 
    this.aiBotStore.bots().map(bot => ({
      value: bot.feature,
      label: `${bot.name} (${bot.feature})`
    }))
  );

  isSkillActive(botId: string, skill: string) {
    const bot = this.aiBotStore.getBotByFeature(botId);
    return bot?.activeSkills.includes(skill) || false;
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
      console.log('SettingsFeature initialized. Bots in store:', this.aiBotStore.bots());
      console.log('Buddy bot:', this.aiBotStore.getBotByFeature('dashboard'));
    });
  }
}
