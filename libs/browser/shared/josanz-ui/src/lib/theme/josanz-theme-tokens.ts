import type { JosanzControlShape } from '../josanz-control-styles';
import {
  JOSANZ_FIGMA_APP,
  JOSANZ_FIGMA_DASHBOARD,
  JOSANZ_FIGMA_LOGIN,
  JOSANZ_FIGMA_SEMANTIC,
  JOSANZ_FIGMA_SHELL,
} from './josanz-figma-tokens';

/** Primario por defecto alineado con el frame Login de Figma (`Login.svg`). */
export const JOSANZ_DEFAULT_PRIMARY = JOSANZ_FIGMA_LOGIN.primaryCta;

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
    background: JOSANZ_FIGMA_SHELL.canvasBg,
    surface: '#FFFFFF',
    text: '#0F172A',
    textMuted: '#64748B',
    border: JOSANZ_FIGMA_SHELL.hairlineBorder,
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    cardShadow: JOSANZ_FIGMA_SHELL.cardShadow,
    accent: '#635BFF',
  },
  ubisoft: {
    name: 'ubisoft',
    background: '#040711',
    surface: '#0B1024',
    text: '#F1F5F9',
    textMuted: '#94A3B8',
    border: '#1E293B',
    shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
    cardShadow: '0 10px 40px rgba(0, 112, 255, 0.2)',
    accent: '#00A3FF',
    glass: 'rgba(11, 16, 36, 0.85)',
  },
  rayman: {
    name: 'rayman',
    background: '#1E1B4B',
    surface: '#312E81',
    text: '#FFFFFF',
    textMuted: '#A5B4FC',
    border: '#4338CA',
    shadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
    cardShadow: '0 0 30px rgba(250, 204, 21, 0.25)',
    accent: '#FACC15',
    glass: 'rgba(49, 46, 129, 0.8)',
  },
  nintendo: {
    name: 'nintendo',
    background: '#FDFDFD',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textMuted: '#71717A',
    border: '#E60012',
    shadow: '0 10px 30px rgba(230, 0, 18, 0.12)',
    cardShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
    accent: '#E60012',
    glass: 'rgba(255, 255, 255, 0.95)',
  },
  rockstar: {
    name: 'rockstar',
    background: '#050505',
    surface: '#121212',
    text: '#FDE047',
    textMuted: '#A1A1AA',
    border: '#262626',
    shadow: '0 30px 60px rgba(0, 0, 0, 0.9)',
    cardShadow: '0 0 25px rgba(253, 224, 71, 0.1)',
    accent: '#FDE047',
    glass: 'rgba(18, 18, 18, 0.96)',
  },
  easports: {
    name: 'easports',
    background: '#020617',
    surface: '#0F172A',
    text: '#F8FAFC',
    textMuted: '#64748B',
    border: '#1E293B',
    shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
    cardShadow: '0 0 40px rgba(56, 189, 248, 0.3)',
    accent: '#38BDF8',
    glass: 'rgba(15, 23, 42, 0.88)',
  },
  cyberpunk: {
    name: 'cyberpunk',
    background: '#010101',
    surface: '#050505',
    text: '#00FF9F',
    textMuted: '#FF00A0',
    border: '#00FF9F',
    shadow: '0 0 50px rgba(0, 255, 159, 0.2)',
    cardShadow: '0 0 30px rgba(255, 0, 160, 0.4)',
    accent: '#FF00A0',
    glass: 'rgba(5, 5, 5, 0.92)',
  },
  midnight: {
    name: 'midnight',
    background: '#02040A',
    surface: '#0D1117',
    text: '#F0F6FC',
    textMuted: '#8B949E',
    border: '#30363D',
    shadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
    accent: '#58A6FF',
    glass: 'rgba(13, 17, 23, 0.9)',
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
    background: '#1C1917',
    surface: '#292524',
    text: '#FFEDD5',
    textMuted: '#D97706',
    border: '#44403C',
    shadow: '0 15px 40px rgba(120, 53, 15, 0.3)',
    accent: '#F97316',
    glass: 'rgba(41, 37, 36, 0.85)',
  },
  ocean: {
    name: 'ocean',
    background: '#082F49',
    surface: '#0C4A6E',
    text: '#F0F9FF',
    textMuted: '#7DD3FC',
    border: '#075985',
    shadow: '0 15px 35px rgba(8, 47, 73, 0.6)',
    accent: '#38BDF8',
    glass: 'rgba(12, 74, 110, 0.8)',
  },
  forest: {
    name: 'forest',
    background: '#064E3B',
    surface: '#065F46',
    text: '#ECFDF5',
    textMuted: '#6EE7B7',
    border: '#047857',
    shadow: '0 15px 35px rgba(6, 78, 59, 0.6)',
    accent: '#10B981',
    glass: 'rgba(6, 95, 70, 0.8)',
  },
};

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

/** Ratio de contraste WCAG 2.1 entre dos luminancias. */
function contrastRatio(lumA: number, lumB: number): number {
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Texto claro u oscuro con buen contraste sobre un color sólido (botones, badges). */
export function josanzReadableOnSolid(background: string): string {
  const rgb = parseCssColorToRgb(background);
  if (!rgb) {
    return '#FFFFFF';
  }
  const Lbg = relativeLuminanceFromRgb(rgb);
  const Lwhite = 1;
  const Lblack = relativeLuminanceFromRgb([15, 23, 42]);
  const crWhite = contrastRatio(Lbg, Lwhite);
  const crBlack = contrastRatio(Lbg, Lblack);
  return crWhite >= crBlack ? '#FFFFFF' : '#0F172A';
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
  applyJosanzStructuralCssVariables(root);
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
}
