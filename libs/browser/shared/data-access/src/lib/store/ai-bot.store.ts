import { Injectable, signal, computed, effect } from '@angular/core';

export interface UserPersonalityProfile {
  /** Nickname the bot assigned to this user */
  nickname: string;
  /** Inferred communication style from interaction patterns */
  style: 'formal' | 'casual' | 'technical' | 'playful' | 'direct' | 'angry' | 'confused';
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
}

export type BotMood = 'neutral' | 'analyzing' | 'alert' | 'creative' | 'toxic' | 'asleep';

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
  providedIn: 'root'
})
export class AIBotStore {
  readonly selectedProvider = signal<'gemini' | 'openai' | 'anthropic'>((localStorage.getItem('ai_provider') as any) || 'gemini');
  readonly providerApiKey = signal<string>(localStorage.getItem('ai_api_key') || '');
  
  // Custom names stored in local storage: feature -> name
  private readonly _customNames = signal<Record<string, string>>(
    JSON.parse(localStorage.getItem('ai_bot_custom_names') || '{}')
  );

  constructor() {
    effect(() => {
      localStorage.setItem('ai_provider', this.selectedProvider());
      localStorage.setItem('ai_api_key', this.providerApiKey());
      localStorage.setItem('ai_bot_custom_names', JSON.stringify(this._customNames()));
      localStorage.setItem('ai_global_memories', JSON.stringify(this._globalMemories()));
      localStorage.setItem('ai_bot_moods', JSON.stringify(this._botMoods()));
    });
  }

  // Bot Moods & State
  private readonly _botMoods = signal<Record<string, { mood: BotMood, energy: number }>>(
    JSON.parse(localStorage.getItem('ai_bot_moods') || '{}')
  );
  readonly botMoods = this._botMoods.asReadonly();

  setBotMood(feature: string, mood: BotMood, energy: number = 100) {
    this._botMoods.update(current => ({
      ...current,
      [feature]: { mood, energy }
    }));
  }

  // Proactive Suggestions System
  private readonly _proactiveSuggestions = signal<ProactiveSuggestion[]>([]);
  readonly proactiveSuggestions = this._proactiveSuggestions.asReadonly();

  broadcastSuggestion(suggestion: Omit<ProactiveSuggestion, 'id' | 'timestamp'>) {
    const full: ProactiveSuggestion = {
      ...suggestion,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now()
    };
    this._proactiveSuggestions.update(current => [full, ...current].slice(0, 10));
  }

  // Global Context (Antigravity-style shared knowledge)
  private readonly _globalMemories = signal<AIRangeMemory[]>(
    JSON.parse(localStorage.getItem('ai_global_memories') || '[]')
  );
  readonly globalMemories = this._globalMemories.asReadonly();

  private readonly _bots = signal<Record<string, AIBot>>({
    'inventory': { 
      id: 'inv-bot', name: 'Stocky-Bot', feature: 'inventory', 
      description: 'Analiza tendencias de consumo de material.',
      skills: ['Predicción de Stock', 'Auto-Aprovisionamiento', 'Alertas de Caducidad', 'Optimización de Espacio', 'Trazabilidad RFID', 'Auditoría de Daños'],
      activeSkills: ['Predicción de Stock'], status: 'active', color: '#10b981', secondaryColor: '#059669', mascotType: 'inventory', personality: 'worker', bodyShape: 'round', eyesType: 'dots', mouthType: 'o'
    },
    'budgets': { 
      id: 'bud-bot', name: 'Cali-Bot', feature: 'budgets', 
      description: 'Calcula márgenes de beneficio en tiempo real.',
      skills: ['Optimización de Márgenes', 'Detección de Costes Ocultos', 'Proyección Fiscal', 'Análisis Comparativo', 'Sugerencia de Up-selling', 'Validación de Divisas'],
      activeSkills: [], status: 'inactive', color: '#34d399', secondaryColor: '#065f46', mascotType: 'budget', personality: 'happy', bodyShape: 'capsule', eyesType: 'joy', mouthType: 'smile'
    },
    'projects': { 
      id: 'proj-bot', name: 'Direct-Bot', feature: 'projects',
      description: 'Coordina los horarios de técnicos.',
      skills: ['Timeline AI', 'Resource Balancing', 'Scene Optimizer', 'Crew Mood Sync', 'Weather Impact Radar', 'Smart Call-Sheet'],
      activeSkills: ['Timeline AI'], status: 'active', color: '#06b6d4', secondaryColor: '#0891b2', mascotType: 'projects', personality: 'tech', bodyShape: 'square', eyesType: 'shades', mouthType: 'line'
    },
    'clients': { 
      id: 'cli-bot', name: 'Social-Bot', feature: 'clients',
      description: 'Analiza el sentimiento de los clientes.',
      skills: ['Sentiment Analysis', 'Lead Scoring', 'Churn Predictor', 'Auto-FollowUp', 'Network Expansion', 'Voice Tone Advisor'],
      activeSkills: ['Sentiment Analysis'], status: 'active', color: '#8b5cf6', secondaryColor: '#6d28d9', mascotType: 'clients', personality: 'mystic', bodyShape: 'round', eyesType: 'dots', mouthType: 'smile'
    },
    'fleet': { 
      id: 'fleet-bot', name: 'Drive-Bot', feature: 'fleet',
      description: 'Optimiza rutas de transporte.',
      skills: ['Route Optimization', 'Predictive Maintenance', 'Fuel Efficiency AI', 'Driver Habits Monitor', 'Load Balancing', 'Parking Finder'],
      activeSkills: [], status: 'inactive', color: '#f59e0b', secondaryColor: '#d97706', mascotType: 'fleet', personality: 'explorer', bodyShape: 'capsule', eyesType: 'shades', mouthType: 'o'
    },
    'rentals': { 
      id: 'rent-bot', name: 'Key-Bot', feature: 'rentals',
      description: 'Gestiona la disponibilidad de equipos.',
      skills: ['Conflict Detection', 'Auto-Reservation', 'Price Surge Guard', 'Smart Late-Return Hub', 'Insurance Advisor', 'Bundle Recommender'],
      activeSkills: ['Conflict Detection'], status: 'active', color: '#3b82f6', secondaryColor: '#1d4ed8', mascotType: 'rentals', personality: 'ninja', bodyShape: 'square', eyesType: 'dots', mouthType: 'line'
    },
    'audit': { 
      id: 'audit-bot', name: 'Scout-Bot', feature: 'audit',
      description: 'Detecta anomalías en los logs de acceso.',
      skills: ['Anomaly Detection', 'Risk Assessment', 'Breach Prevention', 'Compliance Guard', 'Audit Trail Summary', 'Integrity Scanner'],
      activeSkills: ['Anomaly Detection'], status: 'active', color: '#ef4444', secondaryColor: '#b91c1c', mascotType: 'audit', personality: 'tech', bodyShape: 'round', eyesType: 'shades', mouthType: 'o'
    },
    'verifactu': { 
      id: 'verifactu-bot', name: 'Tax-Bot', feature: 'verifactu',
      description: 'Asegura cumplimiento legal en facturación.',
      skills: ['Fiscal Validation', 'Auto-Reporting', 'Error Rectifier', 'Audit-Ready Export', 'Reg-Tech Sync', 'Electronic Seal Guard'],
      activeSkills: [], status: 'inactive', color: '#f43f5e', secondaryColor: '#9f1239', mascotType: 'universal', personality: 'queen', bodyShape: 'capsule', eyesType: 'joy', mouthType: 'smile'
    },
    'billing': {
      id: 'bill-bot', name: 'Factu-Bot', feature: 'billing',
      description: 'Gestiona facturas y cumplimiento fiscal con IA.',
      skills: ['Invoice Generator', 'Verifactu Guard', 'Tax Optimization', 'Late Payment Alert', 'Client Risk Score', 'PDF Auto-Export'],
      activeSkills: ['Invoice Generator', 'Verifactu Guard'], status: 'active', color: '#f59e0b', secondaryColor: '#b45309', mascotType: 'inventory', personality: 'tech', bodyShape: 'square', eyesType: 'shades', mouthType: 'line'
    },
    'delivery': {
      id: 'delivery-bot', name: 'Logis-Bot', feature: 'delivery',
      description: 'Coordina entregas y albaranes logísticos.',
      skills: ['Route Optimizer', 'ETA Predictor', 'Signature Validator', 'Return Manager', 'Fleet Sync', 'Incident Alerter'],
      activeSkills: ['Route Optimizer', 'ETA Predictor'], status: 'active', color: '#10b981', secondaryColor: '#065f46', mascotType: 'fleet', personality: 'explorer', bodyShape: 'capsule', eyesType: 'dots', mouthType: 'smile'
    },
    'services': {
      id: 'services-bot', name: 'Craft-Bot', feature: 'services',
      description: 'Analiza el catálogo de servicios y sugiere optimizaciones.',
      skills: ['Pricing Optimizer', 'Bundle Suggester', 'Demand Analyzer', 'Seasonal Advisor', 'Margin Guard', 'Competitor Radar'],
      activeSkills: ['Pricing Optimizer'], status: 'active', color: '#8b5cf6', secondaryColor: '#6d28d9', mascotType: 'projects', personality: 'happy', bodyShape: 'round', eyesType: 'joy', mouthType: 'smile'
    },
    'receipts': {
      id: 'receipts-bot', name: 'Pay-Bot', feature: 'receipts',
      description: 'Controla cobros pendientes y alerta de impagos.',
      skills: ['Payment Tracker', 'Overdue Alerter', 'Payment Method Optimizer', 'Cash Flow Forecast', 'Dunning Automator', 'Reconciliation AI'],
      activeSkills: ['Payment Tracker', 'Overdue Alerter'], status: 'active', color: '#06b6d4', secondaryColor: '#0891b2', mascotType: 'clients', personality: 'worker', bodyShape: 'round', eyesType: 'dots', mouthType: 'o'
    },
    'dashboard': {
      id: 'buddy-bot', name: 'Buddy-Bot', feature: 'dashboard',
      description: 'Tu mejor amigo y pato de confianza. Memoriza hitos, da consejos y te escucha.',
      skills: ['Joke Teller', 'Milestone Memory', 'Daily Advice', 'Active Listener', 'Mental Tracker', 'Duck Noises'],
      activeSkills: ['Joke Teller', 'Milestone Memory', 'Active Listener'], status: 'active', color: '#facc15', secondaryColor: '#ca8a04', mascotType: 'dashboard', personality: 'happy', bodyShape: 'capsule', eyesType: 'joy', mouthType: 'beak'
    },
    'events': { 
      id: 'evt-bot', name: 'Party-Bot', feature: 'events',
      description: 'Organiza la logística de eventos y fiestas.',
      skills: ['Guest Optimization', 'A/V Checklist', 'Catering AI', 'Social Sync', 'Mood Lighting Advisor', 'Budget Party Guard'],
      activeSkills: ['Guest Optimization'], status: 'active', color: '#f472b6', secondaryColor: '#db2777', mascotType: 'universal', personality: 'happy', bodyShape: 'round', eyesType: 'joy', mouthType: 'smile'
    },
    'reports': { 
      id: 'rep-bot', name: 'Data-Bot', feature: 'reports',
      description: 'Analiza datos complejos y genera insights.',
      skills: ['Trend Spotter', 'Anomaly Detective', 'Executive Summary AI', 'Chart Wizard', 'Predictive Modeling', 'Data Cleaning Bot'],
      activeSkills: ['Trend Spotter'], status: 'active', color: '#6366f1', secondaryColor: '#4338ca', mascotType: 'inventory', personality: 'worker', bodyShape: 'square', eyesType: 'dots', mouthType: 'line'
    },
    'availability': { 
      id: 'aval-bot', name: 'Time-Bot', feature: 'availability',
      description: 'Gestiona la disponibilidad técnica y planifica calendarios.',
      skills: ['Auto-Planificación', 'Alerta de Solapamiento', 'Predicción de Bajas', 'Control Horario AI'],
      activeSkills: ['Auto-Planificación'], status: 'active', color: '#ec4899', secondaryColor: '#be185d', mascotType: 'projects', personality: 'tech', bodyShape: 'capsule', eyesType: 'shades', mouthType: 'smile'
    }
  });

  readonly bots = computed(() => {
    const defaultBots = this._bots();
    const customNames = this._customNames();
    
    return Object.entries(defaultBots).map(([feature, bot]) => ({
      ...bot,
      name: customNames[feature] ?? bot.name
    }));
  });

  getBotByFeature(feature: string) {
    const bot = this._bots()[feature];
    if (!bot) return undefined;
    const customName = this._customNames()[feature];
    return {
      ...bot,
      name: customName ?? bot.name
    };
  }

  toggleBotStatus(feature: string) {
    this._bots.update(current => {
      const bot = current[feature];
      if (!bot) return current;
      return {
        ...current,
        [feature]: { ...bot, status: bot.status === 'active' ? 'inactive' : 'active' }
      };
    });
  }

  toggleSkill(feature: string, skill: string) {
    this._bots.update(current => {
      const bot = current[feature];
      if (!bot) return current;
      const isActive = bot.activeSkills.includes(skill);
      const newActiveSkills = isActive 
        ? bot.activeSkills.filter(s => s !== skill)
        : [...bot.activeSkills, skill];
      
      return {
        ...current,
        [feature]: { ...bot, activeSkills: newActiveSkills }
      };
    });
  }

  isSkillActive(feature: string, skill: string): boolean {
    const bot = this._bots()[feature];
    return bot?.activeSkills.includes(skill) || false;
  }

  updateBotSkin(feature: string, updates: Partial<AIBot>) {
    this._bots.update(current => {
      const bot = current[feature];
      if (!bot) return current;
      return {
        ...current,
        [feature]: { ...bot, ...updates }
      };
    });
  }

  updateBotName(feature: string, newName: string) {
    if (!newName.trim()) return;
    this._customNames.update(current => ({
      ...current,
      [feature]: newName.trim()
    }));
  }

  // Communication Bus
  private readonly _messageBus = signal<{ feature: string, text: string, timestamp: number, target?: string } | null>(null);
  readonly latestMessage = this._messageBus.asReadonly();

  broadcastMessage(feature: string, text: string, target?: string) {
    this._messageBus.set({ feature, text, timestamp: Date.now(), target });
  }

  // Rage Mode
  private readonly _rageMode = signal<boolean>(localStorage.getItem('ai_rage_mode') === 'true');
  readonly rageMode = this._rageMode.asReadonly();
  
  private readonly _rageStyle = signal<'terror' | 'angry' | 'dark'>(
    (localStorage.getItem('ai_rage_style') as any) || 'angry'
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
  private readonly _relationships = signal<Record<string, { bond: number, history: string[] }>> (
    JSON.parse(localStorage.getItem('ai_bot_relationships') || '{}')
  );
  readonly relationships = this._relationships.asReadonly();

  recordInteraction(from: string, to: string, text: string, quality: number) {
    const key = [from, to].sort().join('_');
    const current = this._relationships()[key] || { bond: 50, history: [] };
    
    const newBond = Math.min(100, Math.max(0, current.bond + quality));
    const newHistory = [text, ...current.history].slice(0, 10); // Keep last 10 interactions

    const updated = { ...this._relationships(), [key]: { bond: newBond, history: newHistory } };
    this._relationships.set(updated);
    localStorage.setItem('ai_bot_relationships', JSON.stringify(updated));

    // Also broadcast so other bots "hear" the interaction
    this.broadcastMessage(from, text, to);
  }

  // Workspace & Memory System
  private readonly _botWorkspaces = signal<Record<string, {
    memories: { text: string; importance: number; timestamp: number; }[];
    lastTasks: string[];
    contextFiles: Record<string, string>;
  }>>(
    JSON.parse(localStorage.getItem('ai_bot_workspaces') || '{}')
  );

  // Dynamic Canvas System
  private readonly _dynamicCanvas = signal<Record<string, string>>(
    JSON.parse(localStorage.getItem('ai_dynamic_canvas') || '{}')
  );
  readonly dynamicCanvas = this._dynamicCanvas.asReadonly();

  updateCanvas(key: string, html: string) {
    this._dynamicCanvas.update(current => {
      const updated = { ...current, [key]: html };
      localStorage.setItem('ai_dynamic_canvas', JSON.stringify(updated));
      return updated;
    });
  }

  getWorkspace(feature: string) {
    return this._botWorkspaces()[feature] || { memories: [], lastTasks: [], contextFiles: {} };
  }

  remember(feature: string, text: string, importance: number = 5, isGlobal: boolean = false) {
    const memory: AIRangeMemory = { text, importance, timestamp: Date.now(), tags: [feature], sourceBot: feature };
    
    if (isGlobal) {
      this._globalMemories.update(current => {
        const updated = [...current, memory].sort((a, b) => b.importance - a.importance).slice(0, 200);
        return updated;
      });
    }

    this._botWorkspaces.update(current => {
      const ws = current[feature] || { memories: [], lastTasks: [], contextFiles: {} };
      const updatedMemories = [...ws.memories, memory];
      const limited = updatedMemories.sort((a, b) => b.importance - a.importance).slice(0, 100);
      const updated = { ...current, [feature]: { ...ws, memories: limited } };
      localStorage.setItem('ai_bot_workspaces', JSON.stringify(updated));
      return updated;
    });
  }

  logTaskExecution(feature: string, functionName: string, args: any) {
    this._botWorkspaces.update(current => {
      const ws = current[feature] || { memories: [], lastTasks: [], contextFiles: {} };
      const taskStr = `[${new Date().toISOString()}] Ejecutó: ${functionName}(${JSON.stringify(args) || ''})`;
      const updatedTasks = [taskStr, ...ws.lastTasks].slice(0, 50);
      const updated = { ...current, [feature]: { ...ws, lastTasks: updatedTasks } };
      localStorage.setItem('ai_bot_workspaces', JSON.stringify(updated));
      return updated;
    });
  }

  writeContextFile(feature: string, filename: string, content: string) {
    this._botWorkspaces.update(current => {
      const ws = current[feature] || { memories: [], lastTasks: [], contextFiles: {} };
      const updated = { ...current, [feature]: { ...ws, contextFiles: { ...ws.contextFiles, [filename]: content } } };
      localStorage.setItem('ai_bot_workspaces', JSON.stringify(updated));
      return updated;
    });
  }

  deleteContextFile(feature: string, filename: string) {
    this._botWorkspaces.update(current => {
      const ws = current[feature] || { memories: [], lastTasks: [], contextFiles: {} };
      const newFiles = { ...ws.contextFiles };
      delete newFiles[filename];
      const updated = { ...current, [feature]: { ...ws, contextFiles: newFiles } };
      localStorage.setItem('ai_bot_workspaces', JSON.stringify(updated));
      return updated;
    });
  }

  // ─── Per-User Personality System ────────────────────────────────────────────
  // Key format: `${botFeature}::${userId}`
  private readonly _userPersonalities = signal<Record<string, UserPersonalityProfile>>(
    JSON.parse(localStorage.getItem('ai_user_personalities') || '{}')
  );
  readonly userPersonalities = this._userPersonalities.asReadonly();

  /** Get (or bootstrap) the personality profile a specific bot has built for a specific user. */
  getUserPersonality(feature: string, userId: string): UserPersonalityProfile {
    const key = `${feature}::${userId}`;
    return this._userPersonalities()[key] ?? {
      nickname: userId,
      style: 'casual',
      likes: [],
      dislikes: [],
      notes: 'Primera interacción. Aún no conozco bien a este usuario.',
      interactionCount: 0,
      lastSeen: Date.now(),
    };
  }

  /** Update specific fields of a bot→user personality profile. */
  updateUserPersonality(feature: string, userId: string, patch: Partial<UserPersonalityProfile>) {
    const key = `${feature}::${userId}`;
    this._userPersonalities.update(current => {
      const existing = current[key] ?? this.getUserPersonality(feature, userId);
      const updated = {
        ...current,
        [key]: {
          ...existing,
          ...patch,
          interactionCount: (existing.interactionCount ?? 0) + (patch.interactionCount != null ? 0 : 1),
          lastSeen: Date.now(),
        }
      };
      localStorage.setItem('ai_user_personalities', JSON.stringify(updated));
      return updated;
    });
  }

  /** Called after each user message to bump the interaction counter. */
  trackInteraction(feature: string, userId: string) {
    const key = `${feature}::${userId}`;
    this._userPersonalities.update(current => {
      const existing = current[key] ?? this.getUserPersonality(feature, userId);
      const updated = {
        ...current,
        [key]: { ...existing, interactionCount: existing.interactionCount + 1, lastSeen: Date.now() }
      };
      localStorage.setItem('ai_user_personalities', JSON.stringify(updated));
      return updated;
    });
  }
}
