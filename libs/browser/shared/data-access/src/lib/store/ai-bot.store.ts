import { Injectable, signal, computed, effect } from '@angular/core';

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

  constructor() {
    effect(() => {
      localStorage.setItem('ai_provider', this.selectedProvider());
      localStorage.setItem('ai_api_key', this.providerApiKey());
    });
  }

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
    }
  });

  readonly bots = computed(() => Object.values(this._bots()));

  getBotByFeature(feature: string) {
    return this._bots()[feature];
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

  // Communication Bus
  private readonly _messageBus = signal<{ feature: string, text: string, timestamp: number } | null>(null);
  readonly latestMessage = this._messageBus.asReadonly();

  broadcastMessage(feature: string, text: string) {
    this._messageBus.set({ feature, text, timestamp: Date.now() });
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
    this.broadcastMessage(from, `[Hacia ${to}]: ${text}`);
  }

  // Persistent Memory System
  private readonly _memories = signal<{ text: string, importance: number, timestamp: number }[]>(
    JSON.parse(localStorage.getItem('ai_buddy_memories') || '[]')
  );
  readonly memories = this._memories.asReadonly();

  remember(text: string, importance: number = 5) {
    this._memories.update(current => {
      const updated = [...current, { text, importance, timestamp: Date.now() }];
      // Keep only top 100 memories, priority to higher importance
      const limited = updated.sort((a, b) => b.importance - a.importance).slice(0, 100);
      localStorage.setItem('ai_buddy_memories', JSON.stringify(limited));
      return limited;
    });
  }

  getMemoriesByImportance(minWeight: number = 0) {
    return this.memories().filter(m => m.importance >= minWeight);
  }
}
