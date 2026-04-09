import { AIBot } from '../../models/ai-bot.model';

export const BUDDY_BOT: AIBot = {
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
  activeSkills: [
    'Global Orchestration',
    'Cross-Domain Coordination',
    'Personal Assistance',
  ],
  status: 'active',
  color: '#6366f1',
  secondaryColor: '#4f46e5',
  mascotType: 'universal',
  personality: 'happy',
  bodyShape: 'round',
  eyesType: 'joy',
  mouthType: 'smile',
};
