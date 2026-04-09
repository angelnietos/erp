import { AIBot } from '../../models/ai-bot.model';

export const RENTALS_BOT: AIBot = {
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
};
