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

/** Forma del cuerpo del `ui-mascot` (CSS classes en el componente). */
export type MascotBodyShape =
  | 'round'
  | 'square'
  | 'capsule'
  | 'tri'
  | 'mushroom-cap'
  | 'mushroom-full'
  | 'mushroom-luminescent'
  | 'mushroom-morel'
  | 'bonsai'
  | 'bonsai-sakura'
  | 'bonsai-maple';

/** Ojos del `ui-mascot` (incl. `glow` usado en bots extendidos). */
export type MascotEyesType =
  | 'dots'
  | 'joy'
  | 'shades'
  | 'angry'
  | 'insane'
  | 'glow';

/** Boca admitida por `ui-mascot`. */
export type MascotMouthType = 'smile' | 'line' | 'o' | 'mean';

/** Valores guardados en `AIBot` (incl. legacy mapeados en ajustes). */
export type AIBotMouthType = MascotMouthType | 'grin' | 'none';

export type MascotRageStyle = 'terror' | 'angry' | 'dark';

/** Boca almacenada en `AIBot` → entrada de `ui-mascot`. */
export function mascotMouthToUi(mouth: AIBotMouthType): MascotMouthType {
  switch (mouth) {
    case 'smile':
    case 'line':
    case 'o':
    case 'mean':
      return mouth;
    case 'grin':
      return 'smile';
    case 'none':
      return 'line';
    default:
      return 'line';
  }
}

export interface UserPersonalityProfile {
  nickname: string;
  style:
    | 'formal'
    | 'casual'
    | 'technical'
    | 'playful'
    | 'direct'
    | 'angry'
    | 'confused';
  likes: string[];
  dislikes: string[];
  notes: string;
  interactionCount: number;
  lastSeen: number;
  lastMood?: 'happy' | 'frustrated' | 'busy' | 'curious';
  learnedPatterns: {
    query: string;
    successRate: number;
    lastUsed: number;
    frequency: number;
  }[];
  preferredTools: string[];
  performanceMetrics: {
    taskType: string;
    successCount: number;
    failureCount: number;
    avgResponseTime: number;
  }[];
  trustLevel: number;
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
  bodyShape: MascotBodyShape;
  eyesType: MascotEyesType;
  mouthType: AIBotMouthType;
}

/** Prompts con nombre para comportamientos concretos (p. ej. informes, tono formal). */
export interface UserAgentPromptPreset {
  id: string;
  title: string;
  content: string;
}

/**
 * Capa por usuario y por agente (p. ej. JAIME / dashboard): skills activas para esa cuenta,
 * reglas en texto libre e instrucciones extra que se inyectan en el contexto del LLM.
 */
export interface UserAgentCustomConfig {
  activeSkills: string[];
  rules: string;
  systemInstructions: string;
  promptPresets: UserAgentPromptPreset[];
}
