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
  tableHeaderTracking: '0.1em',
} as const;

/** Frame `Login.svg` (1280×832): login web claro, formulario a la derecha. */
export const JOSANZ_FIGMA_LOGIN = {
  canvasBg: '#FFFEFE',
  fieldBg: '#FFFFFF',
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
