import { AIBot } from '../../models/ai-bot.model';

export const PROJECTS_BOT: AIBot = {
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
};
