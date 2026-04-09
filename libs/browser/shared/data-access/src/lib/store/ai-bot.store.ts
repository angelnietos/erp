import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { ALL_BOTS } from './bots';
import {
  AIBot,
  AIRangeMemory,
  BotEmotionalState,
  BotMood,
  InterBotMessage,
  PredictiveModel,
  UserAgentCustomConfig,
  UserPersonalityProfile,
} from '../models/ai-bot.model';
import { MasterFilterService } from '../services/master-filter.service';

// Import New Refactored Services
import { AIInferenceService } from '../services/ai/ai-inference.service';
import { AIMemoryService } from '../services/ai/ai-memory.service';
import { AIWorkflowService } from '../services/ai/ai-workflow.service';
import { AIPredictiveService } from '../services/ai/ai-predictive.service';

@Injectable({ providedIn: 'root' })
export class AIBotStore {
  // Inject New Services
  private inference = inject(AIInferenceService);
  private memory = inject(AIMemoryService);
  private workflow = inject(AIWorkflowService);
  private predictive = inject(AIPredictiveService);
  private masterFilterService = inject(MasterFilterService);

  // Expose Service Signals for Backward Compatibility or Direct Access
  readonly selectedProvider = this.inference.selectedProvider;
  readonly selectedModelId = this.inference.selectedModelId;
  readonly providerApiKey = this.inference.providerApiKey;
  readonly aiModelOptions = this.inference.aiModelOptions;
  readonly needsApiKey = this.inference.needsApiKey;
  readonly ollamaConfig = this.inference.ollamaConfig;
  readonly freeModels = this.inference.freeModels;

  readonly globalMemories = this.memory.globalMemories;
  readonly botWorkspaces = this.memory.botWorkspaces;

  readonly predictiveModels = this.predictive.predictiveModels;

  // --- Core Bot State ---
  private readonly _bots = signal<Record<string, AIBot>>(this.getInitialBots());
  readonly bots = computed<AIBot[]>(() => Object.values(this._bots()));

  readonly activeBotFeature = signal<string>(
    localStorage.getItem('ai_active_bot_feature') || 'buddy',
  );

  private readonly _customNames = signal<Record<string, string>>(
    JSON.parse(localStorage.getItem('ai_bot_custom_names') || '{}'),
  );
  readonly customNames = this._customNames.asReadonly();

  private readonly _botPositions = signal<Record<string, { x: number; y: number }>>(
    JSON.parse(localStorage.getItem('ai_bot_positions') || '{}'),
  );
  readonly botPositions = this._botPositions.asReadonly();

  private readonly _interBotQueue = signal<InterBotMessage[]>([]);
  readonly interBotQueue = this._interBotQueue.asReadonly();

  private readonly _pendingFilters = signal<Record<string, string>>({});
  readonly pendingFilters = this._pendingFilters.asReadonly();

  // Dynamic HTML canvas per feature (AI-generated UI injection)
  private readonly _dynamicCanvas = signal<Record<string, string>>(
    JSON.parse(localStorage.getItem('ai_dynamic_canvas') || '{}')
  );
  readonly dynamicCanvas = this._dynamicCanvas.asReadonly();

  setDynamicCanvas(feature: string, html: string) {
    this._dynamicCanvas.update(c => ({ ...c, [feature]: html }));
    localStorage.setItem('ai_dynamic_canvas', JSON.stringify(this._dynamicCanvas()));
  }

  // --- Moods & Emotions ---
  private readonly _botMoods = signal<Record<string, { mood: BotMood; energy: number }>>(
    JSON.parse(localStorage.getItem('ai_bot_moods') || '{}')
  );
  private readonly _botEmotionalStates = signal<Record<string, BotEmotionalState>>(
    JSON.parse(localStorage.getItem('ai_bot_emotional_states') || '{}')
  );

  // --- User Preferences ---
  readonly soundEffects = signal<boolean>(localStorage.getItem('pref_sound') === 'true');
  readonly compactMode = signal<boolean>(localStorage.getItem('pref_compact') === 'true');
  readonly notificationsEnabled = signal<boolean>(localStorage.getItem('pref_notifications') !== 'false');
  readonly language = signal<string>(localStorage.getItem('pref_lang') || 'es');
  readonly experimentalFeatures = signal<boolean>(localStorage.getItem('pref_labs') === 'true');

  // Session and Archive Settings
  readonly sessionTimeout = signal<number>(parseInt(localStorage.getItem('pref_session_timeout') || '30'));
  readonly autoArchive = signal<boolean>(localStorage.getItem('pref_auto_archive') === 'true');

  // --- User Personality Profile ---
  private readonly _userPersonalities = signal<Record<string, UserPersonalityProfile>>(
    JSON.parse(localStorage.getItem('ai_user_personalities') || '{}')
  );

  /** userId (o email) → feature → configuración personal (JAIME/dashboard, etc.) */
  private readonly _userAgentConfigs = signal<
    Record<string, Record<string, UserAgentCustomConfig>>
  >(this.loadUserAgentConfigs());

  /** Reactivo para plantillas (p. ej. Ajustes → JAIME). */
  readonly dashboardUserLayer = computed(() =>
    this.getUserAgentConfig('dashboard'),
  );

  constructor() {
    // Register delegate handler in workflow service to enable inter-bot communication
    // without circular dependency (store → workflow, not workflow → store)
    this.workflow.registerDelegateHandler((target: string, message: string, payload?: unknown) => {
      this.handleBotDelegate(target, message, payload);
    });

    // Sincronización proactiva de filtros entre dominios
    effect(() => {
      const feature = this.activeBotFeature();
      const pendingFilter = this._pendingFilters()[feature];
      if (pendingFilter && this.masterFilterService) {
        setTimeout(() => {
          this.masterFilterService.search(pendingFilter);
          console.log(`🤖 AI: Aplicado filtro delegado para ${feature}: "${pendingFilter}"`);
        }, 500);
      }
    });

    // Auto-save State to LocalStorage
    effect(() => {
      localStorage.setItem('ai_active_bot_feature', this.activeBotFeature());
      localStorage.setItem('ai_bot_custom_names', JSON.stringify(this._customNames()));
      localStorage.setItem('ai_bot_positions', JSON.stringify(this._botPositions()));
      localStorage.setItem('ai_bot_moods', JSON.stringify(this._botMoods()));
      localStorage.setItem('ai_bot_emotional_states', JSON.stringify(this._botEmotionalStates()));
      localStorage.setItem('ai_user_personalities', JSON.stringify(this._userPersonalities()));
      localStorage.setItem('ai_user_agent_configs', JSON.stringify(this._userAgentConfigs()));
      localStorage.setItem('pref_sound', String(this.soundEffects()));
      localStorage.setItem('pref_compact', String(this.compactMode()));
      localStorage.setItem('pref_lang', this.language());
      localStorage.setItem('pref_session_timeout', String(this.sessionTimeout()));
      localStorage.setItem('pref_auto_archive', String(this.autoArchive()));
      // Persist bot status and activeSkills overrides
      const botOverrides: Record<string, { status: string; activeSkills: string[] }> = {};
      Object.entries(this._bots()).forEach(([key, bot]) => {
        botOverrides[key] = { status: bot.status, activeSkills: bot.activeSkills };
      });
      localStorage.setItem('ai_bot_overrides', JSON.stringify(botOverrides));
    });
  }

  /** Handle a delegation request from a workflow action */
  private handleBotDelegate(target: string, message: string, payload?: unknown): void {
    // Map friendly target names to feature IDs
    const targetMap: Record<string, string> = {
      'budgets': 'budgets',
      'presupuestos': 'budgets',
      'bot de presupuestos': 'budgets',
      'inventory': 'inventory',
      'inventario': 'inventory',
      'bot de inventario': 'inventory',
      'clients': 'clients',
      'clientes': 'clients',
    };

    const targetFeature = targetMap[target.toLowerCase().trim()] ?? target;
    const bot = this.getBotByFeature(targetFeature);

    if (!bot || bot.status !== 'active') {
      console.warn(`[Delegate] Target bot "${targetFeature}" not found or inactive`);
      return;
    }

    // Build an instruction message for the target bot
    const instructionText = typeof payload === 'object'
      ? `INSTRUCCIÓN AUTOMÁTICA: Ejecuta el siguiente flujo de trabajo: ${JSON.stringify(payload)}`
      : message;

    console.log(`📡 [Delegate] ${this.activeBotFeature()} → ${targetFeature}: ${instructionText}`);
    this.sendInterBotMessage(this.activeBotFeature(), targetFeature, instructionText);
  }

  // ─── Delegation Methods to Services ──────────────────────────────────────────

  async generateFreeResponse(prompt: string, context?: string): Promise<string> {
    return this.inference.generateResponse(prompt, context);
  }

  async executeAction(actionStr: string): Promise<void> {
    return this.workflow.executeAction(actionStr);
  }

  getActionSystemPrompt(): string {
    return this.workflow.getActionSystemPrompt();
  }

  remember(feature: string, text: string, importance = 5, isGlobal = false) {
    this.memory.remember(feature, text, importance, isGlobal);
  }

  getBotContext(feature: string): AIRangeMemory[] {
    return this.memory.getBotContext(feature);
  }

  createPredictiveModel(feature: string, type: PredictiveModel['type'], name: string, description: string) {
    return this.predictive.createPredictiveModel(feature, type, name, description);
  }

  generatePrediction(modelId: string, input: Record<string, unknown>) {
    return this.predictive.generatePrediction(modelId, input);
  }

  // ─── Missing Delegations for Compatibility ────────────────────────────────

  async autoSelectProvider(): Promise<void> {
    return this.inference.autoSelectProvider();
  }

  trackInteraction(feature: string, userId: string): void {
    console.debug(`[AIBotStore] Interaction tracked for ${feature}:${userId}`);
    // Optional: implement logic in UserPersonalityService if created
  }

  configureOllama(baseUrl: string, model: string): void {
    this.inference.ollamaConfig.update(c => ({ ...c, baseUrl, model }));
    this.checkOllamaAvailability(true);
  }

  // ─── Local Store Management ────────────────────────────────────────────────

  getBotByFeature(feature: string): AIBot | undefined {
    return this._bots()[feature];
  }

  /** Igual que `auth_user` en localStorage (alineado con el chat de IA). */
  private currentUserKey(): string {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) return 'anonymous';
      const u = JSON.parse(raw) as { id?: string; email?: string };
      return (u?.id || u?.email || 'anonymous') as string;
    } catch {
      return 'anonymous';
    }
  }

  private loadUserAgentConfigs(): Record<
    string,
    Record<string, UserAgentCustomConfig>
  > {
    try {
      return JSON.parse(localStorage.getItem('ai_user_agent_configs') || '{}');
    } catch {
      return {};
    }
  }

  /**
   * Configuración persistida por usuario para un agente (skills, reglas, prompts).
   * Si no hay entrada guardada, devuelve defaults tomados del bot global.
   */
  getUserAgentConfig(feature: string): UserAgentCustomConfig {
    const uid = this.currentUserKey();
    const stored = this._userAgentConfigs()[uid]?.[feature];
    const bot = this.getBotByFeature(feature);
    if (stored) return stored;
    return {
      activeSkills: [...(bot?.activeSkills ?? [])],
      rules: '',
      systemInstructions: '',
      promptPresets: [],
    };
  }

  updateUserAgentConfig(
    feature: string,
    patch: Partial<UserAgentCustomConfig>,
  ) {
    const uid = this.currentUserKey();
    const prev = this.getUserAgentConfig(feature);
    const next: UserAgentCustomConfig = {
      activeSkills: patch.activeSkills ?? prev.activeSkills,
      rules: patch.rules !== undefined ? patch.rules : prev.rules,
      systemInstructions:
        patch.systemInstructions !== undefined
          ? patch.systemInstructions
          : prev.systemInstructions,
      promptPresets:
        patch.promptPresets !== undefined ? patch.promptPresets : prev.promptPresets,
    };
    this._userAgentConfigs.update((all) => ({
      ...all,
      [uid]: { ...(all[uid] || {}), [feature]: next },
    }));
  }

  toggleUserAgentSkill(feature: string, skill: string) {
    const catalog = this.getBotByFeature(feature);
    if (!catalog?.skills.includes(skill)) return;
    const cfg = this.getUserAgentConfig(feature);
    const next = cfg.activeSkills.includes(skill)
      ? cfg.activeSkills.filter((s) => s !== skill)
      : [...cfg.activeSkills, skill];
    this.updateUserAgentConfig(feature, { activeSkills: next });
  }

  isUserAgentSkillActive(feature: string, skill: string): boolean {
    return this.getUserAgentConfig(feature).activeSkills.includes(skill);
  }

  /**
   * Bot efectivo para el usuario actual: para agentes con capa personal (p. ej. dashboard),
   * `activeSkills` refleja solo a esta cuenta cuando ya guardó preferencias.
   */
  getEffectiveBotForCurrentUser(feature: string): AIBot | undefined {
    const base = this.getBotByFeature(feature);
    if (!base) return undefined;
    const uid = this.currentUserKey();
    const userStored = this._userAgentConfigs()[uid]?.[feature];
    if (!userStored) return base;
    return { ...base, activeSkills: [...userStored.activeSkills] };
  }

  addUserAgentPromptPreset(feature: string) {
    const cfg = this.getUserAgentConfig(feature);
    const id = `preset-${Date.now()}`;
    this.updateUserAgentConfig(feature, {
      promptPresets: [
        ...cfg.promptPresets,
        { id, title: 'Nuevo comportamiento', content: '' },
      ],
    });
  }

  updateUserAgentPromptPreset(
    feature: string,
    id: string,
    patch: Partial<{ title: string; content: string }>,
  ) {
    const cfg = this.getUserAgentConfig(feature);
    this.updateUserAgentConfig(feature, {
      promptPresets: cfg.promptPresets.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    });
  }

  removeUserAgentPromptPreset(feature: string, id: string) {
    const cfg = this.getUserAgentConfig(feature);
    this.updateUserAgentConfig(feature, {
      promptPresets: cfg.promptPresets.filter((p) => p.id !== id),
    });
  }

  private getInitialBots(): Record<string, AIBot> {
    try {
      const savedOverrides = localStorage.getItem('ai_bot_overrides');
      if (!savedOverrides) return ALL_BOTS;
      const overrides: Record<string, { status: string; activeSkills: string[] }> = JSON.parse(savedOverrides);
      const merged: Record<string, AIBot> = { ...ALL_BOTS };
      Object.entries(overrides).forEach(([key, override]) => {
        if (merged[key]) {
          merged[key] = {
            ...merged[key],
            status: override.status as AIBot['status'],
            activeSkills: override.activeSkills ?? merged[key].activeSkills,
          };
        }
      });
      return merged;
    } catch {
      return ALL_BOTS;
    }
  }

  updateBotName(feature: string, name: string) {
    this._customNames.update(c => ({ ...c, [feature]: name }));
  }

  getBotDisplayName(feature: string): string {
    return this._customNames()[feature] || this.getBotByFeature(feature)?.name || feature;
  }

  updateBotSkin(feature: string, patch: Partial<AIBot>) {
    this._bots.update(c => {
      if (!c[feature]) return c;
      return { ...c, [feature]: { ...c[feature], ...patch } };
    });
  }

  toggleBotStatus(feature: string) {
    this._bots.update(c => {
      if (!c[feature]) return c;
      const bot = c[feature];
      return { ...c, [feature]: { ...bot, status: bot.status === 'active' ? 'inactive' : 'active' } };
    });
  }

  toggleSkill(feature: string, skill: string) {
    this._bots.update(c => {
      const bot = c[feature];
      if (!bot) return c;
      const activeSkills = bot.activeSkills.includes(skill)
        ? bot.activeSkills.filter(s => s !== skill)
        : [...bot.activeSkills, skill];
      return { ...c, [feature]: { ...bot, activeSkills } };
    });
  }

  updateBotPosition(feature: string, position: { x: number; y: number }) {
    this._botPositions.update(c => ({ ...c, [feature]: position }));
  }

  getBotPosition(feature: string): { x: number; y: number } {
    return this._botPositions()[feature] || { x: 240, y: 100 };
  }

  // Inter-Bot Communication
  sendInterBotMessage(from: string, to: string, text: string) {
    const msg: InterBotMessage = { from, to, text, timestamp: Date.now() };
    this._interBotQueue.update(q => [...q, msg]);
  }

  pullInterBotMessagesFor(feature: string): InterBotMessage[] {
    const all = this._interBotQueue();
    const forMe = all.filter(m => m.to === feature || m.to === 'all');
    if (forMe.length > 0) {
      this._interBotQueue.update(q => q.filter(m => !forMe.includes(m)));
    }
    return forMe;
  }

  broadcastMessage(from: string, text: string, to: string) {
    const msg: InterBotMessage = { from, to, text, timestamp: Date.now(), displayOnly: true };
    this._interBotQueue.update(q => [...q, msg]);
  }

  interBotTick() {
    console.debug('[AIBotStore] Inter-bot queue tick');
  }

  // User Personality
  getUserPersonality(feature: string, userId: string): UserPersonalityProfile {
    const key = `${feature}::${userId}`;
    return this._userPersonalities()[key] || {
      nickname: userId, style: 'casual', likes: [], dislikes: [],
      notes: '', interactionCount: 0, lastSeen: Date.now(),
      trustLevel: 50, learnedPatterns: [], preferredTools: [], performanceMetrics: [], successfulInteractions: []
    };
  }

  recordSuccessfulInteraction(feature: string, userId: string, query: string, tool: string, respTime: number) {
    console.debug(`[AIBotStore] Interaction recorded: ${feature}, ${userId}, ${query}, ${tool}, ${respTime}ms`);
  }

  // --- UI Helpers ---
  setRageMode(enabled: boolean) { 
    this.rageMode.set(enabled);
  }
  
  setRageStyle(style: 'terror' | 'angry' | 'dark') { 
    this.rageStyle.set(style);
  }

  rageMode = signal(false);
  rageStyle = signal<'terror' | 'angry' | 'dark'>('terror');

  setAIModel(modelId: string) {
    this.inference.selectedModelId.set(modelId);
    if (modelId.startsWith('ollama:')) {
      const modelName = modelId.split(':')[1];
      this.inference.selectedProvider.set('ollama');
      this.inference.ollamaConfig.update(c => ({ ...c, model: modelName }));
    } else {
      this.inference.selectedProvider.set(modelId as any);
    }
  }

  checkOllamaAvailability(force = false) {
    return this.inference.checkOllamaAvailability(force);
  }

  getProviderStatus() {
    return {
      gemini: !!this.providerApiKey(),
      openai: !!this.providerApiKey(),
      grok: true,
      together: true,
      ollama: this.ollamaConfig().available,
      free: true
    };
  }

  setPendingFilter(feature: string, query: string) {
    this._pendingFilters.update(prev => ({ ...prev, [feature]: query }));
    if (this.activeBotFeature() === feature) this.masterFilterService.search(query);
  }

  clearPendingFilter(feature: string) {
    this._pendingFilters.update(prev => {
      const rest = { ...prev };
      delete rest[feature];
      return rest;
    });
  }
}

