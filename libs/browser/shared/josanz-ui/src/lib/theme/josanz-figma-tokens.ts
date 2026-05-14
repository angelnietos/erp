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
