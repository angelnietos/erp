/**
 * Capa de presentación por tenant (mismo backend, distinto shell/login).
 *
 * - `classic` — layout gaming Josanz (`shared-ui-shell`)
 * - `babooni` — layout Biosstel (`babooni-ui`)
 * - `josanz-figma` — layout Figma / `josanz-ui` (apps/josanz-web-app)
 * - `document-generator` — generador de documentos (apps/document-generator)
 *
 * Auth: ver {@link TENANT_KEYCLOAK_REALM} en `@josanz-erp/identity-api`.
 * Slugs sin KC (`docs`, …) → login local + usuarios solo en seed ERP.
 */
export type ErpTenantUiShell =
  | 'classic'
  | 'babooni'
  | 'josanz-figma'
  | 'document-generator';

/** Slug → shell. Añade tenants aquí; no hace falta duplicar backend ni despliegue. */
export const TENANT_UI_SHELL_BY_SLUG: Readonly<Record<string, ErpTenantUiShell>> = {
  babooni: 'babooni',
  /** Solo el tenant demo Figma; el resto usa ERP clásico por defecto. */
  alexis: 'josanz-figma',
  /** Generador de documentos integrado (standalone en :4210). */
  docs: 'document-generator',
};

export function normalizeTenantSlug(slug: string | null | undefined): string {
  return (slug ?? '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
}

export function getTenantUiShell(slug: string | null | undefined): ErpTenantUiShell {
  const key = normalizeTenantSlug(slug);
  return TENANT_UI_SHELL_BY_SLUG[key] ?? 'classic';
}

/** Login Figma de dos columnas (`Login.svg` / josanz-ui). */
export function usesJosanzFigmaLogin(slug: string | null | undefined): boolean {
  return getTenantUiShell(slug) === 'josanz-figma';
}

/** Login dedicado tenant docs (generador de documentos). */
export function usesDocumentGeneratorLogin(slug: string | null | undefined): boolean {
  return getTenantUiShell(slug) === 'document-generator';
}

export function isBabooniUiShell(slug: string | null | undefined): boolean {
  return getTenantUiShell(slug) === 'babooni';
}

export function isJosanzFigmaUiShell(slug: string | null | undefined): boolean {
  return getTenantUiShell(slug) === 'josanz-figma';
}

export function isDocumentGeneratorUiShell(slug: string | null | undefined): boolean {
  return getTenantUiShell(slug) === 'document-generator';
}
