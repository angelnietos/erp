import { AIBot } from '../../models/ai-bot.model';

export const CLIENTS_BOT: AIBot = {
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
};
