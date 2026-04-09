import { Injectable, signal, computed, effect } from '@angular/core';

export type MascotType =
  | 'inventory'
  | 'budget'
  | 'clients'
  | 'projects'
  | 'fleet'
  | 'rentals'
  | 'audit'
  | 'dashboard'
  | 'universal';
export type MascotPersonality =
  | 'happy'
  | 'tech'
  | 'mystic'
  | 'worker'
  | 'explorer'
  | 'ninja'
  | 'queen';

export interface UserPersonalityProfile {
  /** Nickname the bot assigned to this user */
  nickname: string;
  /** Inferred communication style from interaction patterns */
  style:
    | 'formal'
    | 'casual'
    | 'technical'
    | 'playful'
    | 'direct'
    | 'angry'
    | 'confused';
  /** Things the user seems to enjoy or respond well to */
  likes: string[];
  /** Things that annoyed or frustrated this user */
  dislikes: string[];
  /** Bot's private notes about this user's personality */
  notes: string;
  /** Total messages exchanged with this user */
  interactionCount: number;
  /** Timestamp of last interaction */
  lastSeen: number;
  /** Emotional state detected in the last messages */
  lastMood?: 'happy' | 'frustrated' | 'busy' | 'curious';

  // Sistema de Aprendizaje Continuo
  /** Patrones de consultas exitosas aprendidos */
  learnedPatterns: {
    query: string;
    successRate: number;
    lastUsed: number;
    frequency: number;
  }[];
  /** Preferencias de herramientas aprendidas */
  preferredTools: string[];
  /** Métricas de rendimiento por tipo de tarea */
  performanceMetrics: {
    taskType: string;
    successCount: number;
    failureCount: number;
    avgResponseTime: number;
  }[];
  /** Nivel de confianza del bot con este usuario */
  trustLevel: number; // 0-100
  /** Últimas 10 interacciones exitosas para aprendizaje */
  successfulInteractions: {
    query: string;
    tool: string;
    outcome: 'success' | 'partial' | 'failed';
    timestamp: number;
  }[];
}

export type BotMood =
  | 'neutral'
  | 'analyzing'
  | 'alert'
  | 'creative'
  | 'toxic'
  | 'asleep';

export interface BotEmotionalState {
  primaryMood: BotMood;
  secondaryEmotions: string[];
  energy: number;
  confidence: number;
  socialDrive: number;
  learningMode: boolean;
  lastMoodChange: number;
  emotionalTriggers: Record<string, number>;
}

export interface ProactiveSuggestion {
  id: string;
  botId: string;
  text: string;
  category: 'efficiency' | 'risk' | 'opportunity';
  timestamp: number;
}

export interface BotCollaboration {
  id: string;
  title: string;
  description: string;
  initiator: string;
  participants: string[];
  objective: string;
  status: 'planning' | 'active' | 'completed' | 'failed';
  tasks: CollaborationTask[];
  created: number;
  deadline?: number;
  progress: number;
}

export interface CollaborationTask {
  id: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  dependencies: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PredictiveModel {
  id: string;
  feature: string;
  type:
    | 'demand_forecast'
    | 'churn_prediction'
    | 'price_optimization'
    | 'resource_planning'
    | 'risk_assessment';
  name: string;
  description: string;
  accuracy: number;
  lastTrained: number;
  predictions: PredictionResult[];
  parameters: Record<string, unknown>;
}

export interface PredictionResult {
  id: string;
  timestamp: number;
  input: Record<string, unknown>;
  prediction: unknown;
  confidence: number;
  actual?: unknown;
  accuracy?: number;
}

export interface AIRangeMemory {
  text: string;
  importance: number;
  timestamp: number;
  tags: string[];
  sourceBot?: string;
}

export interface InterBotMessage {
  from: string;
  to: string;
  text: string;
  displayOnly?: boolean;
  timestamp: number;
}

export interface AIBot {
  id: string;
  name: string;
  feature: string;
  description: string;
  skills: string[];
  activeSkills: string[];
  status: 'active' | 'inactive';
  color: string;
  secondaryColor: string;
  mascotType: MascotType;
  personality: MascotPersonality;
  bodyShape: 'round' | 'square' | 'capsule' | 'tri';
  eyesType: 'dots' | 'joy' | 'shades' | 'angry' | 'insane';
  mouthType: 'smile' | 'line' | 'o' | 'mean';
}

@Injectable({ providedIn: 'root' })
export class AIBotStore {
  private _isCheckingProviders = false;
  private _lastCheckTime = 0;
  private readonly CHECK_THROTTLE_MS = 60000; // 1 minuto

  readonly selectedProvider = signal<
    'gemini' | 'openai' | 'anthropic' | 'ollama' | 'huggingface' | 'free'
  >(
    (localStorage.getItem('ai_provider') as
      | 'gemini'
      | 'openai'
      | 'anthropic'
      | 'ollama'
      | 'huggingface'
      | 'free') || 'gemini',
  );

  readonly selectedModelId = signal<string>(
    localStorage.getItem('ai_selected_model_id') || 'gemini',
  );

  readonly providerApiKey = signal<string>(
    localStorage.getItem('ai_api_key') || '',
  );

  readonly activeBotFeature = signal<string>(
    localStorage.getItem('ai_active_bot_feature') || 'buddy',
  );

  // --- NUEVAS PREFERENCIAS DE USUARIO ---
  readonly soundEffects = signal<boolean>(
    localStorage.getItem('pref_sound') === 'true',
  );
  readonly compactMode = signal<boolean>(
    localStorage.getItem('pref_compact') === 'true',
  );
  readonly autoArchive = signal<boolean>(
    localStorage.getItem('pref_autoarchive') === 'true',
  );
  readonly sessionTimeout = signal<number>(
    parseInt(localStorage.getItem('pref_timeout') || '30'),
  );
  readonly language = signal<string>(localStorage.getItem('pref_lang') || 'es');
  readonly experimentalFeatures = signal<boolean>(
    localStorage.getItem('pref_labs') === 'true',
  );
  readonly notificationsEnabled = signal<boolean>(
    localStorage.getItem('pref_notifications') !== 'false',
  );

  // Configuración de modelos gratuitos
  readonly ollamaConfig = signal<{
    baseUrl: string;
    model: string;
    available: boolean;
  }>({
    baseUrl:
      localStorage.getItem('ollama_base_url') || 'http://localhost:11434',
    model: localStorage.getItem('ollama_model') || 'llama2',
    available: false,
  });

  readonly freeModels = signal<{
    huggingface: {
      model: string;
      available: boolean;
    };
    localModels: string[];
  }>({
    huggingface: {
      model: localStorage.getItem('hf_model') || 'microsoft/DialoGPT-medium',
      available: true,
    },
    localModels: JSON.parse(localStorage.getItem('local_models') || '[]'),
  });

  // ─── Global Context (Antigravity-style shared knowledge) ────────────────────────────────────────────
  private readonly _globalMemories = signal<AIRangeMemory[]>(
    JSON.parse(localStorage.getItem('ai_global_memories') || '[]'),
  );
  readonly globalMemories = this._globalMemories.asReadonly();

  // ─── Bot Moods & State ────────────────────────────────────────────
  private readonly _botMoods = signal<
    Record<string, { mood: BotMood; energy: number }>
  >(JSON.parse(localStorage.getItem('ai_bot_moods') || '{}'));
  readonly botMoods = this._botMoods.asReadonly();

  // ─── Advanced Emotional States ────────────────────────────────────────────
  private readonly _botEmotionalStates = signal<
    Record<string, BotEmotionalState>
  >(JSON.parse(localStorage.getItem('ai_bot_emotional_states') || '{}'));
  readonly botEmotionalStates = this._botEmotionalStates.asReadonly();

  // ─── Bot Skills State ────────────────────────────────────────────
  private readonly _botSkillsState = signal<
    Record<
      string,
      {
        activeSkills: string[];
        skillMastery: Record<string, number>;
        skillUsage: Record<
          string,
          { count: number; lastUsed: number; avgSuccess: number }
        >;
        learningQueue: string[];
      }
    >
  >(JSON.parse(localStorage.getItem('ai_bot_skills_state') || '{}'));
  readonly botSkillsState = this._botSkillsState.asReadonly();

  // ─── Proactive Suggestions ────────────────────────────────────────────
  private readonly _proactiveSuggestions = signal<ProactiveSuggestion[]>([]);
  readonly proactiveSuggestions = this._proactiveSuggestions.asReadonly();

  // ─── Bot Collaborations ────────────────────────────────────────────
  private readonly _botCollaborations = signal<
    Record<string, BotCollaboration>
  >({});
  readonly botCollaborations = this._botCollaborations.asReadonly();

  // ─── Predictive Models ────────────────────────────────────────────
  private readonly _predictiveModels = signal<
    Record<string, PredictiveModel[]>
  >({});
  readonly predictiveModels = this._predictiveModels.asReadonly();

  // ─── Bot Workspaces ────────────────────────────────────────────
  private readonly _botWorkspaces = signal<
    Record<
      string,
      {
        memories: AIRangeMemory[];
        lastTasks: string[];
        contextFiles: Record<string, string>;
      }
    >
  >(JSON.parse(localStorage.getItem('ai_bot_workspaces') || '{}'));
  readonly botWorkspaces = this._botWorkspaces.asReadonly();

  // ─── Custom Bot Names ────────────────────────────────────────────
  private readonly _customNames = signal<Record<string, string>>(
    JSON.parse(localStorage.getItem('ai_bot_custom_names') || '{}'),
  );
  readonly customNames = this._customNames.asReadonly();

  // ─── Bot Positions (for drag & drop) ────────────────────────────────────────────
  private readonly _botPositions = signal<
    Record<string, { x: number; y: number }>
  >(JSON.parse(localStorage.getItem('ai_bot_positions') || '{}'));
  readonly botPositions = this._botPositions.asReadonly();

  // ─── User Personalities ────────────────────────────────────────────
  private readonly _userPersonalities = signal<
    Record<string, UserPersonalityProfile>
  >(JSON.parse(localStorage.getItem('ai_user_personalities') || '{}'));
  readonly userPersonalities = this._userPersonalities.asReadonly();

  // ─── Bots Configuration ────────────────────────────────────────────
  private readonly _bots = signal<Record<string, AIBot>>({
    inventory: {
      id: 'inv-bot',
      name: 'Stocky-Bot',
      feature: 'inventory',
      description:
        'Analiza tendencias de consumo de material y gestiona inventario inteligente.',
      skills: [
        'Predicción de Stock',
        'Auto-Aprovisionamiento',
        'Alertas de Caducidad',
        'Optimización de Espacio',
        'Trazabilidad RFID',
        'Auditoría de Daños',
        'Filtrado Inteligente',
        'Análisis de Demanda',
        'Detección de Anomalías',
        'Recomendaciones de Compra',
        'Gestión de Categorías',
        'Reportes Automatizados',
      ],
      activeSkills: [
        'Predicción de Stock',
        'Filtrado Inteligente',
        'Análisis de Demanda',
      ],
      status: 'active',
      color: '#10b981',
      secondaryColor: '#059669',
      mascotType: 'inventory',
      personality: 'worker',
      bodyShape: 'round',
      eyesType: 'dots',
      mouthType: 'o',
    },
    budgets: {
      id: 'bud-bot',
      name: 'Cali-Bot',
      feature: 'budgets',
      description:
        'Calcula márgenes de beneficio en tiempo real y optimiza presupuestos.',
      skills: [
        'Optimización de Márgenes',
        'Detección de Costes Ocultos',
        'Proyección Fiscal',
        'Análisis Comparativo',
        'Sugerencia de Up-selling',
        'Validación de Divisas',
        'Análisis de ROI',
        'Control de Gastos',
        'Predicción de Ingresos',
        'Gestión de Presupuestos',
        'Alertas Financieras',
        'Reportes de Rentabilidad',
      ],
      activeSkills: [
        'Optimización de Márgenes',
        'Análisis de ROI',
        'Control de Gastos',
      ],
      status: 'inactive',
      color: '#34d399',
      secondaryColor: '#065f46',
      mascotType: 'budget',
      personality: 'happy',
      bodyShape: 'capsule',
      eyesType: 'joy',
      mouthType: 'smile',
    },
    projects: {
      id: 'proj-bot',
      name: 'Direct-Bot',
      feature: 'projects',
      description:
        'Coordina los horarios de técnicos y optimiza gestión de proyectos.',
      skills: [
        'Timeline AI',
        'Resource Balancing',
        'Scene Optimizer',
        'Crew Mood Sync',
        'Weather Impact Radar',
        'Smart Call-Sheet',
        'Planificación Automática',
        'Asignación Inteligente',
        'Seguimiento de Progreso',
        'Detección de Conflictos',
        'Optimización de Recursos',
        'Reportes de Eficiencia',
      ],
      activeSkills: [
        'Timeline AI',
        'Planificación Automática',
        'Asignación Inteligente',
      ],
      status: 'active',
      color: '#06b6d4',
      secondaryColor: '#0891b2',
      mascotType: 'projects',
      personality: 'tech',
      bodyShape: 'square',
      eyesType: 'shades',
      mouthType: 'line',
    },
    clients: {
      id: 'cli-bot',
      name: 'Social-Bot',
      feature: 'clients',
      description:
        'Analiza el sentimiento de los clientes y optimiza relaciones comerciales.',
      skills: [
        'Sentiment Analysis',
        'Lead Scoring',
        'Churn Predictor',
        'Auto-FollowUp',
        'Network Expansion',
        'Voice Tone Advisor',
        'Análisis de Satisfacción',
        'Segmentación de Clientes',
        'Predicción de Compras',
        'Gestión de Feedback',
        'Recomendaciones Personalizadas',
        'Alertas de Retención',
      ],
      activeSkills: [
        'Sentiment Analysis',
        'Análisis de Satisfacción',
        'Predicción de Compras',
      ],
      status: 'active',
      color: '#8b5cf6',
      secondaryColor: '#6d28d9',
      mascotType: 'clients',
      personality: 'mystic',
      bodyShape: 'round',
      eyesType: 'dots',
      mouthType: 'smile',
    },
    fleet: {
      id: 'fleet-bot',
      name: 'Drive-Bot',
      feature: 'fleet',
      description: 'Optimiza rutas de transporte y gestiona flota vehicular.',
      skills: [
        'Route Optimization',
        'Predictive Maintenance',
        'Fuel Efficiency AI',
        'Driver Habits Monitor',
        'Load Balancing',
        'Parking Finder',
        'Gestión de Mantenimiento',
        'Análisis de Costos',
        'Monitoreo en Tiempo Real',
        'Optimización de Flota',
        'Planificación de Rutas',
        'Alertas de Seguridad',
      ],
      activeSkills: [
        'Route Optimization',
        'Predictive Maintenance',
        'Monitoreo en Tiempo Real',
      ],
      status: 'inactive',
      color: '#f59e0b',
      secondaryColor: '#d97706',
      mascotType: 'fleet',
      personality: 'explorer',
      bodyShape: 'capsule',
      eyesType: 'shades',
      mouthType: 'o',
    },
    rentals: {
      id: 'rent-bot',
      name: 'Key-Bot',
      feature: 'rentals',
      description: 'Gestiona contratos de alquiler y fidelización de equipos.',
      skills: [
        'Contract Optimizer',
        'Fideloty Scoring',
        'Damage Detection',
        'Price Dynamic AI',
      ],
      activeSkills: ['Contract Optimizer'],
      status: 'active',
      color: '#f43f5e',
      secondaryColor: '#9f1239',
      mascotType: 'rentals',
      personality: 'ninja',
      bodyShape: 'square',
      eyesType: 'dots',
      mouthType: 'smile',
    },
    audit: {
      id: 'audit-bot',
      name: 'Shield-Bot',
      feature: 'audit',
      description: 'Supervisa el cumplimiento normativo y detecta fraudes.',
      skills: ['Fraud Detection', 'Compliance Radar', 'Risk Matrix'],
      activeSkills: ['Compliance Radar'],
      status: 'active',
      color: '#64748b',
      secondaryColor: '#334155',
      mascotType: 'audit',
      personality: 'worker',
      bodyShape: 'tri',
      eyesType: 'shades',
      mouthType: 'line',
    },
    dashboard: {
      id: 'dash-bot',
      name: 'Dash-Bot',
      feature: 'dashboard',
      description:
        'Gestiona métricas y análisis del panel de control principal.',
      skills: [
        'Dashboard Analytics',
        'KPI Monitoring',
        'Report Generation',
        'Data Visualization',
        'Performance Tracking',
        'Alert Management',
        'Trend Analysis',
        'Custom Dashboards',
      ],
      activeSkills: ['Dashboard Analytics', 'KPI Monitoring'],
      status: 'active',
      color: '#facc15',
      secondaryColor: '#ca8a04',
      mascotType: 'dashboard',
      personality: 'tech',
      bodyShape: 'square',
      eyesType: 'shades',
      mouthType: 'line',
    },
    buddy: {
      id: 'buddy-bot',
      name: 'Buddy',
      feature: 'buddy',
      description:
        'Tu compañero orquestador de IA que te acompaña en todos los dominios.',
      skills: [
        'Global Orchestration',
        'Cross-Domain Coordination',
        'Personal Assistance',
        'Context Awareness',
        'Multi-Feature Integration',
        'Intelligent Routing',
        'Knowledge Synthesis',
        'Adaptive Learning',
      ],
      activeSkills: ['Global Orchestration', 'Cross-Domain Coordination'],
      status: 'active',
      color: '#6366f1',
      secondaryColor: '#4f46e5',
      mascotType: 'universal',
      personality: 'happy',
      bodyShape: 'round',
      eyesType: 'joy',
      mouthType: 'smile',
    },
  });
  readonly bots = computed<AIBot[]>(() => Object.values(this._bots()));

  readonly aiModelOptions = computed(() => {
    const options = [
      { value: 'gemini', label: 'Google Gemini 2.5 Flash (Recomendado)' },
      { value: 'openai', label: 'OpenAI GPT-4o' },
      { value: 'anthropic', label: 'Anthropic Claude 3.5' },
      { value: 'huggingface', label: 'HuggingFace Inference API' },
    ];

    const localModels = this.freeModels().localModels;
    if (localModels.length > 0) {
      localModels.forEach((m) => {
        options.push({ value: `ollama:${m}`, label: `Ollama: ${m} (Local)` });
      });
    } else {
      options.push({
        value: 'ollama',
        label: 'Ollama (Sin modelos detectados aún)',
      });
    }

    return options;
  });

  setAIModel(modelId: string) {
    this.selectedModelId.set(modelId);

    if (modelId.startsWith('ollama:')) {
      const model = modelId.split(':')[1];
      this.selectedProvider.set('ollama');
      this.ollamaConfig.update((c) => ({ ...c, model }));
    } else {
      this.selectedProvider.set(
        modelId as
          | 'gemini'
          | 'openai'
          | 'anthropic'
          | 'ollama'
          | 'huggingface'
          | 'free',
      );
    }
  }

  constructor() {
    effect(() => {
      localStorage.setItem('ai_provider', this.selectedProvider());
      localStorage.setItem('ai_selected_model_id', this.selectedModelId());
      localStorage.setItem('ai_api_key', this.providerApiKey());
      localStorage.setItem('ai_active_bot_feature', this.activeBotFeature());
      localStorage.setItem('ollama_base_url', this.ollamaConfig().baseUrl);
      localStorage.setItem('ollama_model', this.ollamaConfig().model);
      localStorage.setItem('hf_model', this.freeModels().huggingface.model);
      localStorage.setItem(
        'local_models',
        JSON.stringify(this.freeModels().localModels),
      );
      localStorage.setItem(
        'ai_global_memories',
        JSON.stringify(this._globalMemories()),
      );
      localStorage.setItem('ai_bot_moods', JSON.stringify(this._botMoods()));
      localStorage.setItem(
        'ai_bot_emotional_states',
        JSON.stringify(this._botEmotionalStates()),
      );
      localStorage.setItem(
        'ai_bot_skills_state',
        JSON.stringify(this._botSkillsState()),
      );
      localStorage.setItem(
        'ai_user_personalities',
        JSON.stringify(this._userPersonalities()),
      );
      localStorage.setItem(
        'ai_bot_workspaces',
        JSON.stringify(this._botWorkspaces()),
      );
      localStorage.setItem(
        'ai_bot_custom_names',
        JSON.stringify(this._customNames()),
      );
      localStorage.setItem(
        'ai_bot_positions',
        JSON.stringify(this._botPositions()),
      );
      localStorage.setItem(
        'ai_proactive_suggestions',
        JSON.stringify(this._proactiveSuggestions()),
      );
      localStorage.setItem(
        'ai_bot_collaborations',
        JSON.stringify(this._botCollaborations()),
      );
      localStorage.setItem(
        'ai_predictive_models',
        JSON.stringify(this._predictiveModels()),
      );
    });
  }

  // ─── Bot Management ────────────────────────────────────────────
  getBotByFeature(feature: string): AIBot | undefined {
    return this._bots()[feature];
  }

  updateBotName(feature: string, name: string) {
    this._customNames.update((current) => ({
      ...current,
      [feature]: name,
    }));
  }

  getBotDisplayName(feature: string): string {
    const customName = this._customNames()[feature];
    const bot = this.getBotByFeature(feature);
    return customName || bot?.name || feature;
  }

  updateBotSkin(feature: string, patch: Partial<AIBot>) {
    this._bots.update((current) => {
      if (!current[feature]) return current;
      return {
        ...current,
        [feature]: { ...current[feature], ...patch },
      };
    });
  }

  toggleBotStatus(feature: string) {
    this._bots.update((current) => {
      if (!current[feature]) return current;
      const bot = current[feature];
      return {
        ...current,
        [feature]: {
          ...bot,
          status: bot.status === 'active' ? 'inactive' : 'active',
        },
      };
    });
  }

  toggleSkill(feature: string, skill: string) {
    this._bots.update((current) => {
      if (!current[feature]) return current;
      const bot = current[feature];
      const activeSkills = bot.activeSkills.includes(skill)
        ? bot.activeSkills.filter((s) => s !== skill)
        : [...bot.activeSkills, skill];
      return {
        ...current,
        [feature]: { ...bot, activeSkills },
      };
    });
  }

  // ─── User Personality System ────────────────────────────────────────────
  getUserPersonality(feature: string, userId: string): UserPersonalityProfile {
    const key = `${feature}::${userId}`;
    return (
      this._userPersonalities()[key] ?? {
        nickname: userId,
        style: 'casual',
        likes: [],
        dislikes: [],
        notes: 'Primera interacción. Aún no conozco bien a este usuario.',
        interactionCount: 0,
        lastSeen: Date.now(),
        learnedPatterns: [],
        preferredTools: [],
        performanceMetrics: [],
        trustLevel: 50,
        successfulInteractions: [],
      }
    );
  }

  updateUserPersonality(
    feature: string,
    userId: string,
    patch: Partial<UserPersonalityProfile>,
  ) {
    const key = `${feature}::${userId}`;
    this._userPersonalities.update((current) => {
      const existing = current[key] ?? this.getUserPersonality(feature, userId);
      const updated = {
        ...current,
        [key]: {
          ...existing,
          ...patch,
          interactionCount:
            (existing.interactionCount ?? 0) +
            (patch.interactionCount != null ? 0 : 1),
          lastSeen: Date.now(),
        },
      };
      return updated;
    });
  }

  trackInteraction(feature: string, userId: string) {
    const key = `${feature}::${userId}`;
    this._userPersonalities.update((current) => {
      const existing = current[key] ?? this.getUserPersonality(feature, userId);
      const updated = {
        ...current,
        [key]: {
          ...existing,
          interactionCount: existing.interactionCount + 1,
          lastSeen: Date.now(),
        },
      };
      return updated;
    });
  }

  // ─── Sistema de Aprendizaje Continuo ──────────────────────────────────────────
  recordSuccessfulInteraction(
    feature: string,
    userId: string,
    query: string,
    tool: string,
    responseTime: number,
  ) {
    const key = `${feature}::${userId}`;
    this._userPersonalities.update((current) => {
      const existing = current[key] ?? this.getUserPersonality(feature, userId);

      const existingPattern = existing.learnedPatterns.find(
        (p) => p.query === query,
      );
      const learnedPatterns = existingPattern
        ? existing.learnedPatterns.map((p) =>
            p.query === query
              ? {
                  ...p,
                  successRate:
                    (p.successRate * p.frequency + 100) / (p.frequency + 1),
                  lastUsed: Date.now(),
                  frequency: p.frequency + 1,
                }
              : p,
          )
        : [
            ...existing.learnedPatterns,
            {
              query,
              successRate: 100,
              lastUsed: Date.now(),
              frequency: 1,
            },
          ]
            .sort((a, b) => b.successRate - a.successRate)
            .slice(0, 20);

      const preferredTools = existing.preferredTools.includes(tool)
        ? existing.preferredTools
        : [tool, ...existing.preferredTools].slice(0, 5);

      const taskType = tool.split('_')[0];
      const existingMetric = existing.performanceMetrics.find(
        (m) => m.taskType === taskType,
      );
      const performanceMetrics = existingMetric
        ? existing.performanceMetrics.map((m) =>
            m.taskType === taskType
              ? {
                  ...m,
                  successCount: m.successCount + 1,
                  avgResponseTime:
                    (m.avgResponseTime * m.successCount + responseTime) /
                    (m.successCount + 1),
                }
              : m,
          )
        : [
            ...existing.performanceMetrics,
            {
              taskType,
              successCount: 1,
              failureCount: 0,
              avgResponseTime: responseTime,
            },
          ];

      const successfulInteractions = [
        {
          query,
          tool,
          outcome: 'success' as const,
          timestamp: Date.now(),
        },
        ...existing.successfulInteractions,
      ].slice(0, 10);

      const trustLevel = Math.min(100, existing.trustLevel + 2);

      const updated = {
        ...current,
        [key]: {
          ...existing,
          learnedPatterns,
          preferredTools,
          performanceMetrics,
          successfulInteractions,
          trustLevel,
        },
      };
      return updated;
    });
  }

  recordFailedInteraction(
    feature: string,
    userId: string,
    query: string,
    tool: string,
  ) {
    const key = `${feature}::${userId}`;
    this._userPersonalities.update((current) => {
      const existing = current[key] ?? this.getUserPersonality(feature, userId);

      const existingPattern = existing.learnedPatterns.find(
        (p) => p.query === query,
      );
      const learnedPatterns = existingPattern
        ? existing.learnedPatterns.map((p) =>
            p.query === query
              ? {
                  ...p,
                  successRate:
                    (p.successRate * p.frequency) / (p.frequency + 1),
                  lastUsed: Date.now(),
                  frequency: p.frequency + 1,
                }
              : p,
          )
        : existing.learnedPatterns;

      const taskType = tool.split('_')[0];
      const existingMetric = existing.performanceMetrics.find(
        (m) => m.taskType === taskType,
      );
      const performanceMetrics = existingMetric
        ? existing.performanceMetrics.map((m) =>
            m.taskType === taskType
              ? { ...m, failureCount: m.failureCount + 1 }
              : m,
          )
        : [
            ...existing.performanceMetrics,
            {
              taskType,
              successCount: 0,
              failureCount: 1,
              avgResponseTime: 0,
            },
          ];

      const trustLevel = Math.max(0, existing.trustLevel - 1);

      const updated = {
        ...current,
        [key]: {
          ...existing,
          learnedPatterns,
          performanceMetrics,
          trustLevel,
        },
      };
      return updated;
    });
  }

  getLearnedPatterns(
    feature: string,
    userId: string,
  ): UserPersonalityProfile['learnedPatterns'] {
    const personality = this.getUserPersonality(feature, userId);
    return personality.learnedPatterns;
  }

  getSmartSuggestions(
    feature: string,
    userId: string,
    currentQuery: string,
  ): string[] {
    const personality = this.getUserPersonality(feature, userId);
    const suggestions: string[] = [];

    if (personality.preferredTools.length > 0) {
      suggestions.push(
        `Herramientas que sueles usar: ${personality.preferredTools.join(', ')}`,
      );
    }

    const similarPatterns = personality.learnedPatterns
      .filter((p) => p.successRate > 70 && p.frequency > 1)
      .filter((p) => this.calculateSimilarity(p.query, currentQuery) > 0.3)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 3);

    if (similarPatterns.length > 0) {
      suggestions.push(
        `Patrones similares exitosos: ${similarPatterns.map((p) => `"${p.query}" (${Math.round(p.successRate)}% éxito)`).join(', ')}`,
      );
    }

    return suggestions;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.toLowerCase().split(' ');
    const words2 = str2.toLowerCase().split(' ');
    const commonWords = words1.filter((word) => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  // ─── Proactive Suggestions ────────────────────────────────────────────
  generateProactiveSuggestions(feature: string): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = [];
    const bot = this.getBotByFeature(feature);
    if (!bot) return suggestions;

    const inactiveSkills = bot.skills.filter(
      (skill) => !bot.activeSkills.includes(skill),
    );
    if (inactiveSkills.length > 0) {
      suggestions.push({
        id: `activate_skill_${feature}_${Date.now()}`,
        botId: feature,
        text: `Considera activar estas skills: ${inactiveSkills.slice(0, 3).join(', ')}`,
        category: 'efficiency',
        timestamp: Date.now(),
      });
    }

    const userPersonality = this.getLearnedPatterns(feature, 'current_user');
    if (userPersonality && userPersonality.length > 0) {
      const topPattern = userPersonality[0];
      if (topPattern.successRate > 80) {
        suggestions.push({
          id: `pattern_suggestion_${feature}_${Date.now()}`,
          botId: feature,
          text: `Usuario responde bien a consultas similares a: "${topPattern.query}" (${Math.round(topPattern.successRate)}% éxito)`,
          category: 'efficiency',
          timestamp: Date.now(),
        });
      }
    }

    switch (feature) {
      case 'inventory':
        suggestions.push({
          id: `inventory_check_${Date.now()}`,
          botId: feature,
          text: 'Revisa productos con stock crítico (< 20% del total)',
          category: 'risk',
          timestamp: Date.now(),
        });
        break;
      case 'budgets':
        suggestions.push({
          id: `budget_review_${Date.now()}`,
          botId: feature,
          text: 'Analiza proyectos con ROI negativo potencial',
          category: 'risk',
          timestamp: Date.now(),
        });
        break;
      case 'projects':
        suggestions.push({
          id: `schedule_check_${Date.now()}`,
          botId: feature,
          text: 'Verifica conflictos en la planificación de proyectos',
          category: 'efficiency',
          timestamp: Date.now(),
        });
        break;
    }

    this._proactiveSuggestions.update((current) =>
      [...suggestions, ...current].slice(0, 20),
    );
    return suggestions;
  }

  getProactiveSuggestions(): ProactiveSuggestion[] {
    return this._proactiveSuggestions();
  }

  getProactiveSuggestionsForBot(botId: string): ProactiveSuggestion[] {
    return this._proactiveSuggestions().filter((s) => s.botId === botId);
  }

  markSuggestionApplied(suggestionId: string) {
    this._proactiveSuggestions.update((current) =>
      current.filter((s) => s.id !== suggestionId),
    );
  }

  // ─── Bot Emotional States ────────────────────────────────────────────
  setBotMood(feature: string, mood: BotMood, energy = 100) {
    this._botMoods.update((current) => ({
      ...current,
      [feature]: { mood, energy },
    }));

    this.updateEmotionalState(feature, {
      primaryMood: mood,
      energy,
      lastMoodChange: Date.now(),
    });
  }

  updateEmotionalState(feature: string, updates: Partial<BotEmotionalState>) {
    this._botEmotionalStates.update((current) => {
      const existing = current[feature] || this.getDefaultEmotionalState();
      const updated = {
        ...existing,
        ...updates,
        lastMoodChange: updates.lastMoodChange || existing.lastMoodChange,
      };
      return { ...current, [feature]: updated };
    });
  }

  private getDefaultEmotionalState(): BotEmotionalState {
    return {
      primaryMood: 'neutral',
      secondaryEmotions: [],
      energy: 80,
      confidence: 70,
      socialDrive: 50,
      learningMode: false,
      lastMoodChange: Date.now(),
      emotionalTriggers: {},
    };
  }

  getEmotionalState(feature: string): BotEmotionalState {
    return (
      this._botEmotionalStates()[feature] || this.getDefaultEmotionalState()
    );
  }

  // ─── Bot Collaborations ────────────────────────────────────────────
  startCollaboration(
    initiator: string,
    title: string,
    description: string,
    participants: string[],
    objective: string,
  ): string {
    const collaborationId = `collab_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const collaboration: BotCollaboration = {
      id: collaborationId,
      title,
      description,
      initiator,
      participants: [initiator, ...participants.filter((p) => p !== initiator)],
      objective,
      status: 'planning',
      tasks: [],
      created: Date.now(),
      progress: 0,
    };

    this._botCollaborations.update((current) => ({
      ...current,
      [collaborationId]: collaboration,
    }));

    this.notifyCollaborationParticipants(collaboration);
    return collaborationId;
  }

  addCollaborationTask(
    collaborationId: string,
    task: Omit<CollaborationTask, 'id'>,
  ): boolean {
    const collaboration = this._botCollaborations()[collaborationId];
    if (!collaboration) return false;

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const fullTask: CollaborationTask = { ...task, id: taskId };

    this._botCollaborations.update((current) => ({
      ...current,
      [collaborationId]: {
        ...collaboration,
        tasks: [...collaboration.tasks, fullTask],
      },
    }));

    return true;
  }

  updateCollaborationProgress(
    collaborationId: string,
    taskId: string,
    status: CollaborationTask['status'],
  ): boolean {
    const collaboration = this._botCollaborations()[collaborationId];
    if (!collaboration) return false;

    const updatedTasks = collaboration.tasks.map((task) =>
      task.id === taskId ? { ...task, status } : task,
    );

    const completedTasks = updatedTasks.filter(
      (task) => task.status === 'completed',
    ).length;
    const progress =
      updatedTasks.length > 0
        ? (completedTasks / updatedTasks.length) * 100
        : 0;

    const newStatus =
      progress === 100
        ? 'completed'
        : updatedTasks.some((task) => task.status === 'blocked')
          ? 'active'
          : 'active';

    this._botCollaborations.update((current) => ({
      ...current,
      [collaborationId]: {
        ...collaboration,
        tasks: updatedTasks,
        progress,
        status: newStatus as BotCollaboration['status'],
      },
    }));

    return true;
  }

  getActiveCollaborations(feature: string): BotCollaboration[] {
    const allCollaborations = Object.values(this._botCollaborations());
    return allCollaborations.filter(
      (collab: BotCollaboration) =>
        collab.participants.includes(feature) &&
        ['planning', 'active'].includes(collab.status),
    );
  }

  suggestCollaborations(feature: string): string[] {
    const suggestions: string[] = [];
    const bot = this.getBotByFeature(feature);

    if (!bot) return suggestions;

    switch (feature) {
      case 'budgets':
        if (
          !this.getActiveCollaborations(feature).some((c) =>
            c.participants.includes('inventory'),
          )
        ) {
          suggestions.push(
            'Colabora con Stocky-Bot para análisis de costos de inventario',
          );
        }
        break;
      case 'clients':
        if (
          !this.getActiveCollaborations(feature).some((c) =>
            c.participants.includes('projects'),
          )
        ) {
          suggestions.push(
            'Coordina con Direct-Bot para asignación de proyectos a clientes satisfechos',
          );
        }
        break;
      case 'delivery':
        if (
          !this.getActiveCollaborations(feature).some((c) =>
            c.participants.includes('fleet'),
          )
        ) {
          suggestions.push(
            'Trabaja con Drive-Bot para optimización de rutas de entrega',
          );
        }
        break;
    }

    return suggestions;
  }

  private notifyCollaborationParticipants(collaboration: BotCollaboration) {
    collaboration.participants.forEach((participant: string) => {
      if (participant !== collaboration.initiator) {
        this.broadcastMessage(
          collaboration.initiator,
          `Te invito a colaborar en: "${collaboration.title}". Objetivo: ${collaboration.objective}`,
          participant,
        );
      }
    });
  }

  // ─── Predictive Models ────────────────────────────────────────────
  createPredictiveModel(
    feature: string,
    type: PredictiveModel['type'],
    name: string,
    description: string,
  ): string {
    const modelId = `model_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const model: PredictiveModel = {
      id: modelId,
      feature,
      type,
      name,
      description,
      accuracy: 0,
      lastTrained: Date.now(),
      predictions: [],
      parameters: {},
    };

    this._predictiveModels.update((current) => ({
      ...current,
      [feature]: [...(current[feature] || []), model],
    }));

    return modelId;
  }

  generatePrediction(
    modelId: string,
    input: Record<string, unknown>,
  ): PredictionResult | null {
    let targetModel: PredictiveModel | null = null;
    let feature = '';

    for (const [feat, models] of Object.entries(this._predictiveModels())) {
      const model = models.find((m) => m.id === modelId);
      if (model) {
        targetModel = model;
        feature = feat;
        break;
      }
    }

    if (!targetModel) return null;

    const prediction = this.calculatePrediction(targetModel, input);
    const confidence = this.calculateConfidence(targetModel, input);

    const result: PredictionResult = {
      id: `pred_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
      input,
      prediction,
      confidence,
    };

    this._predictiveModels.update((current) => ({
      ...current,
      [feature]: current[feature].map((model) =>
        model.id === modelId
          ? { ...model, predictions: [...model.predictions, result] }
          : model,
      ),
    }));

    return result;
  }

  getPredictiveModels(feature: string): PredictiveModel[] {
    return this._predictiveModels()[feature] || [];
  }

  private calculatePrediction(
    model: PredictiveModel,
    input: Record<string, unknown>,
  ): unknown {
    switch (model.type) {
      case 'demand_forecast': {
        const baseDemand = (input['currentStock'] as number) || 100;
        const trend = (input['growthRate'] as number) || 1.1;
        return Math.round(baseDemand * trend);
      }

      case 'churn_prediction': {
        const riskFactors = (input['complaints'] as number) || 0;
        const satisfaction = (input['satisfaction'] as number) || 5;
        const risk = riskFactors * 10 + (5 - satisfaction) * 20;
        return risk > 50 ? 'high_risk' : 'low_risk';
      }

      case 'price_optimization': {
        const cost = (input['cost'] as number) || 0;
        const marketRate = (input['marketRate'] as number) || 1.2;
        return Math.round(cost * marketRate * 1.3);
      }

      default:
        return 'unknown';
    }
  }

  private calculateConfidence(
    model: PredictiveModel,
    input: Record<string, unknown>,
  ): number {
    const baseConfidence = model.accuracy || 50;
    const inputQuality = Object.keys(input).length > 3 ? 20 : 10;
    return Math.min(100, baseConfidence + inputQuality);
  }

  // ─── Memory Management ────────────────────────────────────────────
  remember(feature: string, text: string, importance = 5, isGlobal = false) {
    const memory: AIRangeMemory = {
      text,
      importance,
      timestamp: Date.now(),
      tags: [feature],
      sourceBot: feature,
    };

    if (isGlobal) {
      this._globalMemories.update((current) => {
        const updated = [...current, memory]
          .sort((a, b) => b.importance - a.importance)
          .slice(0, 200);
        return updated;
      });
    }

    this._botWorkspaces.update((current) => {
      const ws = current[feature] || {
        memories: [],
        lastTasks: [],
        contextFiles: {},
      };
      const updatedMemories = [...ws.memories, memory];
      const limited = updatedMemories
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 100);
      const updated = { ...current, [feature]: { ...ws, memories: limited } };
      return updated;
    });

    this.autoSummarizeMemories(feature);
  }

  private autoSummarizeMemories(feature: string) {
    const ws = this.getWorkspace(feature);
    if (ws.memories.length >= 10 && ws.memories.length % 10 === 0) {
      const recentMemories: AIRangeMemory[] = ws.memories.slice(-10);
      const summary = this.generateMemorySummary(recentMemories);

      const summaryMemory: AIRangeMemory = {
        text: `RESUMEN AUTOMÁTICO: ${summary}`,
        importance: 8,
        timestamp: Date.now(),
        tags: [feature, 'summary', 'auto-generated'],
        sourceBot: feature,
      };

      this._botWorkspaces.update((current) => {
        const ws = current[feature] || {
          memories: [],
          lastTasks: [],
          contextFiles: {},
        };
        const updatedMemories = [...ws.memories, summaryMemory];
        const limited = updatedMemories
          .sort((a, b) => b.importance - a.importance)
          .slice(0, 100);
        const updated = { ...current, [feature]: { ...ws, memories: limited } };
        return updated;
      });
    }
  }

  private generateMemorySummary(memories: AIRangeMemory[]): string {
    const topics = memories.map((m: AIRangeMemory) => m.tags).flat();
    const uniqueTopics = [...new Set(topics)];

    const timeRange =
      memories.length > 0
        ? `${new Date(Math.min(...memories.map((m: AIRangeMemory) => m.timestamp))).toLocaleDateString()} - ${new Date(Math.max(...memories.map((m: AIRangeMemory) => m.timestamp))).toLocaleDateString()}`
        : 'período desconocido';

    const avgImportance =
      memories.reduce(
        (sum: number, m: AIRangeMemory) => sum + m.importance,
        0,
      ) / memories.length;

    return `Durante ${timeRange}, se registraron ${memories.length} eventos relacionados con: ${uniqueTopics.join(', ')}. Importancia promedio: ${avgImportance.toFixed(1)}/10.`;
  }

  getWorkspace(feature: string) {
    return (
      this._botWorkspaces()[feature] || {
        memories: [],
        lastTasks: [],
        contextFiles: {},
      }
    );
  }

  // ─── Bot Context Access ────────────────────────────────────────────
  getBotContext(feature: string): AIRangeMemory[] {
    if (feature === 'buddy') {
      // Buddy bot (orchestrator): access to shared store data from all features
      const globalMemories = this._globalMemories();
      const allBotMemories = Object.values(this._botWorkspaces()).flatMap(
        (ws) => ws.memories,
      );
      return [...globalMemories, ...allBotMemories];
    } else {
      // Domain bots (including dashboard): access only to their own domain store data
      return this.getWorkspace(feature).memories;
    }
  }

  // ─── Sistema de Proveedores Gratuitos ─────────────────────────────────────────

  async checkOllamaAvailability(force = false): Promise<boolean> {
    const now = Date.now();
    if (!force && now - this._lastCheckTime < this.CHECK_THROTTLE_MS) {
      return this.ollamaConfig().available;
    }

    this._lastCheckTime = now;
    try {
      const response = await fetch(`${this.ollamaConfig().baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        const availableModels =
          data.models?.map((m: { name: string }) => m.name) || [];
        this.freeModels.update((current) => ({
          ...current,
          localModels: availableModels,
        }));
        this.ollamaConfig.update((config) => ({ ...config, available: true }));
        return true;
      }
    } catch {
      // Silencioso - Ollama no está corriendo localmente
    }
    this.ollamaConfig.update((config) => ({ ...config, available: false }));
    return false;
  }

  configureOllama(baseUrl: string, model: string) {
    this.ollamaConfig.update((config) => ({
      ...config,
      baseUrl,
      model,
    }));
  }

  async autoSelectProvider(): Promise<void> {
    if (this._isCheckingProviders) return;

    // Si ya tenemos una preferencia guardada que no sea 'free', la respetamos
    // No chequeamos Ollama en segundo plano si ya tenemos un proveedor Cloud para evitar el ruido en consola
    const persisted = localStorage.getItem('ai_selected_model_id');
    if (persisted && persisted !== 'free' && persisted !== 'ollama') {
      return;
    }

    this._isCheckingProviders = true;
    const providers = [
      { name: 'ollama', check: () => this.checkOllamaAvailability() },
      { name: 'huggingface', check: () => Promise.resolve(true) },
      { name: 'gemini', check: () => Promise.resolve(!!this.providerApiKey()) },
      { name: 'openai', check: () => Promise.resolve(!!this.providerApiKey()) },
    ];

    for (const provider of providers) {
      try {
        const available = await provider.check();
        if (available) {
          this.selectedProvider.set(
            provider.name as
              | 'gemini'
              | 'openai'
              | 'anthropic'
              | 'ollama'
              | 'huggingface'
              | 'free',
          );
          console.debug(
            `Proveedor seleccionado automáticamente: ${provider.name}`,
          );
          this._isCheckingProviders = false;
          return;
        }
      } catch {
        // Ignorar errores de verificación de disponibilidad
      }
    }

    this.selectedProvider.set('free');
    this._isCheckingProviders = false;
  }

  getProviderStatus(): Record<string, boolean> {
    return {
      gemini: !!this.providerApiKey(),
      openai: !!this.providerApiKey(),
      anthropic: !!this.providerApiKey(),
      ollama: this.ollamaConfig().available,
      huggingface: this.freeModels().huggingface.available,
      free: true,
    };
  }

  async generateFreeResponse(
    prompt: string,
    context?: string,
  ): Promise<string> {
    const provider = this.selectedProvider();

    try {
      switch (provider) {
        case 'gemini':
          return await this.generateWithGemini(prompt, context);
        case 'openai':
          return await this.generateWithOpenAI(prompt, context);
        case 'ollama':
          return await this.generateWithOllama(prompt, context);
        case 'huggingface':
          return await this.generateWithHuggingFace(prompt, context);
        case 'free':
          return this.generateBasicResponse(prompt);
        default:
          return this.generateBasicResponse(prompt);
      }
    } catch (error) {
      console.warn(`Error con ${provider}, intentando fallback:`, error);
      await this.autoSelectProvider();
      return this.generateBasicResponse(prompt);
    }
  }

  private async generateWithOllama(
    prompt: string,
    context?: string,
  ): Promise<string> {
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

    const response = await fetch(
      `${this.ollamaConfig().baseUrl}/api/generate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.ollamaConfig().model,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: 256,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || 'Lo siento, no pude generar una respuesta.';
  }

  private async generateWithHuggingFace(
    prompt: string,
    context?: string,
  ): Promise<string> {
    const fullPrompt = context
      ? `${context}\n\nUsuario: ${prompt}\nAsistente:`
      : `Usuario: ${prompt}\nAsistente:`;

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${this.freeModels().huggingface.model}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hf_token') || ''}`,
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_length: 256,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false,
          },
          options: {
            wait_for_model: true,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HuggingFace error: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text.replace(fullPrompt, '').trim();
    } else if (data.generated_text) {
      return data.generated_text.replace(fullPrompt, '').trim();
    }

    return 'Lo siento, no pude generar una respuesta.';
  }

  private generateBasicResponse(prompt: string): string {
    // Respuestas básicas predefinidas cuando no hay modelos disponibles
    const responses = {
      greeting: [
        '¡Hola! Soy un asistente básico. Para respuestas más inteligentes, configura un modelo de IA.',
        '¡Hola! Estoy funcionando en modo básico. Considera configurar Ollama o HuggingFace para mejores respuestas.',
        '¡Hola! Funciono con respuestas predefinidas. Para IA avanzada, configura un proveedor gratuito.',
      ],
      help: [
        'Puedo ayudarte con tareas básicas. Para funcionalidades avanzadas, configura un modelo de IA gratuito como Ollama.',
        'Estoy en modo básico. Configura Ollama o HuggingFace para análisis inteligente de datos.',
        'Funcionalidades limitadas activas. Para IA completa, instala Ollama o usa HuggingFace.',
      ],
      default: [
        'Entiendo tu consulta. Para respuestas más precisas, configura un modelo de IA gratuito.',
        'Procesé tu mensaje. Considera configurar Ollama para respuestas más inteligentes.',
        'Mensaje recibido. Para análisis avanzado, usa un proveedor de IA gratuito.',
      ],
    };

    const lowerPrompt = prompt.toLowerCase();

    if (
      lowerPrompt.includes('hola') ||
      lowerPrompt.includes('hello') ||
      lowerPrompt.includes('hi')
    ) {
      return responses.greeting[
        Math.floor(Math.random() * responses.greeting.length)
      ];
    }

    if (
      lowerPrompt.includes('ayuda') ||
      lowerPrompt.includes('help') ||
      lowerPrompt.includes('configur')
    ) {
      return responses.help[Math.floor(Math.random() * responses.help.length)];
    }

    return responses.default[
      Math.floor(Math.random() * responses.default.length)
    ];
  }

  private async generateWithGemini(
    prompt: string,
    context?: string,
  ): Promise<string> {
    const apiKey = this.providerApiKey();
    if (!apiKey) throw new Error('API Key de Gemini no configurada');

    const fullPrompt = context ? `${context}\n\nPregunta: ${prompt}` : prompt;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error en Gemini API');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private async generateWithOpenAI(
    prompt: string,
    context?: string,
  ): Promise<string> {
    const apiKey = this.providerApiKey();
    if (!apiKey) throw new Error('API Key de OpenAI no configurada');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          ...(context ? [{ role: 'system', content: context }] : []),
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error en OpenAI API');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // ─── Inter-Bot Communication ───────────────────────────────────────────────

  /** Enviar mensaje a otro bot */
  sendInterBotMessage(fromFeature: string, toFeature: string, message: string) {
    // Por ahora, solo log para futuras implementaciones
    console.log(
      `Mensaje inter-bot: ${fromFeature} -> ${toFeature}: ${message}`,
    );
    // Aquí se podría implementar comunicación real entre bots
  }

  /** Obtener mensajes pendientes de otros bots */
  pullInterBotMessagesFor(feature: string): InterBotMessage[] {
    // Implementación básica - devolver array vacío para el feature solicitado (placeholder para futuras colas)
    if (!feature) return [];
    return [];
  }

  /** Tick del sistema inter-bot */
  interBotTick() {
    // Procesar mensajes inter-bot pendientes
    // Por ahora vacío para futuras implementaciones
  }

  /** Broadcast message to a specific bot/feature or all */
  broadcastMessage(from: string, message: string, to: string) {
    if (to === 'all') {
      // Broadcast to all bots
      (this.bots() as AIBot[]).forEach((bot: AIBot) => {
        if (bot.feature !== from) {
          console.log(`Broadcast from ${from} to ${bot.feature}: ${message}`);
        }
      });
    } else {
      // Send to specific bot
      console.log(`Broadcast from ${from} to ${to}: ${message}`);
    }
    // Could trigger UI notification or inter-bot message
  }

  // ─── Rage Mode & UI Features ──────────────────────────────────────────────

  private readonly _rageMode = signal(false);
  readonly rageMode = this._rageMode.asReadonly();

  private readonly _rageStyle = signal<'terror' | 'angry' | 'dark'>('terror');
  readonly rageStyle = this._rageStyle.asReadonly();

  setRageMode(enabled: boolean) {
    this._rageMode.set(enabled);
  }

  setRageStyle(style: 'terror' | 'angry' | 'dark') {
    this._rageStyle.set(style);
  }

  // ─── Additional UI Integration Methods ──────────────────────────────────────

  /** Get dynamic canvas HTML for features */
  dynamicCanvas(): Record<string, string> {
    return {
      login:
        '<div class="welcome-message"><h2>¡Bienvenido a Josanz ERP!</h2><p>Sistema de gestión integral con IA avanzada</p></div>',
      dashboard:
        '<div class="dashboard-canvas"><div class="stats">Estadísticas en tiempo real</div></div>',
    };
  }

  /** Send inter-bot display message */
  sendInterBotDisplay(
    fromFeature: string,
    toFeature: string,
    displayData: unknown,
  ) {
    console.log(
      `Display message from ${fromFeature} to ${toFeature}:`,
      displayData,
    );
    // Could trigger UI updates or notifications
  }
}
