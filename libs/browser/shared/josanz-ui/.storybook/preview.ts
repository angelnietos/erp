import { storybookRouterDecorator } from './storybook-providers';
import { JOSANZ_FIGMA_APP, JOSANZ_FIGMA_DASHBOARD, JOSANZ_FIGMA_LOGIN, JOSANZ_FIGMA_SEMANTIC, JOSANZ_FIGMA_SHELL } from '../src/lib/theme/josanz-figma-tokens';
import {
  JOSANZ_ATMOSPHERE_REGISTRY,
  JOSANZ_DEFAULT_PRIMARY,
  applyJosanzStructuralCssVariables,
  applyJosanzThemeCssVariables,
  type JosanzAtmosphereName,
} from '../src/lib/theme/josanz-theme-tokens';

// ─── Google Fonts ────────────────────────────────────────────────────────────
const googleFonts = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800&display=swap');`;

// ─── Design Tokens (CSS custom properties) ──────────────────────────────────
// Light theme (default :root) + dark theme (data-theme="dark")
const designTokens = `
:root, [data-theme="light"] {
  --josanz-bg: ${JOSANZ_FIGMA_SHELL.canvasBg};
  --josanz-surface: #ffffff;
  --josanz-text: #0f172a;
  --josanz-text-muted: #64748b;
  --josanz-border: ${JOSANZ_FIGMA_SHELL.hairlineBorder};
  --josanz-primary: ${JOSANZ_DEFAULT_PRIMARY};
  --josanz-on-primary: #ffffff;
  --josanz-primary-hover: #1a2d44;
  --josanz-accent: #3b82f6;
  --josanz-danger: #ef4444;
  --josanz-danger-hover: #dc2626;
  --josanz-shadow: 0 10px 15px -3px rgba(0,0,0,0.07);
  --josanz-on-danger: #ffffff;
  --josanz-stroke-widget: ${JOSANZ_FIGMA_DASHBOARD.widgetStroke};
  --josanz-stroke-field: ${JOSANZ_FIGMA_LOGIN.fieldStroke};
  --josanz-row-line: ${JOSANZ_FIGMA_DASHBOARD.rowLine};
  --josanz-surface-muted: ${JOSANZ_FIGMA_DASHBOARD.surfaceMuted};
  --josanz-header-filter-bg: ${JOSANZ_FIGMA_DASHBOARD.headerFilterBg};
  --josanz-field-fill: ${JOSANZ_FIGMA_LOGIN.fieldIdleFill};
  --josanz-text-heading: ${JOSANZ_FIGMA_LOGIN.heading};
  --josanz-label-muted: ${JOSANZ_FIGMA_LOGIN.muted};
  --josanz-kpi-positive: ${JOSANZ_FIGMA_DASHBOARD.kpiPositive};
  --josanz-elev-soft: 0px 4px 8px rgba(178,178,178,0.28);
  --josanz-shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
  --josanz-radius-control: ${JOSANZ_FIGMA_LOGIN.fieldRadiusPx}px;
  --josanz-radius-widget: ${JOSANZ_FIGMA_DASHBOARD.widgetRadiusPx}px;
  --josanz-radius-card: 12px;
  --josanz-secondary-fill: ${JOSANZ_FIGMA_APP.secondaryFill};
  --josanz-success: ${JOSANZ_FIGMA_SEMANTIC.success};
  --josanz-warning: ${JOSANZ_FIGMA_SEMANTIC.warning};
  --josanz-badge-neutral: ${JOSANZ_FIGMA_SEMANTIC.badgeNeutral};
  --josanz-field-accent: var(--josanz-primary);
  --josanz-content-max: 1280px;
  --josanz-sidebar-width: 68px;
  --josanz-shell-pad-x: 1.25rem;
  --josanz-shell-pad-x-md: ${JOSANZ_FIGMA_DASHBOARD.pagePadPx}px;
  --josanz-shell-pad-y: 1.5rem;
  --josanz-shell-pad-y-md: 2.5rem;
  --josanz-shell-footer-safe: max(1.5rem, env(safe-area-inset-bottom, 0px));
  --josanz-shell-mobile-tab-clearance: 133px;
  --josanz-footer-elev: 0 -10px 30px rgba(0,0,0,0.1);
  /* legacy compat */
  --bg-primary: #ffffff;
  --bg-secondary: #f1f5f9;
  --surface: #ffffff;
  --brand: ${JOSANZ_DEFAULT_PRIMARY};
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --border-soft: #e2e8f0;
  --font-main: 'Nunito', sans-serif;
  --font-display: 'DM Sans', sans-serif;
}

[data-theme="dark"] {
  --josanz-bg: #0f172a;
  --josanz-surface: #1e293b;
  --josanz-text: #f8fafc;
  --josanz-text-muted: #94a3b8;
  --josanz-border: #334155;
  --josanz-primary: #818cf8;
  --josanz-on-primary: #0f172a;
  --josanz-primary-hover: #6366f1;
  --josanz-accent: #60a5fa;
  --josanz-danger: #f87171;
  --josanz-danger-hover: #ef4444;
  --josanz-shadow: 0 10px 15px -3px rgba(0,0,0,0.4);
  --josanz-on-danger: #0f172a;
  --josanz-stroke-widget: #334155;
  --josanz-stroke-field: #475569;
  --josanz-row-line: #334155;
  --josanz-surface-muted: #1e293b;
  --josanz-header-filter-bg: #1e293b;
  --josanz-field-fill: #0f172a;
  --josanz-text-heading: #f8fafc;
  --josanz-label-muted: #94a3b8;
  --josanz-kpi-positive: #4ade80;
  --josanz-elev-soft: 0px 4px 8px rgba(0,0,0,0.35);
  --josanz-shadow-sm: 0 2px 4px rgba(0,0,0,0.25);
  --josanz-radius-control: ${JOSANZ_FIGMA_LOGIN.fieldRadiusPx}px;
  --josanz-radius-widget: ${JOSANZ_FIGMA_DASHBOARD.widgetRadiusPx}px;
  --josanz-radius-card: 12px;
  --josanz-secondary-fill: #334155;
  --josanz-success: ${JOSANZ_FIGMA_SEMANTIC.success};
  --josanz-warning: ${JOSANZ_FIGMA_SEMANTIC.warning};
  --josanz-badge-neutral: #334155;
  --josanz-field-accent: var(--josanz-primary);
  --josanz-content-max: 1280px;
  --josanz-sidebar-width: 68px;
  --josanz-shell-pad-x: 1.25rem;
  --josanz-shell-pad-x-md: ${JOSANZ_FIGMA_DASHBOARD.pagePadPx}px;
  --josanz-shell-pad-y: 1.5rem;
  --josanz-shell-pad-y-md: 2.5rem;
  --josanz-shell-footer-safe: max(1.5rem, env(safe-area-inset-bottom, 0px));
  --josanz-shell-mobile-tab-clearance: 133px;
  --josanz-footer-elev: 0 -10px 30px rgba(0,0,0,0.45);
  --bg-primary: #1e293b;
  --surface: #1e293b;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --border-soft: #334155;
}
`;

// ─── Storybook canvas overrides ──────────────────────────────────────────────
const canvasStyles = `
body.sb-show-main,
.sb-show-main,
#storybook-root {
  background: var(--josanz-bg, #f8fafc) !important;
  min-height: 100%;
  padding: 2rem !important;
  font-family: 'Nunito', sans-serif;
  transition: background 0.3s ease;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'DM Sans', sans-serif;
  font-weight: 800;
  color: var(--josanz-text, #0f172a);
}
`;

const atmosphereToolbarItems = (Object.keys(JOSANZ_ATMOSPHERE_REGISTRY) as JosanzAtmosphereName[]).map(
  (value) => ({
    value,
    title: value.charAt(0).toUpperCase() + value.slice(1),
  }),
);

// ─── Atmósfera Josanz: sincroniza CSS con el mismo registro que `JosanzThemeService` ─
const atmosphereDecorator = (
  storyFn: () => unknown,
  context: { globals: { josanzAtmosphere?: string } },
) => {
  const key = (context.globals?.josanzAtmosphere ?? 'neutral') as JosanzAtmosphereName;
  const atmosphere = JOSANZ_ATMOSPHERE_REGISTRY[key] ?? JOSANZ_ATMOSPHERE_REGISTRY.neutral;
  applyJosanzThemeCssVariables({
    atmosphere,
    primaryColor: JOSANZ_DEFAULT_PRIMARY,
    themeName: 'luxe-rounded',
  });
  return storyFn();
};

// ─── Theme decorator: apply data-theme to <html> from Storybook globals ─────
const themeDecorator = (storyFn: () => unknown, context: { globals: { theme?: string } }) => {
  const theme = context.globals?.theme ?? 'light';
  document.documentElement.setAttribute('data-theme', theme);
  applyJosanzStructuralCssVariables(document.documentElement);
  return storyFn();
};

// ─── Inject styles once ──────────────────────────────────────────────────────
let stylesInjected = false;
const injectStylesDecorator = (storyFn: () => unknown) => {
  if (!stylesInjected) {
    const style = document.createElement('style');
    style.id = 'josanz-design-system';
    style.textContent = googleFonts + designTokens + canvasStyles;
    document.head.appendChild(style);
    stylesInjected = true;
  }
  return storyFn();
};

// ─── Exports ─────────────────────────────────────────────────────────────────
export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Josanz UI theme',
    defaultValue: 'light',
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: 'light', title: '☀️  Light' },
        { value: 'dark', title: '🌙  Dark' },
      ],
      showName: true,
      dynamicTitle: true,
    },
  },
  josanzAtmosphere: {
    name: 'Atmósfera',
    description: 'Paleta de fondo/texto (`JosanzThemeService`)',
    defaultValue: 'neutral',
    toolbar: {
      icon: 'mirror',
      items: atmosphereToolbarItems,
      showName: true,
      dynamicTitle: true,
    },
  },
};

export const parameters = {
  layout: 'padded',
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    expanded: true,
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: {
    description: {
      component:
        'Las stories responden a la barra **Atmósfera** (mismo registro que `JosanzThemeService`) y a **Theme** claro/oscuro. Comprueba contraste en fondos claros/oscuros y con distintos colores de marca desde la app o forzando tokens en `:root`.',
    },
  },
  backgrounds: {
    default: 'Luxe Light',
    values: [
      { name: 'Luxe Light', value: '#fefefe' },
      { name: 'White',      value: '#ffffff' },
      { name: 'Luxe Dark',  value: '#0f172a' },
    ],
  },
};

export const decorators = [
  storybookRouterDecorator,
  injectStylesDecorator,
  themeDecorator,
  atmosphereDecorator,
];
