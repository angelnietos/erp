import { normalizeAuthTenantSlug } from './tenant-auth-policy';

/** Slug del picker para abrir `apps/saas-platform` (app independiente). */
export const ERP_PLATFORM_APP_SLUG = 'platform';

/** Slug del picker para abrir el CRM Verifactu (`apps/verifactu-platform`, :4230 en dev). */
export const ERP_VERIFACTU_APP_SLUG = 'verifactu';

/** Slug del picker para abrir el generador de documentos (`apps/document-generator`, :4210 en dev). */
export const ERP_DOCS_APP_SLUG = 'docs';

export type ErpExternalAppKind = 'platform' | 'verifactu' | 'docs';

export interface ErpExternalAppDefinition {
  slug: string;
  kind: ErpExternalAppKind;
  name: string;
  description: string;
  /** Ruta de entrada en la app externa (p. ej. login). */
  entryPath: string;
}

/** Apps fuera del shell ERP en :4200; no son organizaciones/tenants. */
export const ERP_EXTERNAL_APP_CATALOG: readonly ErpExternalAppDefinition[] = [
  {
    slug: ERP_PLATFORM_APP_SLUG,
    kind: 'platform',
    name: 'Panel SaaS Babooni',
    description: 'Tenants, usuarios platform, permisos y observabilidad.',
    entryPath: '/login',
  },
  {
    slug: ERP_VERIFACTU_APP_SLUG,
    kind: 'verifactu',
    name: 'Verifactu',
    description: 'Facturación electrónica AEAT (app independiente del ERP).',
    entryPath: '/login?returnUrl=%2Fverifactu%2Foverview',
  },
  {
    slug: ERP_DOCS_APP_SLUG,
    kind: 'docs',
    name: 'Generador de Documentos',
    description: 'Documentos con IA — global, sin organización ERP.',
    entryPath: '/',
  },
];

const DEFAULT_EXTERNAL_APP_BASE_URLS: Readonly<Record<string, string>> = {
  [ERP_PLATFORM_APP_SLUG]: 'http://localhost:4300',
  [ERP_VERIFACTU_APP_SLUG]: 'http://localhost:4230',
  [ERP_DOCS_APP_SLUG]: 'http://localhost:4210',
};

let externalAppBaseUrls: Record<string, string> = {
  ...DEFAULT_EXTERNAL_APP_BASE_URLS,
};

/** Sobrescribe URLs de apps externas (p. ej. desde `environment` del frontend). */
export function configureErpExternalAppBaseUrls(
  urls: Partial<Record<string, string>>,
): void {
  for (const [slug, url] of Object.entries(urls)) {
    if (typeof url === 'string' && url.trim()) {
      externalAppBaseUrls[slug] = url.trim();
    }
  }
}

export function resetErpExternalAppBaseUrlsForTests(): void {
  externalAppBaseUrls = { ...DEFAULT_EXTERNAL_APP_BASE_URLS };
}

export function isExternalErpAppSlug(slug: string | null | undefined): boolean {
  const key = normalizeAuthTenantSlug(slug);
  return ERP_EXTERNAL_APP_CATALOG.some((app) => app.slug === key);
}

export function getExternalErpAppDefinition(
  slug: string | null | undefined,
): ErpExternalAppDefinition | undefined {
  const key = normalizeAuthTenantSlug(slug);
  return ERP_EXTERNAL_APP_CATALOG.find((app) => app.slug === key);
}

/** URL completa para abrir la app externa; `null` si slug desconocido o sin base URL. */
export function resolveExternalAppLaunchUrl(
  slug: string | null | undefined,
  erpOrgSlug?: string | null,
): string | null {
  const app = getExternalErpAppDefinition(slug);
  if (!app) {
    return null;
  }
  const base = (externalAppBaseUrls[app.slug] ?? '').trim().replace(/\/$/, '');
  if (!base) {
    return null;
  }
  let path = app.entryPath.startsWith('/') ? app.entryPath : `/${app.entryPath}`;

  if (app.slug === ERP_VERIFACTU_APP_SLUG) {
    const org = erpOrgSlug?.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') ?? '';
    const crmTenantByErp: Record<string, string> = {
      josanz: 'josanz',
      babooni: 'babooni',
      alexis: 'alexis',
    };
    const tenant = crmTenantByErp[org] ?? 'demo';
    const sep = path.includes('?') ? '&' : '?';
    path = `${path}${sep}tenant=${encodeURIComponent(tenant)}`;
  }

  return `${base}${path}`;
}
