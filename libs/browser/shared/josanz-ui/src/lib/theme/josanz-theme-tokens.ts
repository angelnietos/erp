import type { JosanzControlShape } from '../josanz-control-styles';

export type JosanzThemeName = 'luxe-rounded' | 'luxe-sharp' | 'luxe-pill';

export type JosanzAtmosphereName =
  | 'neutral'
  | 'luxe'
  | 'nordic'
  | 'ivory'
  | 'nature'
  | 'ocean'
  | 'forest'
  | 'sakura'
  | 'midnight'
  | 'slate'
  | 'fire'
  | 'cyberpunk'
  | 'industrial'
  | 'sunset';

export interface JosanzAtmosphereConfig {
  name: JosanzAtmosphereName;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  shadow: string;
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
  luxe: {
    name: 'luxe',
    background: '#FEFEFE',
    surface: '#FFFFFF',
    text: '#080808',
    textMuted: '#2E425A',
    border: '#E7EDF1',
    shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },
  midnight: {
    name: 'midnight',
    background: '#0B0F1A',
    surface: '#151C2C',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    border: '#1E293B',
    shadow: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
  },
  fire: {
    name: 'fire',
    background: '#2D1B1B',
    surface: '#3D2626',
    text: '#FFF1F1',
    textMuted: '#E5AFAF',
    border: '#4D3434',
    shadow: '0 10px 15px -3px rgb(0 0 0 / 0.4)',
  },
  nordic: {
    name: 'nordic',
    background: '#CBD5E1',
    surface: '#F8FAFC',
    text: '#1E293B',
    textMuted: '#475569',
    border: '#94A3B8',
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.12)',
  },
  slate: {
    name: 'slate',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F1F5F9',
    textMuted: '#94A3B8',
    border: '#334155',
    shadow: '0 4px 6px -1px rgb(0 0 0 / 0.2)',
  },
  ivory: {
    name: 'ivory',
    background: '#EDE4D3',
    surface: '#FFFEF7',
    text: '#292524',
    textMuted: '#78716C',
    border: '#D6D3D1',
    shadow: '0 2px 10px rgb(0 0 0 / 0.06)',
  },
  nature: {
    name: 'nature',
    background: '#BBF7D0',
    surface: '#F0FDF4',
    text: '#14532D',
    textMuted: '#166534',
    border: '#86EFAC',
    shadow: '0 2px 8px rgb(22 101 52 / 0.15)',
  },
  ocean: {
    name: 'ocean',
    background: '#BAE6FD',
    surface: '#F0F9FF',
    text: '#0C4A6E',
    textMuted: '#075985',
    border: '#7DD3FC',
    shadow: '0 2px 8px rgb(3 105 161 / 0.15)',
  },
  forest: {
    name: 'forest',
    background: '#C5D9B8',
    surface: '#F4FAF0',
    text: '#1A2E16',
    textMuted: '#3F5A38',
    border: '#9DB892',
    shadow: '0 2px 10px rgb(34 55 24 / 0.12)',
  },
  sakura: {
    name: 'sakura',
    background: '#FBCFE8',
    surface: '#FFF5F7',
    text: '#831843',
    textMuted: '#9D174D',
    border: '#F9A8D4',
    shadow: '0 2px 10px rgb(190 24 93 / 0.12)',
  },
  cyberpunk: {
    name: 'cyberpunk',
    background: '#0A0A12',
    surface: '#12121C',
    text: '#E2E8F0',
    textMuted: '#64748B',
    border: '#1E3A5F',
    shadow: '0 0 0 1px rgb(6 182 212 / 0.15), 0 12px 40px rgb(0 0 0 / 0.45)',
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
    background: '#1C0F0C',
    surface: '#2D1810',
    text: '#FFF7ED',
    textMuted: '#FDBA74',
    border: '#5C2E22',
    shadow: '0 8px 24px rgb(124 45 18 / 0.35)',
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
  root.setAttribute('data-josanz-atmosphere', atmosphere.name);
  root.setAttribute('data-josanz-theme', themeName);
  document.body.style.backgroundColor = atmosphere.background;
  document.body.style.color = atmosphere.text;
}
