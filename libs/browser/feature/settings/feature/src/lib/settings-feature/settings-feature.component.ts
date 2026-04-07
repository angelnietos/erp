import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
              <span>Buddy (Compañero)</span>
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
                      [options]="[
                        { value: 'gemini', label: 'Google Gemini 2.5 Flash (Recomendado)' },
                        { value: 'openai', label: 'OpenAI GPT-4o' },
                        { value: 'anthropic', label: 'Anthropic Claude 3.5' }
                      ]"
                      [ngModel]="aiBotStore.selectedProvider()"
                      (ngModelChange)="aiBotStore.selectedProvider.set($event)"
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
                      <ui-josanz-mascot [type]="bot.mascotType" [color]="bot.color" [personality]="bot.personality" [bodyShape]="bot.bodyShape" [eyesType]="bot.eyesType" [mouthType]="bot.mouthType"></ui-josanz-mascot>
                    </div>
                    
                    <div class="bot-info">
                      <div class="bot-header">
                        <h3>{{ bot.name }}</h3>
                        <ui-josanz-badge [variant]="bot.status === 'active' ? 'success' : 'neutral'">
                          {{ bot.status === 'active' ? 'SUSCRIPCIÓN ACTIVA' : 'SaaS INACTIVO' }}
                        </ui-josanz-badge>
                      </div>
                      <p class="bot-feature">{{ bot.feature }}</p>
                      <p class="bot-desc">{{ bot.description }}</p>
                      
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
                            variant="filled" 
                            size="sm"
                            (click)="managingBotId.set(bot.feature)"
                          >
                            GESTIONAR SKILLS
                          </ui-josanz-button>
                        }
                      </div>
                    </div>
                  </ui-josanz-card>
                }
              </div>

              <!-- Skill Management Modal/Panel -->
              @if (managingBotId(); as mId) {
                @if (aiBotStore.getBotByFeature(mId); as mBot) {
                  <div class="skills-overlay animate-fade-in" (click)="managingBotId.set(null)">
                    <ui-josanz-card variant="glass" class="skills-panel animate-slide-up" (click)="$event.stopPropagation()">
                      <div class="panel-header">
                        <div class="header-bot">
                          <ui-josanz-mascot [type]="mBot.mascotType" [color]="mBot.color" [personality]="mBot.personality" size="sm"></ui-josanz-mascot>
                          <div>
                            <h3>Centro de Habilidades: {{ mBot.name }}</h3>
                            <p>Configura el comportamiento de tu asistente</p>
                          </div>
                        </div>
                        <button class="close-btn" (click)="managingBotId.set(null)">
                          <lucide-icon name="x" size="20"></lucide-icon>
                        </button>
                      </div>

                      <div class="skills-config-list">
                        @for (skill of mBot.skills; track skill) {
                          <div class="skill-config-item">
                            <div class="skill-info">
                              <span class="skill-name">{{ skill }}</span>
                              <p class="skill-desc">Habilita esta capacidad avanzada de IA para el módulo.</p>
                            </div>
                            <div class="toggle-wrapper" [class.active]="isSkillActive(mId, skill)" (click)="aiBotStore.toggleSkill(mId, skill)">
                              <div class="toggle-handle"></div>
                            </div>
                          </div>
                        }
                      </div>

                      <div class="panel-footer">
                        <ui-josanz-button variant="filled" fullWidth="true" (click)="managingBotId.set(null)">
                          GUARDAR CONFIGURACIÓN
                        </ui-josanz-button>
                      </div>
                    </ui-josanz-card>
                  </div>
                }
              }
            </section>
          }

          @if (activeTab() === 'buddy') {
            <section class="content-section animate-slide-up">
              <div class="section-title">
                <h2>Customización de Buddy</h2>
                <p>Configura tu pato de confianza al estilo GunBound</p>
              </div>

              @if (aiBotStore.getBotByFeature('dashboard'); as buddy) {
                <div class="buddy-customizer">
                  <div class="buddy-visual-col">
                    <ui-josanz-card variant="glass" class="buddy-preview-card" [class.is-rage-preview]="aiBotStore.rageMode()">
                      <div class="preview-glow"></div>
                      <ui-josanz-mascot 
                        [type]="buddy.mascotType" 
                        [color]="buddy.color" 
                        [personality]="buddy.personality" 
                        [bodyShape]="buddy.bodyShape" 
                        [eyesType]="buddy.eyesType" 
                        [mouthType]="buddy.mouthType"
                        [rageMode]="aiBotStore.rageMode()"
                        [rageStyle]="aiBotStore.rageStyle()">
                      </ui-josanz-mascot>
                    </ui-josanz-card>
                  </div>

                  <div class="buddy-config-col">
                    <ui-josanz-card variant="glass" class="buddy-options-card">
                      <div class="card-header-with-toggle">
                        <h3>Apariencia Standard</h3>
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
                                   (click)="aiBotStore.updateBotSkin('dashboard', { color: c.m, secondaryColor: c.s })">
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
                            (ngModelChange)="aiBotStore.updateBotSkin('dashboard', { bodyShape: $event })"
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
                            (ngModelChange)="aiBotStore.updateBotSkin('dashboard', { eyesType: $event })"
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
                            <div class="toggle-wrapper" [class.active]="isSkillActive('dashboard', skill)" (click)="aiBotStore.toggleSkill('dashboard', skill)">
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
      backdrop-filter: blur(20px);
      border-right: 1px solid var(--border-soft);
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      padding: 2rem 1rem;
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
      gap: 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      color: var(--text-muted);
      border: none;
      background: transparent;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 600;
      font-size: 0.85rem;
      text-align: left;
    }

    .nav-item lucide-icon { opacity: 0.6; }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
    }

    .nav-item.active {
      background: linear-gradient(90deg, var(--brand) 0%, rgba(var(--brand-rgb), 0.2) 100%);
      color: #fff;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

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

    /* Skills Overlay */
    .skills-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(10px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .skills-panel {
      width: 100%;
      max-width: 500px;
      padding: 2rem;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .header-bot {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .header-bot ui-josanz-mascot { width: 60px; height: 60px; }
    .header-bot h3 { margin: 0; color: #fff; font-size: 1.1rem; }
    .header-bot p { margin: 0.25rem 0 0 0; color: var(--text-muted); font-size: 0.8rem; }

    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.5rem;
      transition: color 0.3s;
    }

    .close-btn:hover { color: #fff; }

    .skills-config-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .skill-config-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: rgba(255,255,255,0.03);
      border-radius: 12px;
      border: 1px solid var(--border-soft);
    }

    .skill-name { font-size: 0.9rem; font-weight: 700; color: #fff; display: block; }
    .skill-desc { font-size: 0.75rem; color: var(--text-muted); margin: 0.2rem 0 0 0; }

    .panel-footer { border-top: 1px solid var(--border-soft); padding-top: 2rem; }

    .ai-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
      gap: 1.5rem;
      width: 100%;
      padding-bottom: 2rem;
    }

    .ai-bot-card {
      display: flex;
      flex-direction: row;
      gap: 2rem;
      padding: 1.75rem;
      align-items: flex-start;
      transition: transform 0.3s ease;
    }

    .ai-bot-card:hover {
      transform: translateY(-5px);
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
      min-width: 0; /* Prevents text from forcing parent width */
    }

    .bot-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.25rem;
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

    .bot-feature {
      font-size: 0.8rem;
      color: var(--brand);
      font-weight: 800;
      margin-bottom: 1rem;
      text-transform: uppercase;
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
    }

    .skill-tag {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(255,255,255,0.05);
      padding: 0.4rem 0.8rem;
      border-radius: 100px;
      font-size: 0.75rem;
      color: #fff;
      border: 1px solid var(--border-soft);
    }

    .skill-tag lucide-icon { color: var(--brand); }

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

    .toggle-wrapper {
      width: 44px;
      height: 22px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 100px;
      position: relative;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .toggle-handle {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 16px;
      height: 16px;
      background: #fff;
      border-radius: 50%;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .toggle-wrapper.active { background: var(--brand); }
    .toggle-wrapper.active.premium { background: #facc15; }
    .toggle-wrapper.active .toggle-handle { left: 25px; }

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

    .buddy-options-card {
      padding: 1.5rem;
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
export class SettingsFeatureComponent {
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
}
