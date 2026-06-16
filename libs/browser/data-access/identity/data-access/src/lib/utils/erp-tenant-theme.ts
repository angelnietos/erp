import { ERP_TENANT_SLUG_SESSION_KEY } from '../services/auth.service';
import { getStoredTenantId } from '../interceptors/tenant.interceptor';
import { getTenantUiShell } from './tenant-ui-shell';

/** IDs fijos del seed (`apps/backend/prisma/seed.ts`) → slug. */
export const TENANT_ID_TO_SLUG: Readonly<Record<string, string>> = {
  'c363035a-2a98-4054-9207-38c8aa5732d9': 'josanz',
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d': 'babooni',
  'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a': 'alexis',
};

export function resolveTenantSlugFromId(tenantId: string | null | undefined): string | null {
  const id = (tenantId ?? '').trim().toLowerCase();
  if (!id) {
    return null;
  }
  return TENANT_ID_TO_SLUG[id] ?? null;
}

/** Persiste slug (login / refresh) y sincroniza `<html data-erp-*`. */
export function setErpTenantSlug(slug: string | null | undefined): void {
  const normalized = (slug ?? '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!normalized || typeof sessionStorage === 'undefined') {
    syncErpTenantHtmlTheme();
    return;
  }
  sessionStorage.setItem(ERP_TENANT_SLUG_SESSION_KEY, normalized);
  syncErpTenantHtmlTheme();
}

/**
 * Slug del tenant ERP actual.
 * Prioridad: sessionStorage (backend) → tenantId del JWT → atributo HTML → josanz.
 */
export function getErpTenantSlug(): string {
  if (typeof sessionStorage !== 'undefined') {
    const s = sessionStorage.getItem(ERP_TENANT_SLUG_SESSION_KEY)?.trim();
    if (s) {
      return s.toLowerCase();
    }
  }
  const fromTenantId = resolveTenantSlugFromId(getStoredTenantId());
  if (fromTenantId) {
    return fromTenantId;
  }
  if (typeof document !== 'undefined') {
    const a = document.documentElement.getAttribute('data-erp-tenant')?.trim();
    if (a) {
      return a.toLowerCase();
    }
  }
  return 'josanz';
}

/**
 * Marca el tenant ERP en `<html>` para estilos condicionales.
 * `babooni` → paleta Biosstel; `alexis` → shell Figma (`josanz-ui`); resto → clásico.
 */
export function syncErpTenantHtmlTheme(): void {
  if (typeof document === 'undefined') {
    return;
  }
  const slug = getErpTenantSlug();
  document.documentElement.setAttribute('data-erp-tenant', slug);
  document.documentElement.setAttribute('data-erp-ui-shell', getTenantUiShell(slug));
}

/** Rutas `/auth/*`: permiten scroll en body (login no debe quedar recortado). */
export function syncErpRoutePhaseFromPath(pathname: string): void {
  if (typeof document === 'undefined') {
    return;
  }
  const path = (pathname || '').split('?')[0]?.split('#')[0] ?? '';
  const isAuth = path === '/auth' || path.startsWith('/auth/');
  if (isAuth) {
    document.documentElement.setAttribute('data-erp-route', 'auth');
  } else {
    document.documentElement.removeAttribute('data-erp-route');
  }
}
