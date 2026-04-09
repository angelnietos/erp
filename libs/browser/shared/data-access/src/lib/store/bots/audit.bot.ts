import { AIBot } from '../../models/ai-bot.model';

export const AUDIT_BOT: AIBot = {
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
};
