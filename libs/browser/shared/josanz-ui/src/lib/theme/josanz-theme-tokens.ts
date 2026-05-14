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
  /** Sombra de filas/tarjetas de lista (Figma); si no existe, se usa `shadow`. */
  cardShadow?: string;
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
  },
  ubisoft: {
    name: 'ubisoft',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04)',
    cardShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
  },
  rayman: {
    name: 'rayman',
    background: '#4C1D95',
    surface: '#5B21B6',
    text: '#FFFFFF',
    textMuted: '#C4B5FD',
    border: '#6D28D9',
    shadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
  },
  nintendo: {
    name: 'nintendo',
    background: '#E60012',
    surface: '#FFFFFF',
    text: '#1F1F1F',
    textMuted: '#666666',
    border: '#E5E5E5',
    shadow: '0 4px 12px rgba(230, 0, 18, 0.15)',
  },
  rockstar: {
    name: 'rockstar',
    background: '#000000',
    surface: '#121212',
    text: '#FDE047',
    textMuted: '#A1A1AA',
    border: '#27272A',
    shadow: '0 0 20px rgba(253, 224, 71, 0.1)',
  },
  easports: {
    name: 'easports',
    background: '#060B15',
    surface: '#0F172A',
    text: '#38BDF8',
    textMuted: '#94A3B8',
    border: '#1E293B',
    shadow: '0 0 40px rgba(56, 189, 248, 0.1)',
  },
  cyberpunk: {
    name: 'cyberpunk',
    background: '#050505',
    surface: '#0D0D0D',
    text: '#00FF9F',
    textMuted: '#FF00A0',
    border: '#333333',
    shadow: '0 0 15px rgba(0, 255, 159, 0.2)',
  },
  midnight: {
    name: 'midnight',
    background: '#020617',
    surface: '#0F172A',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    border: '#1E293B',
    shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  },
  industrial: {
    name: 'industrial',
    background: '#18181B',
    surface: '#27272A',
    text: '#FAFAFA',
    textMuted: '#A1A1AA',
    border: '#3F3F46',
    shadow: '0 4px 14px rgb(0 0 0 / 0.35)',
  },
  sunset: {
    name: 'sunset',
    background: '#451A03',
    surface: '#78350F',
    text: '#FFF7ED',
    textMuted: '#FDBA74',
    border: '#92400E',
    shadow: '0 8px 24px rgb(124 45 18 / 0.35)',
  },
  ocean: {
    name: 'ocean',
    background: '#083344',
    surface: '#164E63',
    text: '#ECFEFF',
    textMuted: '#22D3EE',
    border: '#155E75',
    shadow: '0 4px 12px rgba(8, 51, 68, 0.4)',
  },
  forest: {
    name: 'forest',
    background: '#064E3B',
    surface: '#065F46',
    text: '#ECFDF5',
    textMuted: '#34D399',
    border: '#047857',
    shadow: '0 4px 12px rgba(6, 78, 59, 0.4)',
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
  root.style.setProperty(
    '--josanz-card-shadow',
    atmosphere.cardShadow ?? atmosphere.shadow,
  );
  root.setAttribute('data-josanz-atmosphere', atmosphere.name);
  root.setAttribute('data-josanz-theme', themeName);
  document.body.style.backgroundColor = atmosphere.background;
  document.body.style.color = atmosphere.text;
}
