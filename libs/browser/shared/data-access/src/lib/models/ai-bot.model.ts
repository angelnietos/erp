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
  bodyShape: 'round' | 'square' | 'tri' | 'capsule' | 'star';
  eyesType: 'dots' | 'joy' | 'shades' | 'glow' | 'angry';
  mouthType: 'smile' | 'line' | 'o' | 'none' | 'grin';
}
