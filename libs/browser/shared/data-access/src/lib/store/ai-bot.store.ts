import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { ALL_BOTS } from './bots';
import {
  AIBot,
  AIRangeMemory,
  BotEmotionalState,
  BotMood,
  InterBotMessage,
  PredictiveModel,
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
  private readonly _bots = signal<Record<string, AIBot>>(ALL_BOTS);
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

  // --- User Personality Profile ---
  private readonly _userPersonalities = signal<Record<string, UserPersonalityProfile>>(
    JSON.parse(localStorage.getItem('ai_user_personalities') || '{}')
  );

  constructor() {
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
      localStorage.setItem('pref_sound', String(this.soundEffects()));
      localStorage.setItem('pref_compact', String(this.compactMode()));
      localStorage.setItem('pref_lang', this.language());
    });
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
  
  setRageStyle(style: string) { 
    this.rageStyle.set(style);
  }

  rageMode = signal(false);
  rageStyle = signal('terror');

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

