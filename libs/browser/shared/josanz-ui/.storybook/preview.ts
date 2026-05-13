import { storybookRouterDecorator } from './storybook-providers';

const cssVariables = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800&family=Orbitron:wght@400;700;900&family=Outfit:wght@400;500;600;700;800&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&family=Press+Start+2P&display=swap');

:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f1f5f9;
  --bg-tertiary: #f8fafc;
  --surface: #ffffff;
  --surface-hover: #f1f5f9;
  --brand: #2563eb;
  --brand-muted: #1e40af;
  --brand-glow: rgba(37, 99, 235, 0.2);
  --accent: #7c3aed;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --border-soft: #e2e8f0;
  --border-vibrant: #cbd5e1;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --font-main: 'Nunito', sans-serif;
  --font-display: 'DM Sans', sans-serif;
}

body.sb-show-main,
.sb-show-main,
#storybook-root {
  background: #f8fafc !important;
  min-height: 100%;
  padding: 2rem !important;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--text-primary);
}
`;

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
    default: 'light',
    values: [
      { name: 'light', value: '#f8fafc' },
      { name: 'white', value: '#ffffff' },
      { name: 'dark', value: '#0f172a' },
    ],
  },
};

export const decorators = [
  storybookRouterDecorator,
  (storyFn: () => unknown) => {
    const style = document.createElement('style');
    style.textContent = cssVariables;
    document.head.appendChild(style);
    return storyFn();
  },
];
