import { AIBot } from '../../models/ai-bot.model';

/** Eventos y producción en vivo */
export const EVENTS_BOT: AIBot = {
  id: 'events-bot',
  name: 'Stage-Bot',
  feature: 'events',
  description:
    'Asiste en la planificación de eventos, cronogramas y coordinación de equipos en sala.',
  skills: [
    'Cronograma de Evento',
    'Checklist de Montaje',
    'Alertas de Solapes',
    'Sincronía con Disponibilidad',
    'Briefing Rápido',
    'Seguimiento de Cambios',
  ],
  activeSkills: ['Cronograma de Evento', 'Checklist de Montaje', 'Alertas de Solapes'],
  status: 'active',
  color: '#ec4899',
  secondaryColor: '#be185d',
  mascotType: 'universal',
  personality: 'explorer',
  bodyShape: 'round',
  eyesType: 'glow',
  mouthType: 'smile',
};

/** Informes y analítica */
export const REPORTS_BOT: AIBot = {
  id: 'reports-bot',
  name: 'Lens-Bot',
  feature: 'reports',
  description:
    'Genera y explica informes, KPIs y tendencias a partir de los datos del ERP.',
  skills: [
    'Resumen Ejecutivo',
    'Comparativas Temporales',
    'Exportación Guiada',
    'Detección de Picos',
    'Narrativa de KPIs',
  ],
  activeSkills: ['Resumen Ejecutivo', 'Comparativas Temporales', 'Narrativa de KPIs'],
  status: 'active',
  color: '#0ea5e9',
  secondaryColor: '#0369a1',
  mascotType: 'universal',
  personality: 'tech',
  bodyShape: 'square',
  eyesType: 'shades',
  mouthType: 'line',
};

/** Disponibilidad de técnicos y recursos */
export const AVAILABILITY_BOT: AIBot = {
  id: 'availability-bot',
  name: 'Pulse-Bot',
  feature: 'availability',
  description:
    'Optimiza calendarios de disponibilidad, bajas y sustituciones de equipo técnico.',
  skills: [
    'Detección de Huecos',
    'Propuesta de Sustitutos',
    'Sincronía con Eventos',
    'Alertas de Sobrecarga',
  ],
  activeSkills: ['Detección de Huecos', 'Propuesta de Sustitutos', 'Sincronía con Eventos'],
  status: 'active',
  color: '#22c55e',
  secondaryColor: '#15803d',
  mascotType: 'universal',
  personality: 'worker',
  bodyShape: 'capsule',
  eyesType: 'dots',
  mouthType: 'o',
};

/** Catálogo de servicios */
export const SERVICES_BOT: AIBot = {
  id: 'services-bot',
  name: 'Suite-Bot',
  feature: 'services',
  description:
    'Ayuda a definir paquetes de servicios, precios sugeridos y bundles frecuentes.',
  skills: [
    'Paquetes Recomendados',
    'Consistencia de Tarifas',
    'Upsell Contextual',
    'Descripción de Servicios',
  ],
  activeSkills: ['Paquetes Recomendados', 'Consistencia de Tarifas', 'Descripción de Servicios'],
  status: 'active',
  color: '#a855f7',
  secondaryColor: '#7e22ce',
  mascotType: 'universal',
  personality: 'mystic',
  bodyShape: 'round',
  eyesType: 'joy',
  mouthType: 'smile',
};

/** Albaranes y logística de entrega */
export const DELIVERY_BOT: AIBot = {
  id: 'delivery-bot',
  name: 'Dispatch-Bot',
  feature: 'delivery',
  description:
    'Acompaña la preparación y seguimiento de albaranes y entregas de material.',
  skills: [
    'Estado de Envío',
    'Emparejamiento con Pedido',
    'Alertas de Incidencias',
    'Ruta Sugerida',
  ],
  activeSkills: ['Estado de Envío', 'Emparejamiento con Pedido', 'Alertas de Incidencias'],
  status: 'active',
  color: '#f97316',
  secondaryColor: '#c2410c',
  mascotType: 'universal',
  personality: 'ninja',
  bodyShape: 'tri',
  eyesType: 'glow',
  mouthType: 'line',
};

/** Recibos y cobros */
export const RECEIPTS_BOT: AIBot = {
  id: 'receipts-bot',
  name: 'Ledger-Bot',
  feature: 'receipts',
  description:
    'Asiste con recibos, conciliación básica y seguimiento de cobros pendientes.',
  skills: [
    'Estado de Cobro',
    'Recordatorios',
    'Conciliación Rápida',
    'Alertas de Vencimiento',
  ],
  activeSkills: ['Estado de Cobro', 'Recordatorios', 'Alertas de Vencimiento'],
  status: 'active',
  color: '#14b8a6',
  secondaryColor: '#0f766e',
  mascotType: 'universal',
  personality: 'tech',
  bodyShape: 'square',
  eyesType: 'dots',
  mouthType: 'line',
};

/** Facturación */
export const BILLING_BOT: AIBot = {
  id: 'billing-bot',
  name: 'Invoice-Bot',
  feature: 'billing',
  description:
    'Apoya en facturas, series, impuestos y coherencia con presupuestos y albaranes.',
  skills: [
    'Borrador de Factura',
    'Validación Fiscal Básica',
    'Enlace Presupuesto→Factura',
    'Series y Numeración',
  ],
  activeSkills: ['Borrador de Factura', 'Validación Fiscal Básica', 'Enlace Presupuesto→Factura'],
  status: 'active',
  color: '#eab308',
  secondaryColor: '#a16207',
  mascotType: 'universal',
  personality: 'queen',
  bodyShape: 'round',
  eyesType: 'shades',
  mouthType: 'smile',
};

/** Cumplimiento VeriFactu / AEAT */
export const VERIFACTU_BOT: AIBot = {
  id: 'verifactu-bot',
  name: 'Seal-Bot',
  feature: 'verifactu',
  description:
    'Orienta sobre envíos regulatorios, estados de cumplimiento y trazabilidad VeriFactu.',
  skills: [
    'Checklist de Envío',
    'Estado AEAT',
    'Trazabilidad de Registros',
    'Alertas de Incidencias',
  ],
  activeSkills: ['Checklist de Envío', 'Estado AEAT', 'Trazabilidad de Registros'],
  status: 'active',
  color: '#64748b',
  secondaryColor: '#334155',
  mascotType: 'audit',
  personality: 'tech',
  bodyShape: 'square',
  eyesType: 'glow',
  mouthType: 'line',
};

/** Usuarios, roles y acceso */
export const USERS_BOT: AIBot = {
  id: 'users-bot',
  name: 'People-Bot',
  feature: 'users',
  description:
    'Ayuda a gestionar cuentas, permisos y buenas prácticas de acceso al ERP.',
  skills: [
    'Resumen de Roles',
    'Sugerencias de Permisos',
    'Auditoría de Accesos',
    'Altas y Bajas',
  ],
  activeSkills: ['Resumen de Roles', 'Sugerencias de Permisos', 'Auditoría de Accesos'],
  status: 'active',
  color: '#3b82f6',
  secondaryColor: '#1d4ed8',
  mascotType: 'universal',
  personality: 'happy',
  bodyShape: 'round',
  eyesType: 'joy',
  mouthType: 'smile',
};
