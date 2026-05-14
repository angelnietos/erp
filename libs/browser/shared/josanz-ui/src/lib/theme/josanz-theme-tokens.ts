import type { JosanzControlShape } from '../josanz-control-styles';
import { JOSANZ_FIGMA_SHELL } from './josanz-figma-tokens';

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
  | 'forest';

export interface JosanzAtmosphereConfig {
  name: JosanzAtmosphereName;
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
}

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
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#171717',
    textMuted: '#737373',
    border: '#E5E5E5',
    shadow: '0 1px 3px rgb(0 0 0 / 0.06)',
    accent: '#635BFF',
  },
  ubisoft: {
    name: 'ubisoft',
    background: '#F0F4F8',
    surface: '#FFFFFF',
    text: '#0F172A',
    textMuted: '#64748B',
    border: '#D1D9E6',
    shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
    cardShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)',
    accent: '#0070FF',
    glass: 'rgba(255, 255, 255, 0.8)',
  },
  rayman: {
    name: 'rayman',
    background: '#4C1D95',
    surface: '#5B21B6',
    text: '#FFFFFF',
    textMuted: '#C4B5FD',
    border: '#7C3AED',
    shadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
    accent: '#FACC15',
    glass: 'rgba(91, 33, 182, 0.7)',
  },
  nintendo: {
    name: 'nintendo',
    background: '#F2F2F2',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textMuted: '#737373',
    border: '#E60012',
    shadow: '0 4px 20px rgba(230, 0, 18, 0.1)',
    accent: '#E60012',
  },
  rockstar: {
    name: 'rockstar',
    background: '#000000',
    surface: '#1A1A1A',
    text: '#FDE047',
    textMuted: '#A1A1AA',
    border: '#333333',
    shadow: '0 0 40px rgba(253, 224, 71, 0.08)',
    accent: '#FDE047',
  },
  easports: {
    name: 'easports',
    background: '#05070A',
    surface: '#0D1117',
    text: '#E6EDF3',
    textMuted: '#8492A6',
    border: '#30363D',
    shadow: '0 0 50px rgba(56, 189, 248, 0.12)',
    accent: '#38BDF8',
    glass: 'rgba(13, 17, 23, 0.85)',
  },
  cyberpunk: {
    name: 'cyberpunk',
    background: '#050505',
    surface: '#000000',
    text: '#00FF9F',
    textMuted: '#FF00A0',
    border: '#00FF9F',
    shadow: '0 0 20px rgba(0, 255, 159, 0.25)',
    accent: '#FF00A0',
  },
  midnight: {
    name: 'midnight',
    background: '#0B0F1A',
    surface: '#151C2C',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    border: '#1E293B',
    shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    accent: '#818CF8',
    glass: 'rgba(21, 28, 44, 0.9)',
  },
  industrial: {
    name: 'industrial',
    background: '#09090B',
    surface: '#18181B',
    text: '#FAFAFA',
    textMuted: '#71717A',
    border: '#27272A',
    shadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    accent: '#F4F4F5',
  },
  sunset: {
    name: 'sunset',
    background: '#2D1A12',
    surface: '#432619',
    text: '#FEF3C7',
    textMuted: '#D97706',
    border: '#78350F',
    shadow: '0 15px 35px rgba(120, 53, 15, 0.4)',
    accent: '#F59E0B',
  },
  ocean: {
    name: 'ocean',
    background: '#082F49',
    surface: '#0C4A6E',
    text: '#F0F9FF',
    textMuted: '#38BDF8',
    border: '#075985',
    shadow: '0 10px 25px rgba(8, 47, 73, 0.5)',
    accent: '#0EA5E9',
    glass: 'rgba(12, 74, 110, 0.8)',
  },
  forest: {
    name: 'forest',
    background: '#064E3B',
    surface: '#065F46',
    text: '#ECFDF5',
    textMuted: '#34D399',
    border: '#047857',
    shadow: '0 10px 25px rgba(6, 78, 59, 0.5)',
    accent: '#10B981',
    glass: 'rgba(6, 95, 70, 0.8)',
  },
};

function parseCssColorToRgb(input: string): [number, number, number] | null {
  const s = input.trim();
  const hex = s.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgb = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }
  return null;
}

/** Texto claro u oscuro con buen contraste sobre un color sólido (botones, badges). */
export function josanzReadableOnSolid(background: string): string {
  const rgb = parseCssColorToRgb(background);
  if (!rgb) {
    return '#FFFFFF';
  }
  const lin = rgb.map((c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  return L > 0.4 ? '#0F172A' : '#FFFFFF';
}

/** Aplica tokens de atmósfera y marca a `:root` y `body` (app + Storybook). */
export function applyJosanzThemeCssVariables(params: {
  atmosphere: JosanzAtmosphereConfig;
  primaryColor: string;
  themeName: string;
}): void {
  const { atmosphere, primaryColor, themeName } = params;
  const root = document.documentElement;
  root.style.setProperty('--josanz-primary', primaryColor);
  root.style.setProperty('--josanz-on-primary', josanzReadableOnSolid(primaryColor));
  root.style.setProperty('--josanz-on-danger', josanzReadableOnSolid('#EF4444'));
  root.style.setProperty('--josanz-bg', atmosphere.background);
  root.style.setProperty('--josanz-surface', atmosphere.surface);
  root.style.setProperty('--josanz-text', atmosphere.text);
  root.style.setProperty('--josanz-text-muted', atmosphere.textMuted);
  root.style.setProperty('--josanz-border', atmosphere.border);
  root.style.setProperty('--josanz-shadow', atmosphere.shadow);
  root.style.setProperty('--josanz-accent', atmosphere.accent);
  root.style.setProperty('--josanz-glass', atmosphere.glass ?? 'transparent');
  root.style.setProperty(
    '--josanz-card-shadow',
    atmosphere.cardShadow ?? atmosphere.shadow,
  );
  root.setAttribute('data-josanz-atmosphere', atmosphere.name);
  root.setAttribute('data-josanz-theme', themeName);
  document.body.style.backgroundColor = atmosphere.background;
  document.body.style.color = atmosphere.text;
}
