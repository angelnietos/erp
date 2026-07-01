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
  | 'emerald'
  | 'orbitron';

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
  fontMain?: string;
  fontDisplay?: string;
}

export interface JosanzAtmosphereCatalogEntry {
  name: JosanzAtmosphereName;
  label: string;
  description: string;
}

/** Orden y metadatos para el panel de personalización. */
export const JOSANZ_ATMOSPHERE_CATALOG: readonly JosanzAtmosphereCatalogEntry[] =
  [
    {
      name: 'neutral',
      label: 'Neutral White',
      description: 'Referencia Figma: lienzo claro y tarjetas blancas.',
    },
    {
      name: 'lavender',
      label: 'Lavanda Suave',
      description: 'Morado empolvado, calmado y luminoso.',
    },
    {
      name: 'sakura',
      label: 'Sakura',
      description: 'Rosa cerezo y crema, delicado y acogedor.',
    },
    {
      name: 'cafe',
      label: 'Café Cálido',
      description: 'Marrón tostado y vainilla, como una cafetería.',
    },
    {
      name: 'terracotta',
      label: 'Terracota',
      description: 'Arcilla y ámbar, cálido mediterráneo.',
    },
    {
      name: 'nintendo',
      label: 'Nintendo Red',
      description: 'Crema cálida con acentos rojos alegres.',
    },
    {
      name: 'emerald',
      label: 'Esmeralda',
      description: 'Verde bosque refinado, fresco y elegante.',
    },
    {
      name: 'ocean',
      label: 'Océano Sereno',
      description: 'Azul profundo con espuma clara, relajante.',
    },
    {
      name: 'forest',
      label: 'Bosque Musgo',
      description: 'Verdes apagados y sombra suave.',
    },
    {
      name: 'sunset',
      label: 'Atardecer',
      description: 'Ámbar, coral y noche temprana.',
    },
    {
      name: 'aurora',
      label: 'Aurora',
      description: 'Verde azulado y violeta, como luces del norte.',
    },
    {
      name: 'ubisoft',
      label: 'Azul Profundo',
      description: 'Azul nocturno cinematográfico, suave.',
    },
    {
      name: 'rayman',
      label: 'Magia Violeta',
      description: 'Índigo y oro, fantasía acogedora.',
    },
    {
      name: 'easports',
      label: 'Arena Digital',
      description: 'Pizarra y cian eléctrico, deportivo premium.',
    },
    {
      name: 'midnight',
      label: 'Medianoche',
      description: 'Gris azulado GitHub, foco nocturno.',
    },
    {
      name: 'stargazer',
      label: 'Cielo Estrellado',
      description: 'Índigo cosmos con destellos suaves.',
    },
    {
      name: 'orbitron',
      label: 'Orbitron',
      description: 'Interfaz sci-fi con tipografía Orbitron y acentos neón.',
    },
    {
      name: 'rosewood',
      label: 'Palo Rosa',
      description: 'Burdeos y rosa antiguo, íntimo.',
    },
    {
      name: 'rockstar',
      label: 'Oro Urbano',
      description: 'Carbón cálido y dorado tenue.',
    },
    {
      name: 'industrial',
      label: 'Grafito',
      description: 'Zinc cálido, estudio minimalista.',
    },
    {
      name: 'cyberpunk',
      label: 'Neón Lounge',
      description: 'Oscuro con neones suaves, no agresivo.',
    },
  ] as const;

export interface JosanzThemeConfig {
  name: JosanzThemeName;
  defaultShape: JosanzControlShape;
  primaryColor: string;
  atmosphere: JosanzAtmosphereConfig;
}

/** Registro único de atmósferas (servicio, Storybook y herramientas). */
export const JOSANZ_ATMOSPHERE_REGISTRY: Record<
  JosanzAtmosphereName,
  JosanzAtmosphereConfig
> = {
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
    background:
      'radial-gradient(circle at 15% 10%, #FFFFFF 0%, transparent 28%), linear-gradient(145deg, #F8F3FF 0%, #E9DDFF 46%, #D9C7FF 100%)',
    surface: '#FFFCFF',
    text: '#2E1065',
    textMuted: '#5B4B8A',
    border: '#D8B4FE',
    shadow: '0 18px 42px rgba(109, 40, 217, 0.16)',
    cardShadow: '0 18px 44px rgba(124, 58, 237, 0.2)',
    accent: '#7C3AED',
    glass: 'rgba(255, 252, 255, 0.82)',
    isDark: false,
    fieldFill: '#F6F0FF',
    surfaceMuted: '#F1E8FF',
    strokeField: '#CDB7F5',
  },
  sakura: {
    name: 'sakura',
    background:
      'radial-gradient(circle at 82% 12%, #FFFFFF 0%, transparent 30%), linear-gradient(160deg, #FFF8FA 0%, #FFE7EF 52%, #FFD3E2 100%)',
    surface: '#FFFBFD',
    text: '#4A102A',
    textMuted: '#8F4A63',
    border: '#F9A8D4',
    shadow: '0 18px 40px rgba(190, 24, 93, 0.13)',
    cardShadow: '0 18px 44px rgba(236, 72, 153, 0.16)',
    accent: '#DB2777',
    glass: 'rgba(255, 251, 253, 0.84)',
    isDark: false,
    fieldFill: '#FFF1F6',
    surfaceMuted: '#FFE4EE',
    strokeField: '#F3B6CC',
  },
  cafe: {
    name: 'cafe',
    background:
      'radial-gradient(circle at 8% 12%, #FFFDF8 0%, transparent 32%), linear-gradient(150deg, #FBF6EF 0%, #F0E3D3 50%, #E2D0BC 100%)',
    surface: '#FFFDF9',
    text: '#3A271A',
    textMuted: '#7C5F42',
    border: '#D7BFA6',
    shadow: '0 18px 40px rgba(92, 64, 39, 0.13)',
    cardShadow: '0 16px 38px rgba(146, 98, 57, 0.15)',
    accent: '#A16207',
    glass: 'rgba(255, 253, 249, 0.84)',
    isDark: false,
    fieldFill: '#F6EDE2',
    surfaceMuted: '#EFE2D1',
    strokeField: '#D6C0A8',
  },
  terracotta: {
    name: 'terracotta',
    background:
      'radial-gradient(circle at 88% 8%, #FFF7ED 0%, transparent 30%), linear-gradient(145deg, #FFF4E8 0%, #FFDCC4 48%, #F7B78D 100%)',
    surface: '#FFFDF9',
    text: '#431407',
    textMuted: '#8A4B2E',
    border: '#FDBA74',
    shadow: '0 18px 40px rgba(194, 65, 12, 0.14)',
    cardShadow: '0 18px 42px rgba(234, 88, 12, 0.18)',
    accent: '#EA580C',
    glass: 'rgba(255, 253, 249, 0.84)',
    isDark: false,
    fieldFill: '#FFF3E8',
    surfaceMuted: '#FFE7D1',
    strokeField: '#F4A261',
  },
  nintendo: {
    name: 'nintendo',
    background:
      'radial-gradient(circle at 18% 0%, #FFFFFF 0%, transparent 28%), linear-gradient(160deg, #FFF8F1 0%, #FFE3E3 48%, #FFB4B4 100%)',
    surface: '#FFFFFF',
    text: '#4A0B0B',
    textMuted: '#9B4040',
    border: '#FCA5A5',
    shadow: '0 18px 42px rgba(185, 28, 28, 0.16)',
    cardShadow: '0 18px 42px rgba(239, 68, 68, 0.22)',
    accent: '#DC2626',
    glass: 'rgba(255, 255, 255, 0.88)',
    isDark: false,
    fieldFill: '#FFF5F5',
    surfaceMuted: '#FFE8E8',
    strokeField: '#FECACA',
  },
  emerald: {
    name: 'emerald',
    background:
      'radial-gradient(circle at 85% 12%, #ECFDF5 0%, transparent 28%), linear-gradient(150deg, #DDFBEA 0%, #9EEEC8 45%, #5FD6A2 100%)',
    surface: '#FBFFFD',
    text: '#052E24',
    textMuted: '#166B53',
    border: '#6EE7B7',
    shadow: '0 18px 42px rgba(5, 150, 105, 0.16)',
    cardShadow: '0 18px 44px rgba(16, 185, 129, 0.22)',
    accent: '#059669',
    glass: 'rgba(251, 255, 253, 0.82)',
    isDark: false,
    fieldFill: '#F0FDF6',
    surfaceMuted: '#DDFBEA',
    strokeField: '#86EFAC',
  },
  ubisoft: {
    name: 'ubisoft',
    background:
      'radial-gradient(circle at 18% 12%, rgba(96, 165, 250, 0.28) 0%, transparent 28%), linear-gradient(155deg, #07111F 0%, #0D1B33 48%, #142B4D 100%)',
    surface: '#16243D',
    text: '#F3F8FF',
    textMuted: '#AFC4E8',
    border: '#31527F',
    shadow: '0 26px 60px rgba(2, 6, 23, 0.58)',
    cardShadow: '0 18px 48px rgba(59, 130, 246, 0.24)',
    accent: '#60A5FA',
    glass: 'rgba(22, 36, 61, 0.86)',
    isDark: true,
    fieldFill: '#0D1A2E',
    surfaceMuted: '#12223A',
    strokeField: '#3B5F91',
  },
  rayman: {
    name: 'rayman',
    background:
      'radial-gradient(circle at 78% 14%, rgba(251, 191, 36, 0.28) 0%, transparent 24%), linear-gradient(145deg, #171346 0%, #27206F 44%, #3C2EA8 100%)',
    surface: '#332A86',
    text: '#FBFCFF',
    textMuted: '#D9D7FF',
    border: '#6D63D9',
    shadow: '0 26px 58px rgba(17, 13, 64, 0.62)',
    cardShadow: '0 18px 46px rgba(251, 191, 36, 0.2)',
    accent: '#FBBF24',
    glass: 'rgba(51, 42, 134, 0.82)',
    isDark: true,
    fieldFill: '#241F66',
    surfaceMuted: '#2D2874',
    strokeField: '#756CE0',
  },
  easports: {
    name: 'easports',
    background:
      'radial-gradient(circle at 80% 8%, rgba(34, 211, 238, 0.22) 0%, transparent 26%), linear-gradient(160deg, #07111F 0%, #0D182B 50%, #101C33 100%)',
    surface: '#16243A',
    text: '#F4F9FF',
    textMuted: '#A4BCD9',
    border: '#31506E',
    shadow: '0 26px 58px rgba(0, 0, 0, 0.56)',
    cardShadow: '0 16px 44px rgba(56, 189, 248, 0.22)',
    accent: '#22D3EE',
    glass: 'rgba(22, 36, 58, 0.88)',
    isDark: true,
    fieldFill: '#0D1728',
    surfaceMuted: '#122038',
    strokeField: '#3A5A7B',
  },
  cyberpunk: {
    name: 'cyberpunk',
    background:
      'radial-gradient(circle at 15% 10%, rgba(236, 72, 153, 0.24) 0%, transparent 25%), radial-gradient(circle at 86% 80%, rgba(45, 212, 191, 0.16) 0%, transparent 28%), linear-gradient(155deg, #12081A 0%, #1A1027 48%, #0D1720 100%)',
    surface: '#21172D',
    text: '#F8F5FF',
    textMuted: '#D8B4FE',
    border: '#4C3764',
    shadow: '0 26px 58px rgba(0, 0, 0, 0.62)',
    cardShadow: '0 18px 48px rgba(167, 139, 250, 0.22)',
    accent: '#C084FC',
    glass: 'rgba(33, 23, 45, 0.9)',
    isDark: true,
    fieldFill: '#171020',
    surfaceMuted: '#21162E',
    strokeField: '#5B4172',
  },
  midnight: {
    name: 'midnight',
    background:
      'radial-gradient(circle at 70% 4%, rgba(88, 166, 255, 0.16) 0%, transparent 28%), linear-gradient(180deg, #090D13 0%, #111827 100%)',
    surface: '#1A2230',
    text: '#F4F8FF',
    textMuted: '#A8B3C3',
    border: '#344054',
    shadow: '0 24px 54px rgba(0, 0, 0, 0.58)',
    cardShadow: '0 16px 42px rgba(88, 166, 255, 0.16)',
    accent: '#60A5FA',
    glass: 'rgba(26, 34, 48, 0.9)',
    isDark: true,
    fieldFill: '#0D1118',
    surfaceMuted: '#151D2B',
    strokeField: '#3F4B60',
  },
  stargazer: {
    name: 'stargazer',
    background:
      'radial-gradient(circle at 22% 14%, rgba(129, 140, 248, 0.26) 0%, transparent 24%), radial-gradient(circle at 82% 72%, rgba(217, 70, 239, 0.12) 0%, transparent 30%), linear-gradient(160deg, #070B20 0%, #12183A 44%, #1B1240 100%)',
    surface: '#202A4F',
    text: '#F4F6FF',
    textMuted: '#B8C3F7',
    border: '#455188',
    shadow: '0 28px 62px rgba(8, 12, 40, 0.66)',
    cardShadow: '0 18px 46px rgba(129, 140, 248, 0.22)',
    accent: '#A5B4FC',
    glass: 'rgba(32, 42, 79, 0.86)',
    isDark: true,
    fieldFill: '#111733',
    surfaceMuted: '#182147',
    strokeField: '#4D5B94',
  },
  orbitron: {
    name: 'orbitron',
    background:
      'radial-gradient(circle at 16% 12%, rgba(34, 211, 238, 0.26) 0%, transparent 24%), radial-gradient(circle at 84% 18%, rgba(168, 85, 247, 0.22) 0%, transparent 28%), linear-gradient(150deg, #050816 0%, #0A1024 46%, #111827 100%)',
    surface: '#111A2E',
    text: '#F8FBFF',
    textMuted: '#A7F3D0',
    border: '#2DD4BF',
    shadow: '0 30px 70px rgba(0, 0, 0, 0.68)',
    cardShadow: '0 20px 54px rgba(34, 211, 238, 0.24)',
    accent: '#22D3EE',
    glass: 'rgba(17, 26, 46, 0.88)',
    isDark: true,
    fieldFill: '#0A1324',
    surfaceMuted: '#0F1A2D',
    strokeField: '#275E69',
    fontMain: "'Orbitron', 'DM Sans', sans-serif",
    fontDisplay: "'Orbitron', 'DM Sans', sans-serif",
  },
  rosewood: {
    name: 'rosewood',
    background:
      'radial-gradient(circle at 18% 12%, rgba(244, 114, 182, 0.18) 0%, transparent 25%), linear-gradient(150deg, #210D13 0%, #361522 50%, #26101B 100%)',
    surface: '#432130',
    text: '#FFF1F7',
    textMuted: '#F2B8CF',
    border: '#744154',
    shadow: '0 26px 58px rgba(0, 0, 0, 0.58)',
    cardShadow: '0 18px 46px rgba(244, 114, 182, 0.2)',
    accent: '#FB7185',
    glass: 'rgba(67, 33, 48, 0.88)',
    isDark: true,
    fieldFill: '#2B121B',
    surfaceMuted: '#371927',
    strokeField: '#7E4A5C',
  },
  rockstar: {
    name: 'rockstar',
    background:
      'radial-gradient(circle at 72% 10%, rgba(245, 158, 11, 0.18) 0%, transparent 24%), linear-gradient(160deg, #100E0B 0%, #1C1711 50%, #0F0D0A 100%)',
    surface: '#29231C',
    text: '#FFF2D6',
    textMuted: '#D6C2A2',
    border: '#514535',
    shadow: '0 28px 60px rgba(0, 0, 0, 0.62)',
    cardShadow: '0 18px 44px rgba(217, 180, 90, 0.16)',
    accent: '#F59E0B',
    glass: 'rgba(41, 35, 28, 0.92)',
    isDark: true,
    fieldFill: '#17130F',
    surfaceMuted: '#211B15',
    strokeField: '#5D503C',
  },
  industrial: {
    name: 'industrial',
    background:
      'radial-gradient(circle at 18% 0%, rgba(212, 212, 216, 0.12) 0%, transparent 28%), linear-gradient(180deg, #121214 0%, #232327 100%)',
    surface: '#303036',
    text: '#FAFAFA',
    textMuted: '#B9B9C0',
    border: '#4B4B55',
    shadow: '0 22px 48px rgba(0, 0, 0, 0.5)',
    cardShadow: '0 14px 34px rgba(0, 0, 0, 0.38)',
    accent: '#E4E4E7',
    glass: 'rgba(48, 48, 54, 0.9)',
    isDark: true,
    fieldFill: '#1C1C20',
    surfaceMuted: '#28282E',
    strokeField: '#5B5B66',
  },
  sunset: {
    name: 'sunset',
    background:
      'radial-gradient(circle at 22% 10%, rgba(251, 146, 60, 0.24) 0%, transparent 26%), radial-gradient(circle at 85% 72%, rgba(244, 63, 94, 0.18) 0%, transparent 30%), linear-gradient(150deg, #331106 0%, #7C2D12 42%, #3A0A1A 100%)',
    surface: '#5F2517',
    text: '#FFF7ED',
    textMuted: '#FED7AA',
    border: '#D97706',
    shadow: '0 28px 60px rgba(67, 20, 7, 0.6)',
    cardShadow: '0 18px 48px rgba(251, 146, 60, 0.26)',
    accent: '#FB923C',
    glass: 'rgba(95, 37, 23, 0.86)',
    isDark: true,
    fieldFill: '#2A140E',
    surfaceMuted: '#3B1B13',
    strokeField: '#8A4A2D',
  },
  ocean: {
    name: 'ocean',
    background:
      'radial-gradient(circle at 20% 12%, rgba(125, 211, 252, 0.22) 0%, transparent 26%), linear-gradient(160deg, #06283D 0%, #0B4568 42%, #075985 100%)',
    surface: '#0D4A66',
    text: '#F0FAFF',
    textMuted: '#C7ECFF',
    border: '#38BDF8',
    shadow: '0 26px 58px rgba(3, 105, 161, 0.48)',
    cardShadow: '0 18px 48px rgba(56, 189, 248, 0.28)',
    accent: '#38BDF8',
    glass: 'rgba(13, 74, 102, 0.84)',
    isDark: true,
    fieldFill: '#08263A',
    surfaceMuted: '#0B3551',
    strokeField: '#2D759A',
  },
  forest: {
    name: 'forest',
    background:
      'radial-gradient(circle at 78% 8%, rgba(134, 239, 172, 0.18) 0%, transparent 26%), linear-gradient(155deg, #041F13 0%, #0B3B25 46%, #14532D 100%)',
    surface: '#123F2C',
    text: '#F0FDF4',
    textMuted: '#BDECCF',
    border: '#2F7A51',
    shadow: '0 26px 56px rgba(5, 46, 22, 0.58)',
    cardShadow: '0 18px 44px rgba(74, 222, 128, 0.18)',
    accent: '#86EFAC',
    glass: 'rgba(18, 63, 44, 0.86)',
    isDark: true,
    fieldFill: '#0A2519',
    surfaceMuted: '#0F3323',
    strokeField: '#3A8460',
  },
  aurora: {
    name: 'aurora',
    background:
      'radial-gradient(circle at 18% 12%, rgba(45, 212, 191, 0.26) 0%, transparent 25%), radial-gradient(circle at 82% 76%, rgba(167, 139, 250, 0.2) 0%, transparent 30%), linear-gradient(135deg, #08111F 0%, #0E3C3B 36%, #3B1A78 72%, #0B5F73 100%)',
    surface: '#1A3142',
    text: '#F0FDFA',
    textMuted: '#B6F2EA',
    border: '#2DD4BF',
    shadow: '0 28px 62px rgba(15, 23, 42, 0.62)',
    cardShadow: '0 18px 48px rgba(45, 212, 191, 0.25)',
    accent: '#5EEAD4',
    glass: 'rgba(26, 49, 66, 0.86)',
    isDark: true,
    fieldFill: '#0D2430',
    surfaceMuted: '#143244',
    strokeField: '#3B7488',
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
  const rgbComma = s.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i,
  );
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

function contrastRatioFromRgb(
  a: [number, number, number],
  b: [number, number, number],
): number {
  const l1 = relativeLuminanceFromRgb(a);
  const l2 = relativeLuminanceFromRgb(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function contrastRatio(foreground: string, background: string): number | null {
  const fg = parseCssColorToRgb(foreground);
  const bg = parseCssColorToRgb(background);
  if (!fg || !bg) {
    return null;
  }
  return contrastRatioFromRgb(fg, bg);
}

function ensureContrast(
  color: string,
  background: string,
  fallback: string,
  minimumRatio: number,
): string {
  const ratio = contrastRatio(color, background);
  if (ratio !== null && ratio >= minimumRatio) {
    return color;
  }
  return fallback;
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
  const dark: [number, number, number] = [15, 23, 42];
  const light: [number, number, number] = [255, 255, 255];
  return contrastRatioFromRgb(dark, rgb) >= contrastRatioFromRgb(light, rgb)
    ? '#0F172A'
    : '#FFFFFF';
}

/**
 * Tokens derivados del color de marca, mezclados con la atmósfera activa
 * (chips, navegación, focos, hovers de tarjetas, etc.).
 */
export function applyJosanzBrandCssVariables(
  root: HTMLElement,
  primaryColor: string,
  atmosphere: JosanzAtmosphereConfig,
  isDark: boolean,
): void {
  const surface = atmosphere.surface;
  const softStrength = isDark ? 26 : atmosphere.name === 'neutral' ? 12 : 18;
  const softBg = `color-mix(in srgb, ${primaryColor} ${softStrength}%, ${surface})`;
  const brandRgb = parseCssColorToRgb(primaryColor);
  const brandLum = brandRgb ? relativeLuminanceFromRgb(brandRgb) : 0;
  const isNeutral = atmosphere.name === 'neutral';
  /** En lienzo oscuro, marcas muy oscuras pierden contraste: aclaramos el texto activo. */
  const pillText =
    isDark && brandLum < 0.22
      ? `color-mix(in srgb, ${primaryColor} 55%, white)`
      : primaryColor;

  root.style.setProperty(
    '--josanz-primary-hover',
    isDark
      ? `color-mix(in srgb, ${primaryColor} 78%, white)`
      : `color-mix(in srgb, ${primaryColor} 80%, black)`,
  );
  if (isNeutral) {
    root.style.setProperty('--josanz-pill-active-bg', JOSANZ_FIGMA_SHELL.pillActiveBg);
    root.style.setProperty('--josanz-pill-active-text', JOSANZ_FIGMA_SHELL.pillActiveText);
    root.style.setProperty(
      '--josanz-pill-active-border',
      'rgba(8, 8, 8, 0.2)',
    );
  } else {
    root.style.setProperty('--josanz-pill-active-bg', softBg);
    root.style.setProperty('--josanz-pill-active-text', pillText);
    root.style.setProperty(
      '--josanz-pill-active-border',
      `color-mix(in srgb, ${primaryColor} 42%, transparent)`,
    );
  }
  root.style.setProperty('--josanz-nav-active-indicator', primaryColor);
  root.style.setProperty('--josanz-nav-hover', primaryColor);
  root.style.setProperty('--josanz-interactive', primaryColor);
  root.style.setProperty('--josanz-accent', primaryColor);
  root.style.setProperty('--btn-color', primaryColor);
  root.style.setProperty(
    '--josanz-button-primary-bg',
    isNeutral ? '#0F1E2F' : primaryColor,
  );
  root.style.setProperty(
    '--josanz-button-primary-hover-bg',
    isNeutral
      ? '#17283D'
      : isDark
        ? `color-mix(in srgb, ${primaryColor} 78%, white)`
        : `color-mix(in srgb, ${primaryColor} 82%, black)`,
  );
  root.style.setProperty(
    '--josanz-button-primary-text',
    josanzReadableOnSolid(isNeutral ? '#0F1E2F' : primaryColor),
  );
  root.style.setProperty(
    '--josanz-button-secondary-bg',
    isNeutral
      ? '#FFFFFF'
      : `color-mix(in srgb, ${primaryColor} ${isDark ? 14 : 8}%, ${surface})`,
  );
  root.style.setProperty(
    '--josanz-button-secondary-border',
    isNeutral
      ? '#0F1E2F'
      : `color-mix(in srgb, ${primaryColor} 48%, ${atmosphere.border})`,
  );
  root.style.setProperty(
    '--josanz-button-secondary-text',
    isNeutral ? '#0F1E2F' : pillText,
  );
  root.style.setProperty(
    '--josanz-button-ghost-text',
    isNeutral ? '#0F1E2F' : atmosphere.text,
  );
  root.style.setProperty('--josanz-button-disabled-bg', '#DADFE6');
  root.style.setProperty('--josanz-button-disabled-border', '#DADFE6');
  root.style.setProperty('--josanz-button-disabled-text', '#FFFFFF');
  root.style.setProperty(
    '--josanz-button-shadow',
    isNeutral
      ? '0 2px 8px rgba(231, 237, 241, 0.9)'
      : `0 12px 26px color-mix(in srgb, ${primaryColor} 26%, transparent)`,
  );
  root.style.setProperty(
    '--josanz-sidebar-bg',
    isNeutral ? '#FFFFFF' : (atmosphere.glass ?? atmosphere.surface),
  );
  root.style.setProperty('--josanz-sidebar-width', '36px');
  root.style.setProperty('--josanz-sidebar-expanded-width', '132px');
  root.style.setProperty(
    '--josanz-sidebar-border',
    isNeutral ? '#e7edf1' : atmosphere.border,
  );
  root.style.setProperty(
    '--josanz-sidebar-shadow',
    isNeutral
      ? '4px 0 16px rgba(189, 189, 189, 0.28)'
      : `4px 0 18px color-mix(in srgb, ${primaryColor} 12%, rgba(0, 0, 0, 0.28))`,
  );
  root.style.setProperty(
    '--josanz-sidebar-icon',
    isNeutral ? '#222222' : atmosphere.textMuted,
  );
  root.style.setProperty(
    '--josanz-sidebar-icon-active',
    isNeutral ? '#222222' : primaryColor,
  );
  root.style.setProperty(
    '--josanz-sidebar-hover-bg',
    isNeutral
      ? 'transparent'
      : `color-mix(in srgb, ${primaryColor} ${isDark ? 16 : 10}%, transparent)`,
  );
  root.style.setProperty(
    '--josanz-focus-ring',
    `color-mix(in srgb, ${primaryColor} 22%, transparent)`,
  );
  root.style.setProperty(
    '--josanz-card-hover-glow',
    `color-mix(in srgb, ${primaryColor} 28%, transparent)`,
  );
  root.style.setProperty(
    '--josanz-primary-soft',
    `color-mix(in srgb, ${primaryColor} ${isDark ? 14 : 10}%, ${surface})`,
  );
  root.style.setProperty('--josanz-brand-soft', softBg);
  root.style.setProperty(
    '--josanz-brand-soft-strong',
    `color-mix(in srgb, ${primaryColor} ${isDark ? 32 : 20}%, ${surface})`,
  );
  root.style.setProperty(
    '--josanz-brand-muted',
    isNeutral
      ? '#7C7C7C'
      : `color-mix(in srgb, ${primaryColor} 68%, ${isDark ? '#C5D4E8' : '#64748B'})`,
  );
  root.style.setProperty(
    '--josanz-brand-border',
    isNeutral
      ? atmosphere.border
      : `color-mix(in srgb, ${primaryColor} 40%, ${atmosphere.border})`,
  );
  root.style.setProperty(
    '--josanz-segmented-track-bg',
    isNeutral
      ? '#F7F7F7'
      : `color-mix(in srgb, ${primaryColor} ${isDark ? 14 : 10}%, ${atmosphere.surfaceMuted ?? surface})`,
  );
  root.style.setProperty(
    '--josanz-segmented-active-bg',
    isNeutral ? '#FFFFFF' : softBg,
  );
  root.style.setProperty(
    '--josanz-segmented-active-text',
    isNeutral ? '#222222' : pillText,
  );
  root.style.setProperty(
    '--josanz-segmented-idle-text',
    isNeutral
      ? '#8D8D8D'
      : `color-mix(in srgb, ${primaryColor} 38%, ${atmosphere.textMuted})`,
  );
  root.style.setProperty(
    '--josanz-thead-text',
    isNeutral
      ? '#7C7C7C'
      : `color-mix(in srgb, ${primaryColor} 58%, ${atmosphere.textMuted})`,
  );
  root.style.setProperty('--josanz-link', isNeutral ? '#0F1E2F' : primaryColor);
  root.style.setProperty(
    '--josanz-sidebar-active-bg',
    isNeutral
      ? 'transparent'
      : `color-mix(in srgb, ${primaryColor} ${isDark ? 20 : 14}%, ${surface})`,
  );
  root.style.setProperty(
    '--josanz-list-card-border-brand',
    isNeutral
      ? '#EBEBEB'
      : `color-mix(in srgb, ${primaryColor} 28%, ${atmosphere.border})`,
  );
  root.style.setProperty(
    '--josanz-section-border-brand',
    isNeutral
      ? atmosphere.border
      : `color-mix(in srgb, ${primaryColor} 22%, ${atmosphere.border})`,
  );
}

/** Infiera si la atmósfera es oscura a partir del fondo (sólido o gradiente). */
export function josanzAtmosphereIsDark(
  atmosphere: JosanzAtmosphereConfig,
): boolean {
  if (atmosphere.isDark !== undefined) {
    return atmosphere.isDark;
  }
  const sample =
    atmosphere.background.match(/#[\da-f]{3,8}/i)?.[0] ?? atmosphere.background;
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
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  const erpShell = root.getAttribute('data-erp-ui-shell');
  /** ERP multi-tenant: solo pintar Figma en tenant Alexis. `josanz-web-app` no marca el atributo. */
  if (erpShell !== null && erpShell !== 'josanz-figma') {
    return;
  }
  const { atmosphere, primaryColor, themeName } = params;
  const isDark = josanzAtmosphereIsDark(atmosphere);
  const effectiveText = ensureContrast(
    atmosphere.text,
    atmosphere.surface,
    isDark ? '#F8FAFC' : '#111827',
    7,
  );
  const effectiveTextMuted = ensureContrast(
    atmosphere.textMuted,
    atmosphere.surface,
    isDark ? '#D8E3F0' : '#475569',
    4.5,
  );
  const effectiveBorder = ensureContrast(
    atmosphere.border,
    atmosphere.surface,
    isDark ? '#4B647D' : '#CBD5E1',
    1.45,
  );
  const effectiveAtmosphere: JosanzAtmosphereConfig = {
    ...atmosphere,
    text: effectiveText,
    textMuted: effectiveTextMuted,
    border: effectiveBorder,
  };

  root.style.setProperty('--josanz-primary', primaryColor);
  root.style.setProperty(
    '--josanz-on-primary',
    josanzReadableOnSolid(primaryColor),
  );
  root.style.setProperty(
    '--josanz-on-danger',
    josanzReadableOnSolid('#EF4444'),
  );
  root.style.setProperty('--josanz-bg', atmosphere.background);
  root.style.setProperty('--josanz-surface', atmosphere.surface);
  root.style.setProperty('--josanz-text', effectiveText);
  root.style.setProperty('--josanz-text-muted', effectiveTextMuted);
  root.style.setProperty('--josanz-border', effectiveBorder);
  root.style.setProperty('--josanz-shadow', atmosphere.shadow);
  root.style.setProperty('--josanz-glass', atmosphere.glass ?? 'transparent');
  root.style.setProperty(
    '--font-main',
    atmosphere.fontMain ?? "'Nunito', sans-serif",
  );
  root.style.setProperty(
    '--font-display',
    atmosphere.fontDisplay ?? "'DM Sans', sans-serif",
  );
  root.style.setProperty(
    '--josanz-font-main',
    atmosphere.fontMain ?? "'Nunito', sans-serif",
  );
  root.style.setProperty(
    '--josanz-font-display',
    atmosphere.fontDisplay ?? "'DM Sans', sans-serif",
  );
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
  document.body.style.color = effectiveText;

  applyJosanzStructuralCssVariables(root);
  applyJosanzBrandCssVariables(root, primaryColor, effectiveAtmosphere, isDark);
  applyJosanzListCardTokens(root, effectiveAtmosphere, isDark);
  applyJosanzFormTokens(root, effectiveAtmosphere, isDark);

  if (atmosphere.surfaceMuted) {
    root.style.setProperty('--josanz-surface-muted', atmosphere.surfaceMuted);
    root.style.setProperty(
      '--josanz-header-filter-bg',
      atmosphere.surfaceMuted,
    );
  }
  if (atmosphere.strokeField) {
    root.style.setProperty('--josanz-stroke-field', atmosphere.strokeField);
    root.style.setProperty('--josanz-stroke-widget', atmosphere.strokeField);
  }
  if (isDark) {
    root.style.setProperty('--josanz-text-heading', effectiveText);
    root.style.setProperty('--josanz-label-muted', effectiveTextMuted);
    root.style.setProperty('--josanz-row-line', effectiveBorder);
  } else if (atmosphere.name === 'neutral') {
    applyJosanzFigmaNeutralStructuralOverrides(root);
  } else {
    root.style.setProperty('--josanz-text-heading', effectiveText);
    root.style.setProperty('--josanz-label-muted', effectiveTextMuted);
    root.style.setProperty('--josanz-row-line', effectiveBorder);
    root.style.setProperty(
      '--josanz-header-filter-bg',
      atmosphere.surfaceMuted ?? `color-mix(in srgb, ${atmosphere.surface} 88%, ${effectiveText} 4%)`,
    );
  }
}

/**
 * Tokens de filas/tarjetas de listado: superficie y texto acordes a la atmósfera.
 */
export function applyJosanzListCardTokens(
  root: HTMLElement,
  atmosphere: JosanzAtmosphereConfig,
  isDark: boolean,
): void {
  if (atmosphere.name === 'neutral') {
    root.style.setProperty('--josanz-list-card-bg', '#FFFFFF');
    root.style.setProperty('--josanz-list-card-text', '#222222');
    root.style.setProperty('--josanz-list-card-text-muted', '#7C7C7C');
    root.style.setProperty('--josanz-list-card-border', '#EBEBEB');
    root.style.setProperty('--josanz-list-card-shadow', JOSANZ_FIGMA_SHELL.cardShadow);
    return;
  }

  const cardBg = atmosphere.surface;
  const cardText = ensureContrast(
    atmosphere.text,
    cardBg,
    isDark ? '#F8FAFC' : '#111827',
    7,
  );
  const cardTextMuted = ensureContrast(
    atmosphere.textMuted,
    cardBg,
    isDark ? '#C5D4E8' : '#475569',
    4.5,
  );
  const cardBorder = ensureContrast(
    atmosphere.border,
    cardBg,
    isDark ? '#4B647D' : '#E2E8F0',
    1.45,
  );

  root.style.setProperty('--josanz-list-card-bg', cardBg);
  root.style.setProperty('--josanz-list-card-text', cardText);
  root.style.setProperty('--josanz-list-card-text-muted', cardTextMuted);
  root.style.setProperty('--josanz-list-card-border', cardBorder);
  root.style.setProperty(
    '--josanz-list-card-shadow',
    atmosphere.cardShadow ?? atmosphere.shadow,
  );
}

/**
 * Campos de formulario y paneles anidados (operadores, venues, etc.).
 */
export function applyJosanzFormTokens(
  root: HTMLElement,
  atmosphere: JosanzAtmosphereConfig,
  isDark: boolean,
): void {
  const fieldBg =
    atmosphere.fieldFill ?? (isDark ? '#0f172a' : JOSANZ_FIGMA_LOGIN.fieldIdleFill);
  const fieldText = ensureContrast(
    atmosphere.text,
    fieldBg,
    isDark ? '#F8FAFC' : '#111827',
    7,
  );
  const fieldTextMuted = ensureContrast(
    atmosphere.textMuted,
    fieldBg,
    isDark ? '#B8C9DE' : '#64748B',
    4.5,
  );

  root.style.setProperty('--josanz-field-fill', fieldBg);
  root.style.setProperty('--josanz-login-field-bg', fieldBg);
  root.style.setProperty('--josanz-field-text', fieldText);
  root.style.setProperty('--josanz-field-text-muted', fieldTextMuted);

  if (atmosphere.name === 'neutral') {
    root.style.setProperty('--josanz-form-panel-bg', '#F7F7F7');
    root.style.setProperty('--josanz-form-panel-border', '#EBEBEB');
    return;
  }

  const panelBg = atmosphere.surfaceMuted ?? atmosphere.surface;
  const panelBorder = ensureContrast(
    atmosphere.border,
    panelBg,
    isDark ? '#4B647D' : '#E2E8F0',
    1.45,
  );
  root.style.setProperty('--josanz-form-panel-bg', panelBg);
  root.style.setProperty('--josanz-form-panel-border', panelBorder);
}

/** Tokens estructurales fijos del frame Figma (modo neutro). */
function applyJosanzFigmaNeutralStructuralOverrides(root: HTMLElement): void {
  root.style.setProperty(
    '--josanz-stroke-widget',
    JOSANZ_FIGMA_DASHBOARD.widgetStroke,
  );
  root.style.setProperty(
    '--josanz-stroke-field',
    JOSANZ_FIGMA_LOGIN.fieldStroke,
  );
  root.style.setProperty('--josanz-row-line', JOSANZ_FIGMA_DASHBOARD.rowLine);
  root.style.setProperty(
    '--josanz-surface-muted',
    JOSANZ_FIGMA_DASHBOARD.surfaceMuted,
  );
  root.style.setProperty(
    '--josanz-header-filter-bg',
    JOSANZ_FIGMA_DASHBOARD.headerFilterBg,
  );
  root.style.setProperty(
    '--josanz-field-fill',
    JOSANZ_FIGMA_LOGIN.fieldIdleFill,
  );
  root.style.setProperty('--josanz-text-heading', JOSANZ_FIGMA_LOGIN.heading);
  root.style.setProperty('--josanz-label-muted', JOSANZ_FIGMA_LOGIN.muted);
  root.style.setProperty(
    '--josanz-kpi-positive',
    JOSANZ_FIGMA_DASHBOARD.kpiPositive,
  );
  root.style.setProperty(
    '--josanz-dashboard-toolbar-cta',
    JOSANZ_FIGMA_DASHBOARD.toolbarCta,
  );
  root.style.setProperty(
    '--josanz-dashboard-on-toolbar-cta',
    JOSANZ_FIGMA_DASHBOARD.onToolbarCta,
  );
  root.style.setProperty(
    '--josanz-dashboard-kpi-min-h',
    `${JOSANZ_FIGMA_DASHBOARD.kpiCardH}px`,
  );
  root.style.setProperty(
    '--josanz-elev-soft',
    '0px 4px 8px rgba(178, 178, 178, 0.28)',
  );
  root.style.setProperty('--josanz-shadow-sm', '0 2px 4px rgba(0, 0, 0, 0.08)');
  root.style.setProperty(
    '--josanz-footer-elev',
    '0 -10px 30px rgba(0, 0, 0, 0.08)',
  );
  root.style.setProperty(
    '--josanz-radius-control',
    `${JOSANZ_FIGMA_LOGIN.fieldRadiusPx}px`,
  );
  root.style.setProperty(
    '--josanz-radius-widget',
    `${JOSANZ_FIGMA_DASHBOARD.widgetRadiusPx}px`,
  );
  root.style.setProperty('--josanz-radius-card', '12px');
  root.style.setProperty(
    '--josanz-secondary-fill',
    JOSANZ_FIGMA_APP.secondaryFill,
  );
}

function applyJosanzStatusPillCssVariables(
  root: HTMLElement,
  isDark: boolean,
): void {
  const palette = isDark
    ? JOSANZ_FIGMA_STATUS_PILLS_DARK
    : JOSANZ_FIGMA_STATUS_PILLS;
  (Object.keys(palette) as JosanzStatusPillKey[]).forEach((key) => {
    const { bg, text } = palette[key];
    root.style.setProperty(`--josanz-pill-${key}-bg`, bg);
    root.style.setProperty(`--josanz-pill-${key}-text`, text);
  });
}

/** Tokens de layout Figma (trazos, radios, superficies) + semántica; respeta `data-theme="dark"`. */
export function applyJosanzStructuralCssVariables(
  root: HTMLElement = document.documentElement,
): void {
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
    root.style.setProperty(
      '--josanz-elev-soft',
      '0px 4px 8px rgba(0,0,0,0.35)',
    );
    root.style.setProperty('--josanz-shadow-sm', '0 2px 4px rgba(0,0,0,0.25)');
  } else {
    root.style.setProperty(
      '--josanz-status-pill-muted-bg',
      JOSANZ_FIGMA_LOGIN.primaryCta,
    );
    root.style.setProperty(
      '--josanz-status-pill-muted-text',
      JOSANZ_FIGMA_LOGIN.onPrimaryCta,
    );
    root.style.setProperty(
      '--josanz-stroke-widget',
      JOSANZ_FIGMA_DASHBOARD.widgetStroke,
    );
    root.style.setProperty(
      '--josanz-stroke-field',
      JOSANZ_FIGMA_LOGIN.fieldStroke,
    );
    root.style.setProperty('--josanz-row-line', JOSANZ_FIGMA_DASHBOARD.rowLine);
    root.style.setProperty(
      '--josanz-surface-muted',
      JOSANZ_FIGMA_DASHBOARD.surfaceMuted,
    );
    root.style.setProperty(
      '--josanz-header-filter-bg',
      JOSANZ_FIGMA_DASHBOARD.headerFilterBg,
    );
    root.style.setProperty(
      '--josanz-field-fill',
      JOSANZ_FIGMA_LOGIN.fieldIdleFill,
    );
    root.style.setProperty('--josanz-text-heading', JOSANZ_FIGMA_LOGIN.heading);
    root.style.setProperty('--josanz-label-muted', JOSANZ_FIGMA_LOGIN.muted);
    root.style.setProperty(
      '--josanz-kpi-positive',
      JOSANZ_FIGMA_DASHBOARD.kpiPositive,
    );
    root.style.setProperty(
      '--josanz-elev-soft',
      '0px 4px 8px rgba(178,178,178,0.28)',
    );
    root.style.setProperty('--josanz-shadow-sm', '0 2px 4px rgba(0,0,0,0.1)');
  }
  root.style.setProperty(
    '--josanz-radius-control',
    `${JOSANZ_FIGMA_LOGIN.fieldRadiusPx}px`,
  );
  root.style.setProperty(
    '--josanz-radius-widget',
    `${JOSANZ_FIGMA_DASHBOARD.widgetRadiusPx}px`,
  );
  root.style.setProperty('--josanz-radius-card', '12px');
  root.style.setProperty(
    '--josanz-secondary-fill',
    JOSANZ_FIGMA_APP.secondaryFill,
  );
  root.style.setProperty('--josanz-success', JOSANZ_FIGMA_SEMANTIC.success);
  root.style.setProperty('--josanz-warning', JOSANZ_FIGMA_SEMANTIC.warning);
  root.style.setProperty(
    '--josanz-badge-neutral',
    JOSANZ_FIGMA_SEMANTIC.badgeNeutral,
  );
  root.style.setProperty('--josanz-field-accent', 'var(--josanz-primary)');
  root.style.setProperty('--josanz-content-max', '1440px');
  root.style.setProperty('--josanz-sidebar-width', '36px');
  root.style.setProperty('--josanz-sidebar-expanded-width', '132px');
  root.style.setProperty('--josanz-shell-pad-x', '1.5rem');
  root.style.setProperty(
    '--josanz-shell-pad-x-md',
    `${JOSANZ_FIGMA_DASHBOARD.pagePadPx}px`,
  );
  root.style.setProperty('--josanz-shell-pad-y', '1.5rem');
  root.style.setProperty('--josanz-shell-pad-y-md', '2.5rem');
  root.style.setProperty(
    '--josanz-shell-footer-safe',
    'max(1.5rem, env(safe-area-inset-bottom, 0px))',
  );
  root.style.setProperty('--josanz-shell-mobile-tab-clearance', '133px');
  /** Listas (Dashboard.svg): gutter rejilla 32px; más aire interior en filas tipo card. */
  root.style.setProperty(
    '--josanz-list-stack-gap',
    `${JOSANZ_FIGMA_DASHBOARD.gridGapPx}px`,
  );
  root.style.setProperty('--josanz-list-card-pad-x', '1.25rem');
  root.style.setProperty('--josanz-list-card-pad-x-md', '2rem');
  root.style.setProperty('--josanz-list-card-pad-y', '1.25rem');
  root.style.setProperty('--josanz-list-card-pad-y-md', '1.5rem');
  if (isDark) {
    root.style.setProperty(
      '--josanz-footer-elev',
      '0 -10px 30px rgba(0,0,0,0.45)',
    );
  } else {
    root.style.setProperty(
      '--josanz-footer-elev',
      '0 -10px 30px rgba(0,0,0,0.1)',
    );
  }

  applyJosanzStatusPillCssVariables(root, isDark);
}
