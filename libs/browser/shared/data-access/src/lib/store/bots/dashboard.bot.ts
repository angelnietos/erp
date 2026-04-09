import { AIBot } from '../../models/ai-bot.model';

export const DASHBOARD_BOT: AIBot = {
  id: 'dash-bot',
  name: 'Dash-Bot',
  feature: 'dashboard',
  description: 'Gestiona métricas y análisis del panel de control principal.',
  skills: [
    'Dashboard Analytics',
    'KPI Monitoring',
    'Report Generation',
    'Data Visualization',
    'Performance Tracking',
    'Alert Management',
    'Trend Analysis',
    'Custom Dashboards',
  ],
  activeSkills: ['Dashboard Analytics', 'KPI Monitoring'],
  status: 'active',
  color: '#facc15',
  secondaryColor: '#ca8a04',
  mascotType: 'dashboard',
  personality: 'tech',
  bodyShape: 'square',
  eyesType: 'shades',
  mouthType: 'line',
};
