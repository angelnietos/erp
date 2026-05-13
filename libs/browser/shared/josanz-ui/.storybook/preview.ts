import { storybookRouterDecorator } from './storybook-providers';

// ─── Google Fonts ────────────────────────────────────────────────────────────
const googleFonts = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800&display=swap');`;

// ─── Design Tokens (CSS custom properties) ──────────────────────────────────
// Light theme (default :root) + dark theme (data-theme="dark")
const designTokens = `
:root, [data-theme="light"] {
  --josanz-bg: #f8fafc;
  --josanz-surface: #ffffff;
  --josanz-text: #0f172a;
  --josanz-text-muted: #64748b;
  --josanz-border: #f1f5f9;
  --josanz-primary: #4f46e5;
  --josanz-primary-hover: #4338ca;
  --josanz-accent: #3b82f6;
  --josanz-danger: #ef4444;
  --josanz-danger-hover: #dc2626;
  --josanz-shadow: 0 10px 15px -3px rgba(0,0,0,0.07);
  /* legacy compat */
  --bg-primary: #ffffff;
  --bg-secondary: #f1f5f9;
  --surface: #ffffff;
  --brand: #4f46e5;
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
  --josanz-primary-hover: #6366f1;
  --josanz-accent: #60a5fa;
  --josanz-danger: #f87171;
  --josanz-danger-hover: #ef4444;
  --josanz-shadow: 0 10px 15px -3px rgba(0,0,0,0.4);
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

// ─── Theme decorator: apply data-theme to <html> from Storybook globals ─────
const themeDecorator = (storyFn: () => unknown, context: { globals: { theme?: string } }) => {
  const theme = context.globals?.theme ?? 'light';
  document.documentElement.setAttribute('data-theme', theme);
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
        { value: 'dark',  title: '🌙  Dark'  },
      ],
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
  backgrounds: {
    default: 'Luxe Light',
    values: [
      { name: 'Luxe Light', value: '#f8fafc' },
      { name: 'White',      value: '#ffffff' },
      { name: 'Luxe Dark',  value: '#0f172a' },
    ],
  },
};

export const decorators = [
  storybookRouterDecorator,
  injectStylesDecorator,
  themeDecorator,
];
