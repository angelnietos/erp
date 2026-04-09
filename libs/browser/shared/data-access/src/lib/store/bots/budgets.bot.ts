import { AIBot } from '../../models/ai-bot.model';

export const BUDGETS_BOT: AIBot = {
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
};
