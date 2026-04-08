import { Injectable, signal, computed, effect } from '@angular/core';

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
  secondaryEmotions: string[]; // ej: ['frustrated', 'excited', 'concerned']
  energy: number; // 0-100
  confidence: number; // 0-100
  socialDrive: number; // 0-100 (deseo de interactuar con otros bots)
  learningMode: boolean; // si está en modo aprendizaje activo
  lastMoodChange: number;
  emotionalTriggers: Record<string, number>; // qué cosas afectan su estado emocional
}

export interface BotCollaboration {
  id: string;
  title: string;
  description: string;
  initiator: string; // bot que inició la colaboración
  participants: string[]; // bots participantes
  objective: string;
  status: 'planning' | 'active' | 'completed' | 'failed';
  tasks: CollaborationTask[];
  created: number;
  deadline?: number;
  progress: number; // 0-100
}

export interface CollaborationTask {
  id: string;
  description: string;
  assignedTo: string; // bot feature
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  dependencies: string[]; // IDs de tareas que deben completarse primero
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PredictiveModel {
  id: string;
  feature: string; // bot que creó el modelo
  type:
    | 'demand_forecast'
    | 'churn_prediction'
    | 'price_optimization'
    | 'resource_planning'
    | 'risk_assessment';
  name: string;
  description: string;
  accuracy: number; // 0-100
  lastTrained: number;
  predictions: PredictionResult[];
  parameters: Record<string, any>; // parámetros del modelo
}

export interface PredictionResult {
  id: string;
  timestamp: number;
  input: Record<string, any>;
  prediction: any;
  confidence: number; // 0-100
  actual?: any; // valor real cuando se valida
  accuracy?: number; // precisión de esta predicción específica
}

export interface ProactiveSuggestion {
  id: string;
  botId: string;
  text: string;
  action?: string;
  category: 'efficiency' | 'risk' | 'opportunity';
  timestamp: number;
}

export interface AIRangeMemory {
  text: string;
  importance: number;
  timestamp: number;
  tags: string[];
  sourceBot?: string;
}

/** Mensaje entre bots (entregado al chat del `targetFeature`). */
export interface InterBotEnvelope {
  readonly from: string;
  readonly text: string;
  /** Si true, solo se muestra en el chat del destinatario (sin nueva llamada al modelo). */
  readonly displayOnly?: boolean;
}

export interface AIBot {
  id: string;
  name: string;
  feature: string;
  description: string;
  skills: string[];
  status: 'active' | 'inactive';
  color: string;
  secondaryColor: string;
  mascotType: any;
  personality: any;
  bodyShape: any;
  eyesType: any;
  mouthType: any;
  activeSkills: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AIBotStore {
  readonly selectedProvider = signal<'gemini' | 'openai' | 'anthropic'>(
    (localStorage.getItem('ai_provider') as any) || 'gemini',
  );
  readonly providerApiKey = signal<string>(
    localStorage.getItem('ai_api_key') || '',
  );

  // Custom names stored in local storage: feature -> name
  private readonly _customNames = signal<Record<string, string>>(
    JSON.parse(localStorage.getItem('ai_bot_custom_names') || '{}'),
  );

  constructor() {
    effect(() => {
      localStorage.setItem('ai_provider', this.selectedProvider());
      localStorage.setItem('ai_api_key', this.providerApiKey());
      localStorage.setItem(
        'ai_bot_custom_names',
        JSON.stringify(this._customNames()),
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

  // Bot Emotional States (Advanced)
  private readonly _botEmotionalStates = signal<
    Record<string, BotEmotionalState>
  >(JSON.parse(localStorage.getItem('ai_bot_emotional_states') || '{}'));
  readonly botEmotionalStates = this._botEmotionalStates.asReadonly();

  // Legacy support for simple moods
  private readonly _botMoods = signal<
    Record<string, { mood: BotMood; energy: number }>
  >(JSON.parse(localStorage.getItem('ai_bot_moods') || '{}'));
  readonly botMoods = this._botMoods.asReadonly();

  // Sistema de Skills Avanzado
  private readonly _botSkillsState = signal<
    Record<
      string,
      {
        activeSkills: string[];
        skillMastery: Record<string, number>; // 0-100 nivel de dominio
        skillUsage: Record<
          string,
          { count: number; lastUsed: number; avgSuccess: number }
        >;
        learningQueue: string[]; // Skills que está aprendiendo
      }
    >
  >(JSON.parse(localStorage.getItem('ai_bot_skills_state') || '{}'));
  readonly botSkillsState = this._botSkillsState.asReadonly();

  setBotMood(feature: string, mood: BotMood, energy = 100) {
    // Legacy method for backward compatibility
    this._botMoods.update((current) => ({
      ...current,
      [feature]: { mood, energy },
    }));

    // Update advanced emotional state
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

  broadcastSuggestion(
    suggestion: Omit<ProactiveSuggestion, 'id' | 'timestamp'>,
  ) {
    const full: ProactiveSuggestion = {
      ...suggestion,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
    };
    this._proactiveSuggestions.update((current) =>
      [full, ...current].slice(0, 10),
    );
  }

  // Global Context (Antigravity-style shared knowledge)
  private readonly _globalMemories = signal<AIRangeMemory[]>(
    JSON.parse(localStorage.getItem('ai_global_memories') || '[]'),
  );
  readonly globalMemories = this._globalMemories.asReadonly();

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
      description: 'Gestiona la disponibilidad de equipos.',
      skills: [
        'Conflict Detection',
        'Auto-Reservation',
        'Price Surge Guard',
        'Smart Late-Return Hub',
        'Insurance Advisor',
        'Bundle Recommender',
      ],
      activeSkills: ['Conflict Detection'],
      status: 'active',
      color: '#3b82f6',
      secondaryColor: '#1d4ed8',
      mascotType: 'rentals',
      personality: 'ninja',
      bodyShape: 'square',
      eyesType: 'dots',
      mouthType: 'line',
    },
    audit: {
      id: 'audit-bot',
      name: 'Scout-Bot',
      feature: 'audit',
      description: 'Detecta anomalías en los logs de acceso.',
      skills: [
        'Anomaly Detection',
        'Risk Assessment',
        'Breach Prevention',
        'Compliance Guard',
        'Audit Trail Summary',
        'Integrity Scanner',
      ],
      activeSkills: ['Anomaly Detection'],
      status: 'active',
      color: '#ef4444',
      secondaryColor: '#b91c1c',
      mascotType: 'audit',
      personality: 'tech',
      bodyShape: 'round',
      eyesType: 'shades',
      mouthType: 'o',
    },
    verifactu: {
      id: 'verifactu-bot',
      name: 'Tax-Bot',
      feature: 'verifactu',
      description: 'Asegura cumplimiento legal en facturación.',
      skills: [
        'Fiscal Validation',
        'Auto-Reporting',
        'Error Rectifier',
        'Audit-Ready Export',
        'Reg-Tech Sync',
        'Electronic Seal Guard',
      ],
      activeSkills: [],
      status: 'inactive',
      color: '#f43f5e',
      secondaryColor: '#9f1239',
      mascotType: 'universal',
      personality: 'queen',
      bodyShape: 'capsule',
      eyesType: 'joy',
      mouthType: 'smile',
    },
    billing: {
      id: 'bill-bot',
      name: 'Factu-Bot',
      feature: 'billing',
      description: 'Gestiona facturas y cumplimiento fiscal con IA.',
      skills: [
        'Invoice Generator',
        'Verifactu Guard',
        'Tax Optimization',
        'Late Payment Alert',
        'Client Risk Score',
        'PDF Auto-Export',
      ],
      activeSkills: ['Invoice Generator', 'Verifactu Guard'],
      status: 'active',
      color: '#f59e0b',
      secondaryColor: '#b45309',
      mascotType: 'inventory',
      personality: 'tech',
      bodyShape: 'square',
      eyesType: 'shades',
      mouthType: 'line',
    },
    delivery: {
      id: 'delivery-bot',
      name: 'Logis-Bot',
      feature: 'delivery',
      description: 'Coordina entregas y albaranes logísticos.',
      skills: [
        'Route Optimizer',
        'ETA Predictor',
        'Signature Validator',
        'Return Manager',
        'Fleet Sync',
        'Incident Alerter',
      ],
      activeSkills: ['Route Optimizer', 'ETA Predictor'],
      status: 'active',
      color: '#10b981',
      secondaryColor: '#065f46',
      mascotType: 'fleet',
      personality: 'explorer',
      bodyShape: 'capsule',
      eyesType: 'dots',
      mouthType: 'smile',
    },
    services: {
      id: 'services-bot',
      name: 'Craft-Bot',
      feature: 'services',
      description: 'Analiza el catálogo de servicios y sugiere optimizaciones.',
      skills: [
        'Pricing Optimizer',
        'Bundle Suggester',
        'Demand Analyzer',
        'Seasonal Advisor',
        'Margin Guard',
        'Competitor Radar',
      ],
      activeSkills: ['Pricing Optimizer'],
      status: 'active',
      color: '#8b5cf6',
      secondaryColor: '#6d28d9',
      mascotType: 'projects',
      personality: 'happy',
      bodyShape: 'round',
      eyesType: 'joy',
      mouthType: 'smile',
    },
    receipts: {
      id: 'receipts-bot',
      name: 'Pay-Bot',
      feature: 'receipts',
      description: 'Controla cobros pendientes y alerta de impagos.',
      skills: [
        'Payment Tracker',
        'Overdue Alerter',
        'Payment Method Optimizer',
        'Cash Flow Forecast',
        'Dunning Automator',
        'Reconciliation AI',
      ],
      activeSkills: ['Payment Tracker', 'Overdue Alerter'],
      status: 'active',
      color: '#06b6d4',
      secondaryColor: '#0891b2',
      mascotType: 'clients',
      personality: 'worker',
      bodyShape: 'round',
      eyesType: 'dots',
      mouthType: 'o',
    },
    dashboard: {
      id: 'buddy-bot',
      name: 'Buddy-Bot',
      feature: 'dashboard',
      description:
        'Tu mejor amigo y pato de confianza. Memoriza hitos, da consejos y te escucha.',
      skills: [
        'Joke Teller',
        'Milestone Memory',
        'Daily Advice',
        'Active Listener',
        'Mental Tracker',
        'Duck Noises',
      ],
      activeSkills: ['Joke Teller', 'Milestone Memory', 'Active Listener'],
      status: 'active',
      color: '#facc15',
      secondaryColor: '#ca8a04',
      mascotType: 'dashboard',
      personality: 'happy',
      bodyShape: 'capsule',
      eyesType: 'joy',
      mouthType: 'beak',
    },
    events: {
      id: 'evt-bot',
      name: 'Party-Bot',
      feature: 'events',
      description: 'Organiza la logística de eventos y fiestas.',
      skills: [
        'Guest Optimization',
        'A/V Checklist',
        'Catering AI',
        'Social Sync',
        'Mood Lighting Advisor',
        'Budget Party Guard',
      ],
      activeSkills: ['Guest Optimization'],
      status: 'active',
      color: '#f472b6',
      secondaryColor: '#db2777',
      mascotType: 'universal',
      personality: 'happy',
      bodyShape: 'round',
      eyesType: 'joy',
      mouthType: 'smile',
    },
    reports: {
      id: 'rep-bot',
      name: 'Data-Bot',
      feature: 'reports',
      description: 'Analiza datos complejos y genera insights.',
      skills: [
        'Trend Spotter',
        'Anomaly Detective',
        'Executive Summary AI',
        'Chart Wizard',
        'Predictive Modeling',
        'Data Cleaning Bot',
      ],
      activeSkills: ['Trend Spotter'],
      status: 'active',
      color: '#6366f1',
      secondaryColor: '#4338ca',
      mascotType: 'inventory',
      personality: 'worker',
      bodyShape: 'square',
      eyesType: 'dots',
      mouthType: 'line',
    },
    availability: {
      id: 'aval-bot',
      name: 'Time-Bot',
      feature: 'availability',
      description:
        'Gestiona la disponibilidad técnica y planifica calendarios.',
      skills: [
        'Auto-Planificación',
        'Alerta de Solapamiento',
        'Predicción de Bajas',
        'Control Horario AI',
      ],
      activeSkills: ['Auto-Planificación'],
      status: 'active',
      color: '#ec4899',
      secondaryColor: '#be185d',
      mascotType: 'projects',
      personality: 'tech',
      bodyShape: 'capsule',
      eyesType: 'shades',
      mouthType: 'smile',
    },
  });

  readonly bots = computed(() => {
    const defaultBots = this._bots();
    const customNames = this._customNames();

    return Object.entries(defaultBots).map(([feature, bot]) => ({
      ...bot,
      name: customNames[feature] ?? bot.name,
    }));
  });

  getBotByFeature(feature: string) {
    const bot = this._bots()[feature];
    if (!bot) return undefined;
    const customName = this._customNames()[feature];
    return {
      ...bot,
      name: customName ?? bot.name,
    };
  }

  toggleBotStatus(feature: string) {
    this._bots.update((current) => {
      const bot = current[feature];
      if (!bot) return current;
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
      const bot = current[feature];
      if (!bot) return current;
      const isActive = bot.activeSkills.includes(skill);
      const newActiveSkills = isActive
        ? bot.activeSkills.filter((s) => s !== skill)
        : [...bot.activeSkills, skill];

      return {
        ...current,
        [feature]: { ...bot, activeSkills: newActiveSkills },
      };
    });
  }

  isSkillActive(feature: string, skill: string): boolean {
    const bot = this._bots()[feature];
    return bot?.activeSkills.includes(skill) || false;
  }

  updateBotSkin(feature: string, updates: Partial<AIBot>) {
    this._bots.update((current) => {
      const bot = current[feature];
      if (!bot) return current;
      return {
        ...current,
        [feature]: { ...bot, ...updates },
      };
    });
  }

  updateBotName(feature: string, newName: string) {
    if (!newName.trim()) return;
    this._customNames.update((current) => ({
      ...current,
      [feature]: newName.trim(),
    }));
  }

  // Communication Bus
  private readonly _messageBus = signal<{
    feature: string;
    text: string;
    timestamp: number;
    target?: string;
  } | null>(null);
  readonly latestMessage = this._messageBus.asReadonly();

  broadcastMessage(feature: string, text: string, target?: string) {
    this._messageBus.set({ feature, text, timestamp: Date.now(), target });
  }

  private readonly _interBotInbox = signal<Record<string, InterBotEnvelope[]>>(
    {},
  );

  /** Incrementa en cada mensaje inter-bot para que los asistentes reaccionen (effect). */
  readonly interBotTick = signal(0);

  private enqueueInterBotMessage(
    targetFeature: string,
    env: InterBotEnvelope,
  ): void {
    this._interBotInbox.update((current) => {
      const prev = current[targetFeature] ?? [];
      return { ...current, [targetFeature]: [...prev, env] };
    });
    this.interBotTick.update((n) => n + 1);
  }

  /**
   * Extrae y vacía la cola de mensajes dirigidos a un bot por su `feature`.
   * Cada instancia del asistente llama solo con su propio feature.
   */
  pullInterBotMessagesFor(targetFeature: string): InterBotEnvelope[] {
    let taken: InterBotEnvelope[] = [];
    this._interBotInbox.update((current) => {
      taken = [...(current[targetFeature] ?? [])];
      return { ...current, [targetFeature]: [] };
    });
    return taken;
  }

  /** Respuesta de un bot que solo debe mostrarse en el chat del destinatario (evita bucles de IA). */
  sendInterBotDisplay(
    fromFeature: string,
    toFeature: string,
    text: string,
  ): void {
    const t = text.trim();
    if (!t) return;
    this.enqueueInterBotMessage(toFeature, {
      from: fromFeature,
      text: t,
      displayOnly: true,
    });
  }

  // Rage Mode
  private readonly _rageMode = signal<boolean>(
    localStorage.getItem('ai_rage_mode') === 'true',
  );
  readonly rageMode = this._rageMode.asReadonly();

  private readonly _rageStyle = signal<'terror' | 'angry' | 'dark'>(
    (localStorage.getItem('ai_rage_style') as any) || 'angry',
  );
  readonly rageStyle = this._rageStyle.asReadonly();

  setRageMode(enabled: boolean) {
    this._rageMode.set(enabled);
    localStorage.setItem('ai_rage_mode', enabled.toString());
  }

  setRageStyle(style: 'terror' | 'angry' | 'dark') {
    this._rageStyle.set(style);
    localStorage.setItem('ai_rage_style', style);
  }

  // Inter-Bot Social Relationship System
  private readonly _relationships = signal<
    Record<string, { bond: number; history: string[] }>
  >(JSON.parse(localStorage.getItem('ai_bot_relationships') || '{}'));
  readonly relationships = this._relationships.asReadonly();

  recordInteraction(from: string, to: string, text: string, quality: number) {
    const key = [from, to].sort().join('_');
    const current = this._relationships()[key] || { bond: 50, history: [] };

    const newBond = Math.min(100, Math.max(0, current.bond + quality));
    const newHistory = [text, ...current.history].slice(0, 10); // Keep last 10 interactions

    const updated = {
      ...this._relationships(),
      [key]: { bond: newBond, history: newHistory },
    };
    this._relationships.set(updated);
    localStorage.setItem('ai_bot_relationships', JSON.stringify(updated));

    this.enqueueInterBotMessage(to, { from, text, displayOnly: false });
  }

  // Workspace & Memory System
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

  // Dynamic Canvas System
  private readonly _dynamicCanvas = signal<Record<string, string>>(
    JSON.parse(localStorage.getItem('ai_dynamic_canvas') || '{}'),
  );
  readonly dynamicCanvas = this._dynamicCanvas.asReadonly();

  // Sistema de Sugerencias Proactivas
  private readonly _proactiveSuggestions = signal<ProactiveSuggestion[]>([]);
  readonly proactiveSuggestions = this._proactiveSuggestions.asReadonly();

  // Sistema de Colaboración entre Bots
  private readonly _botCollaborations = signal<
    Record<string, BotCollaboration>
  >({});
  readonly botCollaborations = this._botCollaborations.asReadonly();

  // Sistema de Análisis Predictivo
  private readonly _predictiveModels = signal<
    Record<string, PredictiveModel[]>
  >(JSON.parse(localStorage.getItem('ai_predictive_models') || '{}'));
  readonly predictiveModels = this._predictiveModels.asReadonly();

  updateCanvas(key: string, html: string) {
    this._dynamicCanvas.update((current) => {
      const updated = { ...current, [key]: html };
      localStorage.setItem('ai_dynamic_canvas', JSON.stringify(updated));
      return updated;
    });
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
      localStorage.setItem('ai_bot_workspaces', JSON.stringify(updated));
      return updated;
    });

    // Generar resumen automático cada 10 memorias
    this.autoSummarizeMemories(feature);
  }

  private autoSummarizeMemories(feature: string) {
    const ws = this.getWorkspace(feature);
    if (ws.memories.length >= 10 && ws.memories.length % 10 === 0) {
      const recentMemories: AIRangeMemory[] = ws.memories.slice(-10);
      const summary = this.generateMemorySummary(recentMemories, feature);

      // Crear memoria de resumen con alta importancia
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
        localStorage.setItem('ai_bot_workspaces', JSON.stringify(updated));
        return updated;
      });
    }
  }

  private generateMemorySummary(
    memories: AIRangeMemory[],
    feature: string,
  ): string {
    const topics = memories.map((m) => m.tags).flat();
    const uniqueTopics = [...new Set(topics)];

    const timeRange =
      memories.length > 0
        ? `${new Date(Math.min(...memories.map((m) => m.timestamp))).toLocaleDateString()} - ${new Date(Math.max(...memories.map((m) => m.timestamp))).toLocaleDateString()}`
        : 'período desconocido';

    const avgImportance =
      memories.reduce((sum, m) => sum + m.importance, 0) / memories.length;

    return `Durante ${timeRange}, se registraron ${memories.length} eventos relacionados con: ${uniqueTopics.join(', ')}. Importancia promedio: ${avgImportance.toFixed(1)}/10.`;
  }

  logTaskExecution(feature: string, functionName: string, args: any) {
    this._botWorkspaces.update((current) => {
      const ws = current[feature] || {
        memories: [],
        lastTasks: [],
        contextFiles: {},
      };
      const taskStr = `[${new Date().toISOString()}] Ejecutó: ${functionName}(${JSON.stringify(args) || ''})`;
      const updatedTasks = [taskStr, ...ws.lastTasks].slice(0, 50);
      const updated = {
        ...current,
        [feature]: { ...ws, lastTasks: updatedTasks },
      };
      localStorage.setItem('ai_bot_workspaces', JSON.stringify(updated));
      return updated;
    });
  }

  writeContextFile(feature: string, filename: string, content: string) {
    this._botWorkspaces.update((current) => {
      const ws = current[feature] || {
        memories: [],
        lastTasks: [],
        contextFiles: {},
      };
      const updated = {
        ...current,
        [feature]: {
          ...ws,
          contextFiles: { ...ws.contextFiles, [filename]: content },
        },
      };
      localStorage.setItem('ai_bot_workspaces', JSON.stringify(updated));
      return updated;
    });
  }

  deleteContextFile(feature: string, filename: string) {
    this._botWorkspaces.update((current) => {
      const ws = current[feature] || {
        memories: [],
        lastTasks: [],
        contextFiles: {},
      };
      const newFiles = { ...ws.contextFiles };
      delete newFiles[filename];
      const updated = {
        ...current,
        [feature]: { ...ws, contextFiles: newFiles },
      };
      localStorage.setItem('ai_bot_workspaces', JSON.stringify(updated));
      return updated;
    });
  }

  // ─── Per-User Personality System ────────────────────────────────────────────
  // Key format: `${botFeature}::${userId}`
  private readonly _userPersonalities = signal<
    Record<string, UserPersonalityProfile>
  >(JSON.parse(localStorage.getItem('ai_user_personalities') || '{}'));
  readonly userPersonalities = this._userPersonalities.asReadonly();

  /** Get (or bootstrap) the personality profile a specific bot has built for a specific user. */
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
        trustLevel: 50, // Nivel neutral inicial
        successfulInteractions: [],
      }
    );
  }

  /** Update specific fields of a bot→user personality profile. */
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
      localStorage.setItem('ai_user_personalities', JSON.stringify(updated));
      return updated;
    });
  }

  /** Called after each user message to bump the interaction counter. */
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
      localStorage.setItem('ai_user_personalities', JSON.stringify(updated));
      return updated;
    });
  }

  // ─── Sistema de Aprendizaje Continuo ──────────────────────────────────────────

  /** Registrar una interacción exitosa para aprendizaje */
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

      // Actualizar patrones aprendidos
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
            .slice(0, 20); // Mantener top 20

      // Actualizar herramientas preferidas
      const preferredTools = existing.preferredTools.includes(tool)
        ? existing.preferredTools
        : [tool, ...existing.preferredTools].slice(0, 5);

      // Actualizar métricas de rendimiento
      const taskType = tool.split('_')[0]; // Ej: 'filter' de 'filter_inventory'
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

      // Actualizar interacciones exitosas
      const successfulInteractions = [
        {
          query,
          tool,
          outcome: 'success' as const,
          timestamp: Date.now(),
        },
        ...existing.successfulInteractions,
      ].slice(0, 10);

      // Aumentar nivel de confianza
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
      localStorage.setItem('ai_user_personalities', JSON.stringify(updated));
      return updated;
    });
  }

  /** Registrar una interacción fallida para aprendizaje */
  recordFailedInteraction(
    feature: string,
    userId: string,
    query: string,
    tool: string,
  ) {
    const key = `${feature}::${userId}`;
    this._userPersonalities.update((current) => {
      const existing = current[key] ?? this.getUserPersonality(feature, userId);

      // Actualizar patrones aprendidos con menor éxito
      const existingPattern = existing.learnedPatterns.find(
        (p) => p.query === query,
      );
      const learnedPatterns = existingPattern
        ? existing.learnedPatterns.map((p) =>
            p.query === query
              ? {
                  ...p,
                  successRate:
                    (p.successRate * p.frequency) / (p.frequency + 1), // Disminuye success rate
                  lastUsed: Date.now(),
                  frequency: p.frequency + 1,
                }
              : p,
          )
        : existing.learnedPatterns; // No agregar patrones fallidos nuevos

      // Actualizar métricas de rendimiento
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

      // Disminuir nivel de confianza
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
      localStorage.setItem('ai_user_personalities', JSON.stringify(updated));
      return updated;
    });
  }

  /** Obtener patrones aprendidos para un usuario */
  getLearnedPatterns(
    feature: string,
    userId: string,
  ): UserPersonalityProfile['learnedPatterns'] {
    const personality = this.getUserPersonality(feature, userId);
    return personality.learnedPatterns;
  }

  /** Obtener sugerencias basadas en aprendizaje */
  getSmartSuggestions(
    feature: string,
    userId: string,
    currentQuery: string,
  ): string[] {
    const personality = this.getUserPersonality(feature, userId);
    const suggestions: string[] = [];

    // Sugerir herramientas preferidas
    if (personality.preferredTools.length > 0) {
      suggestions.push(
        `Herramientas que sueles usar: ${personality.preferredTools.join(', ')}`,
      );
    }

    // Sugerir patrones similares exitosos
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

  // ─── Sistema de Sugerencias Proactivas ────────────────────────────────────────

  /** Genera sugerencias proactivas basadas en análisis del bot */
  generateProactiveSuggestions(feature: string): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = [];
    const bot = this.getBotByFeature(feature);
    if (!bot) return suggestions;

    // Sugerencias basadas en skills disponibles pero no activas
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

    // Sugerencias basadas en patrones de usuario
    const userPersonality = this.getLearnedPatterns(feature, 'current_user'); // Asumiendo que hay un usuario actual
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

    // Sugerencias específicas por feature
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

    // Agregar sugerencias a la lista global
    this._proactiveSuggestions.update((current) =>
      [...suggestions, ...current].slice(0, 20),
    );

    return suggestions;
  }

  /** Obtiene todas las sugerencias proactivas */
  getProactiveSuggestions(): ProactiveSuggestion[] {
    return this._proactiveSuggestions();
  }

  /** Obtiene sugerencias proactivas para un bot específico */
  getProactiveSuggestionsForBot(botId: string): ProactiveSuggestion[] {
    return this._proactiveSuggestions().filter((s) => s.botId === botId);
  }

  /** Marca una sugerencia como aplicada */
  markSuggestionApplied(suggestionId: string) {
    this._proactiveSuggestions.update((current) =>
      current.filter((s) => s.id !== suggestionId),
    );
  }

  // ─── Sistema de Colaboración entre Bots ──────────────────────────────────────

  /** Inicia una nueva colaboración entre bots */
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

    // Notificar a los participantes
    this.notifyCollaborationParticipants(collaboration);

    return collaborationId;
  }

  /** Agrega una tarea a una colaboración */
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

  /** Actualiza el progreso de una colaboración */
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

  /** Obtiene colaboraciones activas de un bot */
  getActiveCollaborations(feature: string): BotCollaboration[] {
    const allCollaborations = Object.values(this._botCollaborations());
    return allCollaborations.filter(
      (collab: BotCollaboration) =>
        collab.participants.includes(feature) &&
        ['planning', 'active'].includes(collab.status),
    );
  }

  /** Sugiere colaboraciones basadas en necesidades del bot */
  suggestCollaborations(feature: string): string[] {
    const suggestions: string[] = [];
    const bot = this.getBotByFeature(feature);

    if (!bot) return suggestions;

    // Sugerir colaboración con inventory si es budgets
    if (
      feature === 'budgets' &&
      !this.getActiveCollaborations(feature).some((c) =>
        c.participants.includes('inventory'),
      )
    ) {
      suggestions.push(
        'Colabora con Stocky-Bot para análisis de costos de inventario',
      );
    }

    // Sugerir colaboración con projects si es clients
    if (
      feature === 'clients' &&
      !this.getActiveCollaborations(feature).some((c) =>
        c.participants.includes('projects'),
      )
    ) {
      suggestions.push(
        'Coordina con Direct-Bot para asignación de proyectos a clientes satisfechos',
      );
    }

    // Sugerir colaboración con fleet si es delivery
    if (
      feature === 'delivery' &&
      !this.getActiveCollaborations(feature).some((c) =>
        c.participants.includes('fleet'),
      )
    ) {
      suggestions.push(
        'Trabaja con Drive-Bot para optimización de rutas de entrega',
      );
    }

    return suggestions;
  }

  private notifyCollaborationParticipants(collaboration: BotCollaboration) {
    // Enviar mensajes inter-bot a los participantes
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

  // ─── Sistema de Análisis Predictivo ──────────────────────────────────────────

  /** Crea un nuevo modelo predictivo */
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

  /** Genera una predicción usando un modelo */
  generatePrediction(
    modelId: string,
    input: Record<string, any>,
  ): PredictionResult | null {
    // Encontrar el modelo
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

    // Generar predicción basada en el tipo de modelo
    const prediction = this.calculatePrediction(targetModel, input);
    const confidence = this.calculateConfidence(targetModel, input);

    const result: PredictionResult = {
      id: `pred_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
      input,
      prediction,
      confidence,
    };

    // Actualizar el modelo con la nueva predicción
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

  /** Obtiene modelos predictivos de un bot */
  getPredictiveModels(feature: string): PredictiveModel[] {
    return this._predictiveModels()[feature] || [];
  }

  private calculatePrediction(
    model: PredictiveModel,
    input: Record<string, any>,
  ): unknown {
    // Lógica simplificada de predicción
    switch (model.type) {
      case 'demand_forecast': {
        const baseDemand = input['currentStock'] || 100;
        const trend = input['growthRate'] || 1.1;
        return Math.round(baseDemand * trend);
      }

      case 'churn_prediction': {
        const riskFactors = input['complaints'] || 0;
        const satisfaction = input['satisfaction'] || 5;
        const risk = riskFactors * 10 + (5 - satisfaction) * 20;
        return risk > 50 ? 'high_risk' : 'low_risk';
      }

      case 'price_optimization': {
        const cost = input['cost'] || 0;
        const marketRate = input['marketRate'] || 1.2;
        return Math.round(cost * marketRate * 1.3);
      }

      default:
        return 'unknown';
    }
  }

  private calculateConfidence(
    model: PredictiveModel,
    input: Record<string, any>,
  ): number {
    const baseConfidence = model.accuracy || 50;
    const inputQuality = Object.keys(input).length > 3 ? 20 : 10;
    return Math.min(100, baseConfidence + inputQuality);
  }
}
