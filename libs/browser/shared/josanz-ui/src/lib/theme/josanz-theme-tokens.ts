import type { JosanzControlShape } from '../josanz-control-styles';
import {
  JOSANZ_FIGMA_APP,
  JOSANZ_FIGMA_BRAND_PRIMARY,
  JOSANZ_FIGMA_DASHBOARD,
  JOSANZ_FIGMA_LOGIN,
  JOSANZ_FIGMA_SEMANTIC,
  JOSANZ_FIGMA_SHELL,
  JOSANZ_FIGMA_STATUS_PILLS,
  JOSANZ_FIGMA_STATUS_PILLS_DARK,
  type JosanzStatusPillKey,
} from './josanz-figma-tokens';

export { JOSANZ_FIGMA_BRAND_PRIMARY } from './josanz-figma-tokens';

/** Primario por defecto del ERP en neutro (listados). Login mantiene `#0F1E2F` en su pantalla. */
export const JOSANZ_DEFAULT_PRIMARY = JOSANZ_FIGMA_BRAND_PRIMARY;

export type JosanzThemeName = 'luxe-rounded' | 'luxe-sharp' | 'luxe-pill';

export type JosanzAtmosphereName =
  | 'neutral'
  | 'ubisoft'
  | 'rayman'
  | 'nintendo'
  | 'rockstar'
  | 'easports'
  | 'cyberpunk'
  | 'industrial'
  | 'sunset'
  | 'midnight'
  | 'ocean'
  | 'forest'
  | 'lavender'
  | 'rosewood'
  | 'cafe'
  | 'aurora'
  | 'sakura'
  | 'terracotta'
  | 'stargazer'
  | 'emerald';

export interface JosanzAtmosphereConfig {
  name: JosanzAtmosphereName;
  /** Color sólido o `linear-gradient` para el lienzo. */
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  shadow: string;
  accent: string;
  /** Sombra de filas/tarjetas de lista (Figma); si no existe, se usa `shadow`. */
  cardShadow?: string;
  /** Efecto de cristal/blur opcional para paneles. */
  glass?: string;
  /** Fuerza modo claro/oscuro de tokens estructurales; si no se define, se infiere del fondo. */
  isDark?: boolean;
  fieldFill?: string;
  surfaceMuted?: string;
  strokeField?: string;
}

export interface JosanzAtmosphereCatalogEntry {
  name: JosanzAtmosphereName;
  label: string;
  description: string;
}

/** Orden y metadatos para el panel de personalización. */
export const JOSANZ_ATMOSPHERE_CATALOG: readonly JosanzAtmosphereCatalogEntry[] = [
  { name: 'neutral', label: 'Neutral White', description: 'Referencia Figma: lienzo claro y tarjetas blancas.' },
  { name: 'lavender', label: 'Lavanda Suave', description: 'Morado empolvado, calmado y luminoso.' },
  { name: 'sakura', label: 'Sakura', description: 'Rosa cerezo y crema, delicado y acogedor.' },
  { name: 'cafe', label: 'Café Cálido', description: 'Marrón tostado y vainilla, como una cafetería.' },
  { name: 'terracotta', label: 'Terracota', description: 'Arcilla y ámbar, cálido mediterráneo.' },
  { name: 'nintendo', label: 'Nintendo Red', description: 'Crema cálida con acentos rojos alegres.' },
  { name: 'emerald', label: 'Esmeralda', description: 'Verde bosque refinado, fresco y elegante.' },
  { name: 'ocean', label: 'Océano Sereno', description: 'Azul profundo con espuma clara, relajante.' },
  { name: 'forest', label: 'Bosque Musgo', description: 'Verdes apagados y sombra suave.' },
  { name: 'sunset', label: 'Atardecer', description: 'Ámbar, coral y noche temprana.' },
  { name: 'aurora', label: 'Aurora', description: 'Verde azulado y violeta, como luces del norte.' },
  { name: 'ubisoft', label: 'Azul Profundo', description: 'Azul nocturno cinematográfico, suave.' },
  { name: 'rayman', label: 'Magia Violeta', description: 'Índigo y oro, fantasía acogedora.' },
  { name: 'easports', label: 'Arena Digital', description: 'Pizarra y cian eléctrico, deportivo premium.' },
  { name: 'midnight', label: 'Medianoche', description: 'Gris azulado GitHub, foco nocturno.' },
  { name: 'stargazer', label: 'Cielo Estrellado', description: 'Índigo cosmos con destellos suaves.' },
  { name: 'rosewood', label: 'Palo Rosa', description: 'Burdeos y rosa antiguo, íntimo.' },
  { name: 'rockstar', label: 'Oro Urbano', description: 'Carbón cálido y dorado tenue.' },
  { name: 'industrial', label: 'Grafito', description: 'Zinc cálido, estudio minimalista.' },
  { name: 'cyberpunk', label: 'Neón Lounge', description: 'Oscuro con neones suaves, no agresivo.' },
] as const;

export interface JosanzThemeConfig {
  name: JosanzThemeName;
  defaultShape: JosanzControlShape;
  primaryColor: string;
  atmosphere: JosanzAtmosphereConfig;
}

/** Registro único de atmósferas (servicio, Storybook y herramientas). */
export const JOSANZ_ATMOSPHERE_REGISTRY: Record<JosanzAtmosphereName, JosanzAtmosphereConfig> = {
  neutral: {
    name: 'neutral',
    background: JOSANZ_FIGMA_SHELL.canvasBg,
    surface: '#FFFFFF',
    text: JOSANZ_FIGMA_LOGIN.heading,
    textMuted: JOSANZ_FIGMA_LOGIN.muted,
    border: JOSANZ_FIGMA_SHELL.hairlineBorder,
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
    cardShadow: JOSANZ_FIGMA_SHELL.cardShadow,
    accent: JOSANZ_FIGMA_BRAND_PRIMARY,
    isDark: false,
    fieldFill: JOSANZ_FIGMA_LOGIN.fieldIdleFill,
    surfaceMuted: JOSANZ_FIGMA_DASHBOARD.surfaceMuted,
    strokeField: JOSANZ_FIGMA_LOGIN.fieldStroke,
  },
  lavender: {
    name: 'lavender',
    background: 'linear-gradient(160deg, #F5F0FF 0%, #EDE4FF 48%, #E8DEFF 100%)',
    surface: '#FFFFFF',
    text: '#2E1065',
    textMuted: '#7C6A9E',
    border: '#DDD0F5',
    shadow: '0 8px 24px rgba(124, 58, 237, 0.08)',
    cardShadow: '0 12px 32px rgba(139, 92, 246, 0.12)',
    accent: '#8B5CF6',
    glass: 'rgba(255, 255, 255, 0.72)',
    isDark: false,
    fieldFill: '#F8F5FF',
    surfaceMuted: '#F3EDFF',
    strokeField: '#D4C4F5',
  },
  sakura: {
    name: 'sakura',
    background: 'linear-gradient(165deg, #FFF5F7 0%, #FFE8EE 55%, #FFDCE6 100%)',
    surface: '#FFFBFC',
    text: '#4A1D32',
    textMuted: '#9D6B82',
    border: '#F5C4D4',
    shadow: '0 8px 22px rgba(236, 72, 153, 0.1)',
    cardShadow: '0 14px 36px rgba(244, 114, 182, 0.14)',
    accent: '#EC4899',
    glass: 'rgba(255, 251, 252, 0.78)',
    isDark: false,
    fieldFill: '#FFF0F4',
    surfaceMuted: '#FFE8F0',
    strokeField: '#F0B8CC',
  },
  cafe: {
    name: 'cafe',
    background: 'linear-gradient(155deg, #FAF6F1 0%, #F3EBE0 50%, #EBE0D2 100%)',
    surface: '#FFFCF8',
    text: '#3D2E24',
    textMuted: '#8B7355',
    border: '#E0D0BE',
    shadow: '0 10px 28px rgba(120, 84, 48, 0.1)',
    cardShadow: '0 12px 30px rgba(146, 98, 57, 0.12)',
    accent: '#B45309',
    glass: 'rgba(255, 252, 248, 0.8)',
    isDark: false,
    fieldFill: '#F5EDE3',
    surfaceMuted: '#EFE5D8',
    strokeField: '#D9C9B5',
  },
  terracotta: {
    name: 'terracotta',
    background: 'linear-gradient(150deg, #FFF7F0 0%, #FFEDE0 45%, #FFE2CF 100%)',
    surface: '#FFFFFF',
    text: '#431407',
    textMuted: '#9A5B3C',
    border: '#F5C9A8',
    shadow: '0 10px 26px rgba(234, 88, 12, 0.1)',
    cardShadow: '0 14px 34px rgba(249, 115, 22, 0.15)',
    accent: '#EA580C',
    glass: 'rgba(255, 255, 255, 0.75)',
    isDark: false,
    fieldFill: '#FFF3E8',
    surfaceMuted: '#FFEDD5',
    strokeField: '#FDBA74',
  },
  nintendo: {
    name: 'nintendo',
    background: 'linear-gradient(180deg, #FFF9F5 0%, #FFF0EB 100%)',
    surface: '#FFFFFF',
    text: '#2D1515',
    textMuted: '#8B5E5E',
    border: '#F0B4B4',
    shadow: '0 8px 24px rgba(220, 38, 38, 0.08)',
    cardShadow: '0 12px 28px rgba(220, 38, 38, 0.12)',
    accent: '#DC2626',
    glass: 'rgba(255, 255, 255, 0.88)',
    isDark: false,
    fieldFill: '#FFF5F5',
    surfaceMuted: '#FFEBEB',
    strokeField: '#FECACA',
  },
  emerald: {
    name: 'emerald',
    background: 'linear-gradient(155deg, #ECFDF5 0%, #D1FAE5 55%, #BBF7D0 100%)',
    surface: '#FFFFFF',
    text: '#064E3B',
    textMuted: '#3F7A66',
    border: '#A7F3D0',
    shadow: '0 8px 24px rgba(16, 185, 129, 0.1)',
    cardShadow: '0 12px 32px rgba(5, 150, 105, 0.14)',
    accent: '#059669',
    glass: 'rgba(255, 255, 255, 0.76)',
    isDark: false,
    fieldFill: '#F0FDF4',
    surfaceMuted: '#DCFCE7',
    strokeField: '#86EFAC',
  },
  ubisoft: {
    name: 'ubisoft',
    background: 'linear-gradient(165deg, #0B1224 0%, #101B38 45%, #152347 100%)',
    surface: '#1A2744',
    text: '#E8EEF9',
    textMuted: '#94A8C9',
    border: '#2A3F66',
    shadow: '0 20px 48px rgba(0, 0, 0, 0.45)',
    cardShadow: '0 12px 40px rgba(37, 99, 235, 0.22)',
    accent: '#3B82F6',
    glass: 'rgba(26, 39, 68, 0.82)',
    isDark: true,
    fieldFill: '#121C33',
    surfaceMuted: '#152038',
    strokeField: '#334A72',
  },
  rayman: {
    name: 'rayman',
    background: 'linear-gradient(145deg, #1E1B4B 0%, #312E81 42%, #4338CA 100%)',
    surface: '#3D3894',
    text: '#F8FAFF',
    textMuted: '#C7D2FE',
    border: '#5B56C9',
    shadow: '0 18px 42px rgba(30, 27, 75, 0.55)',
    cardShadow: '0 10px 36px rgba(250, 204, 21, 0.18)',
    accent: '#FBBF24',
    glass: 'rgba(61, 56, 148, 0.78)',
    isDark: true,
    fieldFill: '#2A2670',
    surfaceMuted: '#332F7A',
    strokeField: '#6B65D4',
  },
  easports: {
    name: 'easports',
    background: 'linear-gradient(160deg, #0C1222 0%, #111B32 50%, #0F172A 100%)',
    surface: '#1A2438',
    text: '#F1F5F9',
    textMuted: '#8BA3C7',
    border: '#2D3F5C',
    shadow: '0 22px 50px rgba(0, 0, 0, 0.5)',
    cardShadow: '0 8px 36px rgba(56, 189, 248, 0.2)',
    accent: '#38BDF8',
    glass: 'rgba(26, 36, 56, 0.85)',
    isDark: true,
    fieldFill: '#0F1729',
    surfaceMuted: '#152238',
    strokeField: '#3B5278',
  },
  cyberpunk: {
    name: 'cyberpunk',
    background: 'linear-gradient(155deg, #120818 0%, #1A0F24 50%, #0F1419 100%)',
    surface: '#1E1528',
    text: '#E2FDF4',
    textMuted: '#C4A8E8',
    border: '#3D2E52',
    shadow: '0 20px 44px rgba(0, 0, 0, 0.55)',
    cardShadow: '0 8px 32px rgba(167, 139, 250, 0.2)',
    accent: '#A78BFA',
    glass: 'rgba(30, 21, 40, 0.88)',
    isDark: true,
    fieldFill: '#160F20',
    surfaceMuted: '#221830',
    strokeField: '#4A3860',
  },
  midnight: {
    name: 'midnight',
    background: 'linear-gradient(180deg, #0D1117 0%, #161B22 100%)',
    surface: '#21262D',
    text: '#F0F6FC',
    textMuted: '#9BA7B5',
    border: '#373E47',
    shadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
    cardShadow: '0 8px 28px rgba(88, 166, 255, 0.12)',
    accent: '#58A6FF',
    glass: 'rgba(33, 38, 45, 0.9)',
    isDark: true,
    fieldFill: '#0D1117',
    surfaceMuted: '#1A2028',
    strokeField: '#444C56',
  },
  stargazer: {
    name: 'stargazer',
    background: 'linear-gradient(165deg, #0B1026 0%, #151B3D 40%, #1A1040 100%)',
    surface: '#222B52',
    text: '#E8ECFF',
    textMuted: '#A5B4E8',
    border: '#35406E',
    shadow: '0 22px 50px rgba(8, 12, 40, 0.6)',
    cardShadow: '0 10px 36px rgba(129, 140, 248, 0.2)',
    accent: '#818CF8',
    glass: 'rgba(34, 43, 82, 0.84)',
    isDark: true,
    fieldFill: '#121830',
    surfaceMuted: '#1A2248',
    strokeField: '#3F4D7A',
  },
  rosewood: {
    name: 'rosewood',
    background: 'linear-gradient(150deg, #2A1218 0%, #3D1824 50%, #2E1420 100%)',
    surface: '#4A2430',
    text: '#FCE7F3',
    textMuted: '#E8B4C8',
    border: '#6B3A4A',
    shadow: '0 20px 44px rgba(0, 0, 0, 0.5)',
    cardShadow: '0 10px 34px rgba(244, 114, 182, 0.18)',
    accent: '#F472B6',
    glass: 'rgba(74, 36, 48, 0.86)',
    isDark: true,
    fieldFill: '#32141C',
    surfaceMuted: '#3E1C28',
    strokeField: '#7A4458',
  },
  rockstar: {
    name: 'rockstar',
    background: 'linear-gradient(160deg, #141210 0%, #1C1916 50%, #12100E 100%)',
    surface: '#262220',
    text: '#F5E6C8',
    textMuted: '#B8A898',
    border: '#3D3832',
    shadow: '0 24px 50px rgba(0, 0, 0, 0.55)',
    cardShadow: '0 8px 30px rgba(217, 180, 90, 0.12)',
    accent: '#D9B45A',
    glass: 'rgba(38, 34, 32, 0.92)',
    isDark: true,
    fieldFill: '#1A1816',
    surfaceMuted: '#201E1C',
    strokeField: '#4A4540',
  },
  industrial: {
    name: 'industrial',
    background: 'linear-gradient(180deg, #18181B 0%, #27272A 100%)',
    surface: '#323238',
    text: '#FAFAFA',
    textMuted: '#A8A8B0',
    border: '#45454D',
    shadow: '0 14px 36px rgba(0, 0, 0, 0.4)',
    cardShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
    accent: '#D4D4D8',
    glass: 'rgba(50, 50, 56, 0.88)',
    isDark: true,
    fieldFill: '#1F1F23',
    surfaceMuted: '#2A2A30',
    strokeField: '#52525B',
  },
  sunset: {
    name: 'sunset',
    background: 'linear-gradient(155deg, #2A1810 0%, #3D2218 40%, #1F1518 100%)',
    surface: '#3D2A24',
    text: '#FFEDD5',
    textMuted: '#F0B88A',
    border: '#5C4038',
    shadow: '0 18px 42px rgba(60, 30, 10, 0.45)',
    cardShadow: '0 10px 32px rgba(249, 115, 22, 0.2)',
    accent: '#FB923C',
    glass: 'rgba(61, 42, 36, 0.85)',
    isDark: true,
    fieldFill: '#2A1C16',
    surfaceMuted: '#342420',
    strokeField: '#6B4E44',
  },
  ocean: {
    name: 'ocean',
    background: 'linear-gradient(165deg, #0C2D48 0%, #0F3D5C 45%, #0A2540 100%)',
    surface: '#134A6E',
    text: '#F0F9FF',
    textMuted: '#93C5FD',
    border: '#1E5A82',
    shadow: '0 18px 42px rgba(6, 40, 70, 0.5)',
    cardShadow: '0 10px 34px rgba(56, 189, 248, 0.18)',
    accent: '#7DD3FC',
    glass: 'rgba(19, 74, 110, 0.82)',
    isDark: true,
    fieldFill: '#0A2238',
    surfaceMuted: '#0F3250',
    strokeField: '#256892',
  },
  forest: {
    name: 'forest',
    background: 'linear-gradient(160deg, #0F2E22 0%, #164A36 48%, #0D281F 100%)',
    surface: '#1A5C45',
    text: '#ECFDF5',
    textMuted: '#9FD4BC',
    border: '#267A5C',
    shadow: '0 18px 40px rgba(6, 50, 35, 0.45)',
    cardShadow: '0 10px 32px rgba(52, 211, 153, 0.16)',
    accent: '#6EE7B7',
    glass: 'rgba(26, 92, 69, 0.8)',
    isDark: true,
    fieldFill: '#0F2920',
    surfaceMuted: '#143828',
    strokeField: '#2F6B52',
  },
  aurora: {
    name: 'aurora',
    background: 'linear-gradient(145deg, #0B1F2E 0%, #142840 35%, #1A1045 70%, #0F2838 100%)',
    surface: '#1E3A52',
    text: '#E6FFFA',
    textMuted: '#99E8D9',
    border: '#2D5A72',
    shadow: '0 22px 48px rgba(8, 30, 45, 0.55)',
    cardShadow: '0 12px 38px rgba(45, 212, 191, 0.2)',
    accent: '#5EEAD4',
    glass: 'rgba(30, 58, 82, 0.84)',
    isDark: true,
    fieldFill: '#0F2430',
    surfaceMuted: '#163040',
    strokeField: '#3A6880',
  },
};

/** HSL (h 0–360, s/l 0–1) para heurísticas de “on-color” sin confundir verdes con amarillos. */
function rgbToHsl(r255: number, g255: number, b255: number): { h: number; s: number; l: number } {
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) {
      h = ((g - b) / d) % 6;
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) {
      h += 360;
    }
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1) + 1e-12);
  return { h, s, l };
}

function parseCssColorToRgb(input: string): [number, number, number] | null {
  const s = input.trim();
  const hex = s.match(/^#([\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    } else if (h.length === 8) {
      h = h.slice(0, 6);
    }
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgbComma = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (rgbComma) {
    return [Number(rgbComma[1]), Number(rgbComma[2]), Number(rgbComma[3])];
  }
  const rgbSpace = s.match(/^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/i);
  if (rgbSpace) {
    return [Number(rgbSpace[1]), Number(rgbSpace[2]), Number(rgbSpace[3])];
  }
  return null;
}

function srgbChannelToLinear(c: number): number {
  const x = Math.max(0, Math.min(255, c)) / 255;
  return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

/** Luminancia relativa WCAG 2.1 (0..1). */
function relativeLuminanceFromRgb(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(srgbChannelToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Texto claro u oscuro sobre un color sólido (marca, badges, botones).
 * El criterio solo por ratio WCAG suele elegir **negro** sobre **verdes saturados** (#22c55e, etc.),
 * que rompe la marca; aquí se separa el rango amarillo/ámbar (texto oscuro) del resto (texto claro
 * salvo fondos muy claros o grises).
 */
export function josanzReadableOnSolid(background: string): string {
  const rgb = parseCssColorToRgb(background);
  if (!rgb) {
    return '#FFFFFF';
  }
  const [r255, g255, b255] = rgb;
  const L = relativeLuminanceFromRgb(rgb);
  const { h, s } = rgbToHsl(r255, g255, b255);

  if (s < 0.12) {
    return L > 0.56 ? '#0F172A' : '#FFFFFF';
  }

  if (h >= 38 && h <= 88 && s > 0.12 && L > 0.22) {
    return '#0F172A';
  }

  return L > 0.72 ? '#0F172A' : '#FFFFFF';
}

/** Infiera si la atmósfera es oscura a partir del fondo (sólido o gradiente). */
export function josanzAtmosphereIsDark(atmosphere: JosanzAtmosphereConfig): boolean {
  if (atmosphere.isDark !== undefined) {
    return atmosphere.isDark;
  }
  const sample = atmosphere.background.match(/#[\da-f]{3,8}/i)?.[0] ?? atmosphere.background;
  const rgb = parseCssColorToRgb(sample);
  if (!rgb) {
    return false;
  }
  return relativeLuminanceFromRgb(rgb) < 0.38;
}

/** Aplica tokens de atmósfera y marca a `:root` y `body` (app + Storybook). */
export function applyJosanzThemeCssVariables(params: {
  atmosphere: JosanzAtmosphereConfig;
  primaryColor: string;
  themeName: string;
}): void {
  const { atmosphere, primaryColor, themeName } = params;
  const root = document.documentElement;
  const isDark = josanzAtmosphereIsDark(atmosphere);

  root.style.setProperty('--josanz-primary', primaryColor);
  root.style.setProperty('--josanz-on-primary', josanzReadableOnSolid(primaryColor));
  root.style.setProperty('--josanz-on-danger', josanzReadableOnSolid('#EF4444'));
  root.style.setProperty('--josanz-bg', atmosphere.background);
  root.style.setProperty('--josanz-surface', atmosphere.surface);
  root.style.setProperty('--josanz-text', atmosphere.text);
  root.style.setProperty('--josanz-text-muted', atmosphere.textMuted);
  root.style.setProperty('--josanz-border', atmosphere.border);
  root.style.setProperty('--josanz-shadow', atmosphere.shadow);
  root.style.setProperty(
    '--josanz-accent',
    atmosphere.name === 'neutral' ? JOSANZ_FIGMA_BRAND_PRIMARY : atmosphere.accent,
  );
  root.style.setProperty('--josanz-glass', atmosphere.glass ?? 'transparent');
  root.style.setProperty(
    '--josanz-card-shadow',
    atmosphere.cardShadow ?? atmosphere.shadow,
  );
  root.setAttribute('data-josanz-atmosphere', atmosphere.name);
  root.setAttribute('data-josanz-theme', themeName);
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  root.setAttribute('data-theme-is-light', isDark ? 'false' : 'true');

  if (atmosphere.background.includes('gradient')) {
    document.body.style.background = atmosphere.background;
    document.body.style.backgroundColor = '';
  } else {
    document.body.style.backgroundColor = atmosphere.background;
    document.body.style.background = '';
  }
  document.body.style.color = atmosphere.text;

  applyJosanzStructuralCssVariables(root);

  if (atmosphere.fieldFill) {
    root.style.setProperty('--josanz-field-fill', atmosphere.fieldFill);
  }
  if (atmosphere.surfaceMuted) {
    root.style.setProperty('--josanz-surface-muted', atmosphere.surfaceMuted);
    root.style.setProperty('--josanz-header-filter-bg', atmosphere.surfaceMuted);
  }
  if (atmosphere.strokeField) {
    root.style.setProperty('--josanz-stroke-field', atmosphere.strokeField);
    root.style.setProperty('--josanz-stroke-widget', atmosphere.strokeField);
  }
  if (isDark) {
    root.style.setProperty('--josanz-text-heading', atmosphere.text);
    root.style.setProperty('--josanz-label-muted', atmosphere.textMuted);
    root.style.setProperty('--josanz-row-line', atmosphere.border);
  } else if (atmosphere.name === 'neutral') {
    applyJosanzFigmaNeutralStructuralOverrides(root);
  }
}

/** Tokens estructurales fijos del frame Figma (modo neutro). */
function applyJosanzFigmaNeutralStructuralOverrides(root: HTMLElement): void {
  root.style.setProperty('--josanz-stroke-widget', JOSANZ_FIGMA_DASHBOARD.widgetStroke);
  root.style.setProperty('--josanz-stroke-field', JOSANZ_FIGMA_LOGIN.fieldStroke);
  root.style.setProperty('--josanz-row-line', JOSANZ_FIGMA_DASHBOARD.rowLine);
  root.style.setProperty('--josanz-surface-muted', JOSANZ_FIGMA_DASHBOARD.surfaceMuted);
  root.style.setProperty('--josanz-header-filter-bg', JOSANZ_FIGMA_DASHBOARD.headerFilterBg);
  root.style.setProperty('--josanz-field-fill', JOSANZ_FIGMA_LOGIN.fieldIdleFill);
  root.style.setProperty('--josanz-text-heading', JOSANZ_FIGMA_LOGIN.heading);
  root.style.setProperty('--josanz-label-muted', JOSANZ_FIGMA_LOGIN.muted);
  root.style.setProperty('--josanz-kpi-positive', JOSANZ_FIGMA_DASHBOARD.kpiPositive);
  root.style.setProperty('--josanz-elev-soft', '0px 4px 8px rgba(178, 178, 178, 0.28)');
  root.style.setProperty('--josanz-shadow-sm', '0 2px 4px rgba(0, 0, 0, 0.08)');
  root.style.setProperty('--josanz-footer-elev', '0 -10px 30px rgba(0, 0, 0, 0.08)');
  root.style.setProperty('--josanz-radius-control', `${JOSANZ_FIGMA_LOGIN.fieldRadiusPx}px`);
  root.style.setProperty('--josanz-radius-widget', `${JOSANZ_FIGMA_DASHBOARD.widgetRadiusPx}px`);
  root.style.setProperty('--josanz-radius-card', '12px');
  root.style.setProperty('--josanz-secondary-fill', JOSANZ_FIGMA_APP.secondaryFill);
}

function applyJosanzStatusPillCssVariables(root: HTMLElement, isDark: boolean): void {
  const palette = isDark ? JOSANZ_FIGMA_STATUS_PILLS_DARK : JOSANZ_FIGMA_STATUS_PILLS;
  (Object.keys(palette) as JosanzStatusPillKey[]).forEach((key) => {
    const { bg, text } = palette[key];
    root.style.setProperty(`--josanz-pill-${key}-bg`, bg);
    root.style.setProperty(`--josanz-pill-${key}-text`, text);
  });
}

/** Tokens de layout Figma (trazos, radios, superficies) + semántica; respeta `data-theme="dark"`. */
export function applyJosanzStructuralCssVariables(root: HTMLElement = document.documentElement): void {
  const isDark = root.getAttribute('data-theme') === 'dark';
  if (isDark) {
    root.style.setProperty('--josanz-status-pill-muted-bg', '#334155');
    root.style.setProperty('--josanz-status-pill-muted-text', '#f8fafc');
    root.style.setProperty('--josanz-stroke-widget', '#334155');
    root.style.setProperty('--josanz-stroke-field', '#475569');
    root.style.setProperty('--josanz-row-line', '#334155');
    root.style.setProperty('--josanz-surface-muted', '#1e293b');
    root.style.setProperty('--josanz-header-filter-bg', '#1e293b');
    root.style.setProperty('--josanz-field-fill', '#0f172a');
    root.style.setProperty('--josanz-text-heading', '#f8fafc');
    root.style.setProperty('--josanz-label-muted', '#94a3b8');
    root.style.setProperty('--josanz-kpi-positive', '#4ade80');
    root.style.setProperty('--josanz-elev-soft', '0px 4px 8px rgba(0,0,0,0.35)');
    root.style.setProperty('--josanz-shadow-sm', '0 2px 4px rgba(0,0,0,0.25)');
  } else {
    root.style.setProperty('--josanz-status-pill-muted-bg', JOSANZ_FIGMA_LOGIN.primaryCta);
    root.style.setProperty('--josanz-status-pill-muted-text', JOSANZ_FIGMA_LOGIN.onPrimaryCta);
    root.style.setProperty('--josanz-stroke-widget', JOSANZ_FIGMA_DASHBOARD.widgetStroke);
    root.style.setProperty('--josanz-stroke-field', JOSANZ_FIGMA_LOGIN.fieldStroke);
    root.style.setProperty('--josanz-row-line', JOSANZ_FIGMA_DASHBOARD.rowLine);
    root.style.setProperty('--josanz-surface-muted', JOSANZ_FIGMA_DASHBOARD.surfaceMuted);
    root.style.setProperty('--josanz-header-filter-bg', JOSANZ_FIGMA_DASHBOARD.headerFilterBg);
    root.style.setProperty('--josanz-field-fill', JOSANZ_FIGMA_LOGIN.fieldIdleFill);
    root.style.setProperty('--josanz-text-heading', JOSANZ_FIGMA_LOGIN.heading);
    root.style.setProperty('--josanz-label-muted', JOSANZ_FIGMA_LOGIN.muted);
    root.style.setProperty('--josanz-kpi-positive', JOSANZ_FIGMA_DASHBOARD.kpiPositive);
    root.style.setProperty('--josanz-elev-soft', '0px 4px 8px rgba(178,178,178,0.28)');
    root.style.setProperty('--josanz-shadow-sm', '0 2px 4px rgba(0,0,0,0.1)');
  }
  root.style.setProperty('--josanz-radius-control', `${JOSANZ_FIGMA_LOGIN.fieldRadiusPx}px`);
  root.style.setProperty('--josanz-radius-widget', `${JOSANZ_FIGMA_DASHBOARD.widgetRadiusPx}px`);
  root.style.setProperty('--josanz-radius-card', '12px');
  root.style.setProperty('--josanz-secondary-fill', JOSANZ_FIGMA_APP.secondaryFill);
  root.style.setProperty('--josanz-success', JOSANZ_FIGMA_SEMANTIC.success);
  root.style.setProperty('--josanz-warning', JOSANZ_FIGMA_SEMANTIC.warning);
  root.style.setProperty('--josanz-badge-neutral', JOSANZ_FIGMA_SEMANTIC.badgeNeutral);
  root.style.setProperty('--josanz-field-accent', 'var(--josanz-primary)');
  root.style.setProperty('--josanz-content-max', '1280px');
  root.style.setProperty('--josanz-sidebar-width', '68px');
  root.style.setProperty('--josanz-shell-pad-x', '1.5rem');
  root.style.setProperty('--josanz-shell-pad-x-md', `${JOSANZ_FIGMA_DASHBOARD.pagePadPx}px`);
  root.style.setProperty('--josanz-shell-pad-y', '1.5rem');
  root.style.setProperty('--josanz-shell-pad-y-md', '2.5rem');
  root.style.setProperty('--josanz-shell-footer-safe', 'max(1.5rem, env(safe-area-inset-bottom, 0px))');
  root.style.setProperty('--josanz-shell-mobile-tab-clearance', '133px');
  /** Listas (Dashboard.svg): gutter rejilla 32px; más aire interior en filas tipo card. */
  root.style.setProperty('--josanz-list-stack-gap', `${JOSANZ_FIGMA_DASHBOARD.gridGapPx}px`);
  root.style.setProperty('--josanz-list-card-pad-x', '1.25rem');
  root.style.setProperty('--josanz-list-card-pad-x-md', '2rem');
  root.style.setProperty('--josanz-list-card-pad-y', '1.25rem');
  root.style.setProperty('--josanz-list-card-pad-y-md', '1.5rem');
  if (isDark) {
    root.style.setProperty('--josanz-footer-elev', '0 -10px 30px rgba(0,0,0,0.45)');
  } else {
    root.style.setProperty('--josanz-footer-elev', '0 -10px 30px rgba(0,0,0,0.1)');
  }

  applyJosanzStatusPillCssVariables(root, isDark);
}
