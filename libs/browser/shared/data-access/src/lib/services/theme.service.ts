import { Injectable, signal, effect, computed } from '@angular/core';

/** Global app color palettes (selector in shell). Not the same as UI-kit *component* variants (button primary, alert success, etc.). */
export type Theme =
  | 'light'
  | 'dark'
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'rose'
  | 'slate'
  | 'zinc'
  | 'neutral'
  | 'cyan'
  | 'teal'
  | 'amber'
  | 'indigo'
  | 'lime'
  | 'violet'
  | 'crimson'
  | 'mint'
  | 'coral'
  | 'gold'
  | 'corporate-light'
  | 'classic-dark'
  | 'nordic'
  | 'latte'
  | 'forest-dark'
  | 'assassin-creed'
  | 'rainbow_six'
  | 'zelda-legend'
  | 'mario-world'
  | 'animal-crossing'
  | 'gta-san-andreas'
  | 'red-dead'
  | 'celeste-mountain'
  | 'hades-underworld'
  | 'hollow-knight'
  | 'pearl'
  | 'sky-day'
  | 'rose-quartz'
  | 'sage'
  | 'lavender'
  | 'sunrise'
  | 'cyberpunk-2077'
  | 'matrix-reloaded'
  | 'vaporwave-80s'
  | 'elden-ring'
  | 'bloodborne-dark'
  | 'sekiro-shadow'
  | 'starfield-space'
  | 'god-of-war'
  | 'doom-slayer'
  | 'fallout-pipboy'
  | 'skyrim-rim'
  | 'witcher-wild'
  | 'league-legends'
  | 'valorant-spike'
  | 'overwatch-pulse'
  | 'minecraft-block'
  | 'fortnite-storm'
  | 'cyber-neon-pink'
  | 'onyx-premium'
  | 'platinum-luxe'
  | 'cyber-ocean'
  | 'blood-moon'
  | 'midnight-sun'
  | 'icy-phantom';

function hexToRgbTriplet(hex: string): string {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length !== 6) return '79, 70, 229';
  const n = parseInt(normalized, 16);
  if (Number.isNaN(n)) return '79, 70, 229';
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const t = hexToRgbTriplet(hex);
  return `rgba(${t}, ${alpha})`;
}

export interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  brand: string;
  brandGlow: string;
  bgSecondary: string;
  bgTertiary: string;
  bgStyle: 'aurora' | 'matrix' | 'nebula' | 'grid' | 'bokeh' | 'spot';
  uiVariant: 'glass' | 'solid' | 'flat' | 'neumorphic' | 'minimal';
  success: string;
  warning: string;
  danger: string;
  info: string;
}

export const THEMES: Record<Theme, ThemeConfig> = {
  light: {
    name: 'Modern Silk',
    primary: '#4f46e5',
    secondary: '#64748b',
    background: '#f1f5f9',
    surface: '#ffffff',
    text: '#0f172a',
    textMuted: '#475569',
    border: 'rgba(15, 23, 42, 0.12)',
    brand: '#4f46e5',
    brandGlow: 'rgba(79, 70, 229, 0.15)',
    bgSecondary: '#e2e8f0',
    bgTertiary: '#cbd5e1',
    bgStyle: 'bokeh',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'solid',
  },
  dark: {
    name: 'Elevated Midnight',
    primary: '#818cf8',
    secondary: '#94a3b8',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: 'rgba(255, 255, 255, 0.12)',
    brand: '#818cf8',
    brandGlow: 'rgba(129, 140, 248, 0.35)',
    bgSecondary: '#141e33',
    bgTertiary: '#243354',
    bgStyle: 'nebula',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#38bdf8',
    uiVariant: 'glass',
  },
  blue: {
    name: 'Stellar Abyss',
    primary: '#38bdf8',
    secondary: '#94a3b8',
    background: '#111827',
    surface: '#1f2937',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    border: 'rgba(56, 189, 248, 0.2)',
    brand: '#38bdf8',
    brandGlow: 'rgba(56, 189, 248, 0.4)',
    bgSecondary: '#1a2234',
    bgTertiary: '#2d3748',
    bgStyle: 'nebula',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#f43f5e',
    info: '#38bdf8',
    uiVariant: 'glass',
  },
  green: {
    name: 'Emerald Matrix',
    primary: '#10b981',
    secondary: '#34d399',
    background: '#041510',
    surface: '#0a2119',
    text: '#ffffff',
    textMuted: '#86efac',
    border: 'rgba(52, 211, 153, 0.15)',
    brand: '#10b981',
    brandGlow: 'rgba(16, 185, 129, 0.5)',
    bgSecondary: '#061b14',
    bgTertiary: '#0d2a1f',
    bgStyle: 'matrix',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#10b981',
    uiVariant: 'glass',
  },
  purple: {
    name: 'Void Spiral',
    primary: '#8b5cf6',
    secondary: '#64748B',
    background: '#0a0014',
    surface: '#140028',
    text: '#faf5ff',
    textMuted: '#a78bfa',
    border: '#8b5cf633',
    brand: '#8b5cf6',
    brandGlow: 'rgba(139, 92, 246, 0.4)',
    bgSecondary: '#140028',
    bgTertiary: '#1e003c',
    bgStyle: 'aurora',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#f43f5e',
    info: '#8b5cf6',
    uiVariant: 'minimal',
  },
  orange: {
    name: 'Solar Forge',
    primary: '#f97316',
    secondary: '#64748B',
    background: '#0a0500',
    surface: '#1a0d00',
    text: '#fff7ed',
    textMuted: '#fb923c',
    border: '#f9731633',
    brand: '#f97316',
    brandGlow: 'rgba(249, 115, 22, 0.4)',
    bgSecondary: '#1a0d00',
    bgTertiary: '#2d1600',
    bgStyle: 'spot',
    success: '#10b981',
    warning: '#f97316',
    danger: '#ef4444',
    info: '#f97316',
    uiVariant: 'solid',
  },
  rose: {
    name: 'Cyber-Rose',
    primary: '#f43f5e',
    secondary: '#64748B',
    background: '#0a0005',
    surface: '#1a000d',
    text: '#fff1f2',
    textMuted: '#fb7185',
    border: '#f43f5e33',
    brand: '#f43f5e',
    brandGlow: 'rgba(244, 63, 94, 0.4)',
    bgSecondary: '#1a000d',
    bgTertiary: '#2d0016',
    bgStyle: 'bokeh',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#f43f5e',
    info: '#f43f5e',
    uiVariant: 'glass',
  },
  slate: {
    name: 'Technical-Slate',
    primary: '#64748b',
    secondary: '#475569',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#334155',
    brand: '#64748b',
    brandGlow: 'rgba(100, 116, 139, 0.4)',
    bgSecondary: '#1e293b',
    bgTertiary: '#334155',
    bgStyle: 'grid',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#64748b',
    uiVariant: 'neumorphic',
  },
  zinc: {
    name: 'Monochrome',
    primary: '#71717a',
    secondary: '#52525b',
    background: '#09090b',
    surface: '#18181b',
    text: '#fafafa',
    textMuted: '#a1a1aa',
    border: '#27272a',
    brand: '#71717a',
    brandGlow: 'rgba(113, 113, 122, 0.4)',
    bgSecondary: '#18181b',
    bgTertiary: '#27272a',
    bgStyle: 'aurora',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#71717a',
    uiVariant: 'neumorphic',
  },
  neutral: {
    name: 'Raw-Metal',
    primary: '#737373',
    secondary: '#525252',
    background: '#0a0a0a',
    surface: '#171717',
    text: '#fafafa',
    textMuted: '#a3a3a3',
    border: '#262626',
    brand: '#737373',
    brandGlow: 'rgba(115, 115, 115, 0.4)',
    bgSecondary: '#171717',
    bgTertiary: '#262626',
    bgStyle: 'aurora',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#737373',
    uiVariant: 'minimal',
  },
  cyan: {
    name: 'Arctic-Pulse',
    primary: '#06b6d4',
    secondary: '#64748B',
    background: '#020a0f',
    surface: '#082028',
    text: '#ecfeff',
    textMuted: '#67e8f9',
    border: '#06b6d433',
    brand: '#06b6d4',
    brandGlow: 'rgba(6, 182, 212, 0.45)',
    bgSecondary: '#082028',
    bgTertiary: '#0c2e38',
    bgStyle: 'nebula',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    uiVariant: 'minimal',
  },
  teal: {
    name: 'Abyss-Teal',
    primary: '#14b8a6',
    secondary: '#64748B',
    background: '#020807',
    surface: '#0a1f1c',
    text: '#f0fdfa',
    textMuted: '#5eead4',
    border: '#14b8a633',
    brand: '#14b8a6',
    brandGlow: 'rgba(20, 184, 166, 0.45)',
    bgSecondary: '#0a1f1c',
    bgTertiary: '#0f2e29',
    bgStyle: 'nebula',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#14b8a6',
    uiVariant: 'minimal',
  },
  amber: {
    name: 'Forge-Amber',
    primary: '#f59e0b',
    secondary: '#64748B',
    background: '#0c0800',
    surface: '#1c1400',
    text: '#fffbeb',
    textMuted: '#fcd34d',
    border: '#f59e0b33',
    brand: '#f59e0b',
    brandGlow: 'rgba(245, 158, 11, 0.45)',
    bgSecondary: '#1c1400',
    bgTertiary: '#2d1f00',
    bgStyle: 'aurora',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#f59e0b',
    uiVariant: 'minimal',
  },
  indigo: {
    name: 'Nebula-Indigo',
    primary: '#6366f1',
    secondary: '#64748B',
    background: '#050510',
    surface: '#0f1020',
    text: '#eef2ff',
    textMuted: '#a5b4fc',
    border: '#6366f133',
    brand: '#6366f1',
    brandGlow: 'rgba(99, 102, 241, 0.45)',
    bgSecondary: '#0f1020',
    bgTertiary: '#16182e',
    bgStyle: 'nebula',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#6366f1',
    uiVariant: 'minimal',
  },
  lime: {
    name: 'Acid-Lime',
    primary: '#84cc16',
    secondary: '#64748B',
    background: '#050800',
    surface: '#121a05',
    text: '#f7fee7',
    textMuted: '#bef264',
    border: '#84cc1633',
    brand: '#84cc16',
    brandGlow: 'rgba(132, 204, 22, 0.45)',
    bgSecondary: '#121a05',
    bgTertiary: '#1c2608',
    bgStyle: 'aurora',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#84cc16',
    uiVariant: 'minimal',
  },
  violet: {
    name: 'Ultra-Violet',
    primary: '#7c3aed',
    secondary: '#64748B',
    background: '#080214',
    surface: '#14082a',
    text: '#f5f3ff',
    textMuted: '#c4b5fd',
    border: '#7c3aed33',
    brand: '#7c3aed',
    brandGlow: 'rgba(124, 58, 237, 0.45)',
    bgSecondary: '#14082a',
    bgTertiary: '#1c0c3d',
    bgStyle: 'nebula',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#7c3aed',
    uiVariant: 'minimal',
  },
  crimson: {
    name: 'Crimson-Code',
    primary: '#e11d48',
    secondary: '#64748B',
    background: '#0a0205',
    surface: '#1a0510',
    text: '#fff1f2',
    textMuted: '#fb7185',
    border: '#e11d4833',
    brand: '#e11d48',
    brandGlow: 'rgba(225, 29, 72, 0.45)',
    bgSecondary: '#1a0510',
    bgTertiary: '#2d0819',
    bgStyle: 'matrix',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#e11d48',
    uiVariant: 'minimal',
  },
  mint: {
    name: 'Mint-Signal',
    primary: '#34d399',
    secondary: '#64748B',
    background: '#020807',
    surface: '#0a1812',
    text: '#ecfdf5',
    textMuted: '#6ee7b7',
    border: '#34d39933',
    brand: '#34d399',
    brandGlow: 'rgba(52, 211, 153, 0.45)',
    bgSecondary: '#0a1812',
    bgTertiary: '#0f241b',
    bgStyle: 'aurora',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#34d399',
    uiVariant: 'glass',
  },
  coral: {
    name: 'Coral-Neon',
    primary: '#fb7185',
    secondary: '#64748B',
    background: '#0a0406',
    surface: '#1a0a10',
    text: '#fff1f2',
    textMuted: '#fda4af',
    border: '#fb718533',
    brand: '#fb7185',
    brandGlow: 'rgba(251, 113, 133, 0.45)',
    bgSecondary: '#1a0a10',
    bgTertiary: '#2d1018',
    bgStyle: 'bokeh',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#fb7185',
    uiVariant: 'glass',
  },
  gold: {
    name: 'Vinewood Gold',
    primary: '#f5c518',
    secondary: '#64748B',
    background: '#060503',
    surface: '#141105',
    text: '#fffbeb',
    textMuted: '#f5e08a',
    border: 'rgba(245, 197, 24, 0.22)',
    brand: '#f5c518',
    brandGlow: 'rgba(245, 197, 24, 0.48)',
    bgSecondary: '#121008',
    bgTertiary: '#1f1a0c',
    bgStyle: 'aurora',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#f5c518',
    uiVariant: 'glass',
  },
  'corporate-light': {
    name: 'Corporate Light',
    primary: '#0ea5e9',
    secondary: '#475569',
    background: '#f1f5f9',
    surface: '#ffffff',
    text: '#0f172a',
    textMuted: '#475569',
    border: 'rgba(15, 23, 42, 0.12)',
    brand: '#0ea5e9',
    brandGlow: 'rgba(14, 165, 233, 0.15)',
    bgSecondary: '#e2e8f0',
    bgTertiary: '#cbd5e1',
    bgStyle: 'spot',
    success: '#059669',
    warning: '#f59e0b',
    danger: '#dc2626',
    info: '#0284c7',
    uiVariant: 'solid',
  },
  'classic-dark': {
    name: 'Classic Dark',
    primary: '#3b82f6',
    secondary: '#94a3b8',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#334155',
    brand: '#3b82f6',
    brandGlow: 'rgba(59, 130, 246, 0.1)',
    bgSecondary: '#020617',
    bgTertiary: '#0f172a',
    bgStyle: 'spot',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'solid',
  },
  nordic: {
    name: 'Nordic Frost',
    primary: '#88c0d0',
    secondary: '#4c566a',
    background: '#2e3440',
    surface: '#3b4252',
    text: '#eceff4',
    textMuted: '#d8dee9',
    border: '#434c5e',
    brand: '#88c0d0',
    brandGlow: 'rgba(136, 192, 208, 0.1)',
    bgSecondary: '#242933',
    bgTertiary: '#2e3440',
    bgStyle: 'aurora',
    success: '#a3be8c',
    warning: '#ebcb8b',
    danger: '#bf616a',
    info: '#5e81ac',
    uiVariant: 'flat',
  },
  latte: {
    name: 'Vanilla Latte',
    primary: '#d97706',
    secondary: '#57534e',
    background: '#f5f5f4',
    surface: '#ffffff',
    text: '#292524',
    textMuted: '#57534e',
    border: 'rgba(41, 37, 36, 0.12)',
    brand: '#d97706',
    brandGlow: 'rgba(217, 119, 6, 0.1)',
    bgSecondary: '#e7e5e4',
    bgTertiary: '#d6d3d1',
    bgStyle: 'spot',
    success: '#15803d',
    warning: '#c2410c',
    danger: '#b91c1c',
    info: '#0369a1',
    uiVariant: 'flat',
  },
  'forest-dark': {
    name: 'Deep Forest',
    primary: '#10b981',
    secondary: '#a1a1aa',
    background: '#06180c',
    surface: '#0c2415',
    text: '#f0fdf4',
    textMuted: '#86efac',
    border: '#166534',
    brand: '#10b981',
    brandGlow: 'rgba(16, 185, 129, 0.15)',
    bgSecondary: '#020d04',
    bgTertiary: '#041508',
    bgStyle: 'spot',
    success: '#10b981',
    warning: '#eab308',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'flat',
  },
  'assassin-creed': {
    name: 'Animus Order',
    primary: '#9ca3af',
    secondary: '#b91c1c',
    background: '#0f171e',
    surface: '#1c252e',
    text: '#f3f4f6',
    textMuted: '#9ca3af',
    border: 'rgba(156, 163, 175, 0.15)',
    brand: '#b91c1c',
    brandGlow: 'rgba(185, 28, 28, 0.35)',
    bgSecondary: '#161f28',
    bgTertiary: '#232d36',
    bgStyle: 'aurora',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'glass',
  },
  rainbow_six: {
    name: 'Tactical Siege',
    primary: '#fbbf24',
    secondary: '#1e3a5a',
    background: '#0a0a0c',
    surface: '#111116',
    text: '#ffffff',
    textMuted: '#94a3b8',
    border: 'rgba(251, 191, 36, 0.25)',
    brand: '#fbbf24',
    brandGlow: 'rgba(251, 191, 36, 0.4)',
    bgSecondary: '#16161c',
    bgTertiary: '#212129',
    bgStyle: 'grid',
    success: '#10b981',
    warning: '#fbbf24',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'glass',
  },
  'zelda-legend': {
    name: 'Hylian Temple',
    primary: '#fbbf24',
    secondary: '#16a34a',
    background: '#1a2e1a',
    surface: '#2d4a2d',
    text: '#ffffff',
    textMuted: '#bbf7d0',
    border: 'rgba(251, 191, 36, 0.3)',
    brand: '#16a34a',
    brandGlow: 'rgba(22, 163, 74, 0.5)',
    bgSecondary: '#213a21',
    bgTertiary: '#325632',
    bgStyle: 'aurora',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'glass',
  },
  'mario-world': {
    name: 'Super Plumber',
    primary: '#e11d48',
    secondary: '#3b82f6',
    background: '#0c1824',
    surface: '#152b3d',
    text: '#ffffff',
    textMuted: '#94a3b8',
    border: 'rgba(225, 29, 72, 0.2)',
    brand: '#e11d48',
    brandGlow: 'rgba(225, 29, 72, 0.4)',
    bgSecondary: '#0f1f2e',
    bgTertiary: '#1e3a5a',
    bgStyle: 'bokeh',
    success: '#22c55e',
    warning: '#facc15',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'solid',
  },
  'animal-crossing': {
    name: 'Island Life',
    primary: '#6bb33b',
    secondary: '#f9f5d7',
    background: '#e8f5e9',
    surface: '#ffffff',
    text: '#2d4a22',
    textMuted: '#4a7c33',
    border: 'rgba(45, 74, 34, 0.15)',
    brand: '#6bb33b',
    brandGlow: 'rgba(107, 179, 59, 0.15)',
    bgSecondary: '#c5e1a5',
    bgTertiary: '#aed581',
    bgStyle: 'spot',
    success: '#43a047',
    warning: '#fbc02d',
    danger: '#e53935',
    info: '#039be5',
    uiVariant: 'flat',
  },
  'gta-san-andreas': {
    name: 'Grove Street',
    primary: '#15803d',
    secondary: '#facc15',
    background: '#0a0d0a',
    surface: '#141a14',
    text: '#f0fdf4',
    textMuted: '#86efac',
    border: 'rgba(21, 128, 61, 0.2)',
    brand: '#16a34a',
    brandGlow: 'rgba(22, 163, 74, 0.4)',
    bgSecondary: '#0f140f',
    bgTertiary: '#1d261d',
    bgStyle: 'grid',
    success: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'glass',
  },
  'red-dead': {
    name: 'Western Sunset',
    primary: '#b91c1c',
    secondary: '#78350f',
    background: '#1a1412',
    surface: '#2a1e1a',
    text: '#fef3c7',
    textMuted: '#d97706',
    border: 'rgba(185, 28, 28, 0.15)',
    brand: '#b91c1c',
    brandGlow: 'rgba(185, 28, 28, 0.35)',
    bgSecondary: '#241a16',
    bgTertiary: '#3e2723',
    bgStyle: 'aurora',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#b91c1c',
    info: '#3b82f6',
    uiVariant: 'glass',
  },
  'celeste-mountain': {
    name: 'Strawberry Peak',
    primary: '#38bdf8',
    secondary: '#f472b6',
    background: '#08141f',
    surface: '#0f2430',
    text: '#f0f9ff',
    textMuted: '#7dd3fc',
    border: 'rgba(56, 189, 248, 0.2)',
    brand: '#38bdf8',
    brandGlow: 'rgba(56, 189, 248, 0.4)',
    bgSecondary: '#0c1d29',
    bgTertiary: '#1e3a4e',
    bgStyle: 'bokeh',
    success: '#10b981',
    warning: '#fbbf24',
    danger: '#f43f5e',
    info: '#38bdf8',
    uiVariant: 'solid',
  },
  'hades-underworld': {
    name: 'House of Hades',
    primary: '#fbbf24',
    secondary: '#dc2626',
    background: '#0c0505',
    surface: '#1a0a0a',
    text: '#fee2e2',
    textMuted: '#f87171',
    border: 'rgba(251, 191, 36, 0.15)',
    brand: '#dc2626',
    brandGlow: 'rgba(220, 38, 38, 0.45)',
    bgSecondary: '#110202',
    bgTertiary: '#2d0505',
    bgStyle: 'nebula',
    success: '#10b981',
    warning: '#fbbf24',
    danger: '#dc2626',
    info: '#38bdf8',
    uiVariant: 'glass',
  },
  'hollow-knight': {
    name: 'City of Tears',
    primary: '#94a3b8',
    secondary: '#e2e8f0',
    background: '#1e293b',
    surface: '#334155',
    text: '#f8fafc',
    textMuted: '#cbd5e1',
    border: 'rgba(255, 255, 255, 0.15)',
    brand: '#94a3b8',
    brandGlow: 'rgba(148, 163, 184, 0.4)',
    bgSecondary: '#24334a',
    bgTertiary: '#3a4e6e',
    bgStyle: 'matrix',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#38bdf8',
    uiVariant: 'glass',
  },
  pearl: {
    name: '✦ Pearl White',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#f3f4f6',
    surface: '#ffffff',
    text: '#111827',
    textMuted: '#4b5563',
    border: 'rgba(17, 24, 39, 0.1)',
    brand: '#6366f1',
    brandGlow: 'rgba(99, 102, 241, 0.12)',
    bgSecondary: '#e5e7eb',
    bgTertiary: '#d1d5db',
    bgStyle: 'spot',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#0284c7',
    uiVariant: 'solid',
  },
  'sky-day': {
    name: '🌤 Sky Day',
    primary: '#0ea5e9',
    secondary: '#38bdf8',
    background: '#e0f2fe',
    surface: '#ffffff',
    text: '#0c4a6e',
    textMuted: '#0369a1',
    border: 'rgba(12, 74, 110, 0.15)',
    brand: '#0ea5e9',
    brandGlow: 'rgba(14, 165, 233, 0.15)',
    bgSecondary: '#bae6fd',
    bgTertiary: '#7dd3fc',
    bgStyle: 'bokeh',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#0284c7',
    uiVariant: 'flat',
  },
  'rose-quartz': {
    name: '🌸 Rose Quartz',
    primary: '#e11d48',
    secondary: '#fb7185',
    background: '#ffe4e6',
    surface: '#ffffff',
    text: '#4c0519',
    textMuted: '#be123c',
    border: 'rgba(76, 5, 25, 0.15)',
    brand: '#e11d48',
    brandGlow: 'rgba(225, 29, 72, 0.12)',
    bgSecondary: '#fecdd3',
    bgTertiary: '#fda4af',
    bgStyle: 'bokeh',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#0284c7',
    uiVariant: 'flat',
  },
  sage: {
    name: '🌿 Sage Garden',
    primary: '#16a34a',
    secondary: '#86efac',
    background: '#dcfce7',
    surface: '#ffffff',
    text: '#14532d',
    textMuted: '#15803d',
    border: 'rgba(20, 83, 45, 0.15)',
    brand: '#16a34a',
    brandGlow: 'rgba(74, 222, 128, 0.12)',
    bgSecondary: '#bbf7d0',
    bgTertiary: '#86efac',
    bgStyle: 'spot',
    success: '#15803d',
    warning: '#a16207',
    danger: '#b91c1c',
    info: '#0369a1',
    uiVariant: 'flat',
  },
  lavender: {
    name: '💜 Lavender Mist',
    primary: '#7c3aed',
    secondary: '#a78bfa',
    background: '#ede9fe',
    surface: '#ffffff',
    text: '#3b0764',
    textMuted: '#6d28d9',
    border: 'rgba(59, 7, 100, 0.15)',
    brand: '#7c3aed',
    brandGlow: 'rgba(124, 58, 237, 0.12)',
    bgSecondary: '#ddd6fe',
    bgTertiary: '#c4b5fd',
    bgStyle: 'bokeh',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#0284c7',
    uiVariant: 'flat',
  },
  sunrise: {
    name: '🌅 Sunrise Glow',
    primary: '#ea580c',
    secondary: '#fb923c',
    background: '#ffedd5',
    surface: '#ffffff',
    text: '#431407',
    textMuted: '#c2410c',
    border: 'rgba(67, 20, 7, 0.18)',
    brand: '#ea580c',
    brandGlow: 'rgba(234, 88, 12, 0.12)',
    bgSecondary: '#fed7aa',
    bgTertiary: '#fdba74',
    bgStyle: 'spot',
    success: '#15803d',
    warning: '#b45309',
    danger: '#b91c1c',
    info: '#0369a1',
    uiVariant: 'flat',
  },
  'cyberpunk-2077': {
    name: 'Cyberpunk 2077',
    primary: '#f3e600',
    secondary: '#00f0ff',
    background: '#0a0a0a',
    surface: '#181818',
    text: '#ffffff',
    textMuted: '#f3e600',
    border: 'rgba(243, 230, 0, 0.3)',
    brand: '#f3e600',
    brandGlow: 'rgba(243, 230, 0, 0.4)',
    bgSecondary: '#050505',
    bgTertiary: '#121212',
    bgStyle: 'matrix',
    success: '#34d399',
    warning: '#f3e600',
    danger: '#ef4444',
    info: '#00f0ff',
    uiVariant: 'glass',
  },
  'matrix-reloaded': {
    name: 'The Matrix',
    primary: '#00ff41',
    secondary: '#003b00',
    background: '#000800',
    surface: '#001000',
    text: '#00ff41',
    textMuted: '#003b00',
    border: 'rgba(0, 255, 65, 0.2)',
    brand: '#00ff41',
    brandGlow: 'rgba(0, 255, 65, 0.5)',
    bgSecondary: '#000500',
    bgTertiary: '#001500',
    bgStyle: 'matrix',
    success: '#00ff41',
    warning: '#008f11',
    danger: '#ff0000',
    info: '#00ff41',
    uiVariant: 'flat',
  },
  'vaporwave-80s': {
    name: 'Vaporwave 80s',
    primary: '#ff71ce',
    secondary: '#01cdfe',
    background: '#05000a',
    surface: '#1a0033',
    text: '#fff',
    textMuted: '#b967ff',
    border: 'rgba(255, 113, 206, 0.3)',
    brand: '#05ffa1',
    brandGlow: 'rgba(5, 255, 161, 0.5)',
    bgSecondary: '#0a001a',
    bgTertiary: '#24004d',
    bgStyle: 'aurora',
    success: '#05ffa1',
    warning: '#fffb96',
    danger: '#f43f5e',
    info: '#01cdfe',
    uiVariant: 'glass',
  },
  'elden-ring': {
    name: 'Elden Ring',
    primary: '#c9a227',
    secondary: '#3d3023',
    background: '#0b0805',
    surface: '#1c1611',
    text: '#f2e8cf',
    textMuted: '#c9a227',
    border: 'rgba(201, 162, 39, 0.25)',
    brand: '#c9a227',
    brandGlow: 'rgba(201, 162, 39, 0.45)',
    bgSecondary: '#0f0c08',
    bgTertiary: '#2d241b',
    bgStyle: 'nebula',
    success: '#84cc16',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    uiVariant: 'glass',
  },
  'bloodborne-dark': {
    name: 'Yharnam Night',
    primary: '#4c1d95',
    secondary: '#1e1b4b',
    background: '#020617',
    surface: '#0f172a',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    border: 'rgba(76, 29, 149, 0.2)',
    brand: '#4c1d95',
    brandGlow: 'rgba(76, 29, 149, 0.3)',
    bgSecondary: '#020617',
    bgTertiary: '#0f172a',
    bgStyle: 'matrix',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'glass',
  },
  'sekiro-shadow': {
    name: 'Ashina Castle',
    primary: '#ef4444',
    secondary: '#451a03',
    background: '#0c0a09',
    surface: '#1c1917',
    text: '#fafaf9',
    textMuted: '#ef4444',
    border: 'rgba(239, 68, 68, 0.2)',
    brand: '#ef4444',
    brandGlow: 'rgba(239, 68, 68, 0.4)',
    bgSecondary: '#0c0a09',
    bgTertiary: '#1c1917',
    bgStyle: 'aurora',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'minimal',
  },
  'starfield-space': {
    name: 'Starfield Edge',
    primary: '#0ea5e9',
    secondary: '#475569',
    background: '#020617',
    surface: '#0f172a',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: 'rgba(14, 165, 233, 0.2)',
    brand: '#ca8a04',
    brandGlow: 'rgba(202, 138, 4, 0.2)',
    bgSecondary: '#020617',
    bgTertiary: '#0f172a',
    bgStyle: 'nebula',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'glass',
  },
  'god-of-war': {
    name: 'Nordic Fury',
    primary: '#ea580c',
    secondary: '#451a03',
    background: '#0c0a09',
    surface: '#1c1917',
    text: '#fafaf9',
    textMuted: '#ea580c',
    border: 'rgba(234, 88, 12, 0.2)',
    brand: '#ea580c',
    brandGlow: 'rgba(234, 88, 12, 0.4)',
    bgSecondary: '#0c0a09',
    bgTertiary: '#1c1917',
    bgStyle: 'aurora',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'minimal',
  },
  'doom-slayer': {
    name: 'Doom Eternal',
    primary: '#dc2626',
    secondary: '#450a0a',
    background: '#0a0a0a',
    surface: '#1c1c1c',
    text: '#ffffff',
    textMuted: '#dc2626',
    border: 'rgba(220, 38, 38, 0.3)',
    brand: '#dc2626',
    brandGlow: 'rgba(220, 38, 38, 0.5)',
    bgSecondary: '#050505',
    bgTertiary: '#121212',
    bgStyle: 'matrix',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'glass',
  },
  'fallout-pipboy': {
    name: 'Pip-Boy 3000',
    primary: '#14b8a6',
    secondary: '#064e3b',
    background: '#021008',
    surface: '#062016',
    text: '#14b8a6',
    textMuted: '#065f46',
    border: 'rgba(20, 184, 166, 0.25)',
    brand: '#14b8a6',
    brandGlow: 'rgba(20, 184, 166, 0.5)',
    bgSecondary: '#020804',
    bgTertiary: '#0a1f14',
    bgStyle: 'grid',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#14b8a6',
    uiVariant: 'flat',
  },
  'skyrim-rim': {
    name: 'Elder Scrolls',
    primary: '#d1d5db',
    secondary: '#374151',
    background: '#0a0a0b',
    surface: '#111827',
    text: '#f3f4f6',
    textMuted: '#9ca3af',
    border: 'rgba(209, 213, 221, 0.2)',
    brand: '#ca8a04',
    brandGlow: 'rgba(202, 138, 4, 0.2)',
    bgSecondary: '#050505',
    bgTertiary: '#111827',
    bgStyle: 'aurora',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'glass',
  },
  'witcher-wild': {
    name: 'Wild Hunt',
    primary: '#ef4444',
    secondary: '#000000',
    background: '#050505',
    surface: '#121212',
    text: '#ffffff',
    textMuted: '#ef4444',
    border: 'rgba(239, 68, 68, 0.3)',
    brand: '#ef4444',
    brandGlow: 'rgba(239, 68, 68, 0.5)',
    bgSecondary: '#000000',
    bgTertiary: '#121212',
    bgStyle: 'matrix',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'solid',
  },
  'league-legends': {
    name: 'Summoner Rift',
    primary: '#c5a059',
    secondary: '#0a1428',
    background: '#091428',
    surface: '#0a323c',
    text: '#ffffff',
    textMuted: '#005a82',
    border: 'rgba(197, 160, 89, 0.3)',
    brand: '#c5a059',
    brandGlow: 'rgba(197, 160, 89, 0.5)',
    bgSecondary: '#0a1428',
    bgTertiary: '#0a323c',
    bgStyle: 'aurora',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'glass',
  },
  'valorant-spike': {
    name: 'Tactical Spike',
    primary: '#ff4655',
    secondary: '#0f1923',
    background: '#0f1923',
    surface: '#1f2937',
    text: '#ece8e1',
    textMuted: '#ff4655',
    border: 'rgba(255, 70, 85, 0.3)',
    brand: '#ff4655',
    brandGlow: 'rgba(255, 70, 85, 0.5)',
    bgSecondary: '#0f1923',
    bgTertiary: '#1f2937',
    bgStyle: 'grid',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'minimal',
  },
  'overwatch-pulse': {
    name: 'Overwatch Pulse',
    primary: '#f99e1a',
    secondary: '#405275',
    background: '#f0f3f8',
    surface: '#ffffff',
    text: '#212427',
    textMuted: '#405275',
    border: '#d1d5db',
    brand: '#f99e1a',
    brandGlow: 'rgba(249, 158, 26, 0.2)',
    bgSecondary: '#ffffff',
    bgTertiary: '#f0f3f8',
    bgStyle: 'bokeh',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'solid',
  },
  'minecraft-block': {
    name: 'Craft Block',
    primary: '#4d7e3e',
    secondary: '#795548',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#333333',
    textMuted: '#757575',
    border: '#d7ccc8',
    brand: '#4d7e3e',
    brandGlow: 'rgba(77, 126, 62, 0.15)',
    bgSecondary: '#ffffff',
    bgTertiary: '#f5f5f5',
    bgStyle: 'grid',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'solid',
  },
  'fortnite-storm': {
    name: 'Storm King',
    primary: '#8b5cf6',
    secondary: '#312e81',
    background: '#0c0a1f',
    surface: '#1e1b4b',
    text: '#ffffff',
    textMuted: '#8b5cf6',
    border: 'rgba(139, 92, 246, 0.3)',
    brand: '#8b5cf6',
    brandGlow: 'rgba(139, 92, 246, 0.5)',
    bgSecondary: '#0c0a1f',
    bgTertiary: '#1e1b4b',
    bgStyle: 'aurora',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'glass',
  },
  'cyber-neon-pink': {
    name: 'Neon Pink',
    primary: '#ff00ff',
    secondary: '#00ffff',
    background: '#050505',
    surface: '#121212',
    text: '#ffffff',
    textMuted: '#ff00ff',
    border: 'rgba(255, 0, 255, 0.3)',
    brand: '#ff00ff',
    brandGlow: 'rgba(255, 0, 255, 0.5)',
    bgSecondary: '#000000',
    bgTertiary: '#121212',
    bgStyle: 'matrix',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'glass',
  },
  'onyx-premium': {
    name: 'Onyx Black',
    primary: '#ffffff',
    secondary: '#404040',
    background: '#000000',
    surface: '#171717',
    text: '#ffffff',
    textMuted: '#a3a3a3',
    border: '#262626',
    brand: '#ffffff',
    brandGlow: 'rgba(255, 255, 255, 0.2)',
    bgSecondary: '#0a0a0a',
    bgTertiary: '#171717',
    bgStyle: 'spot',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'minimal',
  },
  'platinum-luxe': {
    name: 'Platinum Luxe',
    primary: '#111827',
    secondary: '#d1d5db',
    background: '#e5e7eb',
    surface: '#ffffff',
    text: '#111827',
    textMuted: '#374151',
    border: 'rgba(17, 24, 39, 0.15)',
    brand: '#111827',
    brandGlow: 'rgba(17, 24, 39, 0.15)',
    bgSecondary: '#d1d5db',
    bgTertiary: '#9ca3af',
    bgStyle: 'bokeh',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'solid',
  },
  'cyber-ocean': {
    name: 'Cyber Ocean',
    primary: '#06b6d4',
    secondary: '#0891b2',
    background: '#020617',
    surface: '#0f172a',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: 'rgba(6, 182, 212, 0.2)',
    brand: '#06b6d4',
    brandGlow: 'rgba(6, 182, 212, 0.5)',
    bgSecondary: '#020617',
    bgTertiary: '#1e293b',
    bgStyle: 'aurora',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    uiVariant: 'glass',
  },
  'blood-moon': {
    name: 'Blood Moon',
    primary: '#ef4444',
    secondary: '#991b1b',
    background: '#0c0505',
    surface: '#1a0505',
    text: '#fee2e2',
    textMuted: '#f87171',
    border: 'rgba(239, 68, 68, 0.2)',
    brand: '#ef4444',
    brandGlow: 'rgba(239, 68, 68, 0.5)',
    bgSecondary: '#0c0505',
    bgTertiary: '#2d0a0a',
    bgStyle: 'nebula',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#f87171',
    uiVariant: 'glass',
  },
  'midnight-sun': {
    name: 'Midnight Sun',
    primary: '#f59e0b',
    secondary: '#d97706',
    background: '#090702',
    surface: '#181205',
    text: '#fffbeb',
    textMuted: '#fbbf24',
    border: 'rgba(245, 158, 11, 0.2)',
    brand: '#f59e0b',
    brandGlow: 'rgba(245, 158, 11, 0.5)',
    bgSecondary: '#090702',
    bgTertiary: '#261a0a',
    bgStyle: 'bokeh',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#fbbf24',
    uiVariant: 'glass',
  },
  'icy-phantom': {
    name: 'Icy Phantom',
    primary: '#334155',
    secondary: '#475569',
    background: '#ebf0f5',
    surface: '#ffffff',
    text: '#0f172a',
    textMuted: '#334155',
    border: 'rgba(15, 23, 42, 0.1)',
    brand: '#334155',
    brandGlow: 'rgba(51, 65, 85, 0.15)',
    bgSecondary: '#cbd5e1',
    bgTertiary: '#94a3b8',
    bgStyle: 'spot',
    success: '#059669',
    warning: '#f59e0b',
    danger: '#dc2626',
    info: '#334155',
    uiVariant: 'minimal',
  },
};

/** Agrupa el selector del shell: paleta base, corporativo e inspiración gaming. */
export interface ThemeMenuSection {
  id: string;
  label: string;
  keys: Theme[];
}

const THEME_MENU_SECTIONS_BASE: readonly ThemeMenuSection[] = [
  {
    id: 'luxe',
    label: '✨ Premium Design',
    keys: [
      'cyber-ocean',
      'blood-moon',
      'midnight-sun',
      'icy-phantom',
      'onyx-premium',
      'platinum-luxe',
    ],
  },
  {
    id: 'light',
    label: '☀️ Temas Claros',
    keys: [
      'pearl',
      'sky-day',
      'rose-quartz',
      'sage',
      'lavender',
      'sunrise',
      'latte',
      'animal-crossing',
      'corporate-light',
    ],
  },
  {
    id: 'palette',
    label: '🌙 Paleta Oscura ERP',
    keys: [
      'light',
      'dark',
      'blue',
      'green',
      'purple',
      'orange',
      'rose',
      'slate',
      'zinc',
      'neutral',
      'cyan',
      'teal',
      'amber',
      'indigo',
      'lime',
      'violet',
      'crimson',
      'mint',
      'coral',
      'gold',
    ],
  },
  {
    id: 'corporate',
    label: 'Corporativo y ambiente',
    keys: [
      'classic-dark',
      'nordic',
      'forest-dark',
    ],
  },
  {
    id: 'gaming',
    label: 'Inspiración videojuegos',
    keys: [
      'assassin-creed',
      'rainbow_six',
      'zelda-legend',
      'mario-world',
      'gta-san-andreas',
      'red-dead',
      'celeste-mountain',
      'hades-underworld',
      'hollow-knight',
    ],
  },
];

function buildThemeMenuSections(): ThemeMenuSection[] {
  const used = new Set<Theme>();
  const sections: ThemeMenuSection[] = THEME_MENU_SECTIONS_BASE.map((s) => {
    for (const k of s.keys) {
      used.add(k);
    }
    return { id: s.id, label: s.label, keys: [...s.keys] };
  });
  const missing = (Object.keys(THEMES) as Theme[]).filter((k) => !used.has(k));
  if (missing.length > 0) {
    sections.push({ id: 'other', label: 'Otros', keys: missing });
  }
  return sections;
}

const THEME_MENU_SECTIONS = buildThemeMenuSections();

const UI_VARIANT_KEYS = [
  'glass',
  'solid',
  'flat',
  'neumorphic',
  'minimal',
] as const;
type UiVariantKey = (typeof UI_VARIANT_KEYS)[number];

function isUiVariantKey(v: string): v is UiVariantKey {
  return (UI_VARIANT_KEYS as readonly string[]).includes(v);
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly currentTheme = signal<Theme>('light');
  readonly currentThemeData = computed(() => THEMES[this.currentTheme()]);
  readonly currentVariant = signal<string>('glass');
  readonly themes = THEMES;
  readonly themeMenuSections = THEME_MENU_SECTIONS;
  private readonly isHighPerf = signal<boolean>(false);

  constructor() {
    const stored = this.getStoredTheme();
    const storedVariant = this.getStoredVariant();
    const initialTheme = stored || 'light';
    const initialVariant = storedVariant || THEMES[initialTheme].uiVariant || 'glass';
    
    this.currentTheme.set(initialTheme);
    this.currentVariant.set(initialVariant);
    this.applyTheme(initialTheme, initialVariant);

    effect(() => {
      const theme = this.currentTheme();
      const variant = this.currentVariant();
      this.applyTheme(theme, variant);
      this.storeTheme(theme);
      this.storeVariant(variant);
    });

    effect(() => {
      this.applyPerformanceMode(this.isHighPerf());
    });
  }

  setTheme(theme: Theme) {
    this.currentTheme.set(theme);
  }

  setVariant(variant: 'glass' | 'solid' | 'flat' | 'neumorphic' | 'minimal') {
    this.currentVariant.set(variant);
  }

  private applyTheme(theme: Theme, variant: string) {
    const config = THEMES[theme];
    const root = document.documentElement;

    // Core legacy tokens
    root.style.setProperty('--theme-primary', config.primary);
    root.style.setProperty(
      '--theme-primary-rgb',
      hexToRgbTriplet(config.primary),
    );
    /* Alias tokens used by feature UIs (dashboard, events, etc.) */
    root.style.setProperty('--primary', config.primary);
    root.style.setProperty('--primary-rgb', hexToRgbTriplet(config.primary));
    root.style.setProperty('--accent-rgb', hexToRgbTriplet(config.secondary));
    root.style.setProperty('--theme-secondary', config.secondary);
    root.style.setProperty('--theme-background', config.background);
    root.style.setProperty('--theme-surface', config.surface);
    root.style.setProperty('--theme-text', config.text);
    root.style.setProperty('--theme-text-muted', config.textMuted);
    root.style.setProperty('--theme-border', config.border);

    // Cyber-Luxe tokens
    root.style.setProperty('--brand', config.brand);
    root.style.setProperty('--brand-rgb', hexToRgbTriplet(config.brand));
    root.style.setProperty('--brand-glow', config.brandGlow);
    root.style.setProperty('--bg-primary', config.background);
    root.style.setProperty('--bg-secondary', config.bgSecondary);
    root.style.setProperty('--bg-tertiary', config.bgTertiary);
    root.style.setProperty('--text-primary', config.text);
    root.style.setProperty('--text-secondary', config.textMuted);
    root.style.setProperty('--border-soft', config.border);

    root.style.setProperty('--surface', hexToRgba(config.surface, 0.78));
    const brandRgb = hexToRgbTriplet(config.brand);
    // ── LIGHT THEME DETECTION ──────────────────────────────────────
    const t = hexToRgbTriplet(config.background).split(',').map(Number);
    const brightness = (t[0] * 299 + t[1] * 587 + t[2] * 114) / 1000;
    const isLight = brightness > 180;

    root.style.setProperty('--brand-ambient', `rgba(${brandRgb}, 0.12)`);
    root.style.setProperty('--brand-ambient-strong', `rgba(${brandRgb}, 0.2)`);
    root.style.setProperty('--surface-opacity', isLight ? '0.94' : '0.78');

    root.setAttribute('data-theme', theme);
    root.setAttribute('data-ui-variant', variant);

    // ── STRUCTURAL TOKENS ──────────────────────────────────────────────
    // Apply variant-specific tokens directly via inline style to bypass
    // Angular ViewEncapsulation (encapsulated component styles cannot see
    // CSS-rule-level html[data-ui-variant] overrides, but they CAN inherit
    // inline CSS variables from :root / documentElement).
    this.applyStructuralTokens(root, variant, config, isLight);
  }

  /**
   * Pushes per-variant structural tokens directly via style.setProperty() so
   * they are available as inherited CSS custom properties inside encapsulated
   * Angular components. Stylesheet-level html[data-ui-variant] rules are
   * overridden by inline style declarations, so we must set them in JS too.
   */
  private applyStructuralTokens(
    root: HTMLElement,
    variant: string,
    config: ThemeConfig,
    isLight: boolean = false,
  ): void {
    // Reset all structural tokens first
    const structuralTokens = [
      '--radius-md',
      '--radius-lg',
      '--radius-xl',
      '--shadow-md',
      '--shadow-lg',
      '--shadow-inset-shine',
      '--border-vibrant',
      '--variant-blur',
      // Component-level token overrides
      '--card-bg',
      '--card-border',
      '--card-border-width',
      '--card-shadow',
      '--input-bg',
      '--input-border',
      '--input-radius',
      '--input-shadow',
      '--modal-bg',
      '--modal-border',
      '--modal-border-width',
      '--modal-radius',
      '--modal-shadow',
      '--badge-radius',
      '--badge-border-width',
      '--btn-radius',
      '--btn-shadow',
      '--btn-border-width',
    ];
    structuralTokens.forEach((t) => root.style.removeProperty(t));

    // Core surface used by .ui-glass
    root.style.setProperty(
      '--surface',
      hexToRgba(config.surface, isLight ? 0.94 : 0.78),
    );

    switch (variant) {
      case 'glass':
        root.style.setProperty('--variant-blur', isLight ? '12px' : '28px');
        root.style.setProperty('--radius-lg', '16px');
        root.style.setProperty('--radius-md', '10px');
        root.style.setProperty('--radius-xl', '24px');
        root.style.setProperty(
          '--border-vibrant',
          isLight
            ? `rgba(${hexToRgbTriplet(config.brand)}, 0.35)`
            : `rgba(${hexToRgbTriplet(config.brand)}, 0.25)`,
        );
        root.style.setProperty(
          '--shadow-inset-shine',
          isLight
            ? 'inset 0 1px 0 rgba(255,255,255,0.8)'
            : 'inset 0 1px 0 rgba(255,255,255,0.08)',
        );
        root.style.setProperty(
          '--shadow-md',
          isLight
            ? '0 8px 32px rgba(0,0,0,0.08)'
            : '0 8px 32px rgba(0,0,0,0.4)',
        );
        // Card
        root.style.setProperty(
          '--card-bg',
          `color-mix(in srgb, ${config.surface} ${isLight ? '95%' : '70%'}, transparent)`,
        );
        root.style.setProperty(
          '--card-border',
          isLight
            ? `rgba(${hexToRgbTriplet(config.brand)}, 0.3)`
            : `rgba(${hexToRgbTriplet(config.brand)}, 0.2)`,
        );
        root.style.setProperty(
          '--card-shadow',
          isLight
            ? '0 8px 32px rgba(0,0,0,0.08)'
            : '0 8px 32px rgba(0,0,0,0.4)',
        );
        // Input
        root.style.setProperty(
          '--input-bg',
          isLight
            ? `color-mix(in srgb, ${config.surface} 98%, transparent)`
            : `color-mix(in srgb, ${config.surface} 50%, transparent)`,
        );
        root.style.setProperty('--input-border', isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)');
        root.style.setProperty('--input-radius', '10px');
        // Modal
        root.style.setProperty('--modal-radius', '24px');
        root.style.setProperty(
          '--modal-bg',
          isLight
            ? `color-mix(in srgb, ${config.bgSecondary} 95%, transparent)`
            : `color-mix(in srgb, ${config.bgSecondary} 80%, transparent)`,
        );
        // Button
        root.style.setProperty('--btn-radius', '10px');
        root.style.setProperty(
          '--btn-shadow',
          isLight
            ? `0 4px 20px rgba(${hexToRgbTriplet(config.brand)}, 0.15)`
            : `0 4px 20px rgba(${hexToRgbTriplet(config.brand)}, 0.3)`,
        );
        break;

      case 'solid':
        root.style.setProperty('--variant-blur', '0px');
        root.style.setProperty('--radius-lg', '10px');
        root.style.setProperty('--radius-md', '6px');
        root.style.setProperty('--radius-xl', '14px');
        root.style.setProperty('--border-vibrant', config.border);
        root.style.setProperty('--shadow-inset-shine', 'none');
        root.style.setProperty(
          '--shadow-md',
          isLight ? '0 4px 12px rgba(0,0,0,0.06)' : '0 4px 12px rgba(0,0,0,0.25)',
        );
        // Card
        root.style.setProperty('--card-bg', config.surface);
        root.style.setProperty('--card-border', config.border);
        root.style.setProperty(
          '--card-shadow',
          isLight ? '0 2px 8px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.2)',
        );
        // Input
        root.style.setProperty('--input-bg', config.bgSecondary);
        root.style.setProperty('--input-border', config.border);
        root.style.setProperty('--input-radius', '6px');
        root.style.setProperty(
          '--input-shadow',
          isLight
            ? 'inset 0 1px 2px rgba(0,0,0,0.05)'
            : 'inset 0 1px 3px rgba(0,0,0,0.2)',
        );
        // Modal
        root.style.setProperty('--modal-radius', '10px');
        root.style.setProperty('--modal-bg', config.surface);
        // Button
        root.style.setProperty('--btn-radius', '6px');
        root.style.setProperty('--btn-shadow', 'none');
        root.style.setProperty('--btn-border-width', '0px');
        break;

      case 'flat':
        root.style.setProperty('--variant-blur', '0px');
        root.style.setProperty('--radius-lg', '4px');
        root.style.setProperty('--radius-md', '2px');
        root.style.setProperty('--radius-xl', '6px');
        root.style.setProperty('--border-vibrant', 'transparent');
        root.style.setProperty('--shadow-inset-shine', 'none');
        root.style.setProperty('--shadow-md', 'none');
        root.style.setProperty('--shadow-lg', 'none');
        // Card
        root.style.setProperty('--card-bg', config.bgTertiary);
        root.style.setProperty('--card-border', 'transparent');
        root.style.setProperty('--card-border-width', '0px');
        root.style.setProperty('--card-shadow', 'none');
        // Input
        root.style.setProperty('--input-bg', config.bgTertiary);
        root.style.setProperty('--input-border', 'transparent');
        root.style.setProperty('--input-radius', '2px');
        root.style.setProperty('--input-shadow', 'none');
        // Modal
        root.style.setProperty('--modal-radius', '4px');
        root.style.setProperty('--modal-bg', config.bgTertiary);
        root.style.setProperty('--modal-border-width', '0px');
        root.style.setProperty('--modal-shadow', '0 2px 20px rgba(0,0,0,0.3)');
        // Button
        root.style.setProperty('--btn-radius', '2px');
        root.style.setProperty('--btn-shadow', 'none');
        root.style.setProperty('--btn-border-width', '0px');
        break;

      case 'neumorphic':
        root.style.setProperty('--variant-blur', '0px');
        root.style.setProperty('--radius-lg', '20px');
        root.style.setProperty('--radius-md', '14px');
        root.style.setProperty('--radius-lg', '40px');
        root.style.setProperty('--radius-md', '24px');
        root.style.setProperty('--radius-xl', '60px');
        root.style.setProperty('--border-vibrant', 'transparent');
        root.style.setProperty('--shadow-inset-shine', 'none');
        root.style.setProperty(
          '--shadow-md',
          '-8px -8px 20px rgba(255,255,255,0.03), 8px 8px 20px rgba(0,0,0,0.5)'
        );
        root.style.setProperty(
          '--shadow-lg',
          '-12px -12px 30px rgba(255,255,255,0.03), 12px 12px 30px rgba(0,0,0,0.6)'
        );
        // Card
        root.style.setProperty('--card-bg', config.background);
        root.style.setProperty('--card-border', 'transparent');
        root.style.setProperty('--card-border-width', '0px');
        root.style.setProperty('--card-shadow', 'var(--shadow-md)');
        // Input
        root.style.setProperty('--input-bg', config.background);
        root.style.setProperty('--input-border', 'transparent');
        root.style.setProperty('--input-radius', '30px');
        root.style.setProperty(
          '--input-shadow',
          'inset -4px -4px 10px rgba(255,255,255,0.02), inset 4px 4px 10px rgba(0,0,0,0.4)'
        );
        // Modal
        root.style.setProperty('--modal-radius', '50px');
        root.style.setProperty('--modal-bg', config.background);
        root.style.setProperty('--modal-border-width', '0px');
        root.style.setProperty('--modal-shadow', 'var(--shadow-lg)');
        // Button
        root.style.setProperty('--btn-radius', '30px');
        root.style.setProperty('--btn-shadow', 'var(--shadow-md)');
        root.style.setProperty('--btn-border-width', '0px');
        // Badge
        root.style.setProperty('--badge-radius', '12px');
        break;

      case 'minimal':
        root.style.setProperty('--variant-blur', '0px');
        root.style.setProperty('--radius-lg', '0px');
        root.style.setProperty('--radius-md', '0px');
        root.style.setProperty('--radius-xl', '0px');
        root.style.setProperty('--border-vibrant', config.border);
        root.style.setProperty('--shadow-inset-shine', 'none');
        root.style.setProperty('--shadow-md', 'none');
        root.style.setProperty('--shadow-lg', '0 1px 0 ' + config.border);
        // Card
        root.style.setProperty('--card-bg', 'transparent');
        root.style.setProperty('--card-border', config.border);
        root.style.setProperty('--card-border-width', '0px');
        root.style.setProperty('--card-shadow', 'none');
        root.style.setProperty('--card-border-bottom', '1px solid ' + config.border);
        // Input — underline-only
        root.style.setProperty('--input-bg', 'transparent');
        root.style.setProperty('--input-border', 'transparent');
        root.style.setProperty('--input-border-bottom', '2px solid ' + config.border);
        root.style.setProperty('--input-radius', '0px');
        root.style.setProperty('--input-shadow', 'none');
        // Modal
        root.style.setProperty('--modal-radius', '0px');
        root.style.setProperty('--modal-bg', config.background);
        root.style.setProperty('--modal-border-width', '0px');
        root.style.setProperty('--modal-shadow', '0 40px 100px rgba(0,0,0,0.6)');
        // Button
        root.style.setProperty('--btn-radius', '0px');
        root.style.setProperty('--btn-shadow', 'none');
        root.style.setProperty('--btn-border-width', '0px');
        root.style.setProperty('--btn-border-bottom', '2px solid transparent');
        // Badge
        root.style.setProperty('--badge-radius', '0px');
        break;
    }
  }

  private applyPerformanceMode(isHighPerf: boolean) {
    const root = document.documentElement;
    if (isHighPerf) {
      root.classList.add('high-perf');
      root.classList.remove('premium-mode');
    } else {
      root.classList.remove('high-perf');
      root.classList.add('premium-mode');
    }
  }

  private storeTheme(theme: Theme) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }

  private getStoredTheme(): Theme | null {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('theme') as Theme;
      if (stored && THEMES[stored]) {
        return stored;
      }
    }
    return null;
  }

  private storeVariant(variant: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ui-variant', variant);
    }
  }

  private getStoredVariant(): UiVariantKey | null {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('ui-variant');
      if (stored && isUiVariantKey(stored)) {
        return stored;
      }
    }
    return null;
  }
}
