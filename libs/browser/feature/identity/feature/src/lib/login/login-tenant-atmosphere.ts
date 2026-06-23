import type { BackgroundTheme } from '../animated-background/animated-background.component';

/** Paleta y copy por tenant — atmósfera tipo plataforma (Rayman: selva, lumen, capas). */
export interface LoginTenantAtmosphere {
  slug: string;
  defaultTheme: BackgroundTheme;
  moodLine: string;
  heroBadge: string;
  accent: string;
  accentSoft: string;
  glow: string;
}

const ATMOSPHERES: Record<string, LoginTenantAtmosphere> = {
  josanz: {
    slug: 'josanz',
    defaultTheme: 'josanz-classic',
    moodLine: 'ERP modular multi-tenant — shell clásico listo para demo.',
    heroBadge: 'Generic ERP',
    accent: '#f03e3e',
    accentSoft: 'rgba(240, 62, 62, 0.22)',
    glow: 'rgba(240, 62, 62, 0.45)',
  },
  alexis: {
    slug: 'alexis',
    defaultTheme: 'spot-scan',
    moodLine: 'Escenario Figma · focos cálidos y energía de plató.',
    heroBadge: 'Alexis · Figma shell',
    accent: '#0f1e2f',
    accentSoft: 'rgba(15, 30, 47, 0.12)',
    glow: 'rgba(250, 204, 21, 0.35)',
  },
  babooni: {
    slug: 'babooni',
    defaultTheme: 'babooni-platform',
    moodLine: 'Selva digital, plataformas verdes y código en la bruma.',
    heroBadge: 'Babooni · Biosstel',
    accent: '#4a9eff',
    accentSoft: 'rgba(74, 158, 255, 0.2)',
    glow: 'rgba(45, 122, 62, 0.5)',
  },
  docs: {
    slug: 'docs',
    defaultTheme: 'golden-vintage',
    moodLine: 'Pergaminos flotantes, polvo de lumen y magia documental.',
    heroBadge: 'Documentos · IA',
    accent: '#a78bfa',
    accentSoft: 'rgba(167, 139, 250, 0.22)',
    glow: 'rgba(251, 191, 36, 0.4)',
  },
  platform: {
    slug: 'platform',
    defaultTheme: 'babooni-platform',
    moodLine: 'Consola SaaS: tenants, permisos y observabilidad en la nube.',
    heroBadge: 'Babooni · Plataforma',
    accent: '#4a9eff',
    accentSoft: 'rgba(74, 158, 255, 0.2)',
    glow: 'rgba(45, 122, 62, 0.5)',
  },
  verifactu: {
    slug: 'verifactu',
    defaultTheme: 'nebula-cosmos',
    moodLine: 'Huella fiscal, códigos QR y envío seguro a la AEAT.',
    heroBadge: 'Verifactu · CRM',
    accent: '#22c55e',
    accentSoft: 'rgba(34, 197, 94, 0.22)',
    glow: 'rgba(34, 197, 94, 0.4)',
  },
};

const FALLBACK: LoginTenantAtmosphere = {
  slug: 'default',
  defaultTheme: 'nebula-cosmos',
  moodLine: 'Elige tu mundo y entra al portal.',
  heroBadge: 'Josanz ERP',
  accent: '#6366f1',
  accentSoft: 'rgba(99, 102, 241, 0.2)',
  glow: 'rgba(139, 92, 246, 0.4)',
};

export function resolveLoginAtmosphere(slug: string): LoginTenantAtmosphere {
  const key = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  return ATMOSPHERES[key] ?? { ...FALLBACK, slug: key || 'default' };
}

export function resolveHubAtmosphere(slug: string | null): LoginTenantAtmosphere {
  if (!slug) {
    return {
      ...FALLBACK,
      slug: 'hub',
      defaultTheme: 'nebula-cosmos',
      moodLine: 'Portales a cada organización o aplicación — elige tu destino.',
      heroBadge: 'Hub · Babooni',
    };
  }
  return resolveLoginAtmosphere(slug);
}
