import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Puzzle, Sliders, Bot, Shield, CheckCircle2 } from 'lucide-angular';
import { UiCardComponent, UiButtonComponent, UIMascotComponent, UiBadgeComponent } from '@josanz-erp/shared-ui-kit';
import { PluginStore } from '@josanz-erp/shared-data-access';

interface PluginDescriptor {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'core' | 'vertical' | 'experimental';
}

interface IAMascot {
  id: string;
  name: string;
  feature: string;
  description: string;
  skills: string[];
  status: 'active' | 'inactive';
  color: string;
  mascotType: any;
}

@Component({
  selector: 'lib-settings-feature',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCardComponent, UiButtonComponent, UIMascotComponent, UiBadgeComponent],
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

              <div class="ai-grid">
                @for (bot of mascotBots(); track bot.id) {
                  <ui-josanz-card variant="glass" class="ai-bot-card" [class.inactive]="bot.status === 'inactive'">
                    <div class="bot-visual">
                      <ui-josanz-mascot [type]="bot.mascotType" [color]="bot.color"></ui-josanz-mascot>
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
                        @for (skill of bot.skills; track skill) {
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
                          (click)="toggleMascotStatus(bot.id)"
                        >
                          {{ bot.status === 'active' ? 'CANCELAR SaaS' : 'ACTIVAR (SaaS)' }}
                        </ui-josanz-button>
                        
                        @if (bot.status === 'active') {
                          <ui-josanz-button 
                            variant="filled" 
                            size="sm"
                            (click)="managingBotId.set(bot.id)"
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
                @if (getBotById(mId); as mBot) {
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
                            <div class="toggle-wrapper" [class.active]="isSkillActive(mId, skill)" (click)="toggleSkill(mId, skill)">
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

    @media (max-width: 1200px) {
      .ai-bot-card { grid-template-columns: 1fr; }
      .bot-visual { height: 160px; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsFeatureComponent {
  private readonly _pluginStore = inject(PluginStore);

  readonly activeTab = signal<'plugins' | 'ai' | 'preferences'>('plugins');
  readonly managingBotId = signal<string | null>(null);

  // Map of botId -> set of active skill names
  private readonly _activeSkills = signal<Record<string, string[]>>({});

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

  readonly mascotBots = signal<any[]>([
    { 
      id: 'inv-bot', 
      name: 'Stocky-Bot', 
      feature: 'Logística & Inventario', 
      description: 'Analiza tendencias de consumo de material y predice faltas de stock en plató.', 
      skills: ['Predicción de Stock', 'Auto-Aprovisionamiento', 'Alertas de Caducidad', 'Optimización de Espacio', 'Trazabilidad RFID', 'Auditoría de Daños'], 
      status: 'active', 
      color: '#10b981',
      secondaryColor: '#059669',
      mascotType: 'inventory',
      personality: 'worker',
      bodyShape: 'round',
      eyesType: 'dots',
      mouthType: 'o'
    },
    { 
      id: 'bud-bot', 
      name: 'Cali-Bot', 
      feature: 'Finanzas & Presupuestos', 
      description: 'Calcula márgenes de beneficio en tiempo real y sugiere ajustes por inflación.', 
      skills: ['Optimización de Márgenes', 'Detección de Costes Ocultos', 'Proyección Fiscal', 'Análisis Comparativo', 'Sugerencia de Up-selling', 'Validación de Divisas'], 
      status: 'inactive', 
      color: '#34d399',
      secondaryColor: '#065f46',
      mascotType: 'budget',
      personality: 'happy',
      bodyShape: 'capsule',
      eyesType: 'joy',
      mouthType: 'smile'
    },
    { 
      id: 'proj-bot', 
      name: 'Direct-Bot', 
      feature: 'Producción & Proyectos', 
      description: 'Coordina los horarios de técnicos y sugiere el mejor flujo de trabajo por escena.', 
      skills: ['Timeline AI', 'Resource Balancing', 'Scene Optimizer', 'Crew Mood Sync', 'Weather Impact Radar', 'Smart Call-Sheet'], 
      status: 'active', 
      color: '#06b6d4',
      secondaryColor: '#0891b2',
      mascotType: 'projects',
      personality: 'tech',
      bodyShape: 'square',
      eyesType: 'shades',
      mouthType: 'line'
    },
    { 
      id: 'cli-bot', 
      name: 'Social-Bot', 
      feature: 'Clientes & CRM', 
      description: 'Analiza el sentimiento de los clientes y sugiere momentos clave para contactar.', 
      skills: ['Sentiment Analysis', 'Lead Scoring', 'Churn Predictor', 'Auto-FollowUp', 'Network Expansion', 'Voice Tone Advisor'], 
      status: 'active', 
      color: '#8b5cf6',
      secondaryColor: '#6d28d9',
      mascotType: 'clients',
      personality: 'mystic',
      bodyShape: 'round',
      eyesType: 'dots',
      mouthType: 'smile'
    },
    { 
      id: 'fleet-bot', 
      name: 'Drive-Bot', 
      feature: 'Flota & Vehículos', 
      description: 'Optimiza rutas de transporte y predice mantenimientos preventivos del motor.', 
      skills: ['Route Optimization', 'Predictive Maintenance', 'Fuel Efficiency AI', 'Driver Habits Monitor', 'Load Balancing', 'Parking Finder'], 
      status: 'inactive', 
      color: '#f59e0b',
      secondaryColor: '#d97706',
      mascotType: 'fleet',
      personality: 'explorer',
      bodyShape: 'capsule',
      eyesType: 'shades',
      mouthType: 'o'
    },
    { 
      id: 'rent-bot', 
      name: 'Key-Bot', 
      feature: 'Alquileres', 
      description: 'Gestiona la disponibilidad de equipos y bloquea reservas conflictivas.', 
      skills: ['Conflict Detection', 'Auto-Reservation', 'Price Surge Guard', 'Smart Late-Return Hub', 'Insurance Advisor', 'Bundle Recommender'], 
      status: 'active', 
      color: '#3b82f6',
      secondaryColor: '#1d4ed8',
      mascotType: 'rentals',
      personality: 'ninja',
      bodyShape: 'square',
      eyesType: 'dots',
      mouthType: 'line'
    },
    { 
      id: 'audit-bot', 
      name: 'Scout-Bot', 
      feature: 'Auditoría & Seguridad', 
      description: 'Detecta anomalías en los logs de acceso y previene acciones no autorizadas.', 
      skills: ['Anomaly Detection', 'Risk Assessment', 'Breach Prevention', 'Compliance Guard', 'Audit Trail Summary', 'Integrity Scanner'], 
      status: 'active', 
      color: '#ef4444',
      secondaryColor: '#b91c1c',
      mascotType: 'audit',
      personality: 'tech',
      bodyShape: 'round',
      eyesType: 'shades',
      mouthType: 'o'
    },
    { 
      id: 'verifactu-bot', 
      name: 'Tax-Bot', 
      feature: 'VeriFactu Compliance', 
      description: 'Asegura que cada factura enviada cumpla con los requisitos legales de la AEAT.', 
      skills: ['Fiscal Validation', 'Auto-Reporting', 'Error Rectifier', 'Audit-Ready Export', 'Reg-Tech Sync', 'Electronic Seal Guard'], 
      status: 'inactive', 
      color: '#f43f5e',
      secondaryColor: '#9f1239',
      mascotType: 'universal',
      personality: 'queen',
      bodyShape: 'capsule',
      eyesType: 'joy',
      mouthType: 'smile'
    }
  ]);

  getBotById(id: string) {
    return this.mascotBots().find(b => b.id === id);
  }

  isSkillActive(botId: string, skill: string) {
    const skills = this._activeSkills()[botId] || [];
    return skills.includes(skill);
  }

  toggleSkill(botId: string, skill: string) {
    this._activeSkills.update(current => {
      const botSkills = current[botId] || [];
      const isCurrentlyActive = botSkills.includes(skill);
      
      return {
        ...current,
        [botId]: isCurrentlyActive 
          ? botSkills.filter(s => s !== skill) 
          : [...botSkills, skill]
      };
    });
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

  toggleMascotStatus(id: string) {
    this.mascotBots.update(bots => bots.map(b => 
      b.id === id ? { ...b, status: b.status === 'active' ? 'inactive' : 'active' } : b
    ));
  }
}
