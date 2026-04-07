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
  | 'hollow-knight';

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
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    brand: '#4f46e5',
    brandGlow: 'rgba(79, 70, 229, 0.15)',
    bgSecondary: '#f1f5f9',
    bgTertiary: '#e2e8f0',
    bgStyle: 'bokeh',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    uiVariant: 'solid',
  },
  dark: {
    name: 'Deep Midnight',
    primary: '#6366f1',
    secondary: '#94a3b8',
    background: '#0b0e14',
    surface: '#151921',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    border: 'rgba(255, 255, 255, 0.08)',
    brand: '#6366f1',
    brandGlow: 'rgba(99, 102, 241, 0.4)',
    bgSecondary: '#0f121a',
    bgTertiary: '#1c212b',
    bgStyle: 'nebula',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#0ea5e9',
    uiVariant: 'glass',
  },
  blue: {
    name: 'Stellar Abyss',
    primary: '#38bdf8',
    secondary: '#94a3b8',
    background: '#020617',
    surface: '#0f172a',
    text: '#f1f5f9',
    textMuted: '#64748b',
    border: 'rgba(56, 189, 248, 0.12)',
    brand: '#38bdf8',
    brandGlow: 'rgba(56, 189, 248, 0.3)',
    bgSecondary: '#0b1120',
    bgTertiary: '#1e293b',
    bgStyle: 'nebula',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#f43f5e',
    info: '#38bdf8',
    uiVariant: 'glass',
  },
  green: {
    name: 'Emerald Grid',
    primary: '#10b981',
    secondary: '#86efac',
    background: '#06130e',
    surface: '#0c1f17',
    text: '#ecfdf5',
    textMuted: '#64748b',
    border: 'rgba(16, 185, 129, 0.15)',
    brand: '#10b981',
    brandGlow: 'rgba(16, 185, 129, 0.35)',
    bgSecondary: '#0a1a14',
    bgTertiary: '#142e23',
    bgStyle: 'grid',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#10b981',
    uiVariant: 'solid',
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
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    brand: '#0ea5e9',
    brandGlow: 'rgba(14, 165, 233, 0.15)',
    bgSecondary: '#f1f5f9',
    bgTertiary: '#e2e8f0',
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
    background: '#fafaf9',
    surface: '#ffffff',
    text: '#292524',
    textMuted: '#78716c',
    border: '#e7e5e4',
    brand: '#d97706',
    brandGlow: 'rgba(217, 119, 6, 0.1)',
    bgSecondary: '#f5f5f4',
    bgTertiary: '#e7e5e4',
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
    name: 'Lost Woods',
    primary: '#d4af37',
    secondary: '#006b53',
    background: '#050f0a',
    surface: '#0a1a12',
    text: '#f1f5f1',
    textMuted: '#a3b3a3',
    border: 'rgba(212, 175, 55, 0.2)',
    brand: '#006b53',
    brandGlow: 'rgba(0, 107, 83, 0.4)',
    bgSecondary: '#08140e',
    bgTertiary: '#0f241a',
    bgStyle: 'aurora',
    success: '#22c55e',
    warning: '#d4af37',
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
    background: '#f1f8e9',
    surface: '#ffffff',
    text: '#2d4a22',
    textMuted: '#7ca668',
    border: '#c5e1a5',
    brand: '#6bb33b',
    brandGlow: 'rgba(107, 179, 59, 0.15)',
    bgSecondary: '#e8f5e9',
    bgTertiary: '#c5e1a5',
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
    name: 'Forgotten Crossroads',
    primary: '#e2e8f0',
    secondary: '#475569',
    background: '#0a0c10',
    surface: '#141720',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: 'rgba(226, 232, 240, 0.1)',
    brand: '#8892b0',
    brandGlow: 'rgba(136, 146, 176, 0.3)',
    bgSecondary: '#11141d',
    bgTertiary: '#1b202e',
    bgStyle: 'matrix',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#38bdf8',
    uiVariant: 'glass',
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
    id: 'palette',
    label: 'Paleta ERP',
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
      'corporate-light',
      'classic-dark',
      'nordic',
      'latte',
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
      'animal-crossing',
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
    root.style.setProperty('--brand-ambient', `rgba(${brandRgb}, 0.12)`);
    root.style.setProperty('--brand-ambient-strong', `rgba(${brandRgb}, 0.2)`);

    root.setAttribute('data-theme', theme);
    root.setAttribute('data-ui-variant', variant);

    // ── STRUCTURAL TOKENS ──────────────────────────────────────────────
    // Apply variant-specific tokens directly via inline style to bypass
    // Angular ViewEncapsulation (encapsulated component styles cannot see
    // CSS-rule-level html[data-ui-variant] overrides, but they CAN inherit
    // inline CSS variables from :root / documentElement).
    this.applyStructuralTokens(root, variant, config);
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

    switch (variant) {
      case 'glass':
        root.style.setProperty('--variant-blur', '28px');
        root.style.setProperty('--radius-lg', '16px');
        root.style.setProperty('--radius-md', '10px');
        root.style.setProperty('--radius-xl', '24px');
        root.style.setProperty(
          '--border-vibrant',
          `rgba(${hexToRgbTriplet(config.brand)}, 0.25)`,
        );
        root.style.setProperty(
          '--shadow-inset-shine',
          'inset 0 1px 0 rgba(255,255,255,0.08)',
        );
        root.style.setProperty('--shadow-md', '0 8px 32px rgba(0,0,0,0.4)');
        // Card
        root.style.setProperty(
          '--card-bg',
          `color-mix(in srgb, ${config.surface} 70%, transparent)`,
        );
        root.style.setProperty(
          '--card-border',
          `rgba(${hexToRgbTriplet(config.brand)}, 0.2)`,
        );
        root.style.setProperty('--card-shadow', '0 8px 32px rgba(0,0,0,0.4)');
        // Input
        root.style.setProperty(
          '--input-bg',
          `color-mix(in srgb, ${config.surface} 50%, transparent)`,
        );
        root.style.setProperty('--input-radius', '10px');
        // Modal
        root.style.setProperty('--modal-radius', '24px');
        root.style.setProperty(
          '--modal-bg',
          `color-mix(in srgb, ${config.bgSecondary} 80%, transparent)`,
        );
        // Button
        root.style.setProperty('--btn-radius', '10px');
        root.style.setProperty(
          '--btn-shadow',
          `0 4px 20px rgba(${hexToRgbTriplet(config.brand)}, 0.3)`,
        );
        break;

      case 'solid':
        root.style.setProperty('--variant-blur', '0px');
        root.style.setProperty('--radius-lg', '10px');
        root.style.setProperty('--radius-md', '6px');
        root.style.setProperty('--radius-xl', '14px');
        root.style.setProperty('--border-vibrant', config.border);
        root.style.setProperty('--shadow-inset-shine', 'none');
        root.style.setProperty('--shadow-md', '0 4px 12px rgba(0,0,0,0.25)');
        // Card
        root.style.setProperty('--card-bg', config.bgSecondary);
        root.style.setProperty('--card-border', config.border);
        root.style.setProperty('--card-shadow', '0 2px 8px rgba(0,0,0,0.2)');
        // Input
        root.style.setProperty('--input-bg', config.bgTertiary);
        root.style.setProperty('--input-radius', '6px');
        root.style.setProperty(
          '--input-shadow',
          'inset 0 1px 3px rgba(0,0,0,0.2)',
        );
        // Modal
        root.style.setProperty('--modal-radius', '10px');
        root.style.setProperty('--modal-bg', config.bgSecondary);
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
