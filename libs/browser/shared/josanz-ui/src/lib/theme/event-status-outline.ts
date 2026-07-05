import type { JosanzStatusPillKey } from './josanz-figma-tokens';

/** Pastilla outline del listado Eventos (Figma «Estados - eventos»). */
export interface JosanzEventOutlinePill {
  border: string;
  bg: string;
  text: string;
  icon: string;
}

type EventOutlineKey =
  | 'borrador'
  | 'presupuesto'
  | 'confirmado'
  | 'en-proceso'
  | 'cancelado'
  | 'finalizado'
  | 'facturado'
  | 'facturado-parcial'
  | 'incidencia';

const EVENT_OUTLINE_PILLS: Record<EventOutlineKey, JosanzEventOutlinePill> = {
  borrador: {
    border: '#8D8D8D',
    bg: '#FAFAFA',
    text: '#222222',
    icon: '✎',
  },
  presupuesto: {
    border: '#F97316',
    bg: '#FFF7ED',
    text: '#EA580C',
    icon: '€',
  },
  confirmado: {
    border: '#22C55E',
    bg: '#F0FDF4',
    text: '#16A34A',
    icon: '✓',
  },
  'en-proceso': {
    border: '#3B82F6',
    bg: '#EFF6FF',
    text: '#2563EB',
    icon: '⚙',
  },
  cancelado: {
    border: '#EF4444',
    bg: '#FEF2F2',
    text: '#DC2626',
    icon: '×',
  },
  finalizado: {
    border: '#7C3AED',
    bg: '#F5F3FF',
    text: '#6D28D9',
    icon: '⚑',
  },
  facturado: {
    border: '#4F46E5',
    bg: '#EEF2FF',
    text: '#4338CA',
    icon: '▤',
  },
  'facturado-parcial': {
    border: '#DB2777',
    bg: '#FDF2F8',
    text: '#BE185D',
    icon: '▤',
  },
  incidencia: {
    border: '#EAB308',
    bg: '#FEFCE8',
    text: '#A16207',
    icon: '!',
  },
};

/** Agrupa variantes de flujo bajo la paleta Figma del listado Eventos. */
export function normalizeEventOutlineKey(key: JosanzStatusPillKey): EventOutlineKey {
  switch (key) {
    case 'presupuesto':
    case 'sin-presupuesto':
    case 'en-preparacion':
    case 'presupuesto-solid':
      return 'presupuesto';
    case 'confirmado':
      return 'confirmado';
    case 'finalizado':
      return 'finalizado';
    case 'en-proceso':
    case 'en-produccion':
    case 'en-ejecucion':
    case 'staff-tecnico':
    case 'admin':
      return 'en-proceso';
    case 'cancelado':
      return 'cancelado';
    case 'cerrado':
    case 'pospuesto':
    case 'facturado-muted':
      return 'finalizado';
    case 'facturado':
      return 'facturado';
    case 'incidencia':
    case 'incidencia-solid':
    case 'inasistencia':
    case 'cliente-tipo-yellow':
      return 'incidencia';
    case 'borrador':
    case 'cliente-nuevo':
    case 'staff-practicas':
    case 'cliente-tipo-pink':
    case 'staff-freelance':
    case 'superadmin':
    default:
      return 'borrador';
  }
}

export function getEventOutlinePill(key: JosanzStatusPillKey): JosanzEventOutlinePill {
  return EVENT_OUTLINE_PILLS[normalizeEventOutlineKey(key)];
}

export function eventOutlineBadgeStyles(key: JosanzStatusPillKey): Record<string, string> {
  const pill = getEventOutlinePill(key);
  return {
    'background-color': pill.bg,
    color: pill.text,
    border: `1px solid ${pill.border}`,
    'box-shadow': 'none',
    'text-transform': 'none',
    'letter-spacing': '0',
    'font-weight': '600',
  };
}

export function eventOutlineIconRingStyles(key: JosanzStatusPillKey): Record<string, string> {
  const pill = getEventOutlinePill(key);
  return {
    color: pill.text,
    'border-color': pill.border,
    'background-color': pill.bg,
  };
}
