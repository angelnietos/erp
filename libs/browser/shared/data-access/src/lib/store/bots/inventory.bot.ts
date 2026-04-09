import { AIBot } from '../../models/ai-bot.model';

export const INVENTORY_BOT: AIBot = {
  id: 'inv-bot',
  name: 'Stocky-Bot',
  feature: 'inventory',
  description:
    'Analiza tendencias de consumo de material y gestiona inventario inteligente.',
  skills: [
    'Predicción de Stock',
    'Auto-Aprovisionamiento',
    'Alertas de Caducidad',
    'Optimización de Espacio',
    'Trazabilidad RFID',
    'Auditoría de Daños',
    'Filtrado Inteligente',
    'Análisis de Demanda',
    'Detección de Anomalías',
    'Recomendaciones de Compra',
    'Gestión de Categorías',
    'Reportes Automatizados',
  ],
  activeSkills: [
    'Predicción de Stock',
    'Filtrado Inteligente',
    'Análisis de Demanda',
  ],
  status: 'active',
  color: '#10b981',
  secondaryColor: '#059669',
  mascotType: 'inventory',
  personality: 'worker',
  bodyShape: 'round',
  eyesType: 'dots',
  mouthType: 'o',
};
