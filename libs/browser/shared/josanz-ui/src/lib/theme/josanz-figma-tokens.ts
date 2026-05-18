/**
 * Valores del frame Figma exportado (Base.svg / Base-1.svg, 1280×832).
 * Centralizados para listas, pestañas, paginación y avatar del shell.
 */
export const JOSANZ_FIGMA_SHELL = {
  canvasBg: '#FEFEFE',
  hairlineBorder: '#E7EDF1',
  pillActiveBg: '#DDECFF',
  pillActiveText: '#080808',
  avatarWash: '#DEEDFF',
  /** Sombra del panel de lista (filter0_d ≈ dy 10, blur 24, gris suave). */
  cardShadow: '0 10px 24px rgba(189, 189, 189, 0.35)',
  /** Alineado con cabeceras de detalle (0.2em). */
  tableHeaderTracking: '0.2em',
} as const;

/** CTA de listados y botones primarios (`Buttons.svg`, frames Base). */
export const JOSANZ_FIGMA_BRAND_PRIMARY = '#080808';

/** Frame `Login.svg` (1280×832): login web claro, formulario a la derecha. */
export const JOSANZ_FIGMA_LOGIN = {
  canvasBg: '#FFFEFE',
  fieldBg: '#FFFFFF',
  /** Fondo campo en reposo (inputs densos / mobile). */
  fieldIdleFill: '#F5F5F5',
  fieldStroke: '#D7D7D7',
  fieldRadiusPx: 8,
  primaryCta: '#0F1E2F',
  onPrimaryCta: '#FFFFFF',
  heading: '#222222',
  muted: '#7C7C7C',
  /** Panel ilustración izquierda (aprox. patrón Figma). */
  heroWash: '#E8EDF5',
  heroWashEnd: '#F5F7FB',
} as const;

/**
 * Frame `Dashboard.svg` (1440×1364): rejilla KPI, tarjetas 8px, trazos #E0E0E0.
 * Proporciones: columnas ~58% / 42% (733 vs 515), gutter 32px, márgenes ~80px.
 */
export const JOSANZ_FIGMA_DASHBOARD = {
  canvas: '#FFFFFF',
  widgetStroke: '#E0E0E0',
  widgetRadiusPx: 8,
  surfaceMuted: '#F7F7F7',
  rowLine: '#E6E6E6',
  headerFilterBg: '#EEEEEE',
  /** Delta positivo en KPIs (verde export). */
  kpiPositive: '#0F6B3A',
  /** Botón oscuro barra superior (rect negro en export). */
  toolbarCta: '#000000',
  onToolbarCta: '#FFFFFF',
  pagePadPx: 80,
  gridGapPx: 32,
  kpiCardH: 172,
  largeCardMinH: 448,
} as const;

/** Frame `App.svg` (393×852): móvil, inputs y CTA secundario. */
export const JOSANZ_FIGMA_APP = {
  frameWidth: 393,
  frameRadius: 20,
  fieldStroke: '#D7D7D7',
  fieldRadiusPx: 8,
  secondaryFill: '#DADFE6',
  tabBarHeight: 133,
  tabBarFill: 'rgba(255,255,255,0.92)',
  homeIndicator: '#000000',
} as const;

/** Estados y badges reutilizables en listas y tarjetas. */
export const JOSANZ_FIGMA_SEMANTIC = {
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  badgeNeutral: '#E2E8F0',
} as const;

/**
 * Pastillas de estado de flujo (guía producto: fondo suave + texto en tono oscuro de la misma gama;
 * variantes “solid” más saturadas; Facturado intenso = verde bosque + blanco).
 * Claves = sufijo de `--josanz-pill-{clave}-bg|text`.
 */
export const JOSANZ_FIGMA_STATUS_PILLS = {
  borrador: { bg: '#ECEFF1', text: '#37474F' },
  presupuesto: { bg: '#FFEEE8', text: '#9A3412' },
  'presupuesto-solid': { bg: '#F97316', text: '#7C2D12' },
  confirmado: { bg: '#D1FAE5', text: '#064E3B' },
  'en-proceso': { bg: '#DBEAFE', text: '#1E3A8A' },
  /** Misma familia que “en proceso”; lista Eventos (filtro “En producción”). */
  'en-produccion': { bg: '#DBEAFE', text: '#1E3A8A' },
  cancelado: { bg: '#FFE4E6', text: '#991B1B' },
  incidencia: { bg: '#FEF9C3', text: '#713F12' },
  'incidencia-solid': { bg: '#EAB308', text: '#713F12' },
  pospuesto: { bg: '#EDE9FE', text: '#5B21B6' },
  facturado: { bg: '#14532D', text: '#FFFFFF' },
  'facturado-muted': { bg: '#EDE9FE', text: '#5B21B6' },
  'en-ejecucion': { bg: '#CCFBF1', text: '#115E59' },
  cerrado: { bg: '#E0E7FF', text: '#312E81' },
  'en-preparacion': { bg: '#FFEDD5', text: '#9A3412' },
  'sin-presupuesto': { bg: '#FFF7ED', text: '#C2410C' },
  finalizado: { bg: '#DCFCE7', text: '#166534' },
  inasistencia: { bg: '#FEF3C7', text: '#B45309' },
  'staff-tecnico': { bg: '#DBEAFE', text: '#1E40AF' },
  'staff-practicas': { bg: '#FCE7F3', text: '#9D174D' },
  'staff-freelance': { bg: '#D1FAE5', text: '#047857' },
} as const;

export type JosanzStatusPillKey = keyof typeof JOSANZ_FIGMA_STATUS_PILLS;

/** Misma semántica en `data-theme="dark"` (fondos más profundos, texto claro legible). */
export const JOSANZ_FIGMA_STATUS_PILLS_DARK: Record<JosanzStatusPillKey, { bg: string; text: string }> = {
  borrador: { bg: '#334155', text: '#F1F5F9' },
  presupuesto: { bg: '#431407', text: '#FDBA74' },
  'presupuesto-solid': { bg: '#9A3412', text: '#FFEDD5' },
  confirmado: { bg: '#022C22', text: '#6EE7B7' },
  'en-proceso': { bg: '#172554', text: '#93C5FD' },
  'en-produccion': { bg: '#172554', text: '#93C5FD' },
  cancelado: { bg: '#450A0A', text: '#FECACA' },
  incidencia: { bg: '#422006', text: '#FDE047' },
  'incidencia-solid': { bg: '#854D0E', text: '#FEF9C3' },
  pospuesto: { bg: '#2E1065', text: '#DDD6FE' },
  facturado: { bg: '#052E16', text: '#ECFDF5' },
  'facturado-muted': { bg: '#2E1065', text: '#DDD6FE' },
  'en-ejecucion': { bg: '#134E4A', text: '#99F6E4' },
  cerrado: { bg: '#1E1B4B', text: '#C7D2FE' },
  'en-preparacion': { bg: '#431407', text: '#FDBA74' },
  'sin-presupuesto': { bg: '#431407', text: '#FED7AA' },
  finalizado: { bg: '#052E16', text: '#BBF7D0' },
  inasistencia: { bg: '#422006', text: '#FDE68A' },
  'staff-tecnico': { bg: '#172554', text: '#93C5FD' },
  'staff-practicas': { bg: '#500724', text: '#F9A8D4' },
  'staff-freelance': { bg: '#064E3B', text: '#6EE7B7' },
};
